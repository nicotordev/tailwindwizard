import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Menu, Sparkles } from "lucide-react";
import Logo from "../logo";

export default function HomeHeader() {
  return (
    <header className="sticky top-0 left-0 z-50 w-full border-b bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Logo />
        </div>

        {/* Center: Desktop nav */}
        <nav className="hidden md:block" aria-label="Primary navigation">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/market"
                    className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Marketplace
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/sell"
                    className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Sell blocks
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/docs"
                    className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Docs
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/pricing"
                    className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Pricing
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Right: CTAs + mobile menu */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            asChild
          >
            <Link href="/sell">
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Start selling
            </Link>
          </Button>

          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/market">Explore blocks</Link>
          </Button>

          {/* Mobile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <div className="text-sm font-semibold">TailwindWizard</div>
                <div className="text-xs text-muted-foreground">
                  Marketplace for Shadcn blocks
                </div>
              </div>
              <Separator />

              <DropdownMenuItem asChild>
                <Link href="/market" className="cursor-pointer">
                  Marketplace
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/sell" className="cursor-pointer">
                  Sell blocks
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/docs" className="cursor-pointer">
                  Docs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pricing" className="cursor-pointer">
                  Pricing
                </Link>
              </DropdownMenuItem>

              <Separator />

              <DropdownMenuItem asChild>
                <Link href="/login" className="cursor-pointer">
                  Sign in
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/signup" className="cursor-pointer">
                  Create account
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
