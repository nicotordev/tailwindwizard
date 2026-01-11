"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
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
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Camera,
  Check,
  Code2,
  Github,
  Globe,
  Hammer,
  Landmark,
  Layers,
  Layout,
  Loader2,
  Shield,
  Sparkles,
  Twitter,
  Wand2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { frontendApi } from "@/lib/frontend-api";
import type { SerializedUser } from "@/utils/serialization";

const onboardingSchema = z.object({
  role: z.enum(["CREATOR", "BUILDER"]),
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  country: z.string().min(1, "Please select a country"),
  websiteUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  githubUsername: z.string().optional(),
  twitterUsername: z.string().optional(),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  imageUrl: z.string().optional(),
});

type FormData = z.infer<typeof onboardingSchema>;

const PRESET_CATEGORIES = [
  { id: "marketing", name: "Marketing", icon: Layout },
  { id: "ecommerce", name: "E-commerce", icon: Layers },
  { id: "dashboard", name: "Dashboards", icon: Layout },
  { id: "landing", name: "Landing Pages", icon: Globe },
  { id: "forms", name: "Forms & Auth", icon: Shield },
  { id: "daisyui", name: "DaisyUI", icon: Code2 },
  { id: "shadcn", name: "Shadcn UI", icon: Sparkles },
  { id: "animated", name: "Animated", icon: Sparkles },
];

export interface OnBoardingWizardProps {
  initialUser: SerializedUser;
}

