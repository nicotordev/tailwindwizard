import type { User } from "@clerk/nextjs/server";

export interface SerializedUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
}

export const serializeClerkUser = (
  user: User | null
): SerializedUser | null => {
  if (!user) return null;

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0].emailAddress,
    imageUrl: user.imageUrl,
  };
};
