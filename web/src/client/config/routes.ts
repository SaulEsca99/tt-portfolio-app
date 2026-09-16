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
  profile: {
    general: "/settings/profile",
    donor: "/settings/profile/donor",
    recipient: "/settings/profile/recipient",
  },
} as const;

export const ADMIN_ROUTES = {
  dashboard: "/admin",
  medications: "/admin/medications",
  requests: "/admin/requests",
  users: "/admin/users",
} as const;

export const ROUTES = {
  ...PUBLIC_ROUTES,
};
