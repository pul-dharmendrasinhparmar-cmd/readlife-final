"use client";

import { DISCOVER_READERS } from "@/components/search/data";
import type {
  ActivityItem,
  FollowPerson,
  ProfileState,
  RecommendedList,
  UserProfile,
} from "./types";

const PROFILE_KEY = "readlife-profile-v1";

export const OWNER_LISTS: RecommendedList[] = [
  {
    id: "alex-slow-burns",
    creatorId: "alex",
    title: "Five-Star Slow Burns",
    description:
      "Books that take their time — tension, longing, and payoffs that earn the wait.",
    books: [
      {
        bookId: "night-circus",
        note: "Atmosphere first. Let the circus arrive slowly.",
        order: 1,
      },
      {
        bookId: "achilles",
        note: "Devastating and tender in equal measure.",
        order: 2,
      },
      {
        bookId: "circe",
        note: "A long becoming — worth every island.",
        order: 3,
      },
      {
        bookId: "piranesi",
        note: "Trust the halls. Don't rush the map.",
        order: 4,
      },
      {
        bookId: "hamnet",
        note: "Quiet devastation done with exquisite patience.",
        order: 5,
      },
    ],
    createdAt: "2026-06-02T12:00:00.000Z",
    updatedAt: "2026-07-20T12:00:00.000Z",
    saveCount: 1284,
    completionCount: 42,
    visibility: "public",
  },
  {
    id: "alex-no-infodump",
    creatorId: "alex",
    title: "Fantasy for People Who Hate Info Dumps",
    description:
      "Magic that arrives like weather — no textbook chapters required.",
    books: [
      {
        bookId: "piranesi",
        note: "Go in knowing absolutely nothing.",
        order: 1,
      },
      {
        bookId: "night-circus",
        note: "Read this for atmosphere, not plot maps.",
        order: 2,
      },
      {
        bookId: "starless-sea",
        note: "Doorways over diagrams.",
        order: 3,
      },
      {
        bookId: "house-sky",
        note: "Gentle worldbuilding by vibes alone.",
        order: 4,
      },
      {
        bookId: "ninth-house",
        note: "Lore unlocked through dread, not lectures.",
        order: 5,
      },
    ],
    createdAt: "2026-05-14T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z",
    saveCount: 842,
    completionCount: 28,
    visibility: "public",
  },
  {
    id: "alex-first-time",
    creatorId: "alex",
    title: "Books I Wish I Could Read Again for the First Time",
    description: "If I could wipe the memory and walk back in blind.",
    books: [
      { bookId: "night-circus", note: "The tents, the first time.", order: 1 },
      { bookId: "six-crows", note: "That heist energy hit different.", order: 2 },
      { bookId: "hobbit", note: "Leaving the Shire never gets old — but first is first.", order: 3 },
      { bookId: "project-hail", note: "Science joy as pure discovery.", order: 4 },
    ],
    createdAt: "2026-04-10T12:00:00.000Z",
    updatedAt: "2026-06-18T12:00:00.000Z",
    saveCount: 610,
    completionCount: 19,
    visibility: "public",
  },
];

function readerToFollow(r: (typeof DISCOVER_READERS)[number]): FollowPerson {
  return {
    id: r.id,
    displayName: r.displayName,
    username: r.username,
    avatar: r.avatar,
    personality: r.readingPersonality,
  };
}

const DEMO_FOLLOWING: FollowPerson[] = DISCOVER_READERS.slice(0, 8).map(
  readerToFollow,
);

const DEMO_FOLLOWERS: FollowPerson[] = [
  ...DISCOVER_READERS.slice(0, 6).map(readerToFollow),
  ...DISCOVER_READERS.slice(6, 10).map(readerToFollow),
];

const DEMO_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    at: "2026-08-10T21:00:00.000Z",
    text: "Continued The Night Circus",
    detail: "47% · 42 min session",
  },
  {
    id: "a2",
    at: "2026-08-08T19:00:00.000Z",
    text: "Started Piranesi",
    detail: "From Mina's dreamlike list",
  },
  {
    id: "a3",
    at: "2026-08-05T16:00:00.000Z",
    text: "Created a list",
    detail: "Fantasy for People Who Hate Info Dumps",
  },
  {
    id: "a4",
    at: "2026-08-01T12:00:00.000Z",
    text: "Earned badge",
    detail: "🌙 Night Owl",
  },
  {
    id: "a5",
    at: "2026-07-28T20:00:00.000Z",
    text: "Finished The Hobbit",
    detail: "★★★★★ · Favorite",
  },
  {
    id: "a6",
    at: "2026-07-15T18:22:00.000Z",
    text: "Discovered Reading Personality",
    detail: "🌙 The Dream Wanderer · EIMO",
  },
];

