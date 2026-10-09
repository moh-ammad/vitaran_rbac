"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { ErrorState, LoadingState } from "@/components/data-state";

type ClassRow = { id: string; name: string; grade: number; subjects: { subject: { name: string } }[]; _count: { students: number; teachers: number } };
export default function ClassesPage() { const [classes, setClasses] = useState<ClassRow[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); useEffect(() => { api<{ classes: ClassRow[] }>("/classes").then((result) => setClasses(result.classes)).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load classes")).finally(() => setLoading(false)); }, []); return <><PageHeader title="Classes" subtitle="Only classes assigned to your current role are loaded." />{error ? <ErrorState message={error} /> : loading ? <LoadingState label="Loading classes" /> : classes.length === 0 ? <p className="rounded-xl border border-dashed border-[#d6ded8] bg-white p-10 text-center text-sm text-[#758079]">No classes are assigned to this account.</p> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{classes.map((item) => <Link href={`/classes/${item.id}`} key={item.id} className="rounded-xl border border-[#e0e7e1] bg-white p-5 hover:border-[#8eaa92]"><div className="flex items-start justify-between"><div className="grid size-10 place-items-center rounded-lg bg-[#e9edf7] text-[#4c6092]"><GraduationCap size={19} /></div><span className="text-3xl font-semibold text-[#17221d]">{item.grade}</span></div><h2 className="mt-6 font-semibold text-[#17221d]">{item.name}</h2><p className="mt-2 text-sm text-[#758079]">{item._count.students} students, {item._count.teachers} teachers</p><div className="mt-4 flex flex-wrap gap-2">{item.subjects.map(({ subject }) => <span key={subject.name} className="rounded-full bg-[#f2f5f2] px-2.5 py-1 text-xs text-[#526158]">{subject.name}</span>)}</div></Link>)}</div>}</>; }
