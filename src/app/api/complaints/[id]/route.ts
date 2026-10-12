import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/middleware-auth';
import { evaluateEscalation } from '@/lib/escalation-engine';
import { calculateOutageDuration } from '@/lib/outage-calculator';
import { z } from 'zod';

const updateComplaintSchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'AWAITING_INFO', 'RESOLVED', 'REOPENED', 'CLOSED']).optional(),
  officialRemark: z.string().optional(),
  estimatedRestoration: z.string().optional().nullable(),
  evidenceUrl: z.string().optional().nullable(),
  assignedDepartmentId: z.string().optional().nullable(),
  assignedOfficerId: z.string().optional().nullable(),
  rating: z.number().min(1).max(5).optional(),
  feedbackComment: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authRes = await authorizeRequest(req);
    if ('status' in authRes) return authRes;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        category: true,
        user: { select: { id: true, name: true, email: true, phone: true, area: true } },
        assignments: {
          include: {
            department: true,
            officer: { select: { id: true, name: true, email: true } },
            assignedByUser: { select: { id: true, name: true } },
          },
          orderBy: { assignedAt: 'desc' },
        },
        updates: {
          include: {
            author: { select: { id: true, name: true, role: true } },
            evidence: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        evidence: true,
        outageIncident: {
          include: {
            affectedUsers: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
        feedback: true,
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 });
    }

    const escalation = evaluateEscalation({
      createdAt: complaint.createdAt,
      status: complaint.status,
      isEmergency: complaint.isEmergency,
      affectedCount: complaint.affectedCount,
      categorySLAHours: complaint.category.SLAHours,
    });

    let outageInfo = null;
    if (complaint.outageIncident) {
      outageInfo = calculateOutageDuration(
        complaint.outageIncident.startTime,
        complaint.outageIncident.confirmedReason,
        complaint.outageIncident.expectedRestoration
      );
    }

    return NextResponse.json({
      complaint: {
        ...complaint,
        calculatedPriority: escalation.priority,
        isOverdue: escalation.isOverdue,
        slaFormatted: escalation.slaFormatted,
        outageInfo,
      },
    });
  } catch (error: any) {
    console.error('Error fetching complaint details:', error);
    return NextResponse.json({ error: 'Failed to retrieve complaint.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authRes = await authorizeRequest(req);
    if ('status' in authRes) return authRes;
    const user = authRes.user;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 });
    }

    const body = await req.json();
    const validated = updateComplaintSchema.parse(body);

    // SECURITY CHECK: Citizens cannot set status to RESOLVED, IN_PROGRESS, or ASSIGNED
    if (user.role === 'CITIZEN') {
      if (validated.status && !['REOPENED'].includes(validated.status)) {
        return NextResponse.json(
          { error: 'Citizens are not authorized to mark complaints as Resolved or In Progress.' },
          { status: 403 }
        );
      }
      if (complaint.userId !== user.id) {
        return NextResponse.json(
          { error: 'You do not have permission to edit this complaint.' },
          { status: 403 }
        );
      }
    }

    const isOfficerOrAdmin = ['OFFICER', 'ADMIN'].includes(user.role);

    let updatedStatus = complaint.status;
    let resolvedAt = complaint.resolvedAt;

    if (validated.status) {
      updatedStatus = validated.status;
      if (validated.status === 'RESOLVED') {
        resolvedAt = new Date();
      }
    }

    // 1. Update main complaint record
    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        status: updatedStatus,
        resolvedAt,
        updatedAt: new Date(),
      },
    });

    // 2. Add update history entry
    const isOfficial = isOfficerOrAdmin;
    const updateRecord = await prisma.complaintUpdate.create({
      data: {
        complaintId: id,
        authorId: user.id,
        authorRole: user.role,
        statusChange: validated.status || null,
        officialRemark: validated.officialRemark || null,
        estimatedRestoration: validated.estimatedRestoration ? new Date(validated.estimatedRestoration) : null,
        isOfficial,
        evidenceUrl: validated.evidenceUrl || null,
      },
    });

    // If evidence URL provided, add to ComplaintEvidence
    if (validated.evidenceUrl) {
      await prisma.complaintEvidence.create({
        data: {
          complaintId: id,
          updateId: updateRecord.id,
          fileUrl: validated.evidenceUrl,
          fileType: 'image/jpeg',
        },
      });
    }

    // 3. Handle Department / Officer reassignment if provided (ADMIN or OFFICER)
    if (isOfficerOrAdmin && (validated.assignedDepartmentId || validated.assignedOfficerId)) {
      await prisma.complaintAssignment.create({
        data: {
          complaintId: id,
          departmentId: validated.assignedDepartmentId || user.departmentId || '',
          officerId: validated.assignedOfficerId || null,
          assignedByUserId: user.id,
          notes: validated.officialRemark || 'Reassigned by official',
        },
      });
    }

    // 4. Handle Resolution Feedback from Citizen
    if (validated.rating && complaint.userId === user.id) {
      await prisma.resolutionFeedback.upsert({
        where: { complaintId: id },
        create: {
          complaintId: id,
          userId: user.id,
          rating: validated.rating,
          comment: validated.feedbackComment || null,
        },
        update: {
          rating: validated.rating,
          comment: validated.feedbackComment || null,
        },
      });
    }

    // 5. Send notification to the citizen
    if (isOfficial && complaint.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: complaint.userId,
          title: `Complaint Update (${complaint.refNumber})`,
          message: validated.officialRemark || `Status updated to ${updatedStatus.replace('_', ' ')}`,
          link: `/complaints/${complaint.id}`,
        },
      });
    }

    // 6. Log Audit Action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: 'UPDATE_COMPLAINT',
        entityType: 'Complaint',
        entityId: id,
        details: `Updated complaint ${complaint.refNumber} status to ${updatedStatus}`,
      },
    });

    return NextResponse.json({
      success: true,
      complaint: updatedComplaint,
      update: updateRecord,
    });
  } catch (error: any) {
    console.error('Error updating complaint:', error);
    return NextResponse.json({ error: 'Failed to update complaint.' }, { status: 500 });
  }
}
