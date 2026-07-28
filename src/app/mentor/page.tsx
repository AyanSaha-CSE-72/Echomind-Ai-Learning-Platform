"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useEcho } from "@/lib/store";
import { SubjectChat } from "@/components/SubjectChat";
import type { Subject } from "@/lib/promptAgent";

function MentorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subjectId = searchParams.get("subject");
  
  const activeApiKey = useEcho((s) => s.apiKeys.find((k) => k.isActive));
  const subjects = useEcho((s) => s.subjects);
  const subject = subjectId ? subjects.find((s) => s.id === subjectId) : null;

  // Redirect to subjects page if no subject provided
  useEffect(() => {
    if (!subjectId || !subject) {
      router.push("/subjects");
    }
  }, [subjectId, subject, router]);

  // Show loading or redirect message
  if (!subjectId || !subject) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-ink-400 mb-2">Redirecting to subjects...</div>
          </div>
        </div>
      </AppShell>
    );
  }

  // Require API key for subject-specific chat
  if (!activeApiKey) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="text-2xl font-semibold mb-4">API Key Required</div>
            <div className="text-ink-300 mb-6">
              To use subject-specific AI tutors, you need to add an API key first.
            </div>
            <button
              onClick={() => router.push("/settings")}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-medium hover:scale-105 transition-transform"
            >
              Add API Key
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SubjectChat
        subject={{
          id: subject.id,
          title: subject.name,
          description: subject.description,
          icon: subject.icon,
          color: subject.color,
        }}
        apiKey={activeApiKey.key}
        model={activeApiKey.model}
        onSettingsClick={() => router.push("/settings")}
      />
    </AppShell>
  );
}

export default function MentorPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-ink-400">Loading...</div>
          </div>
        </div>
      </AppShell>
    }>
      <MentorContent />
    </Suspense>
  );
}
