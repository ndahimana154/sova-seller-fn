import { Clock3, Download, Eye, FileText, MapPin, Pencil, X } from "lucide-react";
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
            <StatusDetail label="Application code" mono value={application.applicationCode} />
            <StatusDetail label="Shop" value={application.shopName} />
            <StatusDetail label="Submitted" value={new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(application.submittedAt))} />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Status</span>
              <span className="mt-1.5 block"><StatusPill status={application.status} /></span>
            </div>
          </div>

          <Section title="Shop">
            <StatusDetail label="Shop name" value={shop.name} />
            <StatusDetail label="Shop email" value={shop.email || "Not provided"} />
            <StatusDetail label="Shop phone" value={shop.phone || "Not provided"} />
            <div className="sm:col-span-2 lg:col-span-3">
              <StatusDetail label="Description" value={shop.description || "Not provided"} />
            </div>
          </Section>

          <Section title="Representative">
            <StatusDetail label="Full names" value={shop.representativeNames || "Not provided"} />
            <StatusDetail label="Email" value={shop.representativeEmail || "Not provided"} />
            <StatusDetail label="Phone" value={shop.representativePhone || "Not provided"} />
          </Section>

          <Section title="Location">
            <div className="sm:col-span-2">
              <StatusDetail label="Address" value={shop.addressLabel || "Not provided"} />
            </div>
            {shop.mapsUrl ? (
              <div className="flex items-end">
                <a
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3.5 py-2 text-[11px] font-bold text-ink transition hover:border-ink/40 hover:bg-soft"
                  href={shop.mapsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MapPin size={13} /> Open in Google Maps
                </a>
              </div>
            ) : (
              <StatusDetail label="Map pin" value="Not provided" />
            )}
          </Section>

          <Section title="Documents">
            <div className="sm:col-span-2 lg:col-span-3">
              <DocumentLinks shop={shop} />
            </div>
          </Section>

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

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="mt-6">
      <h2 className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">{title}</h2>
      <div className="mt-2 grid gap-4 rounded-2xl bg-soft p-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

const STATUS_TONES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  resubmitted: "bg-blue-100 text-blue-800",
  returned: "bg-amber-100 text-amber-800",
  submitted: "bg-blue-100 text-blue-800",
  suspended: "bg-red-100 text-red-800",
  "under review": "bg-amber-100 text-amber-800",
};

function StatusPill({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black ${STATUS_TONES[status] ?? "bg-soft text-muted"}`}>
      {label}
    </span>
  );
}

function DocumentLinks({ shop }: { shop: ApplicationRecord["shop"] }) {
  const documents = [
    { label: "RDB registration document", url: shop.rbdRegistrationDocument },
    { label: "Shop logo", url: shop.logo },
  ].filter((item): item is { label: string; url: string } => Boolean(item.url));

  if (!documents.length) {
    return <p className="text-[11px] text-muted">No documents were attached to this application.</p>;
  }

  return (
    <ul className="space-y-2">
      {documents.map((item) => {
        const name = item.url.split("?")[0].split("/").pop() || item.label;
        return (
          <li className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-3" key={item.label}>
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-soft text-muted">
              <FileText size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-ink">{item.label}</p>
              <p className="truncate font-mono text-[10px] text-muted">{name}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <a
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-[11px] font-bold text-ink transition hover:border-ink/40 hover:bg-soft"
                href={sellerResourceUrl(item.url)}
                rel="noreferrer"
                target="_blank"
              >
                <Eye size={12} /> View
              </a>
              <a
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-[11px] font-bold text-ink transition hover:border-ink/40 hover:bg-soft"
                download={name}
                href={sellerResourceUrl(item.url)}
              >
                <Download size={12} /> Download
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function StatusDetail({ label, mono = false, value }: { label: string; mono?: boolean; value: string }) {
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{label}</span>
      <strong className={`mt-1 block break-words text-sm text-ink ${mono ? "font-mono" : ""}`}>{value}</strong>
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
