import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, JWTPayload } from './auth';

export async function authorizeRequest(
  req: NextRequest,
  allowedRoles?: ('CITIZEN' | 'OFFICER' | 'ADMIN')[]
): Promise<{ user: JWTPayload } | NextResponse> {
  const user = await getSessionUser(req);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in to access this resource.' },
      { status: 401 }
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have permission for this operation.' },
        { status: 403 }
      );
    }
  }

  return { user };
}
