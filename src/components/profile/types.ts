import type { PersonalityAssessment, PersonalityCode } from "@/components/personality/types";

export type ProfileTab =
  | "overview"
  | "books"
  | "lists"
  | "identity"
  | "activity";

export type SocialLinks = {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  goodreads?: string;
};

export type ProfilePrivacy = {
  readingPersonalityPublic: boolean;
  readerDnaPublic: boolean;
  readingEraPublic: boolean;
  activityPublic: boolean;
  readingRoomPublic: boolean;
  booksPublic: boolean;
};

export type RecommendedListBook = {
  bookId: string;
  note: string;
  order: number;
};

export type RecommendedList = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  books: RecommendedListBook[];
  createdAt: string;
  updatedAt: string;
  saveCount: number;
  completionCount: number;
  visibility: "public" | "private";
};

export type BuddyRead = {
  id: string;
  bookId: string;
  friendId: string;
  friendName: string;
  createdBy: "me" | "friend";
  startedAt: string;
  targetEndDate?: string;
  readingStyle: "no-pressure" | "roughly-together" | "checkpoints";
  myProgress: number;
  friendProgress: number;
  checkpointChapter?: number;
  lockedReactionChapter?: number;
  status: "pending" | "active" | "completed";
};

export type ActivityItem = {
  id: string;
  at: string;
  text: string;
  detail?: string;
};

export type FollowPerson = {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  personality?: string;
};

export type UserProfile = {
  userId: string;
  displayName: string;
  username: string;
  bio: string;
  avatarId: "male" | "female";
  shelfPetId: string;
  petName: string;
  socialLinks: SocialLinks;
  followersCount: number;
  followingCount: number;
  privacy: ProfilePrivacy;
  favoriteBookIds: string[];
  featuredBadgeIds: string[];
  recommendedListIds: string[];
  readingEra: {
    title: string;
    blurb: string;
  };
  buddyReads: BuddyRead[];
};

export type ProfileState = {
  profile: UserProfile;
  lists: RecommendedList[];
  followerIds: string[];
  followingPeople: FollowPerson[];
  followerPeople: FollowPerson[];
  activity: ActivityItem[];
  savedListIds: string[];
};

export type VisitorProfileData = {
  id: string;
  displayName: string;
  username: string;
  bio: string;
  avatar: string;
  petId?: string;
  petName?: string;
  personalityCode?: PersonalityCode;
  personalityPublic: boolean;
  readingEra?: { title: string; blurb: string };
  followers: number;
  following: number;
  favoriteBookIds: string[];
  listIds: string[];
  currentBookId?: string;
  currentProgress?: number;
  socialLinks?: SocialLinks;
  roomPublic: boolean;
  activityPublic: boolean;
  dnaTitle?: string;
};
