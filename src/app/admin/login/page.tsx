import { LoginForm } from "./LoginForm";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.card}>
        <p className={styles.kicker}>Martin Qiao</p>
        <h1 className={styles.pageTitle}>Admin</h1>
        <p className={styles.lead}>Password for the editorial desk. There is no public signup.</p>
        <LoginForm />
      </section>
    </main>
  );
}
