import { prisma } from "@database/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const { success } = await req.json();
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';

    if (success) {
      // If they won, we can optionally reset or just leave it.
      // But they'll get the cookie and signup anyway.
      return NextResponse.json({ success: true });
    }

    // On failure, increment attempts
    const attempt = await prisma.ipAttempt.upsert({
      where: { ip },
      update: { 
        attempts: { increment: 1 },
        lastAttempt: new Date()
      },
      create: { 
        ip, 
        attempts: 1,
        lastAttempt: new Date()
      }
    });

    if (attempt.attempts >= 3) {
      const threeMonths = new Date();
      threeMonths.setMonth(threeMonths.getMonth() + 3);
      
      await prisma.ipAttempt.update({
        where: { ip },
        data: { 
          isBlocked: true, 
          blockedUntil: threeMonths 
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
