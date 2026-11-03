"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/admin/actions";
import styles from "@/components/admin/admin.module.css";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return (
    <form className={styles.form} action={action}>
      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}
      <label className={styles.field}>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <button className={styles.button} type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
