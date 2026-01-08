"use client";

import Logo from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import Link from "next/link";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Marketplace", href: "/market" },
      { label: "Become a Seller", href: "/sell" },
      { label: "Zero-Trust Previews", href: "#" },
      { label: "Security Analyzers", href: "#" },
    ],
  },
  {
    title: "Categories",
    links: [
      { label: "Hero Sections", href: "/market?cat=hero" },
      { label: "Dashboards", href: "/market?cat=dashboard" },
      { label: "Forms", href: "/market?cat=form" },
      { label: "Animations", href: "/market?cat=animation" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Success Stories", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "License Agreement", href: "/license" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Mail, href: "mailto:hello@tailwindwizard.com", label: "Email" },
];

export default function HomeFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <div className="xl:grid xl:grid-cols-3 xl:gap-12">
          {/* Brand Column */}
          <div className="space-y-8">
            <Logo size="lg" className="hover:opacity-100" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Empowering developers to monetize their craft through a secure,
              zero-trust component marketplace. Built on the principles of
              speed, security, and visual excellence.
            </p>
            <div className="flex gap-5">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 xl:col-span-2 xl:mt-0">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  {group.title}
                </h3>
                <ul className="mt-6 space-y-4">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-12 opacity-50" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground">
            © {currentYear} TailwindWizard. All rights reserved. Made with ❤️ in
            Chile.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
