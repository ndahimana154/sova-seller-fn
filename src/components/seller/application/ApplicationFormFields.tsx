import { CheckCircle2, Upload, X } from "lucide-react";
import { cloneElement, isValidElement, useContext, useState, type ReactElement } from "react";
import { sellerResourceUrl } from "../../../lib/sellerApi";
import { Select } from "../../ui/Select";
import { ValidationErrorsContext } from "./validationContext";
import { ui } from "../../ui/styles";

export function FormHeading({ copy, icon, title }: { copy: string; icon: React.ReactNode; title: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-light text-primary-dark">{icon}</span>
      <div>
        <h2 className="text-xl font-black text-ink">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-muted">{copy}</p>
      </div>
    </div>
  );
}

export function FormField({ children, className = "", label }: { children: React.ReactNode; className?: string; label: string }) {
  const errors = useContext(ValidationErrorsContext);
  const field = isValidElement<{ name?: string; required?: boolean }>(children) ? children : undefined;
  const error = field?.props.name ? errors[field.props.name] : undefined;
  // Select is a button plus a portalled popup, not labelable: use aria-labelledby.
  const custom = field?.type === Select;
  const labelId = `${field?.props.name ?? label}-label`;
  const Wrapper = custom ? "div" : "label";
  return (
    <Wrapper className={`block ${className}`}>
      <span className="text-xs font-bold text-ink" id={custom ? labelId : undefined}>
        {label}
        {field?.props.required && (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </span>
      <span className={`${ui.input} ${error ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100" : ""}`}>
        {custom && field ? cloneElement(field as ReactElement<{ "aria-labelledby"?: string }>, { "aria-labelledby": labelId }) : children}
      </span>
      {error && (
        <span className="mt-1.5 block text-xs font-semibold text-red-600" role="alert">
          {error}
        </span>
      )}
    </Wrapper>
  );
}

export function UploadField({ accept, existingUrl, label, name, required = true }: { accept: string; existingUrl?: string | null; label: string; name: string; required?: boolean }) {
  const errors = useContext(ValidationErrorsContext);
  const validationError = errors[name];
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileError, setFileError] = useState("");
  const [existingFileVisible, setExistingFileVisible] = useState(Boolean(existingUrl));
  const replacementRequired = existingUrl ? !existingFileVisible : required;
  const uploadInputId = `${name}-upload`;
  const existingFileName = existingUrl ? fileNameFromUrl(existingUrl) : "";

  return (
    <div className="block">
      <span className="text-xs font-bold text-ink">
        {label}
        {replacementRequired && (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </span>
      <div className={`relative mt-2 flex min-h-24 flex-col items-center justify-center rounded-xl border border-dashed bg-soft px-3 text-center text-xs transition ${fileError || validationError ? "border-red-300 text-red-700" : fileName ? "border-green-300 text-green-700" : "border-ink/20 text-muted hover:border-primary"}`}>
        {existingUrl && existingFileVisible ? (
          <>
            <button aria-label={`Remove previously submitted ${label}`} className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100" onClick={() => setExistingFileVisible(false)} title="Remove old file and choose a replacement" type="button">
              <X size={14} />
            </button>
            <CheckCircle2 className="mb-2 text-green-700" size={19} />
            <a className="max-w-[85%] truncate font-bold text-primary-dark underline underline-offset-2" href={sellerResourceUrl(existingUrl)} rel="noreferrer" target="_blank" title={existingFileName}>
              {existingFileName}
            </a>
            <label className="mt-2 cursor-pointer text-[10px] font-bold text-muted underline underline-offset-2" htmlFor={uploadInputId}>
              Choose a replacement
            </label>
          </>
        ) : (
          <label className="flex size-full min-h-24 cursor-pointer flex-col items-center justify-center" htmlFor={uploadInputId}>
            {fileName ? <CheckCircle2 className="mb-2" size={19} /> : <Upload className="mb-2 text-primary-dark" size={18} />}
            <strong className="max-w-full truncate">{fileName || "Choose a file"}</strong>
            <span className="mt-1 text-[10px] opacity-70">{fileError || fileSize || (replacementRequired ? "Required • maximum 5 MB" : "Optional • maximum 5 MB")}</span>
          </label>
        )}
        <input accept={accept} className="sr-only" id={uploadInputId} name={name} onChange={(event) => updateFile(event.currentTarget, { existingUrl, setExistingFileVisible, setFileError, setFileName, setFileSize })} required={replacementRequired} type="file" />
      </div>
      {validationError && (
        <span className="mt-1.5 block text-xs font-semibold text-red-600" role="alert">
          {validationError}
        </span>
      )}
    </div>
  );
}

function updateFile(input: HTMLInputElement, setters: { existingUrl?: string | null; setExistingFileVisible: (value: boolean) => void; setFileError: (value: string) => void; setFileName: (value: string) => void; setFileSize: (value: string) => void }) {
  const file = input.files?.[0];
  if (!file) {
    setters.setFileName("");
    setters.setFileSize("");
    setters.setFileError("");
    setters.setExistingFileVisible(Boolean(setters.existingUrl));
    input.setCustomValidity("");
    return;
  }
  setters.setFileName(file.name);
  if (file.size > 5_000_000) {
    setters.setFileSize("");
    setters.setFileError("File is larger than 5 MB");
    input.setCustomValidity("Choose a file smaller than 5 MB.");
    return;
  }
  setters.setFileSize(`${(file.size / 1_000_000).toFixed(2)} MB • ready to upload`);
  setters.setFileError("");
  setters.setExistingFileVisible(false);
  input.setCustomValidity("");
}

function fileNameFromUrl(url: string) {
  try {
    const path = new URL(url, window.location.origin).pathname;
    return decodeURIComponent(path.split("/").filter(Boolean).pop() || "Previously submitted file");
  } catch {
    return url.split("/").filter(Boolean).pop()?.split("?")[0] || "Previously submitted file";
  }
}
