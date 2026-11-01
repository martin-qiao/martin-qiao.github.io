import { HOME_NAV } from "@/data/home";
import styles from "./home.module.css";

export function SiteNav() {
  return (
    <header className={styles.nav}>
      <a className={styles.brand} href="#about">
        Martin Qiao
      </a>
      <nav className={styles.navLinks} aria-label="Sections">
        {HOME_NAV.map((link) => (
          <a key={link.href} className={styles.navLink} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
