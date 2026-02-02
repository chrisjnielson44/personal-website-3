"use client";

import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/articles", label: "Articles" },
  { href: "/resources", label: "Resources" },
] as const;

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const routerState = useRouterState();
  const isActive =
    href === "/"
      ? routerState.location.pathname === "/"
      : routerState.location.pathname.startsWith(href);

  return (
    <Link
      to={href}
      className={cn(
        "relative text-sm font-medium transition-colors",
        isActive ? "text-foreground" : "text-muted hover:text-foreground",
      )}
    >
      {children}
      {isActive && (
        <motion.div
          className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-accent"
          layoutId="nav-underline"
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 30,
          }}
        />
      )}
    </Link>
  );
}

export default function Header() {
  return (
    <motion.header
      className="z-50 w-full bg-background"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <nav className="mx-auto flex h-14 max-w-2xl items-center justify-between px-6 lg:px-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <Link
            to="/"
            className="text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-accent"
          >
            CN
          </Link>
        </motion.div>

        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </motion.header>
  );
}
