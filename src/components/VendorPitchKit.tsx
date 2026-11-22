import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Info,
  MapPin,
  Printer,
  ShieldCheck,
  ShoppingBag,
  Store,
} from 'lucide-react';

const DEMO_STEPS = [
  {
    title: 'Customer discovers a nearby shop',
    heading: 'Browse food without guessing availability',
    details:
      'The customer can discover a shop and see its verified menu. Closed or out-of-range shops may be browsed, but cannot accept pickup orders.',
    screen: 'Customer app',
  },
  {
    title: 'Customer chooses food for pickup',
    heading: 'Prices come from the verified API',
    details:
      'A customer selects items. The authoritative API must verify live prices, shop status and identity before an actual order can be placed.',
    screen: 'Customer app',
  },
  {
    title: 'Merchant accepts and prepares',
    heading: 'The owner controls the kitchen',
    details:
      'After a real order is safely created, the merchant dashboard will manage Accept, Ready and handover. Live-order notifications still require real-device acceptance.',
    screen: 'Merchant dashboard',
  },
  {
    title: 'Customer collects and pays at the shop',
    heading: 'Pickup-first, simple for the pilot',
    details:
      'For the proposed pickup pilot, the customer pays the merchant at the shop. There is no active LocalPay wallet or online payment promise.',
    screen: 'Pickup handover',
  },
] as const;

const QUESTIONS = [
  'How do customers place orders today: walk-in, phone or WhatsApp?',
  'What are your busiest hours and average preparation times?',
  'Who would manage your phone or LocalEats Merchant Dashboard?',
  'How often do menu items and prices change?',
  'Would you be interested in a small pickup-only pilot when real orders are ready?',
] as const;

const PITCH_TEXT =
  "LocalEats is preparing a simple way for nearby customers to find local food and place pickup orders. We're starting with a small pilot where customers pay at the shop. The customer app and merchant tools are developed, but public ordering is not live yet. We're meeting local food vendors now to understand what they need and invite interested shops to join the pilot after safety testing. Would you like to see a sample and tell us how you currently handle orders?";

