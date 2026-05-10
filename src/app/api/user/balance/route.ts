import { auth } from "@/auth";
import { prisma } from "@database/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true, bonusBalance: true }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({
      balance: user.walletBalance,
      bonus: user.bonusBalance
    });
  } catch (error) {
    console.error("[USER_BALANCE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
