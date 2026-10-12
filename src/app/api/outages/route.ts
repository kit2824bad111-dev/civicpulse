import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/middleware-auth';
import { calculateOutageDuration } from '@/lib/outage-calculator';
import { z } from 'zod';

const createOutageSchema = z.object({
  title: z.string().min(5),
  locality: z.string().min(2),
  startTime: z.string(),
  weatherCondition: z.string().optional().nullable(),
  outageCategory: z.enum(['UNEXPECTED', 'PLANNED', 'RAIN_STORM', 'TRANSFORMER', 'MAINTENANCE', 'DISTRIBUTION_FAULT', 'UNKNOWN']),
  affectedHouseholds: z.number().int().min(1).default(1),
  isEmergencyHazard: z.boolean().default(false),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locality = searchParams.get('locality');
    const isCurrentlyOff = searchParams.get('isCurrentlyOff');

    const where: any = {};
    if (locality && locality !== 'ALL') {
      where.locality = { contains: locality };
    }
    if (isCurrentlyOff !== null && isCurrentlyOff !== undefined) {
      where.isCurrentlyOff = isCurrentlyOff === 'true';
    }

    const incidents = await prisma.electricityOutageIncident.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, contactEmail: true } },
        complaints: {
          select: {
            id: true,
            refNumber: true,
            title: true,
            status: true,
            isEmergency: true,
            createdAt: true,
          },
        },
        affectedUsers: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    const enrichedIncidents = incidents.map(inc => {
      const durationInfo = calculateOutageDuration(
        inc.startTime,
        inc.confirmedReason,
        inc.expectedRestoration
      );

      return {
        ...inc,
        durationInfo,
      };
    });

    return NextResponse.json({ outages: enrichedIncidents });
  } catch (error: any) {
    console.error('Error fetching electricity outages:', error);
    return NextResponse.json({ error: 'Failed to retrieve electricity outages.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authRes = await authorizeRequest(req);
    if ('status' in authRes) return authRes;
    const user = authRes.user;

    const body = await req.json();
    const validated = createOutageSchema.parse(body);

    const startTime = new Date(validated.startTime);

    // Look for existing active incident in same locality
    let incident = await prisma.electricityOutageIncident.findFirst({
      where: {
        locality: { contains: validated.locality.trim() },
        isCurrentlyOff: true,
      },
    });

    if (incident) {
      // Link to existing incident
      await prisma.electricityOutageIncident.update({
        where: { id: incident.id },
        data: {
          affectedHouseholds: { increment: validated.affectedHouseholds },
        },
      });

      await prisma.outageAffectedUser.create({
        data: {
          incidentId: incident.id,
          userId: user.id,
        },
      });
    } else {
      // Find electricity department
      const elecDept = await prisma.department.findFirst({
        where: { code: 'ELEC' },
      });

      incident = await prisma.electricityOutageIncident.create({
        data: {
          title: validated.title,
          locality: validated.locality,
          startTime,
          isCurrentlyOff: true,
          weatherCondition: validated.weatherCondition || null,
          outageCategory: validated.outageCategory,
          affectedHouseholds: validated.affectedHouseholds,
          status: 'INVESTIGATING',
          departmentId: elecDept?.id || null,
        },
      });

      await prisma.outageAffectedUser.create({
        data: {
          incidentId: incident.id,
          userId: user.id,
        },
      });
    }

    // Also create matching Complaint record for tracking
    const elecCat = await prisma.complaintCategory.findFirst({
      where: { code: 'electricity' },
    });

    const count = await prisma.complaint.count();
    const refNumber = `CP-2026-${String(count + 1).padStart(5, '0')}`;

    const complaint = await prisma.complaint.create({
      data: {
        refNumber,
        title: validated.title,
        description: validated.description || `Electricity outage reported in ${validated.locality}. Power cut started at ${startTime.toLocaleTimeString()}.`,
        categoryId: elecCat?.id || '',
        userId: user.id,
        locationName: validated.locality,
        isEmergency: validated.isEmergencyHazard,
        affectedCount: validated.affectedHouseholds,
        isOutage: true,
        outageIncidentId: incident.id,
        priority: validated.isEmergencyHazard ? 'URGENT' : 'HIGH',
        status: 'SUBMITTED',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: 'REPORT_OUTAGE',
        entityType: 'ElectricityOutageIncident',
        entityId: incident.id,
        details: `Outage reported in ${validated.locality}`,
      },
    });

    return NextResponse.json({
      success: true,
      incident,
      complaint,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Error reporting outage:', error);
    return NextResponse.json({ error: 'Failed to record outage report.' }, { status: 500 });
  }
}
