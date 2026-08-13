import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: Promise<{ username: string }> };

/** Public profile for a signed-up user. */
export async function GET(_request: Request, context: Params) {
  const { username: raw } = await context.params;
  const username = decodeURIComponent(raw).trim().toLowerCase();
  if (!username) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      createdAt: true,
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!user?.username) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const session = await auth();
  const me = session?.user?.id ?? null;
  let youFollow = false;
  let friends = false;
  let isSelf = false;
  if (me) {
    isSelf = me === user.id;
    if (!isSelf) {
      const [a, b] = await Promise.all([
        prisma.follow.findUnique({
          where: {
            followerId_followingId: { followerId: me, followingId: user.id },
          },
        }),
        prisma.follow.findUnique({
          where: {
            followerId_followingId: { followerId: user.id, followingId: me },
          },
        }),
      ]);
      youFollow = Boolean(a);
      friends = Boolean(a && b);
    }
  }

  return NextResponse.json({
    profile: {
      id: user.id,
      displayName: user.name ?? user.username,
      username: user.username,
      avatar: user.image ?? "/avatars/1.png",
      bio: user.bio ?? "ReadLife member — building a shelf together.",
      followers: user._count.followers,
      following: user._count.following,
      joinedAt: user.createdAt.toISOString(),
      kind: "user" as const,
    },
    youFollow,
    friends,
    isSelf,
  });
}
