"use client";

import { Download, Printer } from "lucide-react";

type PrintActionsProps = {
  exportLabel?: string;
};

export function PrintActions({
  exportLabel = "Export PDF placeholder",
}: PrintActionsProps) {
  return (
    <div className="print-hidden flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => globalThis.print()}
        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
      >
        <Printer className="size-4" aria-hidden />
        Print
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white"
      >
        <Download className="size-4" aria-hidden />
        {exportLabel}
      </button>
    </div>
  );
}
