"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import GooeyNav from "@/components/ui/GooeyNav";
import { StaggeredMenu } from "@/components/ui/StaggeredMenu";
import {
  Gift, Heart, ShoppingCart, Search,
  ChevronDown, User, Settings, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Home",           href: "/" },
  { label: "Frames",         href: "/frames" },
  { label: "Products",       href: "/products" },
  { label: "Categories",     href: "/categories" },
  { label: "Vintage Strip",  href: "/vintage-strip" },
];

// StaggeredMenu items (mobile full-screen nav)
const staggeredItems = [
  { label: "Home",          ariaLabel: "Go to home page",       link: "/" },
  { label: "Frames",        ariaLabel: "Browse photo frames",   link: "/frames" },
  { label: "Products",      ariaLabel: "Browse all products",   link: "/products" },
  { label: "Categories",    ariaLabel: "All categories",        link: "/categories" },
  { label: "Vintage Strip", ariaLabel: "Make a vintage strip",  link: "/vintage-strip" },
  { label: "Wishlist",      ariaLabel: "My wishlist",           link: "/wishlist" },
  { label: "Track Order",   ariaLabel: "Track your order",      link: "/help/track-order" },
  { label: "Contact",       ariaLabel: "Contact us",            link: "/help/contact" },
];

const staggeredSocials = [
  { label: "Instagram", link: "https://instagram.com" },
  { label: "Twitter",   link: "https://twitter.com" },
  { label: "Facebook",  link: "https://facebook.com" },
];

