"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { getUser } from "@/lib/auth";
import { clearAuth } from "@/lib/auth";
import { getVisibleNavItems } from "@/lib/rbac";

export function Topbar() {
  const pathname = usePathname(); const router = useRouter(); const [menuOpen, setMenuOpen] = useState(false); const [query, setQuery] = useState("");
  const user = getUser(); const name = user?.name ?? user?.email ?? "Member"; const links = getVisibleNavItems(user);
  function logout() { clearAuth(); setMenuOpen(false); toast.success("You have been signed out"); router.replace("/login"); }
  return <header className="relative border-b border-[#e0e7e1] bg-white px-5 sm:px-8">
    <div className="flex min-h-18 items-center gap-5">
      <Link href="/dashboard" className="flex shrink-0 items-center gap-3 text-xl font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-lg bg-[#17221d] text-sm text-white">L</span><span>LMS</span></Link>
      <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex">{links.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${pathname === href ? "bg-[#17221d] text-white" : "text-[#68756d] hover:bg-[#f1f4f1] hover:text-[#17221d]"}`}><Icon size={16} />{label}</Link>)}</nav>
      <div className="ml-auto flex items-center gap-3"><form onSubmit={(event) => { event.preventDefault(); if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`); }} className="relative hidden w-52 xl:block"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b968e]" /><input aria-label="Search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="h-10 w-full rounded-lg border border-[#e0e7e1] bg-[#fafbfa] pl-9 pr-3 text-sm outline-none focus:border-[#6c8872]" /></form><button className="rounded-lg p-2 text-[#66736c] hover:bg-[#f1f4f1]" aria-label="Notifications"><Bell size={19} /></button><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-[#17221d]">{name}</p><p className="text-xs capitalize text-[#7d8981]">{user?.role ?? "member"}</p></div><div className="grid size-9 place-items-center rounded-full bg-[#dce9dd] text-sm font-semibold text-[#365341]">{name.charAt(0).toUpperCase()}</div><button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 text-[#66736c] hover:bg-[#f1f4f1] lg:hidden" aria-label="Toggle navigation">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </div>
    {menuOpen && <div className="absolute inset-x-0 top-full z-30 border-b border-[#e0e7e1] bg-white p-4 shadow-lg lg:hidden"><nav className="grid gap-1">{links.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${pathname === href ? "bg-[#17221d] text-white" : "text-[#68756d] hover:bg-[#f1f4f1]"}`}><Icon size={18} />{label}</Link>)}</nav><button onClick={logout} className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"><LogOut size={18} />Log out</button></div>}
  </header>;
}
