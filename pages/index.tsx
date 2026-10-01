import { useEffect, useState } from "react";

type FlagResponse = {
  flagKey: string;
  value: unknown;
  source: string;
  reason?: string;
};

export default function Home() {
  const [flag, setFlag] = useState<FlagResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hello-flag")
      .then((res) => res.json())
      .then(setFlag)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white">
      <h1 className="text-5xl font-semibold tracking-tight text-neutral-900">
        ToggleWear
      </h1>
      <p className="text-sm text-neutral-500">
        Scaffold placeholder — Jen&apos;s designs land here next.
      </p>

      <div className="w-full max-w-md rounded-lg border border-neutral-200 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
          Server-side flag check
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && !flag && <p className="text-sm text-neutral-400">Checking…</p>}
        {flag && (
          <pre className="overflow-x-auto text-xs text-neutral-700">
            {JSON.stringify(flag, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}
