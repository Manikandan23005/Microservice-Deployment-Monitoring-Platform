// --- DevOps Nexus Centralized Enterprise Design System Tokens ---

export const colors = {
  // Brand & Accent Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  indigo: {
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
  },

  // Dark Slate Theme Neutral Palette
  slate: {
    950: '#020617',
    900: '#0f172a',
    850: '#141e33',
    800: '#1e293b',
    700: '#334155',
    600: '#475569',
    500: '#64748b',
    400: '#94a3b8',
    300: '#cbd5e1',
    200: '#e2e8f0',
    100: '#f1f5f9',
    50: '#f8fafc',
  },

  // Semantic Status Colors
  semantic: {
    success: {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.25)',
      text: '#10b981',
      badgeBg: '#10b981',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.25)',
      text: '#f59e0b',
      badgeBg: '#f59e0b',
    },
    danger: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.25)',
      text: '#ef4444',
      badgeBg: '#ef4444',
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.25)',
      text: '#3b82f6',
      badgeBg: '#3b82f6',
    },
  },

  // Kubernetes Workload & GitOps Status Chips
  statusChips: {
    Running: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    Synced: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    Healthy: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    Pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
    OutOfSync: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
    CrashLoopBackOff: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
    Error: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
    Failed: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
  }
};

export const typography = {
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
  scale: {
    'xs': '0.75rem',     // 12px
    'sm': '0.875rem',    // 14px
    'base': '1rem',      // 16px
    'lg': '1.125rem',    // 18px
    'xl': '1.25rem',     // 20px
    '2xl': '1.5rem',     // 24px
    '3xl': '1.875rem',   // 30px
  }
};

export const animationTokens = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  }
};

export const designTokens = {
  colors,
  typography,
  animationTokens,
};
