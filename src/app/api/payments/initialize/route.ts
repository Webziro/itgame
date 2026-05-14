import { auth } from "@/auth";
import { prisma } from "@database/prisma";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || isNaN(amount) || amount < 100) {
      return new NextResponse("Invalid amount (Minimum 100 Naira)", { status: 400 });
    }

    const host = req.headers.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // Initialize Paystack Transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: session.user.email,
        amount: amount * 100, // Paystack uses Kobo
        callback_url: `${baseUrl}/api/payments/verify`,
        metadata: {
          userId: session.user.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Create a pending transaction record in our database
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount: parseFloat(amount),
        type: "DEPOSIT",
        status: "PENDING",
        providerRef: response.data.data.reference,
        metadata: { gateway: "paystack" }
      }
    });

    return NextResponse.json(response.data.data);
  } catch (error) {
    console.error("[PAYMENT_INITIALIZE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
