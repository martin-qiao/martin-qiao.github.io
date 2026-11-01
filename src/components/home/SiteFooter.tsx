import { FOOTER } from "@/data/home";
import styles from "./home.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p>{FOOTER.text}</p>
    </footer>
  );
}
