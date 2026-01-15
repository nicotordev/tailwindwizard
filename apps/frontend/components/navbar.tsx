"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "./logo";
import { Sparkles, ShoppingBag } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useCart, useCartUI } from "@/hooks/use-cart";
import { CartSheet } from "@/components/marketplace/cart-sheet";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { label: "Marketplace", href: "/market" },
  { label: "Trending", href: "#" },
  { label: "Creators", href: "#" },
  { label: "Pricing", href: "#" },
];

export function MarketNavbar() {
  const pathname = usePathname();
  const { toggleCart } = useCartUI();
  const { cart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemCount = cart?.items?.length || 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex items-center gap-8">
          <Logo size="md" />
          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" &&
                  item.href !== "#" &&
                  pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative flex items-center gap-2 px-3 py-2 text-muted-foreground transition-colors hover:text-primary"
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-[13px] left-0 h-[2px] w-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <SignedIn>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              onClick={toggleCart}
            >
              <ShoppingBag className="size-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
            <CartSheet />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>

            <div className="h-6 w-px bg-border/60 mx-1" />
            {mounted ? (
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9",
                  },
                }}
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            )}
          </SignedIn>

          <SignedOut>
            <Button size="sm" className="gap-2 rounded-xl px-5">
              <Sparkles className="size-4" />
              Get Started
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
