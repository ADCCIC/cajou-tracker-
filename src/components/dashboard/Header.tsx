"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BarChart3,
  CircleDollarSign,
  Database,
  Home,
  Menu,
  Bell,
  Calculator,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Exports", href: "/exports", icon: BarChart3 },
  { name: "Prix", href: "/prices", icon: CircleDollarSign },
  { name: "Alertes", href: "/prices/alerts", icon: Bell },
  { name: "Calculateur", href: "/prices/calculator", icon: Calculator },
  { name: "Données", href: "/data/upload", icon: Database },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">🥜 Cajou Tracker</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 transition-colors hover:text-foreground/80",
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="flex items-center space-x-2 mb-8">
              <span className="font-bold text-xl">🥜 Cajou Tracker</span>
            </Link>
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "bg-accent"
                      : ""
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search could go here */}
          </div>
          <nav className="flex items-center">
            <Link href="/" className="md:hidden flex items-center space-x-2">
              <span className="font-bold">🥜 Cajou</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
