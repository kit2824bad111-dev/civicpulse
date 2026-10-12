import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/middleware-auth';
import { evaluateEscalation } from '@/lib/escalation-engine';
import { calculateDuplicateScore } from '@/lib/duplicate-detector';
import { analyzeComplaintContent } from '@/lib/ai';
import { z } from 'zod';

const createComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryCode: z.string().min(1, 'Category is required'),
  locationName: z.string().min(2, 'Location/Area is required'),
  address: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  isEmergency: z.boolean().default(false),
  affectedCount: z.number().int().min(1).default(1),
  isOutage: z.boolean().default(false),
  outageStartTime: z.string().optional().nullable(),
  outageCategory: z.string().optional().nullable(),
  weatherCondition: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const authRes = await authorizeRequest(req);
    if ('status' in authRes) return authRes;
    const user = authRes.user;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const area = searchParams.get('area');
    const priority = searchParams.get('priority');
    const isOutageOnly = searchParams.get('isOutage') === 'true';
    const myComplaintsOnly = searchParams.get('myComplaints') === 'true';
    const search = searchParams.get('search');

    const where: any = {};

    if (myComplaintsOnly || (user.role === 'CITIZEN' && searchParams.get('all') !== 'true')) {
      where.userId = user.id;
    }

    if (user.role === 'OFFICER' && user.departmentId && !searchParams.get('all')) {
      where.assignments = {
        some: { departmentId: user.departmentId },
      };
    }

    if (status && status !== 'ALL') where.status = status;
    if (category && category !== 'ALL') {
      where.category = { code: category };
    }
    if (area && area !== 'ALL') {
      where.locationName = { contains: area };
    }
    if (priority && priority !== 'ALL') where.priority = priority;
    if (isOutageOnly) where.isOutage = true;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { refNumber: { contains: search } },
        { locationName: { contains: search } },
      ];
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        category: true,
        user: { select: { id: true, name: true, area: true } },
        assignments: {
          include: {
            department: { select: { id: true, name: true, code: true } },
            officer: { select: { id: true, name: true } },
          },
        },
        outageIncident: true,
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedComplaints = complaints.map(c => {
      const escalation = evaluateEscalation({
        createdAt: c.createdAt,
        status: c.status,
        isEmergency: c.isEmergency,
        affectedCount: c.affectedCount,
        categorySLAHours: c.category.SLAHours,
      });

      return {
        ...c,
        calculatedPriority: escalation.priority,
        isOverdue: escalation.isOverdue,
        slaFormatted: escalation.slaFormatted,
      };
    });

    return NextResponse.json({ complaints: enrichedComplaints });
  } catch (error: any) {
    console.error('Error listing complaints:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authRes = await authorizeRequest(req);
    if ('status' in authRes) return authRes;
    const user = authRes.user;

    const body = await req.json();
    const validated = createComplaintSchema.parse(body);

    // AI Fallback classification check
    const aiResult = await analyzeComplaintContent(validated.title, validated.description);

    let category = await prisma.complaintCategory.findUnique({
      where: { code: validated.categoryCode },
    });

    if (!category) {
      category = await prisma.complaintCategory.findFirst({
        where: { code: 'other' },
      });
    }

    if (!category) {
      return NextResponse.json({ error: 'Invalid complaint category.' }, { status: 400 });
    }

    // Generate unique reference number (CP-2026-XXXXX)
    const count = await prisma.complaint.count();
    const refNumber = `CP-2026-${String(count + 1).padStart(5, '0')}`;

    // Duplicate matching check against existing active complaints
    const activeComplaints = await prisma.complaint.findMany({
      where: {
        status: { notIn: ['RESOLVED', 'CLOSED'] },
        categoryId: category.id,
      },
      include: { category: true },
      take: 20,
    });

    let duplicateMatch = null;
    for (const existing of activeComplaints) {
      const dup = calculateDuplicateScore(
        {
          title: validated.title,
          description: validated.description,
          locationName: validated.locationName,
          categoryCode: category.code,
        },
        {
          id: existing.id,
          refNumber: existing.refNumber,
          title: existing.title,
          description: existing.description,
          locationName: existing.locationName,
          categoryCode: existing.category.code,
          createdAt: existing.createdAt,
          affectedCount: existing.affectedCount,
          isOutage: existing.isOutage,
        }
      );

      if (dup.matchScore >= 60) {
        duplicateMatch = {
          existingComplaintId: existing.id,
          existingRefNumber: existing.refNumber,
          title: existing.title,
          locationName: existing.locationName,
          matchScore: dup.matchScore,
          matchReason: dup.matchReason,
        };
        break; // matched best likely duplicate
      }
    }

    // Determine initial priority
    const isEmergency = validated.isEmergency || aiResult.isEmergencyHazard;
    const escalation = evaluateEscalation({
      createdAt: new Date(),
      status: 'SUBMITTED',
      isEmergency,
      affectedCount: validated.affectedCount,
      categorySLAHours: category.SLAHours,
    });

    // Check if this is an electricity outage and link or create ElectricityOutageIncident
    let outageIncidentId: string | undefined = undefined;
    if (validated.isOutage || category.code === 'electricity') {
      let incident = await prisma.electricityOutageIncident.findFirst({
        where: {
          locality: { contains: validated.locationName.trim() },
          isCurrentlyOff: true,
        },
      });

      if (incident) {
        outageIncidentId = incident.id;
        await prisma.electricityOutageIncident.update({
          where: { id: incident.id },
          data: {
            affectedHouseholds: { increment: validated.affectedCount },
          },
        });
      } else {
        const newIncident = await prisma.electricityOutageIncident.create({
          data: {
            title: `Outage at ${validated.locationName}`,
            locality: validated.locationName,
            startTime: validated.outageStartTime ? new Date(validated.outageStartTime) : new Date(),
            isCurrentlyOff: true,
            weatherCondition: validated.weatherCondition || null,
            outageCategory: validated.outageCategory || 'UNEXPECTED',
            affectedHouseholds: validated.affectedCount,
            status: 'INVESTIGATING',
          },
        });
        outageIncidentId = newIncident.id;
      }
    }

    // Create the complaint
    const newComplaint = await prisma.complaint.create({
      data: {
        refNumber,
        title: validated.title,
        description: validated.description,
        categoryId: category.id,
        userId: user.id,
        locationName: validated.locationName,
        address: validated.address || null,
        latitude: validated.latitude || null,
        longitude: validated.longitude || null,
        photoUrl: validated.photoUrl || null,
        isEmergency,
        affectedCount: validated.affectedCount,
        isOutage: validated.isOutage || category.code === 'electricity',
        outageIncidentId,
        priority: escalation.priority,
        status: 'SUBMITTED',
      },
      include: {
        category: true,
      },
    });

    // Create initial update history entry
    await prisma.complaintUpdate.create({
      data: {
        complaintId: newComplaint.id,
        authorId: user.id,
        authorRole: user.role,
        statusChange: 'SUBMITTED',
        officialRemark: null,
        isOfficial: false,
      },
    });

    // Auto-assign to matching department if code matches
    const department = await prisma.department.findFirst({
      where: {
        code: category.code === 'electricity' ? 'ELEC' :
              category.code === 'roads' ? 'ROAD' :
              category.code === 'garbage' ? 'SANI' :
              category.code === 'drainage' ? 'WATR' :
              category.code === 'streetlights' ? 'LGT' : undefined
      },
    });

    if (department) {
      await prisma.complaintAssignment.create({
        data: {
          complaintId: newComplaint.id,
          departmentId: department.id,
          assignedByUserId: user.id,
          notes: 'Auto-assigned to department by system category rule.',
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: 'CREATE_COMPLAINT',
        entityType: 'Complaint',
        entityId: newComplaint.id,
        details: `Created complaint ${refNumber} (${validated.title})`,
      },
    });

    return NextResponse.json({
      success: true,
      complaint: newComplaint,
      duplicateWarning: duplicateMatch,
      aiAnalysis: aiResult,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Error creating complaint:', error);
    return NextResponse.json({ error: 'Failed to submit complaint.' }, { status: 500 });
  }
}
