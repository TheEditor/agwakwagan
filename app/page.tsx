"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { KanbanBoard } from "@/components/KanbanBoard";

function HomeContent() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get("board") || "board-default";

  return <KanbanBoard boardId={boardId} />;
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <p className="text-gray-500">Loading board...</p>
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </main>
  );
}
