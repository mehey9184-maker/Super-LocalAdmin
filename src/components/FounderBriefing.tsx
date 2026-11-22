import { BookOpenText, CheckCircle2, ExternalLink, Info, ShieldCheck } from 'lucide-react';

const DOCS =
  'https://github.com/mehey9184-maker/LocalEats-Dashboard.2/blob/cloudflare/cf1-merchant-api-staging-20261122/docs/';
const IDEA_REGISTER =
  'https://github.com/mehey9184-maker/LocalEats-app/blob/cloudflare/cf1-customer-staging-20261122/docs/LOCALEATS_SCALABLE_IDEA_REGISTER.md';

interface FounderLesson {
  title: string;
  principle: string;
  reason: string;
  decision: string;
  example: string;
}

const LESSONS: readonly FounderLesson[] = [
  {
    title: '1. Why Cloudflare first, Oracle later?',
    principle: 'Keep the storefront simple and the critical API under test.',
    reason:
      'Cloudflare can serve the Customer and Merchant websites without managing a virtual machine. Oracle Always Free could run an isolated backend or AI experiment, but VM capacity, maintenance and uptime are not guaranteed.',
    decision:
      'Continue Cloudflare + existing Supabase for the pickup launch. Compare Oracle only after a secure, measured experiment.',
    example:
      'Customers should still be able to browse the normal LocalEats app if an optional Oracle AI assistant is offline.',
  },
  {
    title: '2. Why not install a language model immediately?',
    principle: 'Pay for useful outcomes, not technology for its own sake.',
    reason:
      'A verified FAQ can answer simple pickup, opening-hours and install questions at almost no inference cost. A small open-weight model has no per-message provider fee, but it still needs CPU, monitoring, safety limits and human-reviewed answers.',
    decision:
      'Start with a deterministic FAQ benchmark. Only consider a CPU-only Oracle model if it improves accuracy or support time.',
    example:
      '“Do I pay online?” should return “For the current pickup pilot, pay at the shop” from approved policy, not a guessed answer.',
  },
  {
    title: '3. Why must the API control business actions?',
    principle: 'AI may explain an order; only the authoritative API may change it.',
    reason:
      'Shop approval, live availability, order revisions, customer payments and merchant notifications have security and financial consequences. A model can hallucinate or follow malicious instructions.',
    decision:
      'AI remains optional, read-only and separate from orders, prices, rewards, customer records and FCM commands.',
    example:
      'An AI answer saying “your order is ready” is never proof that the shop marked it Ready in the database.',
  },
];

const REFERENCES = [
  { label: 'Cloudflare / Oracle hosting evaluation', href: `${DOCS}LOCALEATS_ORACLE_CLOUD_HOSTING_EVALUATION.md` },
  { label: 'CF2-C security and availability test', href: `${DOCS}CLOUDFLARE_CF2C_AVAILABILITY_PARITY.md` },
  { label: 'Founder agreement and approval rules', href: `${DOCS}LOCALEATS_FOUNDER_CHARTER.md` },
  { label: 'Current GitHub project handoff', href: `${DOCS}LOCALEATS_PROJECT_MEMORY.md` },
  { label: 'Scalable ideas — LE-09 optional Oracle AI', href: IDEA_REGISTER },
] as const;

export const FounderBriefing = () => (
  <main
    className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10"
    aria-labelledby="founder-briefing-title"
  >
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D44B2B]">
        LocalEats Founder Learning
      </p>
      <h1
        id="founder-briefing-title"
        className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
      >
        Founder Briefing
      </h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Understand our technical recommendations in business language, and see what
        we are testing before you approve a release.
      </p>
    </div>

    <div className="mt-5 flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
      <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#D44B2B]" />
      <p>
        <strong>Documentation snapshot — 22 November 2026.</strong> This is a read-only
        learning page, not live telemetry or a release dashboard. For current tests,
        approvals and blockers, open the linked GitHub project handoff.
      </p>
    </div>

    <section className="mt-8" aria-labelledby="founder-lessons-heading">
      <div className="flex items-center gap-2">
        <BookOpenText aria-hidden="true" className="h-5 w-5 text-[#D44B2B]" />
        <h2 id="founder-lessons-heading" className="text-lg font-extrabold text-slate-950">
          Three lessons for building LocalEats
        </h2>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {LESSONS.map((lesson) => (
          <article
            key={lesson.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-base font-extrabold text-slate-950">{lesson.title}</h3>
            <p className="mt-3 font-semibold leading-6 text-slate-800">
              {lesson.principle}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{lesson.reason}</p>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#B54629]">
                Recommended company decision
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-800">{lesson.decision}</p>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 px-3 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Real-world example
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{lesson.example}</p>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="founder-phase-heading">
      <h2 id="founder-phase-heading" className="text-lg font-extrabold text-slate-950">
        Current focus: Cloudflare CF2-D
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Prepare a reversible, read-only staging database access proposal before
        changing any hosted permissions. Passing a synthetic test does not
        mean a Customer app is live.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-900">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            <p className="text-sm font-bold">Already verified</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-emerald-950">
            CF2-C's disposable PostgreSQL tests preserved the original shop-hours
            calculation and denied private fields and database writes.
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-950">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            <p className="text-sm font-bold">Still behind founder approval</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-950">
            Applying Supabase grants, deploying another Worker, using database
            credentials, public orders, payments and paid hosting.
          </p>
        </div>
      </div>
    </section>

    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="founder-references-heading">
      <h2 id="founder-references-heading" className="text-lg font-extrabold text-slate-950">
        Read the evidence
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        These GitHub documents are our source of truth across chats and coding agents.
      </p>
      <ul className="mt-4 space-y-3">
        {REFERENCES.map((reference) => (
          <li key={reference.href}>
            <a
              href={reference.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#A33821] underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A33821]"
            >
              <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
              {reference.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  </main>
);
