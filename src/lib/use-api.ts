"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";

interface State<T> {
  data: T | undefined;
  error: string | null;
  loading: boolean;
}

/**
 * Loads `path` from the API whenever it changes. `reload()` fetches again after a change.
 * Pass null to skip loading (for example until a filter is chosen).
 */
export function useApi<T>(path: string | null): State<T> & { reload: () => void } {
  const [state, setState] = useState<State<T>>({ data: undefined, error: null, loading: path !== null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    api<T>(path)
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : "Could not load data.";
        setState({ data: undefined, error: message, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

/** Runs a write and returns an error message for the page to show, or null on success. */
export async function runAction(action: () => Promise<unknown>): Promise<string | null> {
  try {
    await action();
    return null;
  } catch (err) {
    return err instanceof ApiError ? err.message : "Something went wrong. Try again.";
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export function formatPounds(pence: number | null | undefined): string {
  return `£${((pence ?? 0) / 100).toFixed(2)}`;
}
