import { Building2, FileCheck2, LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { renewShopApplication, requestApplicationTracking, submitShopApplication, trackShopApplication, type ShopApplicationPayload } from "../../lib/sellerApi";
import { ApplicationSubmittedModal } from "../../components/seller/application/ApplicationSubmittedModal";
import { TrackingOtpModal } from "../../components/seller/application/TrackingOtpModal";
import { LocationField, type LocationValue } from "../../components/form/LocationField";
import { PhoneField } from "../../components/form/PhoneField";
import { TermsDialog } from "../../components/seller/application/TermsDialog";
import { policyApi } from "../../lib/policyApi";
import { normalizePhone, validatePhone } from "../../lib/phone";
import { normalizeApiError } from "../../api/errors";
import { useToast } from "../../hooks/useToast";
import {
  ApplicationStatusModal,
  FormField,
  FormHeading,
  SellerApplicationHero,
  TrackingErrorModal,
  UploadField,
  ValidationErrorsContext,
  applicationFeedback,
  fieldValidationMessage,
  findInvalidFields,
  loadSellerAccount,
  type ApplicationRecord,
} from "../../components/seller/application";


export function SellerApplicationPage() {
  const account = loadSellerAccount();
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsVersion, setTermsVersion] = useState("");
  const [address, setAddress] = useState<LocationValue>({
    addressLabel: "",
    addressLatitude: null,
    addressLongitude: null,
    addressPlaceId: null,
  });
  const [shopPhone, setShopPhone] = useState("");
  const [repPhone, setRepPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const [formVersion, setFormVersion] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [tracking, setTracking] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [otpGate, setOtpGate] = useState<{ applicationCode: string; email: string } | null>(null);
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [submitted, setSubmitted] = useState<ApplicationRecord | null>(null);
  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [renewalApplication, setRenewalApplication] = useState<ApplicationRecord | null>(null);
  const [renewalToken, setRenewalToken] = useState<string | null>(null);

  useEffect(() => {
    localStorage.removeItem("sova-seller-application");
  }, []);

  useEffect(() => {
    policyApi
      .current()
      .then((policies) => {
        const terms = policies.find((entry) => entry.slug === "terms_and_conditions");
        if (terms) setTermsVersion(terms.version);
      })
      .catch(() => undefined);
  }, []);



  async function sendTrackingCode(applicationCode: string) {
    setTracking(true);
    setTrackingError("");
    try {
      const { email } = await requestApplicationTracking(applicationCode);
      setOtpGate({ applicationCode, email });
      setOtpError("");
      return true;
    } catch (error) {
      setTrackingError(normalizeApiError(error).message);
      return false;
    } finally {
      setTracking(false);
    }
  }

  async function trackApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const applicationCode = String(new FormData(event.currentTarget).get("applicationCode")).trim();
    if (!applicationCode) return;
    await sendTrackingCode(applicationCode);
  }

  async function verifyTrackingCode(otp: string) {
    if (!otpGate) return;
    setVerifying(true);
    setOtpError("");
    try {
      const response = await trackShopApplication(otpGate.applicationCode, otp);
      const record: ApplicationRecord = {
        ...response,
        applicantEmail: account.email || undefined,
        submittedAt: response.history[0]?.createdAt || new Date().toISOString(),
      };
      setOtpGate(null);
      setApplication(record);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setOtpError(normalizeApiError(error).message);
    } finally {
      setVerifying(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalidFields = findInvalidFields(event.currentTarget);
    if (invalidFields.length) {
      setValidationErrors(Object.fromEntries(invalidFields.map((field) => [field.name, fieldValidationMessage(field)])));
      invalidFields[0].focus();
      return;
    }
    const data = new FormData(event.currentTarget);
    const registrationDocument = data.get("rbdRegistrationDocument");
    const logo = data.get("logo");
    if ((!(registrationDocument instanceof File) || !registrationDocument.size) && !renewalApplication?.shop.rbdRegistrationDocument) {
      toast.error("Please attach the RDB registration document.");
      return;
    }
    const phoneErrors: Record<string, string> = {};
    const shopPhoneError = validatePhone(shopPhone);
    if (shopPhoneError) phoneErrors.phone = shopPhoneError;
    const repPhoneError = validatePhone(repPhone);
    if (repPhoneError) phoneErrors.representativePhone = repPhoneError;
    if (Object.keys(phoneErrors).length) {
      setValidationErrors(phoneErrors);
      toast.error("Check the phone numbers before submitting.");
      return;
    }
    if (!address.addressLabel.trim() || !address.addressLatitude || !address.addressLongitude) {
      setValidationErrors({
        addressLabel: "Place the pin on the shop entrance and press Confirm.",
      });
      toast.error("Choose where the shop is located.");
      document.getElementById("shop-location")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const applicantEmail = String(data.get("applicantEmail")).trim();
    const applicantName = String(data.get("applicantName")).trim();
    const payload: ShopApplicationPayload = {
      applicantEmail,
      applicantName,
      name: String(data.get("shopName")).trim(),
      email: String(data.get("shopEmail")).trim(),
      phone: normalizePhone(shopPhone),
      representativePhone: normalizePhone(repPhone),
      description: String(data.get("description")).trim(),
      addressLabel: address.addressLabel.trim(),
      addressPlaceId: address.addressPlaceId,
      addressLatitude: address.addressLatitude,
      addressLongitude: address.addressLongitude,
      tinNumber: String(data.get("tinNumber")).trim(),
      acceptTerms: data.get("termsAccepted") === "on",
      rbdRegistrationDocument: registrationDocument instanceof File && registrationDocument.size ? registrationDocument : undefined,
      logo: logo instanceof File && logo.size ? logo : undefined,
    };
    setSubmitting(true);
    setValidationErrors({});
    try {
      if (renewalApplication && !renewalToken) {
        toast.error("Your verification expired. Track the application again to edit it.");
        setRenewalApplication(null);
        return;
      }
      const response = await (renewalApplication
        ? renewShopApplication(renewalApplication.applicationCode, payload, renewalToken!)
        : submitShopApplication(payload));
      setRenewalToken(null);
      setRenewalApplication(null);
      setApplication(null);
      setAddress({ addressLabel: "", addressLatitude: null, addressLongitude: null, addressPlaceId: null });
      setShopPhone("");
      setRepPhone("");
      setFormVersion((current) => current + 1);
      setSubmitted({
        ...response,
        applicantEmail: account.email || undefined,
        submittedAt: response.history[0]?.createdAt || new Date().toISOString(),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function editReturnedApplication(returnedApplication: ApplicationRecord) {
    const shop = returnedApplication.shop;
    setRenewalToken(returnedApplication.verificationToken ?? null);
    setShopPhone(shop.phone ?? "");
    setRepPhone(shop.representativePhone ?? "");
    setAddress({
      addressLabel: shop.addressLabel ?? "",
      addressLatitude: shop.addressLatitude ?? null,
      addressLongitude: shop.addressLongitude ?? null,
      addressPlaceId: shop.addressPlaceId ?? null,
    });
    setRenewalApplication(returnedApplication);
    setApplication(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const renewalShop = renewalApplication?.shop;
  const returnMessage = renewalApplication ? applicationFeedback(renewalApplication) : undefined;
  const prefilledAccount = formVersion === 0 && !renewalApplication ? account : { email: "", name: "" };

  return (
    <main className="min-h-[75vh]">
      <SellerApplicationHero onTrack={trackApplication} renewing={Boolean(renewalApplication)} tracking={tracking} />

      <section className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <ValidationErrorsContext.Provider value={validationErrors}>
                    <form
            className="w-full rounded-3xl border border-line bg-white p-6 sm:p-8"
            key={`${renewalApplication?.applicationCode || "new-application"}-${formVersion}`}
            noValidate
            onInput={(event) => {
              const fieldName = (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).name;
              if (fieldName) {
                setValidationErrors((current) => {
                  if (!current[fieldName]) return current;
                  const next = { ...current };
                  delete next[fieldName];
                  return next;
                });
              }
            }}
            onSubmit={submit}
          >
            {returnMessage && (
              <div className="mb-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                <strong className="block">Changes requested by SOVA</strong>
                <p className="mt-2 leading-6">{returnMessage}</p>
              </div>
            )}
            <div>
              <FormHeading icon={<Building2 size={20} />} title="Tell us about your shop" copy="Start your application directly. If you are signed in, your saved contact details are filled in for you." />
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField label="Shop name">
                  <input defaultValue={renewalShop?.name} maxLength={120} minLength={2} name="shopName" placeholder="Example: Kigali Home Studio" required />
                </FormField>
                <FormField label="Shop email">
                  <input defaultValue={renewalShop?.email || ""} name="shopEmail" placeholder="shop@example.com" required type="email" />
                </FormField>
                <FormField label="Shop phone">
                  <PhoneField name="phone" onChange={setShopPhone} required value={shopPhone} />
                </FormField>
                <FormField className="sm:col-span-2 lg:col-span-3" label="Shop description">
                  <textarea className="min-h-28 resize-y" defaultValue={renewalShop?.description || ""} maxLength={2000} minLength={20} name="description" placeholder="Describe what you sell, where products come from, and what makes your shop trustworthy." required />
                </FormField>
                <div className="mt-2 border-t border-line pt-5 sm:col-span-2 lg:col-span-3">
                  <h3 className="text-sm font-black text-ink">Representative details</h3>
                  <p className="mt-1 text-xs text-muted">The person SOVA should contact about this application.</p>
                </div>
                <FormField label="Representative name">
                  <input defaultValue={renewalShop?.representativeNames || prefilledAccount.name} maxLength={120} minLength={2} name="applicantName" placeholder="Full name" readOnly={Boolean(prefilledAccount.name)} required />
                </FormField>
                <FormField label="Representative email">
                  <input defaultValue={renewalShop?.representativeEmail || prefilledAccount.email} name="applicantEmail" placeholder="you@example.com" readOnly={Boolean(prefilledAccount.email)} required type="email" />
                </FormField>
                <FormField label="Representative phone">
                  <PhoneField name="representativePhone" onChange={setRepPhone} required value={repPhone} />
                </FormField>
              </div>
            </div>

            <div className="mt-10 border-t border-line pt-8">
              <FormHeading icon={<MapPin size={20} />} title="Where is the shop located?" copy="Drop a pin on the shop entrance so buyers and couriers get exact directions." />
              <div className="mt-6" id="shop-location">
                <span className="text-xs font-bold text-ink">
                  Shop location<span aria-hidden="true" className="ml-1 text-red-600">*</span>
                </span>
                <div className="mt-1.5">
                  <LocationField
                    confirmLabel="Confirm shop location"
                    searchPlaceholder="Search your shop, building or road"
                    error={validationErrors.addressLabel}
                    hint="Search for the shop, or tap the map to place the pin exactly at the entrance couriers should use."
                    onChange={setAddress}
                    value={address}
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-line pt-8">
              <FormHeading icon={<FileCheck2 size={20} />} title="Business verification" copy="Provide the registration information SOVA needs to review your application." />
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField className="sm:col-span-2 lg:col-span-3" label="TIN number">
                  <input defaultValue={renewalShop?.tinNumber || ""} inputMode="numeric" maxLength={9} name="tinNumber" pattern="[0-9]{9}" placeholder="Enter 9-digit TIN" required title="TIN number must contain exactly 9 digits and numbers only." />
                </FormField>
                <UploadField accept=".pdf,image/png,image/jpeg" existingUrl={renewalShop?.rbdRegistrationDocument} label="RDB registration document" name="rbdRegistrationDocument" />
                <UploadField accept="image/png,image/jpeg,image/webp" existingUrl={renewalShop?.logo} label="Shop logo (optional)" name="logo" required={false} />
              </div>
              <div className="mt-5 space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-soft p-4 text-xs leading-5 text-muted">
                  <input className="size-4 rounded border-line accent-ink mt-0.5" name="informationConfirmed" required type="checkbox" />
                  <span>
                    I confirm that this information is accurate and authorize SOVA to review the business details before approving the shop.
                    <span className="ml-1 text-red-600" aria-hidden="true">
                      *
                    </span>
                  </span>
                </label>
                {validationErrors.informationConfirmed && (
                  <p className="text-xs font-semibold text-red-600" role="alert">
                    {validationErrors.informationConfirmed}
                  </p>
                )}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-soft p-4 text-xs leading-5 text-muted">
                  <input className="size-4 rounded border-line accent-ink mt-0.5" name="termsAccepted" required type="checkbox" />
                  <span>
                    I have read and agree to the{" "}
                    <button
                      className="font-bold text-ink underline underline-offset-2 transition hover:text-primary-dark"
                      onClick={() => setTermsOpen(true)}
                      type="button"
                    >
                      SOVA terms and conditions
                    </button>
                    {termsVersion && <span className="text-muted"> (v{termsVersion})</span>}.
                    <span className="ml-1 text-red-600" aria-hidden="true">
                      *
                    </span>
                  </span>
                </label>
                {validationErrors.termsAccepted && (
                  <p className="text-xs font-semibold text-red-600" role="alert">
                    {validationErrors.termsAccepted}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-line pt-5">
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-dark min-w-40 justify-center" disabled={submitting} type="submit">
                {submitting ? (
                  <>
                    <LoaderCircle className="animate-spin" size={15} /> Submitting…
                  </>
                ) : renewalApplication ? (
                  "Resubmit application"
                ) : (
                  "Submit application"
                )}
              </button>
            </div>
                      </form>
        </ValidationErrorsContext.Provider>
      </section>
      {submitted && <ApplicationSubmittedModal application={submitted} onClose={() => setSubmitted(null)} />}
      {otpGate && (
        <TrackingOtpModal
          applicationCode={otpGate.applicationCode}
          busy={verifying}
          email={otpGate.email}
          error={otpError}
          onClose={() => { setOtpGate(null); setOtpError(""); }}
          onResend={() => void sendTrackingCode(otpGate.applicationCode)}
          onVerify={(otp) => void verifyTrackingCode(otp)}
          resending={tracking}
        />
      )}
      {application && <ApplicationStatusModal application={application} onClose={() => setApplication(null)} onEdit={() => void editReturnedApplication(application)} />}
      {trackingError && <TrackingErrorModal message={trackingError} onClose={() => setTrackingError("")} />}
      {termsOpen && <TermsDialog onClose={() => setTermsOpen(false)} />}
    </main>
  );
}
