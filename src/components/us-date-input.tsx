import { useEffect, useState } from "react";
import { displayDate, storedDate } from "@/lib/display-date";
export function UsDateInput({ value, onChange, className, label = "Birthday, MM/DD/YYYY", testId }: { value: string; onChange: (value: string) => void; className?: string; label?: string; testId?: string }) {
  const [text, setText] = useState(displayDate(value));
  useEffect(() => { setText(displayDate(value)); }, [value]);
  return <input type="text" inputMode="numeric" aria-label={label} data-testid={testId} placeholder="MM/DD/YYYY" maxLength={10} className={className} value={text} onChange={e => {
    const next = e.target.value; setText(next);
    const iso = storedDate(next);
    if (!next || iso) onChange(iso ?? "");
  }} aria-invalid={!!text && !storedDate(text)} />;
}