export default function OnboardingWizard({
  initialUser,
}: OnBoardingWizardProps) {
  const [step, setStep] = useState<
    "role" | "profile" | "interests" | "payment"
  >("role");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: "BUILDER",
      displayName: initialUser.firstName || "",
      bio: "",
      country: "CL",
      websiteUrl: "",
      githubUsername: "",
      twitterUsername: "",
      interests: [],
      imageUrl: initialUser.imageUrl || "",
    },
  });

  const role = form.watch("role");
  const interests = form.watch("interests");
  const imageUrl = form.watch("imageUrl");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("imageUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleInterest = (id: string) => {
    const current = form.getValues("interests");
    if (current.includes(id)) {
      form.setValue(
        "interests",
        current.filter((i) => i !== id)
      );
    } else {
      form.setValue("interests", [...current, id]);
    }
  };

  async function onSubmit(values: FormData) {
    if (step === "role") {
      setStep("profile");
      return;
    }

    if (step === "profile") {
      setStep("interests");
      return;
    }

    if (step === "interests" && values.role === "CREATOR") {
      setStep("payment");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Update User
      await frontendApi.users.updateMe({
        name: values.displayName,
      });

      // 2. If Creator, Create Profile & Onboard
      if (values.role === "CREATOR") {
        try {
          await frontendApi.creators.createMe({
            displayName: values.displayName,
            bio: values.bio,
            websiteUrl: values.websiteUrl || undefined,
            countryCode: values.country,
          });
        } catch (e) {
          console.log("Creator profile creation note:", e);
        }

        const baseUrl = window.location.origin;
        const {
          data: { url },
        } = await frontendApi.creators.onboard({
          returnUrl: `${baseUrl}/dashboard?onboarding=success`,
          refreshUrl: `${baseUrl}/onboarding?step=payment`,
        });

        window.location.href = url;
        return;
      }

      toast.success("Welcome to the Block Economy!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("The ritual failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {["role", "profile", "interests", "payment"].map(
          (s, idx) =>
            (s !== "payment" || role === "CREATOR") && (
              <div
                key={s}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  step === s ? "w-8 bg-primary" : "w-2 bg-border",
                  idx <
                    ["role", "profile", "interests", "payment"].indexOf(step)
                    ? "bg-primary/50"
                    : ""
                )}
              />
            )
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* STEP 1: ROLE SELECTION */}
          {step === "role" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          onClick={() => field.onChange("CREATOR")}
                          className={cn(
                            "group relative p-6 rounded-[2rem] border bg-card/40 backdrop-blur-xl transition-all cursor-pointer text-left h-full flex flex-col justify-between",
                            field.value === "CREATOR"
                              ? "border-creator ring-2 ring-creator/20 shadow-xl shadow-creator/10"
                              : "border-border/60 hover:border-creator/50"
                          )}
                        >
                          <div>
                            <div
                              className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-300",
                                field.value === "CREATOR"
                                  ? "bg-creator border-creator/20 shadow-[0_0_20px_rgba(var(--creator),0.4)]"
                                  : "bg-creator/5 border-creator/5 group-hover:bg-creator/10"
                              )}
                            >
                              <Wand2
                                className={cn(
                                  "h-6 w-6 transition-colors",
                                  field.value === "CREATOR"
                                    ? "text-white"
                                    : "text-creator"
                                )}
                              />
                            </div>
                            <h3 className="text-xl font-bold font-heading mb-2">
                              I&apos;m a Creator
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Upload your blocks, earn revenue, and share your
                              spells with the world.
                            </p>
                          </div>
                          <div className="mt-4 h-7 flex items-center">
                            {field.value === "CREATOR" && (
                              <Badge className="bg-creator text-white border-creator hover:bg-creator/90">
                                Selected
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div
                          onClick={() => field.onChange("BUILDER")}
                          className={cn(
                            "group relative p-6 rounded-[2rem] border bg-card/40 backdrop-blur-xl transition-all cursor-pointer text-left h-full flex flex-col justify-between",
                            field.value === "BUILDER"
                              ? "border-builder ring-2 ring-builder/20 shadow-xl shadow-builder/10"
                              : "border-border/60 hover:border-builder/50"
                          )}
                        >
                          <div>
                            <div
                              className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-300",
                                field.value === "BUILDER"
                                  ? "bg-builder border-builder/20 shadow-[0_0_20px_rgba(var(--builder),0.4)]"
                                  : "bg-builder/5 border-builder/5 group-hover:bg-builder/10"
                              )}
                            >
                              <Hammer
                                className={cn(
                                  "h-6 w-6 transition-colors",
                                  field.value === "BUILDER"
                                    ? "text-white"
                                    : "text-builder"
                                )}
                              />
                            </div>
                            <h3 className="text-xl font-bold font-heading mb-2">
                              I&apos;m a Builder
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Browse the marketplace, buy components, and build
                              faster than ever.
                            </p>
                          </div>
                          <div className="mt-4 h-7 flex items-center">
                            {field.value === "BUILDER" && (
                              <Badge className="bg-builder text-white border-builder hover:bg-builder/90">
                                Selected
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                onClick={() => setStep("profile")}
                className="w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-primary/20"
              >
                Continue to Profile <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* STEP 2: PROFILE DETAILS */}
          {step === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
              {/* Profile Picture Section */}
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
                <div className="text-center">
                  <p className="text-sm font-medium">Wizard Portrait</p>
                  <p className="text-xs text-muted-foreground">
                    Click the camera to change your visage
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
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
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wizard Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Master of the shadow arts and Tailwind utility classes..."
                        className="resize-none rounded-xl min-h-25"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("role")}
                  className="flex-1 h-12 rounded-2xl"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep("interests")}
                  className="flex-2 h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
                >
                  Continue to Specialties{" "}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: INTERESTS / SPECIALTIES */}
          {step === "interests" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold font-heading">
                    What are your specialties?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select the categories that align with your magic.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRESET_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = interests.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleInterest(cat.id)}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer group",
                          isSelected
                            ? "bg-primary/10 border-primary shadow-sm"
                            : "bg-card/40 border-border/60 hover:border-primary/40 hover:bg-primary/5"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-6 w-6 mb-2 transition-colors",
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-primary"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium text-center",
                            isSelected
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {cat.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {form.formState.errors.interests && (
                  <p className="text-xs text-destructive font-medium">
                    {form.formState.errors.interests.message}
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("profile")}
                  className="flex-1 h-12 rounded-2xl"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-2 h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
                >
                  {role === "CREATOR" ? "Payment Setup" : "Finish Ritual"}{" "}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT (CREATORS ONLY) */}
          {step === "payment" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
              <div className="p-6 rounded-[2rem] border border-primary/20 bg-primary/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Landmark className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold font-heading">
                      Payout Infrastructure
                    </h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                      Powered by Stripe
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use <strong>Stripe-hosted onboarding</strong> to keep your
                  data secure and ensure you get paid globally. It automatically
                  handles KYC and tax compliance.
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-3 text-sm p-3 rounded-xl bg-background/50 border border-border/40">
                    <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>
                      Zero-Trust security for your sensitive business info.
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm p-3 rounded-xl bg-background/50 border border-border/40">
                    <Globe className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Support for 45+ countries and local currencies.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest leading-loose">
                  Click below to begin the Stripe connection process in a secure
                  hosted window.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("interests")}
                  className="flex-1 h-12 rounded-2xl"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => onSubmit(form.getValues())}
                  className="flex-2 h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    "Connect Stripe Account"
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
