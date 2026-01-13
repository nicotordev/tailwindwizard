"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "./logo";
import { Sparkles, ShoppingBag } from "lucide-react";
import { SignedIn, SignedOut, useUser, UserButton } from "@clerk/nextjs";
import { useCart, useCartUI } from "@/hooks/use-cart";
import { CartSheet } from "@/components/marketplace/cart-sheet";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { label: "Marketplace", href: "/market", active: true },
  { label: "Trending", href: "#" },
  { label: "Creators", href: "#" },
  { label: "Pricing", href: "#" },
];

export function MarketNavbar() {
  const { user } = useUser();
  const { toggleCart } = useCartUI();
  const { cart } = useCart();

  const cartItemCount = cart?.items?.length || 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex items-center gap-8">
          <Logo size="md" />
          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative flex items-center gap-2 px-3 py-2 text-muted-foreground transition-colors hover:text-primary"
                aria-current={item.active ? "page" : undefined}
              >
                {item.label}
                {item.active && (
                  <span className="absolute -bottom-[13px] left-0 h-[2px] w-full bg-primary" />
                )}
              </Link>
            ))}
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
          </SignedIn>

          <SignedOut>
            <Button size="sm" className="gap-2 rounded-xl px-5">
              <Sparkles className="size-4" />
              Get Started
            </Button>
          </SignedOut>
          <SignedIn>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>

            <div className="h-6 w-px bg-border/60 mx-1" />
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-9 w-9",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
