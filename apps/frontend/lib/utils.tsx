import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  BadgeCheck,
  Ban,
  Clock,
  CreditCard,
  XCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { CreatorProfile } from "@/types/extended";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function compareString(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

export function compareDateIso(a: string, b: string): number {
  const ta = new Date(a).getTime();
  const tb = new Date(b).getTime();
  if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
  if (Number.isNaN(ta)) return 1;
  if (Number.isNaN(tb)) return -1;
  return ta - tb;
}

export function safeLower(s: unknown): string {
  return typeof s === "string" ? s.toLowerCase() : "";
}

export function getStripeTone(status: string): {
  label: string;
  variant: "secondary" | "outline";
  icon: React.ReactNode;
} {
  const s = status.toUpperCase();
  if (s === "ENABLED") {
    return {
      label: "Enabled",
      variant: "secondary",
      icon: <BadgeCheck className="size-3.5" />,
    };
  }
  if (s === "RESTRICTED") {
    return {
      label: "Restricted",
      variant: "outline",
      icon: <Ban className="size-3.5" />,
    };
  }
  if (s === "PENDING") {
    return {
      label: "Pending",
      variant: "outline",
      icon: <Clock className="size-3.5" />,
    };
  }
  if (s === "REJECTED") {
    return {
      label: "Rejected",
      variant: "outline",
      icon: <XCircle className="size-3.5" />,
    };
  }
  return {
    label: s,
    variant: "outline",
    icon: <CreditCard className="size-3.5" />,
  };
}

export function getApprovalBadge(state: "APPROVED" | "REJECTED" | "PENDING"): {
  label: string;
  className: string;
  icon: React.ReactNode;
} {
  if (state === "APPROVED") {
    return {
      label: "Approved",
      className:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      icon: <CheckCircle2 className="size-3.5" />,
    };
  }
  if (state === "REJECTED") {
    return {
      label: "Rejected",
      className: "border-destructive/20 bg-destructive/10 text-destructive",
      icon: <XCircle className="size-3.5" />,
    };
  }
  return {
    label: "Pending",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    icon: <AlertTriangle className="size-3.5" />,
  };
}

export function formatPriceUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function stableSort<T>(
  items: readonly T[],
  cmp: (a: T, b: T) => number
): T[] {
  return items
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      const c = cmp(a.item, b.item);
      return c !== 0 ? c : a.idx - b.idx;
    })
    .map((x) => x.item);
}

export function getApprovalState(
  c: CreatorProfile
): "APPROVED" | "REJECTED" | "PENDING" {
  if (c.isApprovedSeller) return "APPROVED";
  if (c.rejectedAt) return "REJECTED";
  return "PENDING";
}
