import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** GET — list signed-up readers you can add (excludes self). */
export async function GET() {
  const session = await auth();
  const me = session?.user?.id ?? null;

  const users = await prisma.user.findMany({
    where: {
      username: { not: null },
      ...(me ? { id: { not: me } } : {}),
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      _count: { select: { followers: true, following: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  let followingSet = new Set<string>();
  let friendSet = new Set<string>();
  if (me) {
    const myFollows = await prisma.follow.findMany({
      where: { followerId: me },
      select: { followingId: true },
    });
    followingSet = new Set(myFollows.map((f) => f.followingId));
    const reciprocals = await prisma.follow.findMany({
      where: {
        followerId: { in: [...followingSet] },
        followingId: me,
      },
      select: { followerId: true },
    });
    friendSet = new Set(reciprocals.map((f) => f.followerId));
  }

  return NextResponse.json({
    people: users.map((u) => ({
      id: u.id,
      displayName: u.name ?? u.username ?? "Reader",
      username: u.username!,
      avatar: u.image ?? "/avatars/1.png",
      bio: u.bio ?? "",
      followers: u._count.followers,
      following: u._count.following,
      youFollow: followingSet.has(u.id),
      friends: friendSet.has(u.id),
      kind: "user" as const,
    })),
  });
}
