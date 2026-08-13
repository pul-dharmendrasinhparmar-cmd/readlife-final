import type { AchievementDef } from "./types";

export const ACHIEVEMENT_CATALOG: AchievementDef[] = [
  {
    id: "perfect-week",
    title: "Perfect Week",
    description: "Complete a qualifying game every day for seven days.",
    icon: "✨",
    iconSrc: "/games/badges/perfect-week.png",
  },
  {
    id: "first-chapter",
    title: "First Chapter",
    description: "Play your first ReadLife game.",
    icon: "📖",
    iconSrc: "/games/badges/first-chapter.png",
  },
  {
    id: "bb-first-page",
    title: "First Page",
    description: "Collect your first lost page in Bookbound.",
    icon: "📄",
    iconSrc: "/games/badges/bb-first-page.png",
  },
  {
    id: "bookle-brain",
    title: "Bookle Brain",
    description: "Solve 5 Bookles.",
    icon: "🧠",
    iconSrc: "/games/badges/bookle-brain.png",
  },
  {
    id: "worming-shelves",
    title: "Worming Through the Shelves",
    description: "Score 1,000 in Bookworm.",
    icon: "📗",
    iconSrc: "/games/badges/worming-shelves.png",
  },
  {
    id: "sharp-reader",
    title: "Sharp Reader",
    description: "Solve a Bookle in 3 guesses.",
    icon: "🎯",
    iconSrc: "/games/badges/sharp-reader.png",
  },
  {
    id: "double-feature",
    title: "Double Feature",
    description: "Play both Bookle and Bookworm in one day.",
    icon: "🎬",
    iconSrc: "/games/badges/double-feature.png",
  },
  {
    id: "on-a-roll",
    title: "On a Roll",
    description: "Maintain a 7-day game streak.",
    icon: "🔥",
    iconSrc: "/games/badges/on-a-roll.png",
  },
  {
    id: "bb-ogre-slayer",
    title: "Ogre Slayer",
    description: "Defeat your first Book Ogre.",
    icon: "👹",
    iconSrc: "/games/badges/bb-ogre-slayer.png",
  },
  {
    id: "shelf-master",
    title: "Shelf Master",
    description: "Score 2,500 in Bookworm.",
    icon: "🏆",
    iconSrc: "/games/badges/shelf-master.png",
  },
  {
    id: "bb-ink-master",
    title: "Ink Master",
    description: "Complete the Ink Witch’s chapter.",
    icon: "🪄",
    iconSrc: "/games/badges/bb-ink-master.png",
  },
  {
    id: "bb-story-restored",
    title: "Story Restored",
    description: "Complete every Bookbound chapter.",
    icon: "📚",
    iconSrc: "/games/badges/bb-story-restored.png",
  },
  {
    id: "bb-dragon-slayer",
    title: "Dragon Slayer",
    description: "Defeat the Story Dragon.",
    icon: "🐉",
    iconSrc: "/games/badges/bb-dragon-slayer.png",
  },
  {
    id: "trolley-star",
    title: "Shelf Star",
    description: "Score 200 in Trolley of Tales.",
    icon: "🛒",
  },
  {
    id: "unbeatable",
    title: "Unbeatable",
    description: "Beat your personal Bookworm best three times.",
    icon: "⭐",
  },
];

export function getAchievement(id: string) {
  return ACHIEVEMENT_CATALOG.find((a) => a.id === id);
}
