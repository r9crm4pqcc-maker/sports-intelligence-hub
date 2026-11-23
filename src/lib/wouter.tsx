// Small compatibility layer so the imported pages keep their Link/useLocation calls
// while navigation runs on TanStack Router.
import { useLocation as useTsLocation, useRouter } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, MouseEvent } from "react";

export function useLocation(): [string, (to: string, opts?: { replace?: boolean }) => void] {
  const pathname = useTsLocation({ select: (l) => l.pathname });
  const router = useRouter();
  return [pathname, (to, opts) => void router.navigate({ href: to, replace: opts?.replace ?? false })];
}

export function useSearch(): string {
  return useTsLocation({ select: (l) => l.searchStr.replace(/^\?/, "") });
}

export function useParams<T extends Record<string, string | undefined> = { sub?: string }>(): T {
  const [pathname] = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  return { sub: parts.length >= 2 ? parts.slice(1).join("/") : undefined } as unknown as T;
}

export function Link({ href, onClick, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const router = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    void router.navigate({ href });
  };
  return <a href={href} onClick={handle} {...rest}>{children}</a>;
}
