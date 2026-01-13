"use server";

import { clerkClient } from "@clerk/nextjs/server";

export async function updateCreatorProfile(userId: string, role: string) {
  const _clerkClient = await clerkClient();
  await _clerkClient.users.updateUser(userId, {
    publicMetadata: {
      isCreator: role === "CREATOR",
    },
  });
}
