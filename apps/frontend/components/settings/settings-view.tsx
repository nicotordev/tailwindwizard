"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Creator, User } from "@/types/extended";
import { User as UserIcon, Wand2 } from "lucide-react";
import { useState } from "react";
import CreatorSection from "../dashboard/creator-section-settings";
import ProfileForm from "../dashboard/profile-form-settings";

interface SettingsViewProps {
  user: User;
  creator: Creator | null;
}

export function SettingsView({
  user,
  creator: initialCreator,
}: SettingsViewProps) {
  const [creator, setCreator] = useState<Creator | null>(initialCreator);

  return (
    <>
      <div className="space-y-2 w-full">
        <h2 className="text-3xl font-bold font-heading tracking-tight">
          Settings
        </h2>
        <p className="text-muted-foreground text-lg">
          Manage your identity and creator presence in the realm.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8 w-full">
        <TabsList className="bg-muted/50 p-1 h-12 rounded-2xl w-full max-w-md">
          <TabsTrigger
            value="profile"
            className="rounded-xl h-10 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="creator"
            className="rounded-xl h-10 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Creator Studio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="outline-none w-full">
          <ProfileForm user={user} />
        </TabsContent>

        <TabsContent value="creator" className="outline-none w-full">
          <CreatorSection creator={creator} onCreatorUpdate={setCreator} />
        </TabsContent>
      </Tabs>
    </>
  );
}
