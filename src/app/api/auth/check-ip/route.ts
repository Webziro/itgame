import { prisma } from "@database/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    
    const attempt = await prisma.ipAttempt.findUnique({
      where: { ip }
    });

    if (attempt && attempt.isBlocked) {
      const now = new Date();
      if (attempt.blockedUntil && attempt.blockedUntil > now) {
        const timeLeft = Math.ceil((attempt.blockedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return NextResponse.json({ 
          isBlocked: true, 
          message: `Your IP is cooling down. Please try again in ${timeLeft} days.` 
        });
      } else {
        // Cooldown expired
        await prisma.ipAttempt.update({
          where: { ip },
          data: { isBlocked: false, attempts: 0 }
        });
      }
    }

    return NextResponse.json({ isBlocked: false });
  } catch (error) {
    return NextResponse.json({ isBlocked: false });
  }
}