export const VendorPitchKit = () => {
  const [step, setStep] = useState(0);
  const current = DEMO_STEPS[step];

  const printWorksheet = () => {
    window.print();
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10" aria-labelledby="vendor-pitch-title">
      <div className="print:hidden">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C84A2D]">
          LocalEats CEO / Pilot preparation
        </p>
        <h1 id="vendor-pitch-title" className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          Vendor Pitch Kit
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Get vendors interested in our pickup-first pilot. This page is a preview tool,
          not a live merchant registration system or evidence that public orders work.
        </p>
      </div>

      <section aria-label="Release readiness" className="mt-6 grid gap-4 sm:grid-cols-2 print:hidden">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
          <p className="text-sm font-extrabold text-emerald-950">Vendor conversations</p>
          <p className="mt-1 text-sm text-emerald-900">
            Current planning estimate: <strong>75%</strong>. Founder goal: <strong>90%</strong>.
          </p>
          <p className="mt-2 text-xs leading-5 text-emerald-800">
            You can pitch and invite expressions of interest now; a tested real-phone
            demo and approved vendor offer still need verification.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <p className="text-sm font-extrabold text-amber-950">Public pickup ordering</p>
          <p className="mt-1 text-sm text-amber-950">
            Current planning estimate: <strong>50%</strong>. Founder goal: <strong>85%</strong>.
          </p>
          <p className="mt-2 text-xs leading-5 text-amber-900">
            Not ready to activate. CF2-E backup is blocked; real API, location,
            notification and consenting-customer pickup tests are outstanding.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 print:hidden" aria-labelledby="vendor-script-heading">
        <div className="flex items-center gap-3">
          <BookOpenText aria-hidden="true" className="h-6 w-6 text-[#C84A2D]" />
          <h2 id="vendor-script-heading" className="text-lg font-extrabold text-slate-950">
            Your 30-second introduction
          </h2>
        </div>
        <div className="mt-4 rounded-lg border-l-4 border-orange-400 bg-orange-50 px-4 py-4 text-sm leading-7 text-slate-900">
          {PITCH_TEXT}
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-600">
          Do not promise a launch date, guaranteed new customers, fees, discounts,
          free trials, payouts or an order-processing account before approval.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 print:hidden" aria-labelledby="vendor-demo-heading">
        <div className="flex items-center gap-3">
          <ShoppingBag aria-hidden="true" className="h-6 w-6 text-[#C84A2D]" />
          <h2 id="vendor-demo-heading" className="text-lg font-extrabold text-slate-950">
            Four-step pickup demonstration
          </h2>
        </div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
          Concept walkthrough — TEST example, not a real order
        </p>
        <div className="mt-5 flex gap-2" aria-label="Demo progress">
          {DEMO_STEPS.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setStep(index)}
              aria-label={`Show demo step ${index + 1}: ${item.title}`}
              aria-current={index === step ? 'step' : undefined}
              className={`h-2 min-w-8 flex-1 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 ${
                index === step ? 'bg-[#C84A2D]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_260px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#B4472A]">
              Step {step + 1} of 4 · {current.screen}
            </p>
            <h3 className="mt-2 text-xl font-extrabold text-slate-950">{current.heading}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-700">{current.details}</p>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((n) => Math.max(0, n - 1))}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft aria-hidden="true" size={16} /> Back
              </button>
              <button
                type="button"
                disabled={step === DEMO_STEPS.length - 1}
                onClick={() => setStep((n) => Math.min(DEMO_STEPS.length - 1, n + 1))}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#C84A2D] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ArrowRight aria-hidden="true" size={16} />
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Synthetic food sample">
            <div className="flex items-center gap-2 text-slate-600">
              <Store aria-hidden="true" size={17} />
              <span className="text-xs font-bold uppercase tracking-wider">TEST sample shop</span>
            </div>
            <p className="mt-3 font-extrabold text-slate-900">Example Kota Kitchen</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
              <MapPin aria-hidden="true" size={14} /> Fictional pilot example
            </p>
            <div className="mt-4 space-y-2 border-t border-slate-200 pt-3 text-sm">
              <div className="flex justify-between gap-4"><span>Kota — TEST</span><span>R25 example</span></div>
              <div className="flex justify-between gap-4"><span>Soft drink — TEST</span><span>R10 example</span></div>
            </div>
            <p className="mt-4 rounded-md bg-amber-100 p-2 text-xs font-semibold text-amber-950">
              No checkout, no real shop record, no price quote or database mutation.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 print:hidden" aria-label="Vendor discovery and approval">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-950">
            <ClipboardCheck aria-hidden="true" size={20} className="text-[#C84A2D]" />
            Questions for each vendor
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-700">
            {QUESTIONS.map((question) => <li key={question}>{question}</li>)}
          </ol>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-950">
            <ShieldCheck aria-hidden="true" size={20} className="text-[#C84A2D]" />
            Interest ≠ merchant approval
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li className="flex gap-2"><CheckCircle2 aria-hidden="true" size={17} className="mt-1 shrink-0 text-emerald-700" /> Ask permission to follow up; explain the pilot is not live.</li>
            <li className="flex gap-2"><Clock3 aria-hidden="true" size={17} className="mt-1 shrink-0 text-amber-700" /> Real account creation depends on the verified Merchant API and Shop Review gate.</li>
            <li className="flex gap-2"><Info aria-hidden="true" size={17} className="mt-1 shrink-0 text-slate-600" /> No live vendor login or public checkout is activated by this page.</li>
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 print:hidden" aria-labelledby="vendor-print-heading">
        <h2 id="vendor-print-heading" className="text-lg font-extrabold text-slate-950">
          Take an interest form to the shop
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Print a blank, voluntary pilot interest sheet. The app never saves or
          transmits vendor contact details. Keep completed paper forms secure,
          and use them only for the agreed follow-up.
        </p>
        <button
          type="button"
          onClick={printWorksheet}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-700"
        >
          <Printer aria-hidden="true" size={17} /> Print blank interest form
        </button>
      </section>

      <div className="hidden print:block print:bg-white print:text-black" aria-label="Printable vendor interest form">
        <h1 className="text-2xl font-bold">LocalEats — Voluntary Vendor Pilot Interest</h1>
        <p className="mt-3 text-sm">
          This form expresses interest in learning about a future pickup-only pilot. It is
          not a live LocalEats merchant account, purchase agreement, paid subscription
          or guarantee of customers, income or an opening date.
        </p>
        <div className="mt-8 space-y-6 text-base">
          <p>Shop / trading name: __________________________________________</p>
          <p>Area / location: ______________________________________________</p>
          <p>Food type / category: _________________________________________</p>
          <p>Contact person (optional): ____________________________________</p>
          <p>Contact number or method (optional): ___________________________</p>
          <p>Preferred time for a follow-up (optional): ______________________</p>
          <p>What would help your shop? ___________________________________</p>
          <p>________________________________________________________________</p>
        </div>
        <div className="mt-9 border border-black p-4">
          <p className="font-bold">Optional permission to contact</p>
          <p className="mt-2 text-sm">
            ☐ I agree that LocalEats may use the contact details I voluntarily provided
            solely to follow up about a possible pickup pilot. I can decline or withdraw
            this permission. My details are not a live merchant registration.
          </p>
          <p className="mt-5 text-sm">Signature / mark (if agreed): __________________ Date: __________</p>
        </div>
        <p className="mt-7 text-xs">
          LocalEats representative: ______________________________. Store this sheet
          securely. Do not upload it to public GitHub or a test database. Confirm a
          complete privacy notice and retention method before collecting details.
        </p>
      </div>
    </main>
  );
};
