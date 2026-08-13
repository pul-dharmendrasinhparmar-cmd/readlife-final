import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import {
  assertPayloadSize,
  emptyUserDataPayload,
  parseUserDataPayload,
  type UserDataPayload,
} from "@/lib/user-data";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const row = await prisma.userData.findUnique({
      where: { userId },
      select: { payload: true, updatedAt: true },
    });

    const payload =
      parseUserDataPayload(row?.payload) ?? emptyUserDataPayload();

    return NextResponse.json({
      payload,
      updatedAt: row?.updatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("[api/user/data GET]", error);
    return NextResponse.json(
      { error: "Could not load user data." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { payload?: unknown };
    const payload = parseUserDataPayload(body.payload);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid payload. Expected { version, entries }." },
        { status: 400 },
      );
    }
    if (!assertPayloadSize(payload)) {
      return NextResponse.json(
        { error: "Payload too large." },
        { status: 413 },
      );
    }

    const stored: UserDataPayload = {
      version: 1,
      entries: payload.entries,
    };

    const row = await prisma.userData.upsert({
      where: { userId },
      create: { userId, payload: stored },
      update: { payload: stored },
      select: { updatedAt: true },
    });

    return NextResponse.json({
      ok: true,
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[api/user/data PUT]", error);
    return NextResponse.json(
      { error: "Could not save user data." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}
