"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/lens", label: "Lens" },
  { href: "/admin/notes", label: "Notes" },
  { href: "/admin/fidget", label: "Fidget" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Admin sections">
      {LINKS.map((link) => {
        const current =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} aria-current={current ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
