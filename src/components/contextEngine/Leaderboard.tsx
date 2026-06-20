"use client";

import { useState } from "react";
import { motion } from "@/components/Motion";
import {
  MODE_COLORS,
  MODE_LABELS,
  leaderboard,
  type LegacyMode,
  type PerModel,
} from "@/data/contextEngine";

const COLS: LegacyMode[] = ["none", "vector", "graph_rag", "graph"];

function Cell({ v, lead }: { v: number | null; lead?: boolean }) {
  if (v == null) return <td className="px-2 py-2 text-right text-muted-foreground">—</td>;
  const bg = `color-mix(in srgb, var(--color-accent) ${Math.round(v * 28)}%, transparent)`;
  return (
    <td className="px-2 py-2 text-right">
      <span
        className="inline-block min-w-[2.9rem] rounded px-1.5 py-0.5 font-mono tabular-nums"
        style={{
          backgroundColor: bg,
          boxShadow: lead ? `inset 0 0 0 1px ${MODE_COLORS.graph}` : undefined,
        }}
      >
        {v.toFixed(2)}
      </span>
    </td>
  );
}

function badge(m: PerModel) {
  if (m.backend === "ollama")
    return (
      <span className="ml-2 rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--cat-projects)]">
        on-device
      </span>
    );
  if (m.tier === "frontier")
    return (
      <span className="ml-2 rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        frontier
      </span>
    );
  return null;
}

export function Leaderboard() {
  const [showAll, setShowAll] = useState(false);
  const rows = leaderboard();
  const shown = showAll ? rows : rows.slice(0, 10);
  const best = Math.max(...rows.map((r) => r.graph ?? 0));

  return (
    <div className="glass-panel overflow-x-auto">
      <table className="w-full min-w-[38rem] text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 text-left font-medium">#</th>
            <th className="px-1 py-3 text-left font-medium">Model</th>
            {COLS.map((c) => (
              <th key={c} className="px-2 py-3 text-right font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: MODE_COLORS[c] }}
                  />
                  {MODE_LABELS[c]}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((m, i) => (
            <motion.tr
              key={m.model}
              className="border-b border-border/50 last:border-0"
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.3, delay: Math.min(i, 10) * 0.03 }}
            >
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {i < 3 ? (
                  <span
                    className="inline-flex size-5 items-center justify-center rounded-full text-[11px] font-semibold text-accent-foreground"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--color-accent) ${90 - i * 22}%, transparent)`,
                    }}
                  >
                    {i + 1}
                  </span>
                ) : (
                  i + 1
                )}
              </td>
              <td className="px-1 py-2">
                <span className="font-medium text-foreground">{m.model}</span>
                {m.params_b > 0 && (
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {m.params_b}B
                  </span>
                )}
                {badge(m)}
              </td>
              <Cell v={m.none} />
              <Cell v={m.vector} />
              <Cell v={m.graph_rag} />
              <Cell v={m.graph} lead={m.graph != null && m.graph >= best - 1e-9} />
            </motion.tr>
          ))}
        </tbody>
      </table>
      {rows.length > 10 && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="w-full border-t border-border py-2.5 text-xs font-medium text-muted transition-colors hover:text-accent"
        >
          {showAll ? "Show fewer" : `Show all ${rows.length} models`}
        </button>
      )}
    </div>
  );
}
