import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { frontendApi } from "@/lib/frontend-api";
import type { User } from "@/types/extended";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  avatarUrl: z.string().optional(),
});

export interface ProfileFormProps {
  user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      avatarUrl: user.avatarUrl || "",
    },
  });

  const avatarUrl = form.watch("avatarUrl");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("avatarUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: z.infer<typeof profileSchema>) {
    setIsLoading(true);
    try {
      await frontendApi.users.updateMe({
        name: data.name,
        avatarUrl: data.avatarUrl || undefined,
      });
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-[2.5rem] border border-border/60 bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 md:p-10 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-10">
          <div className="space-y-1">
            <h3 className="text-3xl font-bold font-heading tracking-tight">
              Personal Profile
            </h3>
            <p className="text-muted-foreground text-lg">
              Manage your identity and appearance across the wizardry realm.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-background/40 hover:bg-background/60 transition-colors p-4 rounded-[1.5rem] border border-border/50 backdrop-blur-md shadow-inner group">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm group-hover:scale-110 transition-transform">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="pr-4 border-r border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Access Level
              </p>
              <p className="text-sm font-bold capitalize">
                {user.role?.toLowerCase()}
              </p>
            </div>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Account Settings */}
          <div className="lg:col-span-2 space-y-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-10"
              >
                {/* Profile Picture Suite */}
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-primary/30 rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-sm" />
                    <Avatar className="h-32 w-32 border-4 border-background shadow-2xl transition-all group-hover:scale-105 group-hover:rotate-1">
                      <AvatarImage src={avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold font-heading">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 p-3 rounded-2xl bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 group-hover:shadow-primary/40"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <h4 className="font-bold font-heading text-xl">
                      Profile Picture
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-[240px]">
                      A high-quality avatar helps people recognize your work in
                      the marketplace.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 rounded-xl border-border/60"
                    >
                      Choose New Image
                    </Button>
                  </div>
                </div>

                <div className="grid gap-8 pt-4 border-t border-border/40">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-bold">
                          Display Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your wizard name"
                            {...field}
                            className="h-14 rounded-2xl bg-background/40 border-border/40 focus:bg-background focus:ring-primary/20 transition-all text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3 opacity-80">
                    <FormLabel className="text-base font-bold">
                      Email Address
                    </FormLabel>
                    <div className="relative group">
                      <Input
                        value={user.email}
                        readOnly
                        className="h-14 rounded-2xl bg-muted/30 border-dashed border-border/60 cursor-not-allowed text-lg pr-12"
                      />
                      <Shield className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      Locked for your security. Contact support to change your
                      primary email.
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-14 rounded-2xl px-12 font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      "Save Profile Changes"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Sidebar Suite */}
          <div className="space-y-8">
            {/* Account Details Card */}
            <div className="group rounded-[2.5rem] border border-primary/20 bg-primary/[0.02] p-8 space-y-6 transition-all hover:bg-primary/[0.04] hover:shadow-lg">
              <div className="flex items-center gap-4 border-b border-primary/10 pb-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm group-hover:rotate-6 transition-transform">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold font-heading text-lg">
                    Account Status
                  </h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                    Verified ID
                  </p>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="space-y-1.5 p-3 rounded-2xl bg-background/40 border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    Profile Identifier
                  </p>
                  <p className="text-xs font-mono truncate text-primary/80">
                    {user.id}
                  </p>
                </div>
                <div className="space-y-1.5 p-3 rounded-2xl bg-background/40 border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    Wizard Journey Started
                  </p>
                  <p className="text-sm font-semibold">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "The Ancient Times"}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Notice Card */}
            <div className="rounded-[2.5rem] border border-border/40 bg-background/20 p-8 space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <h4 className="font-bold font-heading text-sm uppercase tracking-widest">
                  Security Tips
                </h4>
              </div>
              <ul className="space-y-4">
                {[
                  "Use a professional name and avatar.",
                  "Enable 2FA via your provider for maximum safety.",
                  "Your email is our primary way to send invoices.",
                ].map((tip, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-muted-foreground leading-relaxed"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Action Placeholder */}
            <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-transparent to-primary/10">
              <div className="rounded-[2.4rem] bg-background/40 backdrop-blur-sm p-6 text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  Looking for more?
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary font-bold"
                >
                  View Public Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
