export type UserRole = "admin" | "user";

export interface UserProfile {
  id: string;

  name: string;
  email: string;
  image?: string | null;
  role?: string | null;

  isDonor?: boolean;
}
