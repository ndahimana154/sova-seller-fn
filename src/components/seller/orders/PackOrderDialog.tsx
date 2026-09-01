import { Camera, PackageCheck, Truck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button, Modal, ModalFooter } from '../../ui'

interface PackOrderDialogProps {
  busy: boolean
  onClose: () => void
  onConfirm: (input: { note?: string; proof: File }) => void
  orderNumber: string
}

export function PackOrderDialog({ busy, onClose, onConfirm, orderNumber }: PackOrderDialogProps) {
  const [proof, setProof] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  function pick(file: File | null) {
    if (preview) URL.revokeObjectURL(preview)
    setProof(file)
    setError('')
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  function confirm() {
    if (!proof) {
      setError('Add a photo of the packed parcel to continue.')
      return
    }
    onConfirm({ note: note.trim() || undefined, proof })
  }

  return (
    <Modal onClose={onClose} size="lg" subtitle={orderNumber} title="Mark as packed">
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-xl bg-primary-light px-3.5 py-3">
          <Truck className="mt-px shrink-0 text-primary-dark" size={15} />
          <p className="text-[11px] leading-5 text-primary-dark">
            Once you confirm, this order moves to <strong>Awaiting pickup</strong> and becomes
            visible to couriers, who can take it straight away.
          </p>
        </div>

        <div>
          <span className="form-label">
            Photo of the packed parcel<span className="ml-0.5 text-red-600">*</span>
          </span>

          {preview ? (
            <div className="relative mt-1 overflow-hidden rounded-xl border border-line bg-soft">
              <img alt="Packed parcel" className="max-h-64 w-full object-contain" src={preview} />
              <button
                aria-label="Remove photo"
                className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-ink/70 text-white transition hover:bg-ink"
                onClick={() => pick(null)}
                type="button"
              >
                <X size={13} />
              </button>
              <p className="truncate border-t border-line bg-white px-3 py-2 text-[11px] text-muted">
                {proof?.name}
              </p>
            </div>
          ) : (
            <label
              className={`mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
                error ? 'border-red-300 bg-red-50/40' : 'border-line bg-soft/40 hover:border-ink/35 hover:bg-soft'
              }`}
            >
              <span className="grid size-10 place-items-center rounded-full bg-white text-muted shadow-sm">
                <Camera size={17} />
              </span>
              <span className="text-xs font-bold text-ink">Take or choose a photo</span>
              <span className="max-w-xs text-[11px] leading-5 text-muted">
                Show the sealed parcel. The courier and buyer both see this, and it protects you
                if the goods are disputed.
              </span>
              <input
                accept="image/*"
                className="hidden"
                onChange={(event) => pick(event.target.files?.[0] ?? null)}
                type="file"
              />
            </label>
          )}
          {error && <p className="mt-1.5 text-[11px] font-bold text-red-600">{error}</p>}
        </div>

        <label className="block">
          <span className="form-label">Note for the courier</span>
          <span className="form-input">
            <textarea
              maxLength={300}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Fragile — 2 boxes. Ask for Eric at the front desk."
              rows={3}
              value={note}
            />
          </span>
          <span className="mt-1 flex items-center justify-between text-[10px] text-faint">
            <span>Optional — shown to whoever collects this order.</span>
            <span>{note.length}/300</span>
          </span>
        </label>
      </div>

      <ModalFooter>
        <Button onClick={onClose} type="button" variant="ghost">Cancel</Button>
        <Button disabled={busy} onClick={confirm}>
          <PackageCheck size={14} /> {busy ? 'Saving…' : 'Confirm packed'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
