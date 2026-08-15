import { Building2, FileCheck2, LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { getCells, getDistricts, getLocationTree, getProvinces, getSectors, getVillages, renewShopApplication, submitShopApplication, trackShopApplication, type LocationOption, type ShopApplicationPayload } from "../../lib/sellerApi";
import { normalizeApiError } from "../../api/errors";
import { useToast } from "../../hooks/useToast";
import { Select } from "../../components/ui/Select";
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
  findLocationPath,
  loadSellerAccount,
  toLocationOption,
  type ApplicationRecord,
} from "../../components/seller/application";

const locationOptions = (items: LocationOption[]) => items.map((item) => ({ label: item.name, value: item.id }));

export function SellerApplicationPage() {
  const account = loadSellerAccount();
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [sectors, setSectors] = useState<LocationOption[]>([]);
  const [cells, setCells] = useState<LocationOption[]>([]);
  const [villages, setVillages] = useState<LocationOption[]>([]);
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [cellId, setCellId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [locationHydrated, setLocationHydrated] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const [formVersion, setFormVersion] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [tracking, setTracking] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [renewalApplication, setRenewalApplication] = useState<ApplicationRecord | null>(null);

  useEffect(() => {
    localStorage.removeItem("sova-seller-application");
  }, []);

  useEffect(() => {
    setLocationLoading(true);
    getProvinces()
      .then((items) => {
        setProvinces(items);
        setLocationError("");
      })
      .catch((error) => setLocationError(normalizeApiError(error).message))
      .finally(() => setLocationLoading(false));
  }, []);

  useEffect(() => {
    if (locationHydrated) return;
    if (!provinceId) {
      setDistricts([]);
      return;
    }
    setLocationLoading(true);
    getDistricts(provinceId)
      .then((items) => {
        setDistricts(items);
        setLocationError("");
      })
      .catch((error) => setLocationError(normalizeApiError(error).message))
      .finally(() => setLocationLoading(false));
    setDistrictId("");
    setSectorId("");
    setCellId("");
    setSectors([]);
    setCells([]);
    setVillages([]);
  }, [locationHydrated, provinceId]);

  useEffect(() => {
    if (locationHydrated) return;
    if (!districtId) {
      setSectors([]);
      return;
    }
    setLocationLoading(true);
    getSectors(districtId)
      .then((items) => {
        setSectors(items);
        setLocationError("");
      })
      .catch((error) => setLocationError(normalizeApiError(error).message))
      .finally(() => setLocationLoading(false));
    setSectorId("");
    setCellId("");
    setCells([]);
    setVillages([]);
  }, [districtId, locationHydrated]);

  useEffect(() => {
    if (locationHydrated) return;
    if (!sectorId) {
      setCells([]);
      return;
    }
    setLocationLoading(true);
    getCells(sectorId)
      .then((items) => {
        setCells(items);
        setLocationError("");
      })
      .catch((error) => setLocationError(normalizeApiError(error).message))
      .finally(() => setLocationLoading(false));
    setCellId("");
    setVillages([]);
  }, [locationHydrated, sectorId]);

  useEffect(() => {
    if (locationHydrated) return;
    if (!cellId) {
      setVillages([]);
      return;
    }
    setLocationLoading(true);
    getVillages(cellId)
      .then((items) => {
        setVillages(items);
        setLocationError("");
      })
      .catch((error) => setLocationError(normalizeApiError(error).message))
      .finally(() => setLocationLoading(false));
  }, [cellId, locationHydrated]);

  async function trackApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const applicationCode = String(new FormData(event.currentTarget).get("applicationCode")).trim();
    if (!applicationCode) return;

    setTracking(true);
    setTrackingError("");
    try {
      const response = await trackShopApplication(applicationCode);
      const record: ApplicationRecord = {
        ...response,
        applicantEmail: account.email || undefined,
        submittedAt: response.history[0]?.createdAt || new Date().toISOString(),
      };
      setApplication(record);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setTrackingError(normalizeApiError(error).message);
    } finally {
      setTracking(false);
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
    const applicantEmail = String(data.get("applicantEmail")).trim();
    const applicantName = String(data.get("applicantName")).trim();
    const payload: ShopApplicationPayload = {
      applicantEmail,
      applicantName,
      name: String(data.get("shopName")).trim(),
      email: String(data.get("shopEmail")).trim(),
      phone: String(data.get("phone")).trim(),
      representativePhone: String(data.get("representativePhone")).trim(),
      description: String(data.get("description")).trim(),
      villageId: String(data.get("villageId")),
      street: String(data.get("street")).trim(),
      googleMapsLocationLink: String(data.get("googleMapsLocationLink")).trim() || undefined,
      tinNumber: String(data.get("tinNumber")).trim(),
      rbdRegistrationDocument: registrationDocument instanceof File && registrationDocument.size ? registrationDocument : undefined,
      logo: logo instanceof File && logo.size ? logo : undefined,
    };
    setSubmitting(true);
    setValidationErrors({});
    try {
      await (renewalApplication ? renewShopApplication(renewalApplication.applicationCode, payload) : submitShopApplication(payload));
      setRenewalApplication(null);
      setApplication(null);
      setProvinceId("");
      setDistrictId("");
      setSectorId("");
      setCellId("");
      setVillageId("");
      setDistricts([]);
      setSectors([]);
      setCells([]);
      setVillages([]);
      setLocationHydrated(false);
      setFormVersion((current) => current + 1);
      toast.success("Your request has been sent successfully.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function editReturnedApplication(returnedApplication: ApplicationRecord) {
    const savedVillage = returnedApplication.shop.village;
    const savedSector = savedVillage?.sector;
    const savedDistrict = savedSector?.district;
    const savedProvince = savedDistrict?.province;
    const savedCell = savedVillage?.cell;
    if (savedProvince && savedDistrict && savedSector && savedCell && savedVillage) {
      setProvinces([toLocationOption(savedProvince)]);
      setDistricts([toLocationOption(savedDistrict)]);
      setSectors([toLocationOption(savedSector)]);
      setCells([toLocationOption(savedCell)]);
      setVillages([toLocationOption(savedVillage)]);
      setProvinceId(savedProvince.id);
      setDistrictId(savedDistrict.id);
      setSectorId(savedSector.id);
      setCellId(savedCell.id);
      setVillageId(savedVillage.id);
      setLocationHydrated(true);
    }
    setRenewalApplication(returnedApplication);
    setApplication(null);
    setLocationLoading(true);
    setLocationError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const tree = await getLocationTree();
      const savedVillageId = returnedApplication.shop.village?.id;
      const path = savedVillageId ? findLocationPath(tree, savedVillageId) : undefined;
      if (path) {
        setProvinces(tree.map(toLocationOption));
        setDistricts(path.province.districts.map(toLocationOption));
        setSectors(path.district.sectors.map(toLocationOption));
        setCells(path.sector.cells.map(toLocationOption));
        setVillages(path.cell.villages);
        setProvinceId(path.province.id);
        setDistrictId(path.district.id);
        setSectorId(path.sector.id);
        setCellId(path.cell.id);
        setVillageId(path.village.id);
        setLocationHydrated(true);
      } else {
        setLocationHydrated(false);
        setLocationError("The saved village could not be found in the current SOVA location tree. Please select the shop location again.");
      }
    } catch (error) {
      setLocationHydrated(false);
      setLocationError(normalizeApiError(error).message);
    } finally {
      setLocationLoading(false);
    }
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
                  <input defaultValue={renewalShop?.phone || ""} inputMode="numeric" maxLength={10} name="phone" pattern="07(8|9|3|2)[0-9]{7}" placeholder="0781234567" required title="Use 10 digits starting with 078, 079, 073, or 072." type="tel" />
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
                  <input defaultValue={renewalShop?.representativePhone || ""} inputMode="numeric" maxLength={10} name="representativePhone" pattern="07(8|9|3|2)[0-9]{7}" placeholder="0781234567" required title="Use 10 digits starting with 078, 079, 073, or 072." type="tel" />
                </FormField>
              </div>
            </div>

            <div className="mt-10 border-t border-line pt-8">
              <FormHeading icon={<MapPin size={20} />} title="Where is the shop located?" copy="Province, district, sector, cell, and village options come directly from the SOVA public location API." />
              {locationError && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{locationError}</p>}
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField label="Province">
                  <Select
                    name="provinceId"
                    onChange={(value) => {
                      setLocationHydrated(false);
                      setProvinceId(value);
                      setDistrictId("");
                      setSectorId("");
                      setCellId("");
                      setVillageId("");
                    }}
                    options={locationOptions(provinces)}
                    placeholder="Select province"
                    required
                    value={provinceId}
                    variant="bare"
                  />
                </FormField>
                <FormField label="District">
                  <Select
                    disabled={!provinceId}
                    name="districtId"
                    onChange={(value) => {
                      setLocationHydrated(false);
                      setDistrictId(value);
                      setSectorId("");
                      setCellId("");
                      setVillageId("");
                    }}
                    options={locationOptions(districts)}
                    placeholder="Select district"
                    required
                    value={districtId}
                    variant="bare"
                  />
                </FormField>
                <FormField label="Sector">
                  <Select
                    disabled={!districtId}
                    name="sectorId"
                    onChange={(value) => {
                      setLocationHydrated(false);
                      setSectorId(value);
                      setCellId("");
                      setVillageId("");
                    }}
                    options={locationOptions(sectors)}
                    placeholder="Select sector"
                    required
                    value={sectorId}
                    variant="bare"
                  />
                </FormField>
                <FormField label="Cell">
                  <Select
                    disabled={!sectorId}
                    name="cellId"
                    onChange={(value) => {
                      setLocationHydrated(false);
                      setCellId(value);
                      setVillageId("");
                    }}
                    options={locationOptions(cells)}
                    placeholder="Select cell"
                    required
                    value={cellId}
                    variant="bare"
                  />
                </FormField>
                <FormField label="Village">
                  <Select
                    disabled={!cellId}
                    name="villageId"
                    onChange={setVillageId}
                    options={locationOptions(villages)}
                    placeholder="Select village"
                    required
                    value={villageId}
                    variant="bare"
                  />
                </FormField>
                <FormField label="Street or building">
                  <input defaultValue={renewalShop?.street || ""} name="street" placeholder="Street, building, or landmark" required />
                </FormField>
                <FormField className="sm:col-span-2 lg:col-span-3" label="Google Maps link (optional)">
                  <input defaultValue={renewalShop?.googleMapsLocationLink || ""} name="googleMapsLocationLink" placeholder="https://maps.google.com/..." type="url" />
                </FormField>
              </div>
              {locationLoading && (
                <p className="mt-4 flex items-center gap-2 text-xs text-muted">
                  <LoaderCircle className="animate-spin" size={14} /> Loading location information…
                </p>
              )}
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
                    <a className="font-bold text-ink underline underline-offset-2 transition hover:text-primary-dark" href="#terms">
                      SOVA terms and conditions
                    </a>
                    .
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
      {application && <ApplicationStatusModal application={application} onClose={() => setApplication(null)} onEdit={() => void editReturnedApplication(application)} />}
      {trackingError && <TrackingErrorModal message={trackingError} onClose={() => setTrackingError("")} />}
    </main>
  );
}