export function NotchNavbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { getItemCount } = useCartStore();
  const { resolvedTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen,     setUserMenuOpen]     = useState(false);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [scrolled,         setScrolled]         = useState(false);
  const [mounted,          setMounted]          = useState(false);

  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = mounted ? wishlistItems.length : 0;
  const cartCount = mounted ? getItemCount() : 0;

  // Theme-adaptive toggle color:
  //   dark mode  → light text (#f9fafb) — visible on dark navbar + dark panel
  //   light mode → dark text (#111827) — visible on light navbar + white panel
  const menuBtnColor = resolvedTheme === "dark" ? "#f9fafb" : "#111827";

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });

    const handleHashChange = () => {
      if (window.location.hash === "#signout") {
        signOut({ callbackUrl: "/" });
      }
    };
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("scroll", fn);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          NAVBAR — always transparent; frosted glass appears on scroll
          Layout: [Logo]     [GooeyNav — centered]     [Actions]
                  flex-none  flex-1 (centred)           flex-none
          ═══════════════════════════════════════════════════════════ */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 h-16 transition-all duration-500",
          scrolled
            ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5"
            : "bg-transparent",
          className
        )}
        {...props}
      >
        {/* ── True-center layout ──────────────────────────────────
            Logo is position:relative on the left.
            GooeyNav is position:absolute, left:50%, translateX(-50%)
            → always exactly at the horizontal centre regardless of
              how wide the logo or right-actions are.
            Actions float to the far right with ml-auto.
          ─────────────────────────────────────────────────────── */}
        <div className="relative h-full w-full flex items-center px-4 sm:px-6 lg:px-8">

          {/* ── Logo — left ── */}
          <Link href="/" className="flex items-center gap-2.5 group z-10" aria-label="SREE BALAJI FRAMES AND GIFTS Home">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/40 group-hover:shadow-primary-500/60 transition-shadow">
              <Gift className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="font-display text-[0.9rem] lg:text-[1rem] font-bold hidden sm:block text-gray-900 dark:text-white">
              SREE BALAJI FRAMES AND GIFTS
            </span>
          </Link>

          {/* ── GooeyNav — absolutely centred ── */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center z-10">
            <div className="gooey-transparent">
              <GooeyNav
                items={navItems}
                particleCount={9}
                particleDistances={[90, 10]}
                particleR={200}
                animationTime={600}
                timeVariance={200}
                colors={[1, 2, 3, 1, 2, 3, 1, 4]}
              />
            </div>
          </div>

          {/* ── Actions — right ──
              pr-14 on mobile reserves 56px for the StaggeredMenu
              toggle button that sits at position:absolute right:0.
              On desktop (lg+) no padding needed.                  */}
          <div className="ml-auto flex items-center gap-0.5 sm:gap-1 z-10 pr-14 lg:pr-0">

            {/* Search — desktop only */}
            <div className="relative hidden xl:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search..."
                className={cn(
                  "w-40 pl-9 pr-3 py-2 text-sm rounded-full border transition-all",
                  "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40",
                  scrolled
                    ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    : "bg-black/10 dark:bg-white/10 border-white/20 dark:border-white/10 text-gray-800 dark:text-white focus:bg-black/20 dark:focus:bg-white/15"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim())
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                }}
              />
            </div>

            {/* Wishlist — desktop only (StaggeredMenu handles mobile nav) */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden lg:inline-flex p-2 rounded-full text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center leading-none animate-scale-in">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => { router.push("/cart"); }}
              aria-label="Cart"
              className="relative p-2 rounded-full text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Divider — desktop */}
            <div className="hidden lg:block w-px h-5 bg-current opacity-15 mx-0.5" />

            {/* Theme Toggle — desktop only */}
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

            {/* Divider — desktop */}
            <div className="hidden lg:block w-px h-5 bg-current opacity-15 mx-0.5" />

            {/* Auth — desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {status === "loading" ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : session ? (
                <div className="relative">
                  <button
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-expanded={userMenuOpen}
                  >
                    <Avatar src={session.user?.image ?? undefined} name={session.user?.name ?? undefined} size="sm" alt="" />
                    <ChevronDown className={cn("w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-200", userMenuOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 6 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-1.5 z-50"
                        >
                          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                          </div>
                          {[
                            { href: "/account",        icon: User,         label: "My Account" },
                            { href: "/account/orders", icon: ShoppingCart, label: "My Orders" },
                          ].map(({ href, icon: Icon, label }) => (
                            <Link key={href} href={href} onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                              <Icon className="w-4 h-4 text-gray-400" />{label}
                            </Link>
                          ))}
                          {session.user?.role === "ADMIN" && (
                            <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                              <Settings className="w-4 h-4 text-gray-400" />Admin Dashboard
                            </Link>
                          )}
                          <hr className="my-1.5 border-gray-100 dark:border-gray-800" />
                          <button onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
                            <LogOut className="w-4 h-4" />Sign Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm" className="rounded-full font-semibold">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="rounded-full font-semibold">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ── StaggeredMenu — mobile full-screen overlay (hidden on lg+) ── */}
      {/* The component renders its own toggle button fixed at top-right.  */}
      {/* z-index 55 sits above the navbar (z-50).                         */}
      <div className="lg:hidden">
        <StaggeredMenu
          isFixed
          position="right"
          items={(() => {
            const dynamicMobileItems = [
              { label: "Home",          ariaLabel: "Go to home page",       link: "/" },
              { label: "Frames",        ariaLabel: "Browse photo frames",   link: "/frames" },
              { label: "Products",      ariaLabel: "Browse all products",   link: "/products" },
              { label: "Categories",    ariaLabel: "All categories",        link: "/categories" },
              { label: "Vintage Strip", ariaLabel: "Make a vintage strip",  link: "/vintage-strip" },
              { label: "Wishlist",      ariaLabel: "My wishlist",           link: "/wishlist" },
              { label: "Track Order",   ariaLabel: "Track your order",      link: "/track-order" },
              { label: "Contact",       ariaLabel: "Contact us",            link: "/contact" },
            ];

            if (mounted) {
              if (session) {
                dynamicMobileItems.push(
                  { label: "My Account", ariaLabel: "My Account", link: "/account" },
                  { label: "My Orders", ariaLabel: "My Orders", link: "/account/orders" }
                );
                if (session.user?.role === "ADMIN") {
                  dynamicMobileItems.push({ label: "Admin Dashboard", ariaLabel: "Admin Dashboard", link: "/admin" });
                }
                dynamicMobileItems.push({ label: "Sign Out", ariaLabel: "Sign Out", link: "#signout" });
              } else {
                dynamicMobileItems.push(
                  { label: "Sign In", ariaLabel: "Sign In", link: "/auth/signin" },
                  { label: "Sign Up", ariaLabel: "Sign Up", link: "/auth/signup" }
                );
              }
            }
            return dynamicMobileItems;
          })()}
          socialItems={staggeredSocials}
          displaySocials
          displayItemNumbering
          colors={["#fed7aa", "#f97316"]}
          accentColor="#f97316"
          menuButtonColor={menuBtnColor}
          openMenuButtonColor={menuBtnColor}
          changeMenuColorOnOpen={false}
          closeOnClickAway
        />
      </div>
    </>
  );
}
