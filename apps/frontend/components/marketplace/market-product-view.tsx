"use client";

import { useCart } from "@/hooks/use-cart";
import {
  ChevronRight,
  FlaskConical,
  Loader2,
  Package,
  ShoppingCart,
  Star,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Money } from "@/components/primitives/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewsSection } from "./reviews-section";

// Types based on the shared schema and internal logic
import type { components } from "@/types/api";
type Block = components["schemas"]["Block"];

interface MarketProductViewProps {
  block: Block;
}

export function MarketProductView({ block }: MarketProductViewProps) {
  const { addItem } = useCart();

  const basePrice =
    typeof block.price === "string"
      ? parseFloat(block.price)
      : (block.price as number) || 0;
  const primaryCategory = block.categories?.[0]?.category;
  const heroImage = block.screenshot ?? block.previews?.[0]?.url;

  const personalPlan = {
    name: "Personal License",
    description: "For individual developers and small projects",
    features: [
      "Single User License",
      "Lifetime Updates",
      "Public Support",
      "Commercial Use",
      "Full Source Code",
    ],
  };

  const handleAddToCart = () => {
    if (block.id) {
      addItem.mutate({ blockId: block.id, licenseType: "PERSONAL" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground/60">
        <Link href="/market" className="hover:text-primary transition-colors">
          Market
        </Link>
        <ChevronRight className="size-4 opacity-50" />
        <span className="hover:text-primary transition-colors cursor-pointer">
          {primaryCategory?.name || "Blocks"}
        </span>
        <ChevronRight className="size-4 opacity-50" />
        <span className="text-foreground font-medium">{block.title}</span>
      </nav>

      {/* Hero Section */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-8">
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-border/40 bg-muted/20 group shadow-2xl">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={block.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 via-background to-transparent">
                <Zap className="size-32 text-primary/10 animate-pulse" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background via-background/40 to-transparent" />

            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
              <div className="space-y-2">
                <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border-none text-xs uppercase tracking-tighter">
                  Verified Asset
                </Badge>
                <h1 className="text-5xl font-heading font-black tracking-tight text-white drop-shadow-2xl">
                  {block.title}
                </h1>
              </div>
              <div className="flex gap-2">
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="text-[10px] text-white/50 uppercase font-black">
                    Framework
                  </div>
                  <div className="text-sm font-bold text-white uppercase">
                    {block.framework}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-card/30 border border-border/40 backdrop-blur-md space-y-2 shadow-xl shadow-primary/20">
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
              <Star className="size-5 text-amber-500" />
            </div>
            <div className="text-2xl font-black font-heading">
              {Number(block.ratingAvg || 0).toFixed(1)} Rating
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {block.ratingCount || 0} verified customer reviews.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">
              About this Block
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
              {block.description ||
                "Enhance your development workflow with this professionally crafted block. Designed for performance, accessibility, and maximum flexibility. Built by experts for developers who value quality and speed in their development cycle."}
            </p>
          </div>

          <div className="pt-8 border-t border-border/40">
            <ReviewsSection blockId={block.id} />
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card/30 backdrop-blur-3xl border-border/40 rounded-[2.5rem] shadow-2xl p-8 sticky top-8">
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Purchase License
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-heading font-black text-primary">
                    <Money amount={basePrice} currency={block.currency} />
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
                    <Package className="size-3" />
                    {personalPlan.name}
                  </div>
                </div>
                <div className="p-5 rounded-3xl border bg-primary border-primary text-primary-foreground shadow-2xl shadow-primary/40">
                  <p className="text-sm font-medium opacity-90">
                    {personalPlan.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4 py-6 border-y border-border/10">
                <ul className="space-y-4">
                  {personalPlan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
                    >
                      <div className="size-2 rounded-full bg-primary shadow-sm" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full h-20 rounded-3xl text-xl font-black gap-4 group bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95"
                  onClick={handleAddToCart}
                  disabled={addItem.isPending}
                >
                  {addItem.isPending ? (
                    <Loader2 className="size-7 animate-spin" />
                  ) : (
                    <ShoppingCart className="size-7 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
                  )}
                  {addItem.isPending ? "Adding..." : "Add to Cart"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-14 rounded-2xl text-base font-bold gap-2 border-border/40 hover:bg-muted/50"
                  asChild
                >
                </Button>

                <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">
                  <span>Instant Delivery</span>
                  <div className="size-1 rounded-full bg-muted-foreground/30" />
                  <span>Source Included</span>
                  <div className="size-1 rounded-full bg-muted-foreground/30" />
                  <span>Commercial Use</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
