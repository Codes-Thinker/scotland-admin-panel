"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";

interface Result<T> {
  /** Which request produced this result (path plus reload counter). */
  key: string;
  /** Last successful data, kept while a newer request is in flight. */
  data: T | undefined;
  error: string | null;
}

export interface ApiState<T> {
  data: T | undefined;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

/**
 * Loads `path` from the API whenever it changes. `reload()` fetches again after a change.
 * Pass null to skip loading (for example until a filter is chosen).
 */
export function useApi<T>(path: string | null): ApiState<T> {
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const key = path === null ? null : `${path}#${tick}`;

  useEffect(() => {
    if (path === null || key === null) return;
    let cancelled = false;
    api<T>(path)
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : "Could not load data.";
        setResult((prev) => ({ key, data: prev?.data, error: message }));
      });
    return () => {
      cancelled = true;
    };
  }, [path, key]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const current = key !== null && result?.key === key;

  return {
    data: result?.data,
    error: current ? result.error : null,
    loading: key !== null && !current,
    reload,
  };
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
