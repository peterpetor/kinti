"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export function NewsletterToggle() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);

  if (!isLoaded || !user) return null;

  const isOptedIn = !!user.unsafeMetadata?.newsletter_optin;

  async function toggle() {
    if (!user) return;
    setLoading(true);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          newsletter_optin: !isOptedIn,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex-1">
        <h3 className="text-sm font-bold text-ink">Hírlevél és ajánlatok</h3>
        <p className="mt-1 text-[12px] leading-snug text-ink-muted">
          Szeretnék értesülni a kinti újdonságairól, tippekről és exkluzív marketing anyagokról.
        </p>
      </div>
      
      <button
        type="button"
        role="switch"
        aria-checked={isOptedIn}
        onClick={toggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          isOptedIn ? "bg-primary" : "bg-line-heavy"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            isOptedIn ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
