"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { KanbanBoard } from "@/components/Board/KanbanBoard";

function HomeContent() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get("board") || "board-default";

  return <KanbanBoard boardId={boardId} />;
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <p style={{ color: 'var(--text-muted)' }}>Loading board...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
