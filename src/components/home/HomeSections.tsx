import {
  BadgeCheck,
  Boxes,
  ClipboardCheck,
  FileText,
  Images,
  MapPin,
  Phone,
  Send,
  Store,
  UserCheck,
} from 'lucide-react'
import { Card, SectionHeading } from '../ui'
import { ui } from '../ui/styles'

const benefits = [
  {
    icon: Store,
    title: 'A shop buyers can find',
    body: 'Your approved shop gets a SOVA storefront page with your name, logo, and location.',
  },
  {
    icon: Boxes,
    title: 'Catalogue and stock in one place',
    body: 'Create products, set prices and discounts, and record every stock movement from the dashboard.',
  },
  {
    icon: Images,
    title: 'Photos and video on every product',
    body: 'Upload images and MP4 clips so buyers see what they are getting before they order.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified sellers only',
    body: 'Every shop is reviewed against its RDB registration and TIN, so buyers trust who they buy from.',
  },
]

const steps = [
  { icon: Send, title: 'Apply', body: 'Fill in the shop application with your business, contact, and location details.' },
  { icon: ClipboardCheck, title: 'We review', body: 'Our team checks your documents. Track progress any time with your application code.' },
  { icon: UserCheck, title: 'Get access', body: 'On approval we email your seller access. Already have a SOVA account? It simply gains seller access.' },
  { icon: Boxes, title: 'Start selling', body: 'Sign in here, publish products, and keep your stock up to date.' },
]

const requirements = [
  { icon: FileText, label: 'RDB registration document', detail: 'A PDF or image of your registration certificate.' },
  { icon: BadgeCheck, label: 'TIN number', detail: 'The tax identification number of the business.' },
  { icon: MapPin, label: 'Shop location', detail: 'One Google Maps address, so buyers and couriers find you exactly.' },
  { icon: Phone, label: 'Representative details', detail: 'Name, email, and phone of the person who will run the shop.' },
]

const faqs = [
  {
    question: 'I already buy on SOVA. Do I need another account?',
    answer:
      'No. Apply with the same email and, once approved, that account gains seller access. If it has a password already, keep using it; if not, we email a temporary one to change at first sign-in.',
  },
  {
    question: 'How do I know where my application stands?',
    answer:
      'We email you at every decision, and the application code we send lets you track the status — and resubmit if it comes back for changes.',
  },
  {
    question: 'Can I sign in without typing a password?',
    answer:
      'Yes. Sellers can request a six-digit sign-in code by email. You can switch that fallback off in account settings if you prefer password-only access.',
  },
  {
    question: 'What happens if my application is returned?',
    answer:
      'Returned applications explain what to fix. Open the tracking screen with your code, update the details, and resubmit.',
  },
]

export function HomeBenefits() {
  return (
    <section className={ui.publicSection} id="why">
      <SectionHeading
        eyebrow="Why sell on SOVA"
        title="Built for shops that want to be found"
        lead="The seller portal is where your shop lives: your profile, your catalogue, your stock."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((item) => (
          <Card hover key={item.title}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-soft text-ink"><item.icon size={18} /></span>
            <h3 className="mt-4 text-sm font-black tracking-[-0.02em] text-ink">{item.title}</h3>
            <p className="mt-2 text-xs leading-5 text-muted">{item.body}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}

export function HomeSteps() {
  return (
    <section className="bg-soft/60" id="how">
      <div className={ui.publicSection}>
        <SectionHeading
          eyebrow="How it works"
          title="From application to first product"
          lead="Four steps, and you can follow every one of them by email or with your application code."
        />
        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li className="relative rounded-2xl border border-line bg-white p-5" key={step.title}>
              <span className="absolute right-4 top-4 text-2xl font-black text-ink/10">{index + 1}</span>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-white"><step.icon size={17} /></span>
              <h3 className="mt-4 text-sm font-black tracking-[-0.02em] text-ink">{step.title}</h3>
              <p className="mt-2 text-xs leading-5 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function HomeRequirements() {
  return (
    <section className={ui.publicSection} id="requirements">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SectionHeading
          align="left"
          eyebrow="What you need"
          title="Have these ready before you apply"
          lead="The application takes a few minutes when the documents are at hand."
        />
        <ul className="[&>*+*]:mt-3">
          {requirements.map((item) => (
            <li className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4" key={item.label}>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-soft text-ink"><item.icon size={16} /></span>
              <span className="min-w-0">
                <strong className="block text-xs font-black text-ink">{item.label}</strong>
                <span className="mt-1 block text-[11px] leading-5 text-muted">{item.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function HomeFaq() {
  return (
    <section className="bg-soft/60" id="faq">
      <div className={ui.publicSection}>
        <SectionHeading eyebrow="FAQ" title="Questions sellers ask us" />
        <div className="mx-auto mt-10 max-w-3xl [&>*+*]:mt-3">
          {faqs.map((faq) => (
            <details className="group rounded-2xl border border-line bg-white p-4 transition hover:border-ink/20 [&_summary::-webkit-details-marker]:hidden" key={faq.question}>
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-xs font-black text-ink">
                {faq.question}
                <span className="text-lg font-black text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-xs leading-6 text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
