import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/middleware-auth';
import { z } from 'zod';

const verifyOutageSchema = z.object({
  confirmedReason: z.string().min(5, 'Official reason is required'),
  expectedRestoration: z.string().optional().nullable(),
  status: z.enum(['REPORTED', 'INVESTIGATING', 'CONFIRMED', 'REPAIRING', 'RESTORED']),
  isCurrentlyOff: z.boolean().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authRes = await authorizeRequest(req, ['OFFICER', 'ADMIN']);
    if ('status' in authRes) return authRes;
    const user = authRes.user;

    const body = await req.json();
    const validated = verifyOutageSchema.parse(body);

    const isCurrentlyOff = validated.status === 'RESTORED' ? false : (validated.isCurrentlyOff ?? true);

    const updatedIncident = await prisma.electricityOutageIncident.update({
      where: { id },
      data: {
        confirmedReason: validated.confirmedReason,
        expectedRestoration: validated.expectedRestoration ? new Date(validated.expectedRestoration) : null,
        status: validated.status,
        isCurrentlyOff,
        updatedAt: new Date(),
      },
    });

    // If marked RESTORED, update linked complaints to RESOLVED
    if (validated.status === 'RESTORED') {
      await prisma.complaint.updateMany({
        where: { outageIncidentId: id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
        },
      });
    }

    // Add official update entry to all linked complaints
    const linkedComplaints = await prisma.complaint.findMany({
      where: { outageIncidentId: id },
    });

    for (const c of linkedComplaints) {
      await prisma.complaintUpdate.create({
        data: {
          complaintId: c.id,
          authorId: user.id,
          authorRole: user.role,
          statusChange: validated.status === 'RESTORED' ? 'RESOLVED' : 'IN_PROGRESS',
          officialRemark: `OFFICIAL ELECTRICITY BOARD UPDATE: ${validated.confirmedReason}`,
          estimatedRestoration: validated.expectedRestoration ? new Date(validated.expectedRestoration) : null,
          isOfficial: true,
        },
      });

      // Notify affected citizens
      await prisma.notification.create({
        data: {
          userId: c.userId,
          title: 'Official Power Restoration Update',
          message: `Electricity Board provided reason: ${validated.confirmedReason}`,
          link: `/complaints/${c.id}`,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: 'VERIFY_OUTAGE',
        entityType: 'ElectricityOutageIncident',
        entityId: id,
        details: `Verified official reason for outage: ${validated.confirmedReason}`,
      },
    });

    return NextResponse.json({
      success: true,
      incident: updatedIncident,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Error verifying outage:', error);
    return NextResponse.json({ error: 'Failed to verify outage incident.' }, { status: 500 });
  }
}
