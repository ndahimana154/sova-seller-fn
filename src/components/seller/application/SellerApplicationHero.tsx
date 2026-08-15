import { LoaderCircle } from "lucide-react";
import type { FormEvent } from "react";
import { ui } from "../../ui/styles";

export function SellerApplicationHero({ onTrack, renewing, tracking }: { onTrack: (event: FormEvent<HTMLFormElement>) => void; renewing: boolean; tracking: boolean }) {
  return (
    <section className="border-b border-line bg-soft/60">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Shop application</p>
            <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-ink sm:text-3xl">Sell on SOVA</h1>
            <p className="mt-3 text-sm leading-6 text-muted">{renewing ? "Correct the requested details and resubmit for review" : "Complete one application to open your shop on the marketplace"}</p>
          </div>
          <form className="flex h-9 w-full items-stretch gap-2 sm:max-w-sm" onSubmit={onTrack}>
            <label className="min-w-0 flex-1">
              <span className="sr-only">Application code</span>
              <span className={`${ui.input} !mt-0 h-9 !min-h-0 rounded-lg bg-white px-3`}><input className="h-full !py-0 text-xs" name="applicationCode" placeholder="Application code" required /></span>
            </label>
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-dark h-9 min-w-20 justify-center rounded-lg px-3 py-0" disabled={tracking} type="submit">
              {tracking ? <><LoaderCircle className="animate-spin" size={15} /> Tracking…</> : "Track"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
