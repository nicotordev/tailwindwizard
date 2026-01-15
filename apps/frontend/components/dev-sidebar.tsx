"use client";

import {
  Code2,
  Component,
  Database,
  Eye,
  Layout,
  ShieldCheck,
  Terminal,
  Workflow,
} from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const data = {
  navMain: [
    {
      title: "Core Inspector",
      icon: ShieldCheck,
      items: [
        {
          title: "Clerk Session",
          url: "/dev/clerk",
          icon: ShieldCheck,
        },
        {
          title: "UI Primitives",
          url: "/dev/ui",
          icon: Component,
        },
      ],
    },
    {
      title: "Platform Tools",
      icon: Terminal,
      items: [
        {
          title: "Admin Dashboard",
          url: "/admin",
          icon: DashboardIcon,
        },
        {
          title: "Onboarding Flow",
          url: "/onboarding",
          icon: Workflow,
        },
      ],
    },
    {
      title: "Design System",
      icon: Layout,
      items: [
        {
          title: "Colors & Tokens",
          url: "#",
          icon: Eye,
        },
        {
          title: "Typography",
          url: "#",
          icon: Code2,
        },
      ],
    },
  ],
};

function DashboardIcon() {
  return <Database className="w-4 h-4" />;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1">
            <Terminal className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-none">WIZARD DEV</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Internal Tools
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold px-4 text-muted-foreground/70 tracking-wider flex items-center gap-2">
              <group.icon className="w-3.5 h-3.5" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url || (item.url !== "/" && item.url !== "#" && pathname.startsWith(`${item.url}/`))}
                      tooltip={item.title}
                      className="transition-all duration-200"
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-2 py-2"
                      >
                        {item.icon && (
                          <item.icon className="w-4 h-4 opacity-70" />
                        )}
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
