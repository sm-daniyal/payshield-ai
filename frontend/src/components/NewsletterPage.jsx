import React, { useState } from 'react';
import {
  Mail,
  MailCheck,
  CheckCircle2,
  Printer,
  Calendar,
  Share2,
  BookOpen,
  Check,
  AlertCircle
} from 'lucide-react';

export default function NewsletterPage({
  newsletterEmail,
  setNewsletterEmail,
  newsletterFrequency,
  setNewsletterFrequency,
  onSubscribe,
  subscriptionSuccess,
  subscriptionResult,
  onDismissSuccess
}) {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-serif">
      {/* Top Authentic Newspaper Masthead */}
      <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm text-center space-y-4">
        {/* Dateline Bar */}
        <div className="border-b-2 border-gray-900 pb-2 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 font-sans tracking-widest uppercase">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Thursday, October 15, 2026</span>
          </div>
          <span className="font-bold text-gray-900">Vol. II • No. 42</span>
          <span>PayPal Disputes v1 &amp; L402 Edition</span>
        </div>

        {/* Newspaper Title */}
        <div className="py-2">
          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight uppercase font-serif">
            The PayShield Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-gray-700 italic font-serif mt-1">
            The Journal of Merchant Defense, Payment Infrastructure Economics, &amp; Autonomous Fraud Intelligence
          </p>
        </div>

        {/* Double-Line Divider Rule */}
        <div className="border-y-2 border-gray-900 py-1 flex items-center justify-between text-[11px] font-sans uppercase tracking-wider text-gray-700 font-medium">
          <span>Editorial Issue • Special Circulation</span>
          <span className="hidden sm:inline">Published for Online Store Operators &amp; FinTech Engineers</span>
          <span>Verified Non-Refundable Fee Reality</span>
        </div>

        {/* Controls */}
        <div className="pt-2 flex items-center justify-end gap-2 font-sans text-xs">
          <button
            onClick={() => window.print()}
            className="text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200 px-3 py-1 rounded transition flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Edition
          </button>
          <button
            onClick={handleShare}
            className="text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200 px-3 py-1 rounded transition flex items-center gap-1"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            {copiedShare ? "Link Copied" : "Share Dispatch"}
          </button>
        </div>
      </div>

      {/* LEAD EDITORIAL OP-ED */}
      <article className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm space-y-6">
        <div className="space-y-2 text-center border-b border-gray-200 pb-5">
          <span className="font-sans text-[11px] font-bold tracking-widest uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Lead Editorial • Economics of Arbitration
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 leading-tight">
            The Mathematics of Defending Online Stores: Why Conceding Low-Dollar Disputes Saves Real Capital
          </h2>
          <div className="font-sans text-xs text-gray-500">
            By <span className="font-semibold text-gray-800">PayShield Risk Engineering Desk</span> • 6 Min Read
          </div>
        </div>

        {/* Multi-Column Newspaper Article Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-800 leading-relaxed font-serif text-justify">
          <div className="space-y-4">
            <p className="first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:text-gray-950">
              For independent online merchants, few experiences match the frustration of receiving an illegitimate dispute notice. Whether it is an impatient customer claiming non-delivery hours before the carrier arrives, or a friendly-fraud ring executing intentional order redirection, the emotional impulse is always the same: contest the charge, assemble evidence, and fight to the end.
            </p>
            <p>
              Yet in payment processing, emotion is a luxury small merchants cannot afford. When PayPal assesses an automatic, non-refundable <strong>$15.00 dispute fee</strong> on contested claims regardless of resolution, fighting a $12.00 claim with a 35% probability of success becomes financial suicide.
            </p>
            <div className="p-4 bg-gray-50 border-l-4 border-gray-900 italic text-gray-700 my-4 font-sans text-xs">
              "The most profitable decision an e-commerce founder makes this year is writing off a fraudulent $14 charge rather than spending $15 to win it."
            </div>
            <p>
              Under PayShield's algorithmic expected value framework:
            </p>
            <div className="font-mono text-xs bg-gray-100 p-3 rounded border border-gray-300 text-gray-900 font-semibold text-center">
              Expected Net Recovery = (P_win × Amount) - $15.00
            </div>
          </div>

          <div className="space-y-4">
            <p>
              If the expected return is less than or equal to zero, the optimal economic action is immediate concession. Every dollar saved on arbitration fees is retained profit that keeps payroll funded and margins intact.
            </p>
            <p>
              Meanwhile, for claims exceeding $50.00 where carrier delivery scans confirm delivery to the buyer's recipient postal code, our autonomous dossier generator transmits conclusive proof directly through the <code>/v1/customer/disputes/{'{'}id{'}'}/provide-evidence</code> endpoint in milliseconds.
            </p>
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-900 pt-2">
              Three Non-Negotiable Operating Principles:
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 font-sans text-xs text-gray-700">
              <li><strong>Verify Postal Codes First:</strong> A delivery scan to the wrong zip code is an automatic loss.</li>
              <li><strong>Mandate Signature on $750+:</strong> Never ship orders above $750 without carrier adult signature.</li>
              <li><strong>Monetize Crawlers via L402:</strong> Do not block automated scraping bots; charge them 5 cents per inquiry.</li>
            </ul>
          </div>
        </div>
      </article>

      {/* DISPATCH CURATED INTELLIGENCE BRIEFS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm space-y-3">
          <div className="font-sans text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block uppercase tracking-wider">
            Postal Logistics Wire
          </div>
          <h3 className="text-lg font-bold text-gray-950 font-serif">
            Why GPS Geocoding Is Replacing Traditional 'Delivered' Scans in High-Risk Zones
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed font-sans">
            Leading carriers now record geocoded drop coordinates. Cross-checking GPS scans with delivery addresses eliminates 78% of false 'Item Not Received' disputes before formal escalation.
          </p>
          <div className="text-[11px] font-mono text-gray-400 font-sans pt-1">
            Carrier Protocol: USPS Priority &amp; FedEx Geostamp
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm space-y-3">
          <div className="font-sans text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block uppercase tracking-wider">
            Agentic AI &amp; L402
          </div>
          <h3 className="text-lg font-bold text-gray-950 font-serif">
            The Death of CAPTCHAs: Why Machine Tollgates Are the Future of Web Scraping
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed font-sans">
            Modern scraping bots bypass image puzzles with multi-modal LLMs. Programmatic micro-captures ($0.05 USD via PayPal Orders v2) turn server drain into a recurring revenue stream.
          </p>
          <div className="text-[11px] font-mono text-gray-400 font-sans pt-1">
            Standard: RFC 402 • HTTP 402 Payment Required
          </div>
        </div>
      </div>

      {/* DEDICATED NEWSLETTER SUBSCRIPTION DESK */}
      <div className="bg-white border-2 border-gray-900 rounded-lg p-8 shadow-md font-sans space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gray-900 text-white">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-950">
                Subscribe to The PayShield Merchant Dispatch
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Delivered straight to your security team and store managers. No marketing spam; only verified PayPal defense bulletins.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full uppercase">
            Official RSS / Dispatch
          </span>
        </div>

        {/* Frequency Radio Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700">Delivery Cadence Preference:</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'REALTIME', title: '⚡ Real-Time Pager', desc: 'Instant zero-day alerts on carding bursts and bot spikes' },
              { id: 'DAILY', title: '📅 Daily Morning Brief', desc: 'Compiled 8:00 AM overview of open disputes & postal scans' },
              { id: 'WEEKLY', title: '📊 Sunday Executive Digest', desc: 'Weekly macroeconomic analysis and fee recovery ROI recap' }
            ].map((f) => (
              <div
                key={f.id}
                onClick={() => setNewsletterFrequency(f.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition text-left ${
                  newsletterFrequency === f.id
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-bold text-gray-900">{f.title}</div>
                <div className="text-[11px] text-gray-500 mt-1 leading-snug">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Form */}
        <form onSubmit={onSubscribe} className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <input
            type="email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="merchant.ops@your-online-store.com"
            required
            className="flex-1 bg-white border border-gray-300 text-xs text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm font-sans"
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-gray-950 hover:bg-black text-white text-xs font-semibold px-6 py-3 rounded-lg transition shadow flex items-center justify-center gap-2"
          >
            <MailCheck className="w-4 h-4" />
            Join 24,500 Store Subscribers
          </button>
        </form>

        {/* Feedback Message */}
        {subscriptionSuccess && subscriptionResult && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <div className="font-bold text-gray-900">Subscription Confirmed • Token #{subscriptionResult.subscription_id}</div>
                <div className="text-gray-700 mt-0.5">{subscriptionResult.message}</div>
              </div>
            </div>
            <button
              onClick={onDismissSuccess}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
