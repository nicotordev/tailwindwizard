import type { NavItem } from "./dashboard-sidebar";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  item: NavItem;
  isCollapsed: boolean;
  pathname: string;
}

export default function DashboardSidebarItem({
  item,
  isCollapsed,
  pathname,
}: SidebarItemProps) {
  const Icon = item.icon;
  const isExactActive = pathname === item.href;
  const isChildActive =
    item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`);
  const isActive = isExactActive || isChildActive;

  const hasChildren = item.children && item.children.length > 0;
  const [isOpen, setIsOpen] = useState(isChildActive);

  // Auto-expand if a child becomes active
  useEffect(() => {
    if (isChildActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    }
  }, [isChildActive]);

  if (isCollapsed) {
    return (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden justify-center",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
        )}
        title={item.title}
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
            isActive ? "" : "group-hover:text-primary"
          )}
        />
        {isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
        )}
      </Link>
    );
  }

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
            isActive ? "" : "group-hover:text-primary"
          )}
        />
        <span className="font-medium text-sm tracking-tight">{item.title}</span>
        {isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
        )}
      </Link>
    );
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-1"
    >
      <div
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden select-none",
          isExactActive
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : isActive
            ? "bg-primary/10 text-primary font-medium"
            : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
        )}
      >
        <Link
          href={item.href}
          className="flex flex-1 items-center gap-3 min-w-0 outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <Icon
            className={cn(
              "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
              isActive || isExactActive ? "" : "group-hover:text-primary"
            )}
          />
          <span className="font-medium text-sm tracking-tight truncate">
            {item.title}
          </span>
        </Link>
        <CollapsibleTrigger asChild>
          <div
            role="button"
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded-md transition-colors cursor-pointer hover:bg-black/10 dark:hover:bg-white/10",
              isExactActive ? "hover:bg-primary-foreground/20" : ""
            )}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen ? "rotate-180" : ""
              )}
            />
          </div>
        </CollapsibleTrigger>
        {isExactActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
        )}
      </div>

      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
        <div className="pl-4 space-y-1 relative">
          <div className="absolute left-[29px] top-0 bottom-0 w-px bg-border/40" />
          <div className="pl-6 pt-1">
            {item.children!.map((child) => (
              <DashboardSidebarItem
                key={child.href}
                item={child}
                isCollapsed={isCollapsed}
                pathname={pathname}
              />
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
