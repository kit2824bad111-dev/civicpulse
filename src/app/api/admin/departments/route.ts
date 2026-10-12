import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/middleware-auth';

export async function GET(req: NextRequest) {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            users: true,
            assignments: true,
            outages: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const categories = await prisma.complaintCategory.findMany({
      include: {
        _count: {
          select: { complaints: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ departments, categories });
  } catch (error: any) {
    console.error('Error listing departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authRes = await authorizeRequest(req, ['ADMIN']);
    if ('status' in authRes) return authRes;

    const body = await req.json();
    const { type, name, code, description, SLAHours, contactEmail } = body;

    if (type === 'CATEGORY') {
      const newCategory = await prisma.complaintCategory.create({
        data: {
          name,
          code: code.toLowerCase(),
          description,
          SLAHours: SLAHours ? parseInt(SLAHours) : 24,
        },
      });
      return NextResponse.json({ success: true, category: newCategory });
    } else {
      const newDepartment = await prisma.department.create({
        data: {
          name,
          code: code.toUpperCase(),
          description,
          contactEmail,
        },
      });
      return NextResponse.json({ success: true, department: newDepartment });
    }
  } catch (error: any) {
    console.error('Error creating department/category:', error);
    return NextResponse.json({ error: 'Failed to create record.' }, { status: 500 });
  }
}
