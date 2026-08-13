import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/auth-schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid registration details.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try logging in." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const name =
      parsed.data.name && parsed.data.name.trim().length > 0
        ? parsed.data.name.trim()
        : email.split("@")[0] || "Reader";

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: passwordHash,
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("[auth/register]", error);
    return NextResponse.json(
      { error: "Could not create account. Check DATABASE_URL and try again." },
      { status: 500 },
    );
  }
}
