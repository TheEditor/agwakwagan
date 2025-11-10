"use client";

import { useEffect } from "react";
import { Toast as ToastType } from "@/hooks/useToast";

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => onClose(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const bgColors: Record<string, string> = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  };

  const icons: Record<string, string> = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <div
      className={`${bgColors[toast.type]} text-white px-4 py-3 rounded shadow-lg
                   flex items-center gap-2 min-w-[200px] max-w-[400px]
                   animate-in slide-in-from-top-2 fade-in duration-300`}
    >
      <span className="font-bold text-lg">{icons[toast.type]}</span>
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-2 hover:opacity-80 transition-opacity"
      >
        ×
      </button>
    </div>
  );
}
