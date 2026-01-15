"use client";

import { useEffect, useState } from "react";
import { ForgeryOverview } from "@/components/creator/forgery-overview";
import { Loader2 } from "lucide-react";

export default function ForgeryPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ForgeryOverview />
    </div>
  );
}
