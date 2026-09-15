"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { loginAction } from "./actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form className="admin-login-form" action={formAction}>
      <h1>Đăng nhập admin</h1>
      <p>Quản lý quán ăn trưa quanh 219 Trung Kính</p>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <label>
        Email
        <input
          type="email"
          name="email"
          autoComplete="username"
          defaultValue="nhatnv2@vnext.vn"
          required
        />
      </label>
      <label>
        Mật khẩu
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state?.error && <p className="admin-error">{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="admin-login-page">
      <Suspense fallback={<p>Đang tải...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
