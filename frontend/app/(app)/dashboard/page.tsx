"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BookOpen, ClipboardList, GraduationCap, Users } from "lucide-react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ErrorState, LoadingState } from "@/components/data-state";

type Stats = { users: number; classes: number; books: number; questionPapers: number };
const cards = [[Users, "Users", "People in your visible scope", "bg-[#e4f0e5] text-[#477050]", "users"], [GraduationCap, "Classes", "Groups in your visible scope", "bg-[#e9edf7] text-[#4c6092]", "classes"], [BookOpen, "Books", "Resources available to you", "bg-[#f5ebdc] text-[#936c36]", "books"], [ClipboardList, "Question papers", "Assessments available to you", "bg-[#f4e5e6] text-[#94545d]", "questionPapers"]] as const;

export default function DashboardPage() { const name = useSyncExternalStore(() => () => {}, () => getUser()?.name?.split(" ")[0] ?? "there", () => "there"); const [stats, setStats] = useState<Stats | null>(null); const [error, setError] = useState(""); useEffect(() => { api<{ stats: Stats }>("/dashboard/stats").then((result) => setStats(result.stats)).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load dashboard stats")); }, []); return <><PageHeader title={`Welcome, ${name}`} subtitle="Only aggregate stats are loaded on your dashboard." />{error ? <ErrorState message={error} /> : !stats ? <LoadingState label="Loading dashboard" /> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([Icon, label, description, color, key]) => <div key={key} className="rounded-xl border border-[#e0e7e1] bg-white p-5"><div className="flex items-start justify-between"><div className={`grid size-11 place-items-center rounded-lg ${color}`}><Icon size={21} /></div><span className="text-3xl font-semibold text-[#17221d]">{stats[key]}</span></div><p className="mt-7 font-semibold text-[#17221d]">{label}</p><p className="mt-1 text-sm text-[#829087]">{description}</p></div>)}</div><section className="mt-10 rounded-xl border border-[#e0e7e1] bg-white p-6"><h2 className="text-lg font-semibold text-[#17221d]">Your workspace</h2><p className="mt-2 text-sm leading-6 text-[#758079]">Detailed records stay behind their own pages, so this view remains fast and focused.</p></section></>}</>; }
