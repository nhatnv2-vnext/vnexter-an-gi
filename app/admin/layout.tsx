import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link href="/admin" className="admin-brand">
            Admin · Vnexter ăn gì
          </Link>
          {session?.user && (
            <nav className="admin-nav">
              <Link href="/admin">Quán ăn</Link>
              <Link href="/admin/reviews">Reviews</Link>
              <Link href="/" target="_blank">
                Xem site
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/admin/login" });
                }}
              >
                <button type="submit">Đăng xuất</button>
              </form>
              <span className="admin-user">{session.user.email}</span>
            </nav>
          )}
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
