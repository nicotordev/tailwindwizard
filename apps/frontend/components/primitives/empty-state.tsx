import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { LucideIcon, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  variant?: "hero" | "card" | "minimal";
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  variant = "card",
  className,
}: EmptyStateProps) {
  const ActionIcon = action?.icon || Plus;

  return (
    <Empty
      className={cn(
        "transition-all duration-500",
        variant === "hero" &&
          "py-20 bg-primary/5 rounded-[2rem] border-primary/10",
        variant === "card" && "bg-muted/30 border-dashed rounded-2xl",
        variant === "minimal" && "p-4 border-none bg-transparent opacity-80",
        className
      )}
    >
      <EmptyHeader className={cn(variant === "minimal" && "max-w-xs gap-1")}>
        {Icon && (
          <EmptyMedia
            variant="icon"
            className={cn(
              "transition-transform duration-500 hover:scale-110",
              variant === "hero"
                ? "size-20 bg-primary/10 text-primary [&_svg]:size-10"
                : "bg-muted/50"
            )}
          >
            <Icon />
          </EmptyMedia>
        )}
        <EmptyTitle
          className={cn(
            variant === "hero" && "text-3xl font-bold font-heading"
          )}
        >
          {title}
        </EmptyTitle>
        {description && (
          <EmptyDescription className={cn(variant === "hero" && "text-lg")}>
            {description}
          </EmptyDescription>
        )}
      </EmptyHeader>

      {action && (
        <EmptyContent className={cn(variant === "minimal" && "mt-1")}>
          {action.href ? (
            <Button
              asChild
              className={cn(
                "rounded-xl transition-all shadow-lg",
                variant === "hero"
                  ? "h-12 px-8 text-base shadow-primary/20"
                  : "h-10 px-6"
              )}
            >
              <Link href={action.href}>
                <ActionIcon className="mr-2 size-4" />
                {action.label}
              </Link>
            </Button>
          ) : (
            <Button
              onClick={action.onClick}
              className={cn(
                "rounded-xl transition-all",
                variant === "hero" && "h-12 px-8"
              )}
            >
              <ActionIcon className="mr-2 size-4" />
              {action.label}
            </Button>
          )}
        </EmptyContent>
      )}
    </Empty>
  );
}