export function defaultOwnerProfile(): UserProfile {
  return {
    userId: "alex",
    displayName: "Alex",
    username: "alexreads",
    bio: "Fantasy, slow burns, and books that feel like walking into fog with a lantern. Currently living for atmosphere over plot maps.",
    avatarId: "female",
    shelfPetId: "cat",
    petName: "Mochi",
    socialLinks: {
      instagram: "alexreads",
      goodreads: "alexreads",
    },
    followersCount: 342,
    followingCount: 218,
    privacy: {
      readingPersonalityPublic: true,
      readerDnaPublic: true,
      readingEraPublic: true,
      activityPublic: true,
      readingRoomPublic: true,
      booksPublic: true,
    },
    favoriteBookIds: ["night-circus", "hobbit", "piranesi", "achilles", "circe"],
    featuredBadgeIds: ["night-owl", "genre-hopper", "tbr-tamer", "list-explorer"],
    recommendedListIds: OWNER_LISTS.map((l) => l.id),
    readingEra: {
      title: "Fantasy Obsession Era",
      blurb: "Apparently we're collecting doorways and soft magic this month.",
    },
    buddyReads: [
      {
        id: "br-mina-circus",
        bookId: "night-circus",
        friendId: "mina",
        friendName: "Mina",
        createdBy: "me",
        startedAt: "2026-08-08T12:00:00.000Z",
        targetEndDate: "2026-08-31",
        readingStyle: "roughly-together",
        myProgress: 47,
        friendProgress: 39,
        checkpointChapter: 10,
        lockedReactionChapter: 14,
        status: "active",
      },
    ],
  };
}

export function defaultProfileState(): ProfileState {
  return {
    profile: defaultOwnerProfile(),
    lists: OWNER_LISTS,
    followerIds: DEMO_FOLLOWERS.map((f) => f.id),
    followingPeople: DEMO_FOLLOWING,
    followerPeople: DEMO_FOLLOWERS,
    activity: DEMO_ACTIVITY,
    savedListIds: ["altered-brain"],
  };
}

export function loadProfileState(): ProfileState {
  if (typeof window === "undefined") return defaultProfileState();
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      const fresh = defaultProfileState();
      saveProfileState(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<ProfileState>;
    const base = defaultProfileState();
    return {
      ...base,
      ...parsed,
      profile: {
        ...base.profile,
        ...(parsed.profile ?? {}),
        socialLinks: {
          ...base.profile.socialLinks,
          ...(parsed.profile?.socialLinks ?? {}),
        },
        privacy: {
          ...base.profile.privacy,
          ...(parsed.profile?.privacy ?? {}),
        },
        readingEra: {
          ...base.profile.readingEra,
          ...(parsed.profile?.readingEra ?? {}),
        },
        buddyReads:
          parsed.profile?.buddyReads ?? base.profile.buddyReads,
      },
      lists: parsed.lists?.length ? parsed.lists : base.lists,
      followingPeople: parsed.followingPeople?.length
        ? parsed.followingPeople
        : base.followingPeople,
      followerPeople: parsed.followerPeople?.length
        ? parsed.followerPeople
        : base.followerPeople,
      activity: parsed.activity?.length ? parsed.activity : base.activity,
    };
  } catch {
    return defaultProfileState();
  }
}

export function saveProfileState(state: ProfileState) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function updateProfile(
  state: ProfileState,
  patch: Partial<UserProfile>,
): ProfileState {
  const next: ProfileState = {
    ...state,
    profile: {
      ...state.profile,
      ...patch,
      socialLinks: {
        ...state.profile.socialLinks,
        ...(patch.socialLinks ?? {}),
      },
      privacy: {
        ...state.profile.privacy,
        ...(patch.privacy ?? {}),
      },
    },
  };
  saveProfileState(next);
  return next;
}

export function getOwnerListById(
  state: ProfileState,
  id: string,
): RecommendedList | undefined {
  return state.lists.find((l) => l.id === id);
}

export function bumpListSave(state: ProfileState, listId: string): ProfileState {
  const lists = state.lists.map((l) =>
    l.id === listId ? { ...l, saveCount: l.saveCount + 1 } : l,
  );
  const savedListIds = state.savedListIds.includes(listId)
    ? state.savedListIds
    : [...state.savedListIds, listId];
  const next = { ...state, lists, savedListIds };
  saveProfileState(next);
  return next;
}
