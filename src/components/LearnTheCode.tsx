import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";

export interface CodeStep {
  step: string;
  formula: string;
  example?: string;
}

interface LearnTheCodeProps {
  title: string;
  steps: CodeStep[];
  sourceLabel?: string;
  confidenceTag?: "High" | "Medium" | "Low";
  extraNotes?: string;
}

export function LearnTheCode({
  title,
  steps,
  sourceLabel = "Per GG33 Academy",
  confidenceTag = "High",
  extraNotes,
}: LearnTheCodeProps) {
  const [open, setOpen] = useState(false);

  const confColor =
    confidenceTag === "High" ? "#4ade80" :
    confidenceTag === "Medium" ? "#facc15" : "#f87171";

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(96,165,250,0.18)", background: "rgba(10,20,40,0.7)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
        style={{ background: "rgba(96,165,250,0.06)" }}
      >
        <BookOpen size={13} style={{ color: "#60a5fa", flexShrink: 0 }} />
        <span className="flex-1 text-xs font-semibold" style={{ color: "#60a5fa" }}>
          Learn the Code — {title}
        </span>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: `${confColor}18`, color: confColor }}
        >
          {confidenceTag} Confidence
        </span>
        <span className="text-[9px] shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
          {sourceLabel}
        </span>
        {open ? (
          <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
        ) : (
          <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa" }}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
                  {s.step}
                </p>
                <p
                  className="text-[10px] mt-0.5 font-mono px-2 py-1 rounded"
                  style={{ background: "rgba(255,255,255,0.04)", color: "#facc15" }}
                >
                  {s.formula}
                </p>
                {s.example && (
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {s.example}
                  </p>
                )}
              </div>
            </div>
          ))}
          {extraNotes && (
            <p className="text-[10px] leading-relaxed pt-1" style={{ color: "rgba(255,255,255,0.4)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {extraNotes}
            </p>
          )}
          <div className="flex items-center gap-2 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa" }}>
              {sourceLabel}
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: `${confColor}15`, color: confColor }}>
              Confidence: {confidenceTag}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Inline output tag row for Calculated | Interpretive | Confidence | Source */
interface OutputTagsProps {
  calculated: string;
  interpretive: string;
  confidence?: "High" | "Medium" | "Low";
  source?: string;
}

export function OutputTags({ calculated, interpretive, confidence = "High", source = "Per GG33 Academy" }: OutputTagsProps) {
  const confColor =
    confidence === "High" ? "#4ade80" :
    confidence === "Medium" ? "#facc15" : "#f87171";

  return (
    <div className="flex flex-wrap gap-2 text-[9px] mt-2">
      <span className="px-2 py-0.5 rounded" style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa" }}>
        CALC: {calculated}
      </span>
      <span className="px-2 py-0.5 rounded" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
        READ: {interpretive}
      </span>
      <span className="px-2 py-0.5 rounded" style={{ background: `${confColor}15`, color: confColor }}>
        {confidence}
      </span>
      <span className="px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>
        {source}
      </span>
    </div>
  );
}
