// app/thanks/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ArrowLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Thanks — Confirm your email | Cohort AI",
  description:
    "You're nearly there — check your inbox and confirm your email to join The Plan.",
};

export default function ThanksPage() {
  return (
    <main className="min-h-[70vh] bg-gradient-to-br from-sky-50 via-white to-[#25c19b]/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[#25c19b]" aria-hidden="true" />
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Please confirm your email
        </h1>
        <p className="mt-3 text-slate-700">
          We’ve sent a confirmation link to your inbox. Click it to complete your
          subscription to <span className="font-semibold">The Plan</span>.
        </p>

        <div className="mt-8 mx-auto max-w-xl text-left bg-white/80 backdrop-blur border rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Mail className="h-6 w-6 text-sky-600 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-slate-700">
              <p className="font-medium">Didn’t get an email?</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Check your spam or junk folder.</li>
                <li>
                  Add <span className="font-mono">no-reply@mailchimp.com</span> to
                  your safe senders.
                </li>
                <li>Try signing up again with the correct email address.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-xl px-4 py-2 border hover:bg-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <Link
            href="/#blog"
            className="inline-flex items-center gap-1 rounded-xl px-4 py-2 bg-[#25c19b] text-white hover:opacity-90 transition"
          >
            Read The Plan
          </Link>
        </div>
      </div>
    </main>
  );
}
