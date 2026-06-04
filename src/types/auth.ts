/**
 * The authenticated user, as returned by user-auth-service `/api/v1/auth/me`
 * (via the gateway). Shape mirrors the ecosystem's chat-frontend `User` type
 * so the two apps share one contract.
 */
import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullname: z.string(),
  email: z.string(),
  avatar: z.string().nullable(),
  role: z.enum(["user", "admin"]).catch("user"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
