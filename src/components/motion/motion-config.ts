export const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const;

export const PREMIUM_TRANSITION = {
  duration: 0.6,
  ease: PREMIUM_EASE,
} as const;

export const QUICK_TRANSITION = {
  duration: 0.35,
  ease: PREMIUM_EASE,
} as const;

export const STAGGER_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
} as const;

export const STAGGER_GRID = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
} as const;

export const FADE_UP = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: PREMIUM_TRANSITION,
  },
} as const;

export const FADE_UP_SUBTLE = {
  hidden: {
    opacity: 0,
    y: 16,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: PREMIUM_EASE },
  },
} as const;

export const SCALE_IN = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: PREMIUM_TRANSITION,
  },
} as const;

export const CLIP_REVEAL = {
  hidden: {
    opacity: 0,
    clipPath: "inset(0 0 100% 0)",
  },
  visible: {
    opacity: 1,
    clipPath: "inset(0 0 0 0)",
    transition: { duration: 0.7, ease: PREMIUM_EASE },
  },
} as const;

export const SLIDE_IN_RIGHT = {
  hidden: {
    opacity: 0,
    x: 32,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: PREMIUM_EASE },
  },
} as const;
