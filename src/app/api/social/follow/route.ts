import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** POST { username } — toggle follow of a signed-up user. */
export async function POST(request: Request) {
  const session = await auth();
  const me = session?.user?.id;
  if (!me) {
    return NextResponse.json({ error: "Sign in to add friends." }, { status: 401 });
  }

  let body: { username?: string } = {};
  try {
    body = (await request.json()) as { username?: string };
  } catch {
    body = {};
  }
  const username = String(body.username ?? "")
    .trim()
    .toLowerCase();
  if (!username) {
    return NextResponse.json({ error: "Username required." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, name: true, image: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Reader not found." }, { status: 404 });
  }
  if (target.id === me) {
    return NextResponse.json({ error: "You can't follow yourself." }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId: me, followingId: target.id },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({
      data: { followerId: me, followingId: target.id },
    });
  }

  const [iFollow, theyFollow] = await Promise.all([
    prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: me, followingId: target.id },
      },
    }),
    prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: target.id, followingId: me },
      },
    }),
  ]);

  return NextResponse.json({
    following: Boolean(iFollow),
    friends: Boolean(iFollow && theyFollow),
    user: {
      id: target.id,
      username: target.username,
      displayName: target.name ?? target.username,
      avatar: target.image ?? "/avatars/1.png",
    },
  });
}
