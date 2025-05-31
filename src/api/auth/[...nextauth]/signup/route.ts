// File: app/api/auth/signup/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/email"; // You'll need to implement this

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, firstName, lastName } = body as {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };

  // Validation
  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { ok: false, message: "All fields are required" },
      { status: 400 }
    );
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { ok: false, message: "Email already registered" },
      { status: 409 }
    );
  }

  try {
    // Create user with hashed password
    await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 12),
        firstName,
        lastName,
        emailVerified: null, // Will be set when they verify email
      },
    });

    // Generate email verification token
    const verificationToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: expiresAt,
      },
    });

    // Send verification email (non-blocking)
    try {
      await sendVerificationEmail(email, verificationToken, firstName);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the registration if email sending fails
    }

    return NextResponse.json({
      ok: true,
      message: "Account created successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { ok: false, message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}