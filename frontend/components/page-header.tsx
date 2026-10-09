import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div><h1 className="text-3xl font-semibold tracking-tight text-[#17221d]">{title}</h1>{subtitle && <p className="mt-2 text-sm text-[#66736c]">{subtitle}</p>}</div>
    {action}
  </div>;
}
