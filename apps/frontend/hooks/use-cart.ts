"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { frontendApi } from "@/lib/frontend-api";
import { toast } from "sonner";
import { create } from "zustand";

// UI State Store
interface CartUIState {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartUI = create<CartUIState>((set) => ({
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));

// Data Hook
export function useCart() {
  const queryClient = useQueryClient();
  const { openCart } = useCartUI();

  const { data: cart, isLoading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await frontendApi.cart.get();
      return data;
    },
    retry: false, // Don't retry if 401/404 initially
  });

  const addItem = useMutation({
    mutationFn: async ({ blockId, licenseType }: { blockId: string; licenseType?: "PERSONAL" | "TEAM" | "ENTERPRISE" }) => {
      const { data } = await frontendApi.cart.add({
        blockId, 
        licenseType: licenseType || "PERSONAL" 
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
      openCart();
    },
    onError: (err: any) => {
      // Check if it's a conflict (already in cart) - handle gracefully
      if (err?.response?.status === 409) {
          toast.info("Already in your cart");
          openCart();
      } else {
          toast.error("Failed to add item");
      }
    },
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      await frontendApi.cart.remove(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    },
    onError: () => {
      toast.error("Failed to remove item");
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
        await frontendApi.cart.clear();
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  })

  return {
    cart,
    isLoading,
    error,
    addItem,
    removeItem,
    clearCart
  };
}
