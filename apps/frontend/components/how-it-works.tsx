"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Code2,
  DollarSign,
  Globe,
  Lock,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const STEPS = [
  {
    phase: "Phase 01",
    title: "Build & Ship",
    description:
      'Just drop your Tailwind or Shadcn component. Our automated "Wizardry" validates your code, handles dependencies, and prepares it for the world in seconds.',
    icon: Code2,
    footerIcon: Zap,
    footerText: "Ready in under 60 seconds",
  },
  {
    phase: "Phase 02",
    title: "Zero-Trust Exposure",
    description:
      "Customers see exactly what they get through protected, server-side rendered previews. Your source code remains locked and encrypted until the moment of purchase.",
    icon: Lock,
    footerIcon: Globe,
    footerText: "Global reach, zero theft",
  },
  {
    phase: "Phase 03",
    title: "Automated Payouts",
    description:
      "Connect your account and watch your earnings grow. We handle the licenses, the hosting, and the international payments via Stripe Connect Express.",
    icon: DollarSign,
    footerIcon: BarChart3,
    footerText: "Passive income on autopilot",
  },
];

export default function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % STEPS.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + STEPS.length) % STEPS.length);
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000); // Change card every 5 seconds

    return () => clearInterval(interval);
  }, [handleNext, isPaused]);

  const getPosition = (index: number) => {
    const diff = index - activeIndex;

    // For exactly 3 items, diff can be -2, -1, 0, 1, 2
    // We normalize to -1 (left), 0 (center), 1 (right)
    if (diff === 0) return 0;
    if (diff === 1 || diff === -2) return 1;
    if (diff === -1 || diff === 2) return -1;
    return diff;
  };

  return (
    <section
      className="relative isolate overflow-hidden bg-primary py-24 sm:py-32"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Magical background decoration */}
      <div className="absolute left-0 top-0 -z-10 h-150 w-200 -translate-x-1/4 rounded-full bg-white/5 blur-[120px]" />
      <div className="absolute right-0 bottom-0 -z-10 h-125 w-125 translate-x-1/4 rounded-full bg-secondary/10 blur-[130px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Side: Content */}
          <div className="text-left text-primary-foreground z-20">
            <Badge
              variant="secondary"
              className="mb-8 px-4 py-1.5 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-700 bg-white/70"
            >
              The Profit Pipeline
            </Badge>

            <h2 className="text-balance text-5xl font-bold tracking-tight sm:text-7xl font-heading mb-8 animate-in fade-in slide-in-from-left-6 duration-1000 leading-[1.05]">
              Monetize your <br />
              <span className="text-primary-foreground/80 italic font-serif">
                UI components
              </span>
            </h2>

            <p className="text-xl text-primary-foreground/70 leading-relaxed animate-in fade-in slide-in-from-left-8 duration-1000 mb-12 max-w-lg">
              Stop giving away your best work. Build a sustainable revenue
              stream by selling high-quality blocks in our secure, zero-trust
              marketplace.
            </p>

            {/* Navigation & Indicators */}
            <div className="flex flex-col items-start gap-10">
              <div className="flex items-center gap-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  className="rounded-full h-14 w-14 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all active:scale-90 bg-transparent"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>

                <div className="flex gap-4 items-center">
                  {STEPS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-700 ease-in-out",
                        activeIndex === index
                          ? "w-12 bg-primary-foreground shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                          : "w-1.5 bg-primary-foreground/20 hover:bg-primary-foreground/40"
                      )}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="rounded-full h-14 w-14 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all active:scale-90 bg-transparent"
                >
                  <ArrowRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side: 3D Carousel */}
          <div className="relative flex h-[650px] w-full items-center justify-center [perspective:2500px] overflow-visible">
            <div className="relative h-full w-full max-w-[380px] flex items-center justify-center lg:ml-auto">
              {STEPS.map((step, index) => {
                const position = getPosition(index);
                const isActive = position === 0;

                return (
                  <motion.div
                    key={index}
                    initial={false}
                    animate={{
                      x: `${position * (isMobile ? 35 : 55)}%`,
                      scale: isActive ? 1 : 0.75,
                      z: isActive ? 0 : -400,
                      rotateY: position * -35,
                      opacity: isActive ? 1 : 0.3,
                      zIndex: isActive ? 40 : 10,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 180,
                      damping: 22,
                    }}
                    className="absolute w-full px-4 cursor-pointer"
                    onClick={() => setActiveIndex(index)}
                  >
                    <Card
                      className={cn(
                        "group relative flex h-[500px] flex-col justify-between overflow-hidden border p-10 transition-all duration-700",
                        isActive
                          ? "border-primary-foreground/30 bg-card shadow-[0_40px_100px_rgba(0,0,0,0.6)] scale-100"
                          : "border-transparent bg-white/5 backdrop-blur-md grayscale pointer-events-none sm:pointer-events-auto"
                      )}
                    >
                      {/* Premium Glassmorphism highlights */}
                      {isActive && (
                        <div className="absolute top-0 right-0 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
                            <Zap className="h-5 w-5" />
                          </div>
                        </div>
                      )}

                      <div>
                        <div
                          className={cn(
                            "mb-10 flex h-20 w-20 items-center justify-center rounded-3xl transition-all duration-700 shadow-2xl",
                            isActive
                              ? "bg-primary text-primary-foreground rotate-0 scale-110"
                              : "bg-white/10 text-white/50 -rotate-12"
                          )}
                        >
                          <step.icon className="h-10 w-10" />
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                          <span
                            className={cn(
                              "text-[10px] font-black uppercase tracking-[0.3em]",
                              isActive ? "text-primary" : "text-white/30"
                            )}
                          >
                            {step.phase}
                          </span>
                          <div
                            className={cn(
                              "h-[1px] flex-1",
                              isActive ? "bg-primary/20" : "bg-white/10"
                            )}
                          />
                        </div>

                        <h3
                          className={cn(
                            "text-3xl font-bold font-heading mb-6 tracking-tight leading-tight",
                            isActive ? "text-foreground" : "text-white/80"
                          )}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={cn(
                            "text-lg leading-relaxed",
                            isActive
                              ? "text-muted-foreground"
                              : "text-white/40 line-clamp-3"
                          )}
                        >
                          {step.description}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "mt-auto flex items-center justify-between pt-8 border-t",
                          isActive ? "border-primary/5" : "border-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <step.footerIcon
                            className={cn(
                              "h-5 w-5",
                              isActive ? "text-primary" : "text-white/20"
                            )}
                          />
                          <span
                            className={cn(
                              "font-bold text-xs uppercase tracking-widest",
                              isActive ? "text-primary/80" : "text-white/20"
                            )}
                          >
                            {step.footerText}
                          </span>
                        </div>
                        {isActive && (
                          <ArrowRight className="h-5 w-5 text-primary/40 group-hover:translate-x-1 transition-transform" />
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
