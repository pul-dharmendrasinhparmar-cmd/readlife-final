export const GAME_OVER_MESSAGES = [
  "Maybe books aren't actually food.",
  "So close. The shelf won.",
  "Bookworm flew too close to the literature.",
  "Your TBR survives another day.",
  "Dewey Decimal says: try again.",
  "The stacks demanded a toll.",
  "Spine-tingling, for all the wrong reasons.",
  "Overdue — permanently.",
];

export function randomDeathMessage(): string {
  return GAME_OVER_MESSAGES[
    Math.floor(Math.random() * GAME_OVER_MESSAGES.length)
  ];
}
