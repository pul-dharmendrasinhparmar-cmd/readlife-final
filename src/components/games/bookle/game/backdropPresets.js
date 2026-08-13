export const PRESETS = {
  'shire-hills': {
    silhouetteType: 'radial',
    silhouetteStyle: {
      height: '42%',
      background: [
        'radial-gradient(ellipse 70% 100% at 15% 100%, #c9b0e0 0%, transparent 60%)',
        'radial-gradient(ellipse 60% 90% at 55% 100%, #5b4e8c 0%, transparent 65%)',
        'radial-gradient(ellipse 65% 100% at 90% 100%, #4a6350 0%, transparent 60%)',
        'linear-gradient(to top, rgba(176, 143, 206, 0.28) 0%, transparent 100%)',
      ].join(', '),
    },
    overlayStyle: {
      width: '90px',
      height: '90px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, #fff8e8 0%, #e8c97a 55%, transparent 100%)',
      top: '8%',
      left: '12%',
      inset: 'unset',
      opacity: 0.85,
    },
  },

  'castle-towers': {
    silhouetteType: 'clipPath',
    clipPath:
      'polygon(0% 100%, 0% 55%, 6% 55%, 6% 38%, 11% 38%, 11% 50%, 16% 50%, 16% 20%, 21% 20%, 21% 45%, 28% 45%, 28% 60%, 36% 60%, 36% 15%, 41% 15%, 41% 50%, 48% 50%, 48% 32%, 53% 32%, 53% 48%, 60% 48%, 60% 8%, 65% 8%, 65% 42%, 72% 42%, 72% 58%, 79% 58%, 79% 28%, 84% 28%, 84% 52%, 91% 52%, 91% 38%, 96% 38%, 96% 58%, 100% 58%, 100% 100%)',
    silhouetteHeight: '38%',
  },

  'treeline': {
    silhouetteType: 'clipPath',
    clipPath:
      'polygon(0% 100%, 0% 70%, 4% 90%, 9% 55%, 14% 90%, 19% 60%, 24% 90%, 29% 50%, 34% 90%, 39% 65%, 44% 90%, 49% 45%, 54% 90%, 59% 60%, 64% 90%, 69% 50%, 74% 90%, 79% 65%, 84% 90%, 89% 55%, 94% 90%, 100% 70%, 100% 100%)',
    silhouetteHeight: '40%',
    overlayStyle: {
      background:
        'radial-gradient(circle at 50% 12%, rgba(176, 143, 206, 0.22) 0%, transparent 48%)',
    },
  },

  'hotel-snow': {
    silhouetteType: 'clipPath',
    clipPath:
      'polygon(0% 100%, 0% 65%, 10% 65%, 10% 45%, 16% 45%, 16% 30%, 22% 30%, 22% 45%, 28% 45%, 28% 55%, 50% 55%, 50% 20%, 56% 20%, 56% 55%, 72% 55%, 72% 42%, 78% 42%, 78% 55%, 100% 55%, 100% 100%)',
    silhouetteHeight: '46%',
  },

  'mountains': {
    silhouetteType: 'clipPath',
    clipPath:
      'polygon(0% 100%, 0% 70%, 10% 40%, 20% 65%, 30% 30%, 40% 55%, 50% 20%, 60% 50%, 70% 25%, 80% 55%, 90% 35%, 100% 60%, 100% 100%)',
    silhouetteHeight: '45%',
  },

  'ocean-waves': {
    silhouetteType: 'clipPath',
    clipPath:
      'polygon(0% 100%, 0% 75%, 5% 70%, 10% 75%, 15% 70%, 20% 75%, 25% 70%, 30% 75%, 35% 70%, 40% 75%, 45% 70%, 50% 75%, 55% 70%, 60% 75%, 65% 70%, 70% 75%, 75% 70%, 80% 75%, 85% 70%, 90% 75%, 95% 70%, 100% 75%, 100% 100%)',
    silhouetteHeight: '35%',
  },

  'city-skyline': {
    silhouetteType: 'clipPath',
    clipPath:
      'polygon(0% 100%, 0% 60%, 5% 60%, 5% 40%, 10% 40%, 10% 55%, 15% 55%, 15% 25%, 20% 25%, 20% 50%, 25% 50%, 25% 35%, 30% 35%, 30% 55%, 40% 55%, 40% 15%, 45% 15%, 45% 45%, 50% 45%, 50% 30%, 55% 30%, 55% 50%, 65% 50%, 65% 20%, 70% 20%, 70% 45%, 75% 45%, 75% 55%, 80% 55%, 80% 35%, 85% 35%, 85% 55%, 90% 55%, 90% 45%, 95% 45%, 95% 60%, 100% 60%, 100% 100%)',
    silhouetteHeight: '50%',
  },

  'generic-gradient': {
    silhouetteType: 'none',
  },
}

