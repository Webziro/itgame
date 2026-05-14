import { prisma } from "@database/prisma";
import { pusherServer } from "@/lib/pusher-server";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    const host = req.headers.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    if (!reference) {
      return NextResponse.redirect(`${baseUrl}/dashboard?error=no_reference`);
    }

    // Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, metadata, amount } = response.data.data;

    if (status === "success") {
      const userId = metadata.userId;

      // Find the pending transaction
      const transaction = await prisma.transaction.findUnique({
        where: { providerRef: reference }
      });

      if (transaction && transaction.status === "PENDING") {
        // Update User Balance and Transaction Status in a transaction
        const [updatedUser] = await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { walletBalance: { increment: amount / 100 } }
          }),
          prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: "SUCCESS" }
          })
        ]);

        // Trigger real-time event
        await pusherServer.trigger("platform-events", "global-activity", {
          user: updatedUser.name || "A Player",
          prize: `₦${(amount / 100).toLocaleString()}`,
          type: "Nitro Deposit",
          initial: (updatedUser.name || "A")[0]
        });
      }

      return NextResponse.redirect(`${baseUrl}/dashboard?success=true`);
    }

    return NextResponse.redirect(`${baseUrl}/dashboard?error=failed`);
  } catch (error) {
    console.error("[PAYMENT_VERIFY_ERROR]", error);
    const host = req.headers.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    return NextResponse.redirect(`${baseUrl}/dashboard?error=internal_error`);
  }
}
