import { Clock3, Pencil, X } from "lucide-react";
import { sellerResourceUrl } from "../../../lib/sellerApi";
import { applicationFeedback } from "./applicationUtils";
import type { ApplicationRecord } from "./types";

export function ApplicationStatusModal({ application, onClose, onEdit }: { application: ApplicationRecord; onClose: () => void; onEdit: () => void }) {
  const feedback = applicationFeedback(application);
  const shop = application.shop;
  return (
    <div aria-labelledby="application-progress-title" aria-modal="true" className="fixed inset-0 z-[90] overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm sm:p-8" role="dialog">
      <div className="mx-auto max-w-4xl">
        <div className="relative rounded-3xl border border-line bg-white p-7 sm:p-10">
          <button aria-label="Close application progress" className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-soft text-muted transition hover:bg-line hover:text-ink" onClick={onClose} type="button">
            <X size={17} />
          </button>
          <span className="grid size-14 place-items-center rounded-full bg-primary-light text-primary-dark">
            <Clock3 size={25} />
          </span>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Application progress</p>
          <h1 className="mt-2 pr-10 text-3xl font-black tracking-[-0.04em] text-ink" id="application-progress-title">
            {statusTitle(application.status)}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {application.applicantEmail ? (
              <>
                The SOVA team will send approval or feedback to <strong className="text-ink">{application.applicantEmail}</strong>.
              </>
            ) : (
              "The latest progress returned by the SOVA application service is shown below."
            )}
          </p>
          <div className="mt-7 grid gap-3 rounded-2xl bg-soft p-5 sm:grid-cols-2">
            <StatusDetail label="Application code" value={application.applicationCode} />
            <StatusDetail label="Shop" value={application.shopName} />
            <StatusDetail label="Submitted" value={new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(application.submittedAt))} />
            <StatusDetail label="Status" value={application.status.toUpperCase()} />
          </div>
          <section className="mt-8 border-t border-line pt-7">
            <h2 className="text-lg font-black text-ink">Submitted application details</h2>
            <div className="mt-4 grid gap-4 rounded-2xl bg-soft p-5 sm:grid-cols-2 lg:grid-cols-3">
              <StatusDetail label="Shop name" value={shop.name} />
              <StatusDetail label="Shop email" value={shop.email || "Not provided"} />
              <StatusDetail label="Shop phone" value={shop.phone || "Not provided"} />
              <div className="sm:col-span-2">
                <StatusDetail label="Shop description" value={shop.description || "Not provided"} />
              </div>
              <StatusDetail label="Representative" value={shop.representativeNames || "Not provided"} />
              <StatusDetail label="Representative email" value={shop.representativeEmail || "Not provided"} />
              <StatusDetail label="Representative phone" value={shop.representativePhone || "Not provided"} />
              <StatusDetail label="Shop address" value={shop.addressLabel || "Not provided"} />
              <ApplicationLinkDetail label="Google Maps location" linkText={shop.addressLabel || undefined} rawUrl url={shop.mapsUrl ?? null} />
              <ApplicationLinkDetail label="RDB registration document" linkText="Open RDB document" url={shop.rbdRegistrationDocument} />
              <ApplicationLinkDetail label="Shop logo" linkText="Open shop logo" url={shop.logo} />
            </div>
          </section>
          <FeedbackPanel application={application} />
          <div className="mt-7 flex flex-wrap justify-end gap-3">
            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white px-5 py-3 text-xs font-bold text-ink transition hover:border-ink/40 hover:bg-soft" onClick={onClose} type="button">
              Close
            </button>
            {feedback && application.canRenew && (
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-dark" onClick={onEdit} type="button">
                <Pencil size={15} /> Edit requested details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrackingErrorModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div aria-labelledby="tracking-error-title" aria-modal="true" className="fixed inset-0 z-[90] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" role="dialog">
      <div className="relative w-full max-w-md rounded-3xl border border-line bg-white p-7 shadow-xl">
        <button aria-label="Close tracking response" className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-soft text-muted transition hover:bg-line hover:text-ink" onClick={onClose} type="button">
          <X size={17} />
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted pr-10 text-red-700" id="tracking-error-title">
          Unable to track application
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">{message}</p>
        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-dark mt-6 w-full" onClick={onClose} type="button">
          Try another code
        </button>
      </div>
    </div>
  );
}

function statusTitle(status: ApplicationRecord["status"]) {
  if (status === "active") return "Your shop application was approved";
  if (status === "rejected") return "Your shop application was not approved";
  if (status === "returned") return "Your application needs changes";
  if (status === "under review") return "Your application is under review";
  return "Your shop is awaiting review";
}

function StatusDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{label}</span>
      <strong className="mt-1 block text-sm text-ink">{value}</strong>
    </div>
  );
}

function ApplicationLinkDetail({ label, linkText, rawUrl = false, url }: { label: string; linkText: string | undefined; rawUrl?: boolean; url?: string | null }) {
  const href = url ? (rawUrl ? url : sellerResourceUrl(url)) : undefined;
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{label}</span>
      {href ? (
        <a className="mt-1 inline-block break-all text-sm font-bold text-primary-dark underline underline-offset-2" href={href} rel="noreferrer" target="_blank">
          {linkText}
        </a>
      ) : (
        <strong className="mt-1 block text-sm text-ink">Not provided</strong>
      )}
    </div>
  );
}

function FeedbackPanel({ application }: { application: ApplicationRecord }) {
  const feedback = applicationFeedback(application);
  return (
    <div className={`mt-8 rounded-xl border p-4 text-xs leading-5 ${feedback ? "border-amber-200 bg-amber-50 text-amber-800" : "border-blue-200 bg-blue-50 text-blue-800"}`}>
      <strong className="block">{feedback ? "Message from the SOVA review team" : "Feedback will appear here"}</strong>
      {feedback || "If the review team requests a correction, this page will show their message and renewal instructions."}
    </div>
  );
}
