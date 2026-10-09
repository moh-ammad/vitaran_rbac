import Link from "next/link";
import { AuthPage } from "@/app/(public)/login/page";

export default function RegisterPage() { return <AuthPage title="Build what comes next" eyebrow="Make learning feel possible" description="Give your school one clear place for the people, resources, and moments that matter." formTitle="Create your workspace" mode="register" footer={<span>Already have an account? <Link href="/login" className="font-semibold text-[#365341] hover:underline">Sign in</Link></span>} />; }
