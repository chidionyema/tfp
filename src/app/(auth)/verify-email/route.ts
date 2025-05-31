// File: app/api/auth/verify-email/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Verification token is required" },
      { status: 400 }
    );
  }

  try {
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { ok: false, message: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { ok: false, message: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Update user's email verification status
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Clean up the used token
    await prisma.verificationToken.delete({
      where: { token },
    });

    // Redirect to a success page or login page
    return NextResponse.redirect(new URL("/auth?verified=true", request.url));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { ok: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}