export const EFFECTS = {
  stars: {
    className: 'effect-stars',
    css: `
      background-image: radial-gradient(2px 2px at 20% 20%, var(--overlay-color), transparent),
        radial-gradient(1.5px 1.5px at 60% 10%, var(--overlay-color), transparent),
        radial-gradient(1.5px 1.5px at 80% 25%, var(--overlay-color), transparent),
        radial-gradient(2px 2px at 35% 35%, var(--overlay-color), transparent),
        radial-gradient(1px 1px at 90% 15%, var(--overlay-color), transparent),
        radial-gradient(1.5px 1.5px at 10% 45%, var(--overlay-color), transparent),
        radial-gradient(2px 2px at 70% 40%, var(--overlay-color), transparent);
      background-size: 100% 60%;
      background-repeat: no-repeat;
      animation: twinkle 3s ease-in-out infinite alternate;
    `,
  },
  snow: {
    className: 'effect-snow',
    css: `
      background-image: radial-gradient(2px 2px at 15% 20%, var(--overlay-color), transparent),
        radial-gradient(1.5px 1.5px at 45% 10%, var(--overlay-color), transparent),
        radial-gradient(1.5px 1.5px at 75% 30%, var(--overlay-color), transparent),
        radial-gradient(1px 1px at 90% 12%, var(--overlay-color), transparent),
        radial-gradient(1.5px 1.5px at 30% 40%, var(--overlay-color), transparent),
        radial-gradient(1px 1px at 60% 22%, var(--overlay-color), transparent);
      background-size: 100% 200%;
      background-position: 0 0;
      opacity: 0.5;
      animation: snowfall 9s linear infinite;
    `,
  },
  mist: {
    className: 'effect-mist',
    css: `
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(200, 200, 200, 0.08) 25%,
        rgba(200, 200, 200, 0.12) 50%,
        rgba(200, 200, 200, 0.08) 75%,
        transparent 100%
      );
      background-size: 200% 100%;
      animation: mist-drift 12s ease-in-out infinite alternate;
    `,
  },
  fireflies: {
    className: 'effect-fireflies',
    css: `
      background-image: radial-gradient(2px 2px at 25% 60%, var(--overlay-color), transparent),
        radial-gradient(2px 2px at 55% 70%, var(--overlay-color), transparent),
        radial-gradient(1.5px 1.5px at 80% 55%, var(--overlay-color), transparent),
        radial-gradient(2px 2px at 40% 80%, var(--overlay-color), transparent),
        radial-gradient(1.5px 1.5px at 70% 65%, var(--overlay-color), transparent);
      background-size: 100% 100%;
      animation: twinkle 2s ease-in-out infinite alternate;
    `,
  },
}

export function resolvePreset(name) {
  return PRESETS[name] || PRESETS['generic-gradient']
}

export function resolveEffect(name) {
  if (!name || name === 'none') return null
  return EFFECTS[name] || null
}
