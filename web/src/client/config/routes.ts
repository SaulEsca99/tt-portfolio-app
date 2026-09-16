export const PUBLIC_ROUTES = {
  home: "/",
} as const;

export const AUTH_ROUTES = {
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export const SETTINGS_ROUTES = {
  general: "/settings",
  account: "/settings/account",
  security: "/settings/security",
} as const;

export const DASHBOARD_ROUTES = {
  home: "/dashboard",
  portfolios: "/portfolios",
  optimize: "/optimize",
  backtesting: "/backtesting",
  marketData: "/market-data",
  assistant: "/assistant",
} as const;

export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...DASHBOARD_ROUTES,
} as const;
