"use client";

import CreateContent from "@/pages/moderator/dashboard/create-content";

export default function ModeratorPage() {
  // The sidebar and header are now handled by ModeratorLayout
  // This page just renders the default content (CreateContent)
  return <CreateContent />;
}
