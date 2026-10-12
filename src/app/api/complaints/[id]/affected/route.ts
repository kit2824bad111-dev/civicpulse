import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/middleware-auth';

export async function POST(
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
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 });
    }

    // Increment complaint affected count
    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        affectedCount: { increment: 1 },
      },
    });

    // If linked to outage incident, record affected user
    if (complaint.outageIncidentId) {
      await prisma.electricityOutageIncident.update({
        where: { id: complaint.outageIncidentId },
        data: {
          affectedHouseholds: { increment: 1 },
        },
      });

      await prisma.outageAffectedUser.create({
        data: {
          incidentId: complaint.outageIncidentId,
          userId: user.id,
          complaintId: complaint.id,
        },
      });
    }

    // Log notification for owner
    if (complaint.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: complaint.userId,
          title: 'Another Citizen Affected',
          message: `${user.name} confirmed they are also affected by issue ${complaint.refNumber}.`,
          link: `/complaints/${complaint.id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      affectedCount: updatedComplaint.affectedCount,
    });
  } catch (error: any) {
    console.error('Error marking affected:', error);
    return NextResponse.json({ error: 'Failed to record affected status.' }, { status: 500 });
  }
}
