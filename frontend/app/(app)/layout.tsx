"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { getUser, isLoggedIn } from "@/lib/auth";
import { hasPermission, navItems } from "@/lib/rbac";
import { Topbar } from "@/components/topbar";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  const loggedIn = useSyncExternalStore(() => () => {}, isLoggedIn, () => false);
  const pathname = usePathname();
  useEffect(() => { if (hydrated && !loggedIn) router.replace("/login"); else if (hydrated && loggedIn) { const item = navItems.find((entry) => entry.href === pathname); if (item && !hasPermission(getUser(), item.permission)) router.replace("/dashboard"); } }, [hydrated, loggedIn, pathname, router]);
  if (!hydrated || !loggedIn) return <div className="grid min-h-screen place-items-center bg-[#f7f8f6]"><LoaderCircle className="animate-spin text-[#4a6654]" /></div>;
  return <div className="min-h-screen bg-[#f7f8f6]"><Topbar /><main className="mx-auto max-w-[1800px] p-5 sm:p-8">{children}</main></div>;
}
