"use client";

import { useEffect, useState } from "react";
import { Building2, GraduationCap, UserRound, Users } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { ErrorState, LoadingState } from "@/components/data-state";

type Stats = { users: number; teachers: number; students: number; classes: number };
export default function SchoolPage() { const [stats, setStats] = useState<Stats | null>(null); const [error, setError] = useState(""); useEffect(() => { api<{ stats: Stats }>("/school/stats").then((result) => setStats(result.stats)).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load school stats")); }, []); const cards = stats ? [{ icon: Users, label: "All users", value: stats.users }, { icon: UserRound, label: "Teachers", value: stats.teachers }, { icon: GraduationCap, label: "Students", value: stats.students }, { icon: Building2, label: "Classes", value: stats.classes }] : []; return <><PageHeader title="School" subtitle="Only school-level counts are loaded on this page." />{error ? <ErrorState message={error} /> : !stats ? <LoadingState label="Loading school stats" /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ icon: Icon, label, value }) => <div key={label} className="rounded-xl border border-[#e0e7e1] bg-white p-6"><div className="grid size-11 place-items-center rounded-lg bg-[#edf2ed] text-[#4a6654]"><Icon size={21} /></div><p className="mt-6 text-sm text-[#829087]">{label}</p><p className="mt-1 text-4xl font-semibold text-[#17221d]">{value}</p></div>)}</div>}</>; }
