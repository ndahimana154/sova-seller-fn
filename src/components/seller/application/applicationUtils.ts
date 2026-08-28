import type { ApplicationRecord } from "./types";

export function applicationFeedback(application: ApplicationRecord) {
  return [...application.history].reverse().find((item) => item.applicantMessage)?.applicantMessage || undefined;
}

export function loadSellerAccount() {
  try {
    const account = JSON.parse(localStorage.getItem("sova-account-settings") || "{}");
    return { name: account.name || "", email: account.email || "" };
  } catch {
    return { name: "", email: "" };
  }
}

const fieldLabels: Record<string, string> = {
  applicantEmail: "Representative email",
  applicantName: "Representative name",
  addressLabel: "Shop address",
  description: "Shop description",
  informationConfirmed: "Information confirmation",
  phone: "Shop phone",
  rbdRegistrationDocument: "RDB registration document",
  representativePhone: "Representative phone",
  shopEmail: "Shop email",
  shopName: "Shop name",
  termsAccepted: "SOVA terms and conditions agreement",
  tinNumber: "TIN number",
};

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function findInvalidFields(form: HTMLFormElement) {
  const fields = Array.from(form.elements).filter((element): element is FormControl => element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement);
  return fields.filter((field) => !field.disabled && !field.validity.valid);
}

export function fieldValidationMessage(field: FormControl) {
  const label = fieldLabels[field.name] || "This field";
  if (field.validity.valueMissing) return `${label} is required.`;
  if (field.validity.typeMismatch) return `${label} is not valid. Please enter a correctly formatted value.`;
  if (field.validity.patternMismatch) return field.title || `${label} has an invalid format. Please correct it.`;
  if (field.validity.tooShort && "minLength" in field) return `${label} must contain at least ${field.minLength} characters.`;
  if (field.validity.tooLong && "maxLength" in field) return `${label} must contain no more than ${field.maxLength} characters.`;
  if (field.validity.customError) return field.validationMessage;
  return `${label} is invalid. Please correct it before submitting.`;
}
