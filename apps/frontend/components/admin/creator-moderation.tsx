"use client";

import * as React from "react";
import { frontendApi } from "@/lib/frontend-api";
import { toast } from "sonner";
import {
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  ChevronsUpDown,
  Ban,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CreatorProfile } from "@/types/extended";
import {
  safeLower,
  formatDateTime,
  compareString,
  getApprovalBadge,
  getApprovalState,
  compareDateIso,
  stableSort,
  getStripeTone,
  cn,
  formatDate,
} from "@/lib/utils";

interface CreatorModerationProps {
  initialCreators: CreatorProfile[];
}

type SortKey = "CREATOR" | "STRIPE" | "APPROVAL" | "JOINED";
type SortDir = "ASC" | "DESC";
export function CreatorModeration({ initialCreators }: CreatorModerationProps) {
  const [creators, setCreators] =
    React.useState<CreatorProfile[]>(initialCreators);
  const [filter, setFilter] = React.useState<string>("");
  const [selectedCreator, setSelectedCreator] =
    React.useState<CreatorProfile | null>(null);
  const [reason, setReason] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    displayName: "",
    bio: "",
    websiteUrl: "",
    countryCode: "",
  });

  const [sortKey, setSortKey] = React.useState<SortKey>("JOINED");
  const [sortDir, setSortDir] = React.useState<SortDir>("DESC");

  const filteredCreators = React.useMemo<CreatorProfile[]>(() => {
    const q = safeLower(filter).trim();
    if (!q) return creators;
    return creators.filter((c) => {
      const name = safeLower(c.displayName);
      const email = safeLower(c.user?.email);
      return name.includes(q) || email.includes(q);
    });
  }, [creators, filter]);

  const sortedCreators = React.useMemo<CreatorProfile[]>(() => {
    const cmp = (a: CreatorProfile, b: CreatorProfile): number => {
      const dir = sortDir === "ASC" ? 1 : -1;

      if (sortKey === "CREATOR") {
        const an = safeLower(a.displayName) || safeLower(a.user?.email);
        const bn = safeLower(b.displayName) || safeLower(b.user?.email);
        return dir * compareString(an, bn);
      }

      if (sortKey === "STRIPE") {
        const as = safeLower(a.stripeAccountStatus);
        const bs = safeLower(b.stripeAccountStatus);
        return dir * compareString(as, bs);
      }

      if (sortKey === "APPROVAL") {
        const rank = (c: CreatorProfile): number => {
          const state = getApprovalState(c);
          if (state === "PENDING") return 0;
          if (state === "REJECTED") return 1;
          return 2; // APPROVED
        };
        return dir * (rank(a) - rank(b));
      }

      // JOINED
      return dir * compareDateIso(a.createdAt, b.createdAt);
    };

    return stableSort(filteredCreators, cmp);
  }, [filteredCreators, sortKey, sortDir]);

  const metrics = React.useMemo(() => {
    const total = filteredCreators.length;
    const approved = filteredCreators.filter((c) => c.isApprovedSeller).length;
    const rejected = filteredCreators.filter((c) => !!c.rejectedAt).length;
    const pending = total - approved - rejected;
    return { total, approved, rejected, pending };
  }, [filteredCreators]);

  const toggleSort = (key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDir("ASC");
        return key;
      }
      setSortDir((prevDir) => (prevDir === "ASC" ? "DESC" : "ASC"));
      return prevKey;
    });
  };

  const handleReview = async (action: "APPROVE" | "REJECT") => {
    if (!selectedCreator) return;

    setIsSubmitting(true);
    try {
      await frontendApi.admin.reviewCreator(selectedCreator.id, {
        action,
        reason: reason || undefined,
      });

      setCreators((prev) =>
        prev.map((c) =>
          c.id === selectedCreator.id
            ? {
                ...c,
                isApprovedSeller: action === "APPROVE",
                rejectedAt:
                  action === "REJECT" ? new Date().toISOString() : null,
              }
            : c
        )
      );

      toast.success(
        `Creator ${action === "APPROVE" ? "approved" : "rejected"}`
      );
      setSelectedCreator(null);
      setReason("");
    } catch {
      toast.error("Failed to review creator");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBan = async (id: string) => {
    if (!confirm("Are you sure you want to BAN this creator? This will also ban their user account in Clerk.")) return;

    try {
      await frontendApi.admin.creators.ban(id);
      setCreators((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isBanned: true } : c))
      );
      toast.success("Creator and User banned");
    } catch (error) {
      toast.error("Failed to ban creator");
    }
  };

  const handleUnban = async (id: string) => {
    if (!confirm("Are you sure you want to UNBAN this creator?")) return;

    try {
      await frontendApi.admin.creators.unban(id);
      setCreators((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isBanned: false } : c))
      );
      toast.success("Creator and User unbanned");
    } catch (error) {
      toast.error("Failed to unban creator");
    }
  };

  const handleUpdateCreator = async () => {
    if (!selectedCreator) return;
    setIsSubmitting(true);
    try {
      const { data } = await frontendApi.admin.creators.update(selectedCreator.id, editForm);
      setCreators((prev) => prev.map((c) => (c.id === selectedCreator.id ? { ...c, ...data } : c)));
      toast.success("Creator updated");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update creator");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (creator: CreatorProfile) => {
    setSelectedCreator(creator);
    setEditForm({
      displayName: creator.displayName || "",
      bio: creator.bio || "",
      websiteUrl: creator.websiteUrl || "",
      countryCode: creator.countryCode || "",
    });
    setIsEditing(true);
  };

  const metricsMapped = {
    Total: metrics.total,
    Approved: metrics.approved,
    Pending: metrics.pending,
    Rejected: metrics.rejected,
  };

  return (
    <div className="space-y-6">
      {/* Header row: search + KPIs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="relative w-full md:w-90">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by creator or email…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 rounded-xl bg-background/60"
          />
        </div>

        <div className="flex items-stretch gap-2 flex-1 max-w-md">
          {Object.entries(metricsMapped).map(([key, value]) => (
            <div
              key={key}
              className="flex rounded-2xl border border-border bg-background shadow-sm w-[calc((25%)-(0.5rem))]"
            >
              <div className="p-4">
                <p className="text-xs text-muted-foreground">{key}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {sortedCreators.length === 0 ? (
        <div className="py-20 text-center border rounded-2xl bg-background/40">
          <Users className="mx-auto size-12 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-heading font-semibold">
            No creators found
          </h3>
          <p className="text-sm text-muted-foreground">
            No creator applications found matching your search.
          </p>
        </div>
      ) : (
        <Card className="rounded-2xl border-border/60 bg-background/40 shadow-sm">
          <CardHeader className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Creator applications
                </h3>
                <p className="text-sm text-muted-foreground">
                  Review sellers, Stripe readiness, and application status.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full bg-emerald-500/70" />
                  Approved
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full bg-amber-500/70" />
                  Pending
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full bg-destructive/70" />
                  Rejected
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            {/* serious table wrapper */}
            <div className="overflow-hidden rounded-b-2xl border-t border-border/60">
              <div className="overflow-x-auto">
                <Table className="min-w-215">
                  <TableHeader className="bg-muted/20">
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="w-90">
                        <button
                          type="button"
                          onClick={() => toggleSort("CREATOR")}
                          className={cn(
                            "group inline-flex items-center gap-2 font-semibold",
                            "text-foreground/90 hover:text-foreground"
                          )}
                        >
                          Creator
                          <ChevronsUpDown className="size-4 text-muted-foreground group-hover:text-foreground/70" />
                        </button>
                      </TableHead>

                      <TableHead className="w-45">
                        <button
                          type="button"
                          onClick={() => toggleSort("STRIPE")}
                          className={cn(
                            "group inline-flex items-center gap-2 font-semibold",
                            "text-foreground/90 hover:text-foreground"
                          )}
                        >
                          Stripe
                          <ChevronsUpDown className="size-4 text-muted-foreground group-hover:text-foreground/70" />
                        </button>
                      </TableHead>

                      <TableHead className="w-42.5">
                        <button
                          type="button"
                          onClick={() => toggleSort("APPROVAL")}
                          className={cn(
                            "group inline-flex items-center gap-2 font-semibold",
                            "text-foreground/90 hover:text-foreground"
                          )}
                        >
                          Status
                          <ChevronsUpDown className="size-4 text-muted-foreground group-hover:text-foreground/70" />
                        </button>
                      </TableHead>

                      <TableHead className="w-40">
                        <button
                          type="button"
                          onClick={() => toggleSort("JOINED")}
                          className={cn(
                            "group inline-flex items-center gap-2 font-semibold",
                            "text-foreground/90 hover:text-foreground"
                          )}
                        >
                          Joined
                          <ChevronsUpDown className="size-4 text-muted-foreground group-hover:text-foreground/70" />
                        </button>
                      </TableHead>

                      <TableHead className="text-right w-40">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {sortedCreators.map((creator) => {
                      const approval = getApprovalState(creator);
                      const approvalBadge = getApprovalBadge(approval);
                      const stripe = getStripeTone(creator.stripeAccountStatus);

                      return (
                        <TableRow
                          key={creator.id}
                          className={cn(
                            "border-border/50",
                            "hover:bg-muted/10",
                            approval === "REJECTED" && "opacity-[0.92]"
                          )}
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-10 rounded-xl ring-1 ring-border/60">
                                <AvatarImage
                                  src={creator.user?.avatarUrl || undefined}
                                />
                                <AvatarFallback className="rounded-xl">
                                  {(
                                    creator.displayName?.[0] ??
                                    creator.user?.email?.[0] ??
                                    "?"
                                  ).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold truncate">
                                    {creator.displayName || "Unknown"}
                                  </span>

                                  {/* subtle state dot */}
                                  <span
                                    aria-hidden
                                    className={cn(
                                      "size-2 rounded-full",
                                      approval === "APPROVED" &&
                                        "bg-emerald-500/70",
                                      approval === "PENDING" &&
                                        "bg-amber-500/70",
                                      approval === "REJECTED" &&
                                        "bg-destructive/70"
                                    )}
                                  />
                                  {creator.isBanned && (
                                    <Badge variant="destructive" className="h-4 px-1.5 text-[9px] uppercase font-black tracking-tighter">
                                      Banned
                                    </Badge>
                                  )}
                                </div>

                                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="truncate">
                                    {creator.user?.email ?? "—"}
                                  </span>
                                  {creator.countryCode ? (
                                    <span className="rounded-md border border-border/60 bg-background/40 px-1.5 py-0.5 text-[11px]">
                                      {creator.countryCode}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={stripe.variant}
                              className={cn(
                                "rounded-lg px-2.5 py-1",
                                stripe.variant === "secondary" &&
                                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              )}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                {stripe.icon}
                                {stripe.label}
                              </span>
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-lg px-2.5 py-1",
                                approvalBadge.className
                              )}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                {approvalBadge.icon}
                                {approvalBadge.label}
                              </span>
                            </Badge>

                            {approval === "REJECTED" && creator.rejectedAt ? (
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                Rejected{" "}
                                <span className="tabular-nums">
                                  {formatDate(creator.rejectedAt)}
                                </span>
                              </p>
                            ) : null}
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground tabular-nums">
                            {formatDate(creator.createdAt)}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-2">
                              {creator.isBanned ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                  onClick={() => handleUnban(creator.id)}
                                >
                                  Unban
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-xl text-destructive hover:bg-destructive/10"
                                  onClick={() => handleBan(creator.id)}
                                >
                                  <Ban className="size-4" />
                                </Button>
                              )}
                              {!creator.isApprovedSeller && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() => setSelectedCreator(creator)}
                                >
                                  Review
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => startEditing(creator)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* footer hint */}
              <div className="flex items-center justify-between gap-4 px-5 py-3 text-xs text-muted-foreground bg-background/20">
                <p className="tabular-nums">
                  Showing{" "}
                  <span className="text-foreground/80 font-medium">
                    {sortedCreators.length}
                  </span>{" "}
                  result{sortedCreators.length === 1 ? "" : "s"}
                  {filter.trim() ? (
                    <>
                      {" "}
                      (filtered from{" "}
                      <span className="text-foreground/80 font-medium">
                        {creators.length}
                      </span>
                      )
                    </>
                  ) : null}
                </p>

                <p className="hidden sm:block">
                  Tip: Sort columns • Approve requires Stripe{" "}
                  <span className="font-medium text-foreground/80">
                    Enabled
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!selectedCreator}
        onOpenChange={(open) => !open && setSelectedCreator(null)}
      >
        <DialogContent className="sm:max-w-130 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Creator Review</DialogTitle>
            <DialogDescription>
              Review the creator&apos;s profile and application.
            </DialogDescription>
          </DialogHeader>

          {selectedCreator && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/60">
                <Avatar className="size-16 rounded-2xl ring-1 ring-border/60">
                  <AvatarImage
                    src={selectedCreator.user?.avatarUrl || undefined}
                  />
                  <AvatarFallback className="rounded-2xl text-2xl">
                    {(selectedCreator.displayName?.[0] ?? "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h4 className="font-bold text-xl truncate">
                    {selectedCreator.displayName}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedCreator.user?.email}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                    Joined {formatDateTime(selectedCreator.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-border/60 bg-background/30 p-3">
                  <p className="text-muted-foreground mb-1">Country</p>
                  <p className="font-medium">
                    {selectedCreator.countryCode || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/30 p-3">
                  <p className="text-muted-foreground mb-1">Stripe Status</p>
                  <p className="font-medium">
                    {selectedCreator.stripeAccountStatus}
                  </p>
                </div>

                {selectedCreator.websiteUrl ? (
                  <div className="col-span-2 rounded-xl border border-border/60 bg-background/30 p-3">
                    <p className="text-muted-foreground mb-1">Website</p>
                    <a
                      href={selectedCreator.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 break-all"
                    >
                      {selectedCreator.websiteUrl}
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                ) : null}

                {selectedCreator.bio ? (
                  <div className="col-span-2 rounded-xl border border-border/60 bg-background/30 p-3">
                    <p className="text-muted-foreground mb-1">Bio</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedCreator.bio}
                    </p>
                  </div>
                ) : null}
              </div>

              {!selectedCreator.isApprovedSeller && (
                <div className="space-y-3">
                  <Label htmlFor="reject-reason">
                    Rejection Reason (optional)
                  </Label>
                  <Textarea
                    id="reject-reason"
                    placeholder="If rejecting, explain why…"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="rounded-xl min-h-22.5"
                  />
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                {!selectedCreator.isApprovedSeller ? (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleReview("REJECT")}
                      disabled={isSubmitting}
                      className="rounded-xl"
                    >
                      Reject Application
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => handleReview("APPROVE")}
                      disabled={
                        isSubmitting ||
                        selectedCreator.stripeAccountStatus !== "ENABLED"
                      }
                      className="rounded-xl"
                    >
                      <ShieldCheck className="mr-2 size-4" />
                      Approve Creator
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCreator(null)}
                    className="rounded-xl w-full"
                  >
                    Close
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditing}
        onOpenChange={(open) => !open && setIsEditing(false)}
      >
        <DialogContent className="sm:max-w-130 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Edit Creator</DialogTitle>
            <DialogDescription>
              Modify creator profile information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="rounded-xl min-h-25"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={editForm.websiteUrl}
                  onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country Code (2 chars)</Label>
                <Input
                  id="country"
                  value={editForm.countryCode}
                  onChange={(e) => setEditForm({ ...editForm, countryCode: e.target.value })}
                  className="rounded-xl"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCreator}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
