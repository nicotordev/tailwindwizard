"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Layout } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";
import Image from "next/image";

export default function FeaturedCategories() {
  const categoriesQuery = useCategories();

  return (
    <section className="relative py-24 bg-background overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-250 h-[1000px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-4 border-primary/20 text-primary uppercase tracking-widest text-[10px] font-bold"
            >
              Marketplace Preview
            </Badge>
            <h2 className="text-4xl font-bold font-heading sm:text-5xl tracking-tight mb-4">
              Explore the <span className="text-primary italic">Library</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Browse through curated high-quality blocks built by the community.
              Every block is verified for code safety and performance.
            </p>
          </div>

          <button className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
            View all categories
            <div className="h-[2px] w-8 bg-primary/20 group-hover:w-12 transition-all group-hover:bg-primary" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesQuery.data?.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <Link href={`/market/${cat.slug}`}>
                <div
                  className={cn(
                    "relative h-full overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-300",
                    "hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
                  )}
                >
                  {/* Accent background */}
                  <div
                    className={cn(
                      "absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100 bg-gradient-to-br",
                      "from-blue-500/20 to-cyan-500/20"
                    )}
                  />

                  <div className="relative z-10 flex flex-col h-full">
                    <div
                      className={cn(
                        "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted transition-colors group-hover:bg-background shadow-sm",
                        "text-blue-500"
                      )}
                    >
                      {cat.icon && (
                        <Image
                          src={cat.icon}
                          alt={cat.name}
                          width={50}
                          height={50}
                          className="h-7 w-7"
                        />
                      )}
                    </div>

                    <h3 className="text-2xl font-bold font-heading mb-3 group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                      Explore our collection of {cat.name} components.
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {cat._count?.blocks || 0} blocks
                      </span>
                      <div className="text-secondary-foreground h-8 w-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <Layout />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
