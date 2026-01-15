"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Folder,
  LayoutDashboard,
  Library,
  LogOut,
  Settings,
  ShoppingBag,
  SquareCode,
  Hammer,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "../logo";
import DashboardSidebarItem from "./dashboard-sidebar-item";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  role?: "all" | "buyer" | "creator";
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    role: "all",
  },
  {
    title: "Marketplace",
    href: "/market",
    icon: ShoppingBag,
    role: "all",
  },
  {
    title: "My Library",
    href: "/dashboard/library",
    icon: Library,
    role: "buyer",
  },
  {
    title: "Forgery",
    href: "/dashboard/forgery",
    icon: Hammer,
    role: "creator",
    children: [
      {
        title: "Blocks",
        href: "/dashboard/forgery/blocks",
        icon: SquareCode,
        role: "creator",
      },
      {
        title: "Collections",
        href: "/dashboard/forgery/collections",
        icon: Folder,
        role: "creator",
      },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    role: "all",
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    role: "all",
  },
];

interface DashboardSidebarProps {
  isCreator: boolean;
}

export function DashboardSidebar({ isCreator }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useClerk();

  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter((item) => {
        if (item.role === "all") return true;
        if (item.role === "creator") return isCreator;
        if (item.role === "buyer") return true;
        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterNavItems(item.children) : undefined,
      }));
  };

  const filteredItems = filterNavItems(navItems);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r bg-card/30 backdrop-blur-xl transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center px-6 mb-6">
        <div
          className={cn(
            "transition-opacity duration-300",
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 italic"
          )}
        >
          <Logo />
        </div>
        {isCollapsed && (
          <div className="mx-auto">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold">W</span>
            </div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {filteredItems.map((item) => (
          <DashboardSidebarItem
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            pathname={pathname}
          />
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-foreground",
            isCollapsed && "justify-center px-0"
          )}
        >
          <CircleHelp className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <span className="font-medium text-sm">Help & Support</span>
          )}
        </Button>
        <Button
          onClick={() => signOut()}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/5",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm z-50 transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Decorative Gradient blur */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </aside>
  );
}
