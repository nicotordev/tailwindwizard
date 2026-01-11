import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Archive,
  Ban,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  PauseCircle,
  XCircle,
} from "lucide-react";
import * as React from "react";

// Types based on schema.prisma enums
export type BlockStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "ARCHIVED";
export type StripeStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "ENABLED"
  | "RESTRICTED"
  | "REJECTED";
export type LicenseStatus = "ACTIVE" | "REVOKED";
export type DeliveryStatus = "NOT_READY" | "READY" | "REVOKED";

interface StatusBadgeProps {
  className?: string;
}

export function BlockStatusBadge({
  status,
  className,
}: StatusBadgeProps & { status: BlockStatus }) {
  const config: Record<
    BlockStatus,
    {
      label: string;
      icon: React.ReactElement<{ className?: string }>;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    DRAFT: { label: "Draft", icon: <FileText />, variant: "secondary" },
    SUBMITTED: { label: "Submitted", icon: <Clock />, variant: "outline" },
    APPROVED: { label: "Approved", icon: <CheckCircle2 />, variant: "default" },
    REJECTED: { label: "Rejected", icon: <XCircle />, variant: "destructive" },
    PUBLISHED: { label: "Published", icon: <Globe />, variant: "default" },
    UNPUBLISHED: {
      label: "Unpublished",
      icon: <PauseCircle />,
      variant: "secondary",
    },
    ARCHIVED: { label: "Archived", icon: <Archive />, variant: "outline" },
  };

  const { label, icon, variant } = config[status];

  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      {React.cloneElement(icon, {
        className: "size-3.5",
      })}
      {label}
    </Badge>
  );
}

export function StripeStatusBadge({
  status,
  className,
}: StatusBadgeProps & { status: StripeStatus }) {
  const config: Record<
    StripeStatus,
    {
      label: string;
      icon: React.ReactElement<{ className?: string }>;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    NOT_CONNECTED: {
      label: "Not Connected",
      icon: <AlertCircle />,
      variant: "outline",
    },
    PENDING: { label: "Pending", icon: <Clock />, variant: "secondary" },
    ENABLED: { label: "Enabled", icon: <CheckCircle2 />, variant: "default" },
    RESTRICTED: {
      label: "Restricted",
      icon: <AlertCircle />,
      variant: "destructive",
    },
    REJECTED: { label: "Rejected", icon: <XCircle />, variant: "destructive" },
  };

  const { label, icon, variant } = config[status];

  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      {React.cloneElement(icon, {
        className: "size-3.5",
      })}
      {label}
    </Badge>
  );
}

export function LicenseBadge({
  status,
  className,
}: StatusBadgeProps & { status: LicenseStatus }) {
  const config: Record<
    LicenseStatus,
    {
      label: string;
      icon: React.ReactElement<{ className?: string }>;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    ACTIVE: { label: "Active", icon: <CheckCircle2 />, variant: "default" },
    REVOKED: { label: "Revoked", icon: <Ban />, variant: "destructive" },
  };

  const { label, icon, variant } = config[status];

  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      {React.cloneElement(icon, {
        className: "size-3.5",
      })}
      {label}
    </Badge>
  );
}

export function DeliveryStatusBadge({
  status,
  className,
}: StatusBadgeProps & { status: DeliveryStatus }) {
  const config: Record<
    DeliveryStatus,
    {
      label: string;
      icon: React.ReactElement<{ className?: string }>;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    READY: { label: "Ready", icon: <CheckCircle2 />, variant: "default" },
    NOT_READY: { label: "Not Ready", icon: <Clock />, variant: "secondary" },
    REVOKED: { label: "Revoked", icon: <Ban />, variant: "destructive" },
  };

  const { label, icon, variant } = config[status];

  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      {React.cloneElement(icon, {
        className: "size-3.5",
      })}
      {label}
    </Badge>
  );
}
