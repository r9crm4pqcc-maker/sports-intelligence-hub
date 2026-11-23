import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

const FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center"
      style={{ background: "#0a0a0a", color: "#f6ead8" }}
    >
      <span style={{ color: "#ff6a00" }} aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words" style={{ color: "#c4a882" }}>
        {errorMessage(error)}
      </p>
    </main>
  );
}
