"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Camera, Globe, Github, Twitter, Loader2, ArrowRight, Upload, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingFormData } from "../types";
import type { SerializedUser } from "@/utils/serialization";
import { frontendApi } from "@/lib/frontend-api";
import { toast } from "sonner";

interface ProfileStepProps {
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  initialUser: SerializedUser;
}

export function ProfileStep({ onNext, onBack, isLoading, initialUser }: ProfileStepProps) {
  const { control, setValue, watch } = useFormContext<OnboardingFormData>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const imageUrl = watch("imageUrl");
  const [isParsing, setIsParsing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setValue("imageUrl", result, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const { data } = await frontendApi.resume.parse(file);
      
      if (data.suggestedBio) setValue("bio", data.suggestedBio, { shouldDirty: true });
      if (data.website) setValue("websiteUrl", data.website, { shouldDirty: true });
      if (data.github) setValue("githubUsername", data.github, { shouldDirty: true });
      if (data.twitter) setValue("twitterUsername", data.twitter, { shouldDirty: true });
      
      toast.success("Resume parsed! Please review the fields.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to parse resume.");
    } finally {
      setIsParsing(false);
      // Reset input so same file can be selected again if needed
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
      <div className="flex flex-col items-center justify-center space-y-4 mb-8">
        <div className="relative group">
          <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-2xl transition-transform group-hover:scale-105">
            <AvatarImage src={imageUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {initialUser?.firstName?.[0] || "W"}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="text-center space-y-2">
          <div>
            <p className="text-sm font-medium">Wizard Portrait</p>
            <p className="text-xs text-muted-foreground">
              Click the camera to change your visage
            </p>
          </div>
          <div className="pt-2">
            <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="gap-2 h-8 text-xs rounded-full"
                onClick={() => resumeInputRef.current?.click()}
                disabled={isParsing}
            >
                {isParsing ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                Auto-fill from Resume
            </Button>
            <input
                type="file"
                ref={resumeInputRef}
                onChange={handleResumeUpload}
                accept=".pdf"
                className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="The Great Merlin"
                  {...field}
                  className="h-11 rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select your realm" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CL">Chile 🇨🇱</SelectItem>
                  <SelectItem value="US">United States 🇺🇸</SelectItem>
                  <SelectItem value="ES">Spain 🇪🇸</SelectItem>
                  <SelectItem value="AR">Argentina 🇦🇷</SelectItem>
                  <SelectItem value="MX">Mexico 🇲🇽</SelectItem>
                  <SelectItem value="BR">Brazil 🇧🇷</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="websiteUrl"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <FormLabel className="m-0">Website / Portfolio</FormLabel>
            </div>
            <FormControl>
              <Input
                placeholder="https://yourmagic.com"
                {...field}
                className="h-11 rounded-xl"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Wizard Bio</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Master of the shadow arts and Tailwind utility classes..."
                className="resize-none rounded-xl max-h-25"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="githubUsername"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2 mb-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                <FormLabel className="m-0">GitHub</FormLabel>
              </div>
              <FormControl>
                <Input
                  placeholder="username"
                  {...field}
                  className="h-10 rounded-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="twitterUsername"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2 mb-2">
                <Twitter className="h-4 w-4 text-muted-foreground" />
                <FormLabel className="m-0">X / Twitter</FormLabel>
              </div>
              <FormControl>
                <Input
                  placeholder="@handle"
                  {...field}
                  className="h-10 rounded-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 rounded-2xl"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          className="flex-[2] h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <>
              Continue to Specialties{" "}
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
