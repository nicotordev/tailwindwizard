"use client";

import { Money } from "@/components/primitives/formatters";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart, useCartUI } from "@/hooks/use-cart";
import { Loader2, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CartSheet() {
  const { isOpen, closeCart } = useCartUI();
  const { cart, isLoading, removeItem } = useCart();

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => {
    const price = item.block?.price
      ? typeof item.block.price === "string"
        ? parseFloat(item.block.price)
        : (item.block.price as number)
      : 0;
    return sum + price;
  }, 0);

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            Your Cart
          </SheetTitle>
          <SheetDescription>
            {items.length} item{items.length !== 1 && "s"} selected
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden py-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-4">
              <div className="size-20 bg-muted/30 rounded-full flex items-center justify-center">
                <ShoppingBag className="size-10 text-muted-foreground/50" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-lg">Your cart is empty</p>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Looks like you haven&apos;t added anything yet.
                </p>
              </div>
              <Button variant="outline" onClick={closeCart}>
                Browse Market
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-1">
                    <div className="relative size-20 rounded-xl overflow-hidden bg-muted/20 border border-border/50 shrink-0">
                      {item.block?.screenshot ||
                      item.block?.previews?.[0]?.url ? (
                        <Image
                          src={
                            item.block.screenshot || item.block.previews![0].url
                          }
                          alt={item.block?.title || "Block"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground font-mono">
                          NO IMG
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold truncate">
                          {item.block?.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.licenseType === "PERSONAL"
                            ? "Personal License"
                            : item.licenseType}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="font-mono font-medium">
                          <Money
                            amount={(item.block?.price as number) || 0}
                            currency={item.block?.currency}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem.mutate(item.id)}
                          disabled={removeItem.isPending}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  <Money amount={subtotal} />
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  <Money amount={subtotal} />
                </span>
              </div>
            </div>
            <SheetFooter>
              <Button
                className="w-full h-12 text-base font-bold"
                size="lg"
                asChild
              >
                <Link href="/checkout" onClick={closeCart}>
                  Proceed to Checkout
                </Link>
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
