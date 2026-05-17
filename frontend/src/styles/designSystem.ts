/**
 * Design System & Spacing Utilities for Scalegrad
 * Ensures consistent spacing, typography, and visual hierarchy across the application.
 */

// Spacing scale (in rem, based on 16px = 1rem)
export const SPACING = {
  // Micro spacing
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
  '5xl': '5rem',    // 80px

  // Common combinations
  section: '3rem',      // 48px - Section padding
  container: '2rem',    // 32px - Container padding
  component: '1.5rem',  // 24px - Component padding
  element: '1rem',      // 16px - Element padding
  compact: '0.5rem',    // 8px - Compact spacing
} as const;

// Typography scale (font-size, line-height)
export const TYPOGRAPHY = {
  // Display sizes (hero/landing page)
  display1: {
    fontSize: '3.5rem',    // 56px
    lineHeight: '1.2',
    fontWeight: 700,
  },
  display2: {
    fontSize: '3rem',      // 48px
    lineHeight: '1.2',
    fontWeight: 700,
  },

  // Heading sizes
  h1: {
    fontSize: '2.5rem',    // 40px
    lineHeight: '1.2',
    fontWeight: 700,
  },
  h2: {
    fontSize: '2rem',      // 32px
    lineHeight: '1.3',
    fontWeight: 600,
  },
  h3: {
    fontSize: '1.5rem',    // 24px
    lineHeight: '1.4',
    fontWeight: 600,
  },
  h4: {
    fontSize: '1.25rem',   // 20px
    lineHeight: '1.4',
    fontWeight: 600,
  },
  h5: {
    fontSize: '1rem',      // 16px
    lineHeight: '1.5',
    fontWeight: 600,
  },
  h6: {
    fontSize: '0.875rem',  // 14px
    lineHeight: '1.5',
    fontWeight: 600,
  },

  // Body text sizes
  body1: {
    fontSize: '1rem',      // 16px
    lineHeight: '1.6',
    fontWeight: 400,
  },
  body2: {
    fontSize: '0.95rem',   // 15.2px
    lineHeight: '1.6',
    fontWeight: 400,
  },
  body3: {
    fontSize: '0.875rem',  // 14px
    lineHeight: '1.5',
    fontWeight: 400,
  },

  // Label & caption
  label: {
    fontSize: '0.875rem',  // 14px
    lineHeight: '1.4',
    fontWeight: 500,
  },
  caption: {
    fontSize: '0.75rem',   // 12px
    lineHeight: '1.4',
    fontWeight: 400,
  },

  // Button text
  button: {
    fontSize: '1rem',      // 16px
    lineHeight: '1.5',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  buttonSmall: {
    fontSize: '0.875rem',  // 14px
    lineHeight: '1.4',
    fontWeight: 500,
  },
} as const;

// Layout grid
export const GRID = {
  columns: {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    6: 6,
    12: 12,
  },
  gap: {
    xs: '0.5rem',     // 8px
    sm: '1rem',       // 16px
    md: '1.5rem',     // 24px
    lg: '2rem',       // 32px
    xl: '2.5rem',     // 40px
  },
} as const;

// Component sizes
export const COMPONENT_SIZES = {
  // Button sizes
  button: {
    xs: {
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      height: '1.75rem',
    },
    sm: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      height: '2.25rem',
    },
    md: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      height: '2.75rem',
    },
    lg: {
      padding: '1rem 2rem',
      fontSize: '1rem',
      height: '3.25rem',
    },
  },

  // Input sizes
  input: {
    sm: {
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
      height: '2rem',
      borderRadius: '0.375rem',
    },
    md: {
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      height: '2.5rem',
      borderRadius: '0.5rem',
    },
    lg: {
      padding: '1rem 1.5rem',
      fontSize: '1.125rem',
      height: '3rem',
      borderRadius: '0.5rem',
    },
  },

  // Card sizes
  card: {
    sm: {
      padding: '1rem',
      borderRadius: '0.375rem',
    },
    md: {
      padding: '1.5rem',
      borderRadius: '0.5rem',
    },
    lg: {
      padding: '2rem',
      borderRadius: '0.75rem',
    },
  },
} as const;

// Colors and contrast
export const COLOR_PALETTE = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#06b6d4',    // Cyan
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  success: {
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  danger: {
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

// Shadows
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

// Border radius
export const BORDER_RADIUS = {
  none: '0',
  xs: '0.125rem',   // 2px
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// Transitions
export const TRANSITIONS = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-index scale
export const Z_INDEX = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
} as const;

// Utility functions
export function getSpacing(value: keyof typeof SPACING): string {
  return SPACING[value];
}

export function getTypography(style: keyof typeof TYPOGRAPHY) {
  const t = TYPOGRAPHY[style];
  return {
    fontSize: t.fontSize,
    lineHeight: t.lineHeight,
    fontWeight: t.fontWeight,
  };
}

export function createTypographyCSS(style: keyof typeof TYPOGRAPHY): string {
  const t = TYPOGRAPHY[style];
  return `
    font-size: ${t.fontSize};
    line-height: ${t.lineHeight};
    font-weight: ${t.fontWeight};
  `;
}

// Layout utilities
export const LAYOUT_PATTERNS = {
  // Container widths
  containerSmall: 'max-width: 56rem',      // 896px
  containerMd: 'max-width: 64rem',         // 1024px
  containerLg: 'max-width: 80rem',         // 1280px
  containerXl: 'max-width: 96rem',         // 1536px

  // Flex center
  flexCenter: 'display: flex; justify-content: center; align-items: center;',
  flexBetween: 'display: flex; justify-content: space-between; align-items: center;',
  flexCol: 'display: flex; flex-direction: column;',
  flexColCenter: 'display: flex; flex-direction: column; justify-content: center; align-items: center;',

  // Common spacing patterns
  gridTwoCol: 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;',
  gridThreeCol: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;',
  gridFourCol: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;',

  // Common padding
  sectionPadding: 'padding: 3rem 2rem;',
  componentPadding: 'padding: 1.5rem;',
} as const;

// Export CSS variables string for global styles
export const CSS_VARIABLES = `
  :root {
    /* Spacing */
    --spacing-xs: ${SPACING.xs};
    --spacing-sm: ${SPACING.sm};
    --spacing-md: ${SPACING.md};
    --spacing-lg: ${SPACING.lg};
    --spacing-xl: ${SPACING.xl};
    --spacing-2xl: ${SPACING['2xl']};
    --spacing-3xl: ${SPACING['3xl']};
    --spacing-4xl: ${SPACING['4xl']};
    --spacing-5xl: ${SPACING['5xl']};

    /* Shadows */
    --shadow-sm: ${SHADOWS.sm};
    --shadow-md: ${SHADOWS.md};
    --shadow-lg: ${SHADOWS.lg};
    --shadow-xl: ${SHADOWS.xl};
    --shadow-2xl: ${SHADOWS['2xl']};

    /* Colors */
    --primary-color: ${COLOR_PALETTE.primary[500]};
    --success-color: ${COLOR_PALETTE.success[500]};
    --warning-color: ${COLOR_PALETTE.warning[500]};
    --danger-color: ${COLOR_PALETTE.danger[500]};

    /* Transitions */
    --transition-fast: ${TRANSITIONS.fast};
    --transition-base: ${TRANSITIONS.base};
    --transition-slow: ${TRANSITIONS.slow};
  }
`;
