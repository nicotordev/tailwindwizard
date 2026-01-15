"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { frontendApi } from "@/lib/frontend-api";
import { cn } from "@/lib/utils";
import type { Creator } from "@/types/extended";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronsUpDown,
  ExternalLink,
  Globe,
  Landmark,
  Layout,
  Loader2,
  Shield,
  Wand2,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import rawCountries from "world-countries";
import { toast } from "sonner";
import * as z from "zod";

const creatorSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  websiteUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  portfolioUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  countryCode: z
    .string()
    .length(2, "Must be a 2-letter country code")
    .optional(),
});

export interface CreatorSectionProps {
  creator: Creator | null;
  onCreatorUpdate: (creator: Creator) => void;
}

export default function CreatorSection({
  creator,
  onCreatorUpdate,
}: CreatorSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const router = useRouter();
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const countries = useMemo(
    () =>
      rawCountries
        .map((country) => ({
          value: country.cca2,
          label: country.name.common,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  const form = useForm<z.infer<typeof creatorSchema>>({
    resolver: zodResolver(creatorSchema),
    defaultValues: {
      displayName: creator?.displayName || "",
      bio: creator?.bio || "",
      websiteUrl: creator?.websiteUrl || "",
      portfolioUrl: creator?.portfolioUrl || "",
      countryCode: creator?.countryCode || "",
    },
  });

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const { data } = await frontendApi.resume.parse(file);
      
      if (data.suggestedBio) form.setValue("bio", data.suggestedBio, { shouldDirty: true });
      if (data.website) form.setValue("websiteUrl", data.website, { shouldDirty: true });
      // portfolioUrl isn't mapped in resume service explicitly, but we could check
      if (data.github || data.twitter) {
         // Maybe just toast about found social links if fields aren't present
      }
      
      toast.success("Resume parsed! Please review the fields.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to parse resume.");
    } finally {
      setIsParsing(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  };

  async function onSubmit(data: z.infer<typeof creatorSchema>) {
    setIsLoading(true);
    try {
      let updatedCreator;
      if (creator) {
        const res = await fetch("/api/v1/creators/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed");
        updatedCreator = await res.json();
      } else {
        const res = await frontendApi.creators.createMe(data);
        updatedCreator = res.data;
      }
      onCreatorUpdate(updatedCreator);
      toast.success(
        creator ? "Creator profile updated" : "Creator profile created"
      );
      router.refresh();
    } catch (error) {
      toast.error("Failed to save creator profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnectStripe() {
    setIsStripeLoading(true);
    try {
      const { data } = await frontendApi.creators.onboard({
        returnUrl: window.location.href,
        refreshUrl: window.location.href,
      });
      window.location.href = data.url;
    } catch (error) {
      toast.error("Failed to initiate Stripe onboarding");
      console.error(error);
      setIsStripeLoading(false);
    }
  }

  if (!creator) {
    return (
      <div className="rounded-[2.5rem] border border-border/60 bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="p-8 md:p-16 text-center space-y-12">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="mx-auto w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.2)] animate-in fade-in zoom-in duration-500">
              <Wand2 className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-4 max-w-2xl mx-auto">
              <h3 className="text-4xl md:text-5xl font-bold font-heading tracking-tight">
                Become a Creator
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Join the elite circle of wizards who build the blocks of the
                future. Earn revenue, gain recognition, and share your magic
                with the world.
              </p>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Shield,
                title: "Global Payouts",
                desc: "Stripe-powered payments in 45+ countries.",
              },
              {
                icon: Layout,
                title: "Your Storefront",
                desc: "Showcase your components with premium style.",
              },
              {
                icon: Globe,
                title: "Reach Everyone",
                desc: "Sell to builders and teams around the world.",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-background/40 border border-border/50 backdrop-blur-sm transition-all hover:bg-background/60 hover:scale-[1.02] group"
              >
                <benefit.icon className="w-8 h-8 text-primary mb-4 mx-auto transition-transform group-hover:scale-110" />
                <h4 className="font-bold mb-2">{benefit.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Application Form */}
          <div className="pt-12 border-t border-border/40 max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 rounded-full px-4 py-1">
                Step 1: Creator Identity
              </Badge>
              <h4 className="text-2xl font-heading font-bold">
                Start your application
              </h4>
            </div>

            <div className="text-left w-full">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Studio / Creator Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Acme Inc."
                              {...field}
                              className="h-12 rounded-xl bg-background/50 border-border/50 focus:bg-background transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-2">
                          <FormLabel>Country</FormLabel>
                          <Popover
                            open={isCountryOpen}
                            onOpenChange={setIsCountryOpen}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full h-12 justify-between rounded-xl bg-background/50 border-border/50",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? countries.find(
                                        (country) =>
                                          country.value === field.value
                                      )?.label
                                    : "Select country"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                              <Command>
                                <CommandInput placeholder="Search country..." />
                                <CommandList>
                                  <CommandEmpty>No country found.</CommandEmpty>
                                  <CommandGroup>
                                    {countries.map((country) => (
                                      <CommandItem
                                        value={country.label}
                                        key={country.value}
                                        onSelect={() => {
                                          form.setValue(
                                            "countryCode",
                                            country.value
                                          );
                                          setIsCountryOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            country.value === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {country.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      "Complete Application"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] border border-border/60 bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
      <div className="p-8 md:p-10 space-y-10">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/40 pb-8">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-heading flex items-center gap-2">
              Creator Studio
              {creator.isApprovedSeller && (
                <Badge variant="secondary" className="rounded-md">
                  Verified
                </Badge>
              )}
            </h3>
            <p className="text-muted-foreground">
              Manage your public profile and payout settings.
            </p>
          </div>
          {/* Stripe Status Widget */}
          <div className="flex items-center gap-3 bg-background/50 p-3 rounded-2xl border border-border/50">
            <div
              className={cn(
                "h-3 w-3 rounded-full",
                creator.stripeAccountStatus === "ENABLED"
                  ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                  : "bg-amber-500"
              )}
            />
            <div className="text-xs font-medium pr-2">
              <div className="text-muted-foreground uppercase tracking-wider text-[10px]">
                Stripe Status
              </div>
              <div>{creator.stripeAccountStatus.replace("_", " ")}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Acme Inc."
                            {...field}
                            className="h-12 rounded-xl bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 pt-1.5">
                        <FormLabel>Country</FormLabel>
                        <Popover
                          open={isCountryOpen}
                          onOpenChange={setIsCountryOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full h-12 justify-between rounded-xl bg-background/50 border-border/50",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? countries.find(
                                      (country) => country.value === field.value
                                    )?.label
                                  : "Select country"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                            <Command>
                              <CommandInput placeholder="Search country..." />
                              <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                  {countries.map((country) => (
                                    <CommandItem
                                      value={country.label}
                                      key={country.value}
                                      onSelect={() => {
                                        form.setValue(
                                          "countryCode",
                                          country.value
                                        );
                                        setIsCountryOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          country.value === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {country.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Bio</FormLabel>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs gap-1 text-muted-foreground hover:text-primary"
                            onClick={() => resumeInputRef.current?.click()}
                            disabled={isParsing}
                        >
                            {isParsing ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                            Auto-fill from Resume
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself..."
                          className="resize-none rounded-xl min-h-[120px] bg-background/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <input
                    type="file"
                    ref={resumeInputRef}
                    onChange={handleResumeUpload}
                    accept=".pdf"
                    className="hidden"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <FormLabel className="m-0">Website URL</FormLabel>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="https://..."
                            {...field}
                            className="h-11 rounded-xl bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="portfolioUrl"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2 mb-2">
                          <Layout className="h-4 w-4 text-muted-foreground" />
                          <FormLabel className="m-0">Portfolio URL</FormLabel>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="https://..."
                            {...field}
                            className="h-11 rounded-xl bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 rounded-2xl px-12 font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    "Save Studio Profile"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Sidebar / Stripe Section */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-primary/20 bg-primary/5 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Landmark className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold font-heading">Payouts</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Powered by Stripe
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                To receive payments from your sales, you must maintain an active
                Stripe Connect account.
              </p>

              {creator.stripeAccountStatus !== "ENABLED" ? (
                <Button
                  onClick={handleConnectStripe}
                  disabled={isStripeLoading}
                  className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                  {isStripeLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Connect Stripe"
                  )}{" "}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleConnectStripe}
                  variant="outline"
                  disabled={isStripeLoading}
                  className="w-full h-11 rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary"
                >
                  {isStripeLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Update Stripe Settings"
                  )}{" "}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="rounded-[2rem] border border-border/60 bg-background/30 p-6 space-y-4">
              <h4 className="font-bold font-heading text-sm uppercase tracking-widest">
                Tips
              </h4>
              <ul className="text-sm text-muted-foreground space-y-3 list-disc pl-4">
                <li>Complete your bio to gain trust.</li>
                <li>Link your portfolio to showcase past work.</li>
                <li>Ensure your country code matches your Stripe account.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
