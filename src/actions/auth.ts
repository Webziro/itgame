'use server';

import { prisma } from "@database/prisma";
import bcrypt from "bcryptjs";

export async function signUp(formData: FormData, bonus?: string | null) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !name) {
      return { error: "Missing required fields" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: "Email already in use" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        bonusBalance: bonus === "1000" ? 1000 : 0,
        walletBalance: 0,
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("[SIGNUP_ERROR]", error);
    return { error: error.message || "Database connection or server error occurred" };
  }
}
