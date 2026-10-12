import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/middleware-auth';

export async function GET(req: NextRequest) {
  try {
    const authRes = await authorizeRequest(req, ['ADMIN']);
    if ('status' in authRes) return authRes;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        area: true,
        phone: true,
        departmentId: true,
        department: { select: { id: true, name: true, code: true } },
        createdAt: true,
        _count: {
          select: {
            complaints: true,
            assignedToMe: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error listing users:', error);
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authRes = await authorizeRequest(req, ['ADMIN']);
    if ('status' in authRes) return authRes;
    const adminUser = authRes.user;

    const body = await req.json();
    const { userId, role, departmentId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role || undefined,
        departmentId: departmentId !== undefined ? departmentId : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        userRole: 'ADMIN',
        action: 'UPDATE_USER_ROLE',
        entityType: 'User',
        entityId: userId,
        details: `Updated role to ${role || 'unchanged'}, department to ${departmentId || 'none'}`,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}
