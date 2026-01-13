import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  Clock,
  Code2,
  Database,
  Fingerprint,
  Info,
  Key,
  Mail,
  Shield,
  User,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Clerk Debug | TailwindWizard",
  description: "Internal tool to inspect Clerk user state and metadata.",
};

export default async function ClerkDebugPage() {
  const user = await currentUser();
  const authData = await auth();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 rounded-[2rem] bg-muted/20 flex items-center justify-center mb-6">
          <Shield className="w-10 h-10 text-muted-foreground opacity-20" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">Access Denied</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          No active session found. Please sign in to view debug information.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "mt-8 rounded-xl px-8 h-12")}
        >
          <Fingerprint className="w-4 h-4 mr-2" />
          Sign In to Access
        </Link>
      </div>
    );
  }

  const sections = [
    {
      title: "Core Profile",
      icon: <User className="w-5 h-5" />,
      items: [
        {
          label: "Internal ID",
          value: user.id,
          icon: <Fingerprint className="w-4 h-4" />,
        },
        {
          label: "External ID",
          value: user.externalId || "None",
          icon: <Key className="w-4 h-4" />,
        },
        {
          label: "Full Name",
          value: `${user.firstName} ${user.lastName}`.trim() || "N/A",
          icon: <User className="w-4 h-4" />,
        },
        {
          label: "Email",
          value: user.emailAddresses[0]?.emailAddress,
          icon: <Mail className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Timeline",
      icon: <Clock className="w-5 h-5" />,
      items: [
        {
          label: "Created At",
          value: new Date(user.createdAt).toLocaleString(),
          icon: <Clock className="w-4 h-4" />,
        },
        {
          label: "Last Sign In",
          value: user.lastSignInAt
            ? new Date(user.lastSignInAt).toLocaleString()
            : "First time",
          icon: <Clock className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <div className="py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-primary/30 rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-sm" />
              <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
                <AvatarImage src={user.imageUrl} alt={user.firstName || "User"} />
                <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold font-heading">
                  {user.firstName?.[0] || user.id[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="size-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Identity Inspector</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground font-heading">
                Clerk Debugger
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className="rounded-lg px-2 py-0.5 font-mono text-[10px] uppercase font-bold tracking-tight"
                >
                  Role: {(user.publicMetadata?.role as string) || "User"}
                </Badge>
                <div className="h-1 w-1 rounded-full bg-border" />
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  Session Active
                </span>
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className="bg-primary/5 border-primary/20 px-4 py-2 rounded-2xl font-bold flex items-center gap-2"
          >
            <div className="size-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            Authenticated
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Key Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section) => (
              <Card
                key={section.title}
                className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm"
              >
                <CardHeader className="pb-4 border-b border-border/10 bg-muted/5">
                  <div className="flex items-center gap-2 text-primary">
                    {section.icon}
                    <CardTitle className="text-lg font-bold font-heading">
                      {section.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest">
                        {item.icon}
                        {item.label}
                      </span>
                      <code className="text-xs font-mono break-all bg-muted/30 px-3 py-2 rounded-xl border border-border/20 text-foreground/80">
                        {item.value}
                      </code>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Metadata Explorer */}
          <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
            <CardHeader className="pb-4 border-b border-border/10 bg-muted/5">
              <div className="flex items-center gap-2 text-primary">
                <Database className="w-5 h-5" />
                <CardTitle className="text-lg font-bold font-heading">
                  User Metadata Explorer
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Metadata used to persist application state within Clerk.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  label: "Public",
                  data: user.publicMetadata,
                  color: "text-blue-500",
                  bg: "bg-blue-500/5",
                  border: "border-blue-500/20",
                  desc: "Client-visible",
                },
                {
                  label: "Private",
                  data: user.privateMetadata,
                  color: "text-purple-500",
                  bg: "bg-purple-500/5",
                  border: "border-purple-500/20",
                  desc: "Server-only",
                },
                {
                  label: "Unsafe",
                  data: user.unsafeMetadata,
                  color: "text-amber-500",
                  bg: "bg-amber-500/5",
                  border: "border-amber-500/20",
                  desc: "Client-mutable",
                },
              ].map((meta) => (
                <div key={meta.label} className="space-y-4">
                  <div className="flex flex-col">
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.2em] ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight font-medium">
                      {meta.desc}
                    </span>
                  </div>
                  <div className={cn("rounded-2xl p-4 border min-h-[120px] max-h-[300px] overflow-auto", meta.bg, meta.border)}>
                    {Object.keys(meta.data || {}).length > 0 ? (
                      <pre className="text-[10px] font-mono leading-relaxed">
                        {JSON.stringify(meta.data, null, 2)}
                      </pre>
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-30 grayscale italic text-[10px]">
                        No Data
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Raw JSON & Sessions */}
        <div className="space-y-8">
          <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm flex flex-col h-full">
            <CardHeader className="pb-4 border-b border-border/10 bg-muted/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Code2 className="w-5 h-5" />
                  <CardTitle className="text-lg font-bold font-heading">
                    Raw JSON
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold rounded-lg border-primary/20">
                  DEBUG
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-hidden">
              <ScrollArea className="h-[600px] w-full">
                <div className="p-6">
                  <pre className="text-[10px] font-mono leading-relaxed selection:bg-primary/20 text-foreground/70">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 rounded-[1.5rem] shadow-inner overflow-hidden">
            <CardHeader className="p-5 pb-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                <Info className="w-4 h-4" />
                Auth Token Context
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-2 space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground font-bold uppercase tracking-tighter">Session ID</span>
                <span
                  className="font-mono text-primary truncate max-w-[140px] ml-2"
                  title={authData.sessionId || ""}
                >
                  {authData.sessionId || "None"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground font-bold uppercase tracking-tighter">Org ID</span>
                <span className="font-mono ml-2 font-bold">
                  {authData.orgId || "Personal"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
