import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { type AnnouncementPersona } from "@/components/layout/AnnouncementBar";

type FlagResponse = {
  flagKey: string;
  value: unknown;
  source: string;
  reason?: string;
};

const PERSONAS: { id: AnnouncementPersona; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "cartAbandon", label: "Cart Abandoner" },
  { id: "newCustomer", label: "New Customer" },
  { id: "loyaltyGold", label: "Loyalty Gold Member" },
];

const COLORS = [
  { token: "Base/Lime", className: "bg-base-lime", hex: "#DDFF46" },
  { token: "Base/Blue", className: "bg-base-blue", hex: "#405BFF" },
  { token: "Base/Orange", className: "bg-base-orange", hex: "#FF9D29" },
  { token: "Base/Cyan", className: "bg-base-cyan", hex: "#3DD6F5" },
  { token: "Grays/LD Black", className: "bg-grays-ld-black", hex: "#191919" },
  { token: "Grays/Black 01", className: "bg-grays-black-01", hex: "#101010" },
  { token: "Grays/Gray 04", className: "bg-grays-04", hex: "#6D6E71" },
  { token: "Grays/Gray 03", className: "bg-grays-03", hex: "#A7A9AC" },
  { token: "Grays/Gray 02", className: "bg-grays-02", hex: "#D1D6D9" },
  { token: "Grays/Gray 01", className: "bg-grays-01", hex: "#F8F8F8" },
];

const TYPE = [
  { token: "Web H1", className: "font-sora font-bold text-h1" },
  { token: "Web H2", className: "font-sora font-semibold text-h2" },
  { token: "Web H3", className: "font-sora font-semibold text-h3" },
  { token: "Text Main, Regular", className: "font-sohne text-main" },
  { token: "Text Main, Medium", className: "font-sohne font-medium text-main-medium" },
  { token: "Text Small, Regular", className: "font-sohne text-small" },
  { token: "Text XSmall, Regular", className: "font-sohne text-xsmall" },
  { token: "Text XSmall, Mono", className: "font-sohne-mono text-xsmall-mono" },
];

export default function Home() {
  const [persona, setPersona] = useState<AnnouncementPersona>("loyaltyGold");
  const [flag, setFlag] = useState<FlagResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hello-flag")
      .then((res) => res.json())
      .then(setFlag)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <Header persona={persona} />

      <main className="mx-auto max-w-5xl px-8 py-16">
        <header className="mb-16">
          <p className="mb-4 font-sohne-mono text-xsmall-mono uppercase text-grays-04">
            Scaffold specimen — Demo-ToggleWear-2026
          </p>
          <h1 className="font-sora text-h2 font-semibold">Shared layout</h1>
          <p className="mt-4 font-sohne text-main text-grays-04">
            Header and footer are built from Jen&apos;s Figma components. Switch
            personas below to see the announcement bar variants; this will be
            flag-driven once the LaunchDarkly project is wired up.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="mb-6 font-sora text-h3 font-semibold">Persona</h2>
          <div className="flex flex-wrap gap-3">
            {PERSONAS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPersona(id)}
                className={`rounded-[10px] border px-4 py-2 font-sohne text-small font-medium transition-colors ${
                  persona === id
                    ? "border-grays-ld-black bg-grays-ld-black text-grays-white"
                    : "border-grays-02 text-grays-04 hover:border-grays-03"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 font-sora text-h3 font-semibold">Color</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {COLORS.map(({ token, className, hex }) => (
              <div key={token}>
                <div
                  className={`${className} h-20 w-full rounded-[10px] border border-grays-02`}
                />
                <p className="mt-2 font-sohne text-xsmall font-medium">{token}</p>
                <p className="font-sohne-mono text-xsmall-mono text-grays-04">{hex}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 font-sora text-h3 font-semibold">Type</h2>
          <div className="divide-y divide-grays-02">
            {TYPE.map(({ token, className }) => (
              <div key={token} className="py-5">
                <p className="mb-2 font-sohne-mono text-xsmall-mono text-grays-03">
                  {token}
                </p>
                <p className={className}>Swag that&apos;s built for the team</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 font-sora text-h3 font-semibold">
            Server-side flag check
          </h2>
          <div className="rounded-[10px] border border-grays-02 bg-grays-01 p-4">
            {error && <p className="font-sohne text-small text-base-blue">{error}</p>}
            {!error && !flag && (
              <p className="font-sohne text-small text-grays-03">Checking…</p>
            )}
            {flag && (
              <pre className="overflow-x-auto font-sohne-mono text-xsmall-mono text-grays-04">
                {JSON.stringify(flag, null, 2)}
              </pre>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
