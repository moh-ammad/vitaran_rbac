import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading" }: { label?: string }) { return <div className="flex min-h-48 items-center justify-center gap-3 rounded-xl border border-[#e0e7e1] bg-white text-sm text-[#758079]"><LoaderCircle size={18} className="animate-spin" />{label}</div>; }
export function ErrorState({ message }: { message: string }) { return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{message}</div>; }
