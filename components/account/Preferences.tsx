import { useState } from "react";

import { useShopper } from "@/components/ui/ShopperProvider";
import { PREFERENCES, type Preference } from "@/lib/account";

// Figma "Preferences Container" (78:1671).
//
// Two judgment calls here, both because Jen's layers are empty.
//
// Her toggle track and knob are correctly sized and positioned — the third
// row's knob sits left, the other two sit right — but neither layer has a
// fill, so all three render invisible. Lime for on, Gray 02 for off, matching
// the badge and the progress bar.
//
// She also puts a 23px bordered square at the left of every row, which gives
// each setting two controls. It reads as an icon frame she never filled
// rather than a second checkbox, so it is dropped here.
function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grays-ld-black focus-visible:ring-offset-2 ${
        on ? "bg-base-lime" : "bg-grays-02"
      }`}
    >
      <span
        className={`absolute top-0.5 size-7 rounded-full transition-all ${
          on ? "left-[22px] bg-grays-ld-black" : "left-0.5 bg-grays-white"
        }`}
      />
    </button>
  );
}

function PreferenceRow({ preference }: { preference: Preference }) {
  const { role, setRole } = useShopper();
  const [local, setLocal] = useState(preference.defaultOn);

  // "Feature Flag Beta Access" is the beta role wearing retail clothing, so
  // it reads and writes the shopper rather than keeping its own state. Flip
  // it and the Access row in the switcher moves with it.
  const on = preference.drivesBetaRole ? role === "beta" : local;
  const setOn = (next: boolean) => {
    if (preference.drivesBetaRole) {
      setRole(next ? "beta" : "shopper");
      return;
    }
    setLocal(next);
  };

  return (
    <div className="flex items-start gap-4 border-b border-grays-hairline py-5 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <p className="font-sohne text-main font-medium text-grays-ld-black">
          {preference.title}
        </p>
        <p className="font-sohne text-small text-grays-04">
          {preference.description}
        </p>
      </div>
      <Toggle on={on} onChange={setOn} label={preference.title} />
    </div>
  );
}

export default function Preferences() {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-sohne text-h6 font-medium text-grays-ld-black">
        Account Preferences
      </h2>
      <div className="flex flex-col rounded-[12px] bg-grays-white px-6 py-5">
        {PREFERENCES.map((preference) => (
          <PreferenceRow key={preference.id} preference={preference} />
        ))}
      </div>
    </section>
  );
}
