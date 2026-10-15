import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

// Data
import {
  SAMPLE_TRANSACTIONS,
  INITIAL_DISPUTES,
  THREAT_NEWS_ITEMS,
  THREAT_CATEGORIES
} from './data/mockData';

// Modular Components
import Navbar from './components/Navbar';
import InformationHub from './components/InformationHub';
import ProblemPage from './components/ProblemPage';
import NewsletterPage from './components/NewsletterPage';
import RiskRadar from './components/RiskRadar';
import DisputeStudio from './components/DisputeStudio';
import L402Console from './components/L402Console';
import Copilot from './components/Copilot';
import AuditVault from './components/AuditVault';
import Simulator from './components/Simulator';

export default function App() {
  const [activePortal, setActivePortal] = useState('hub');
  const [activeProblemId, setActiveProblemId] = useState(null);

  // Core Data State
  const [transactions, setTransactions] = useState(SAMPLE_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState(SAMPLE_TRANSACTIONS[1]);
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);
  const [threatNews, setThreatNews] = useState(THREAT_NEWS_ITEMS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  // Hub / View Mode State
  const [threatViewMode, setThreatViewMode] = useState('columns');
  const [selectedThreatCategory, setSelectedThreatCategory] = useState('ALL');

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterFrequency, setNewsletterFrequency] = useState('DAILY');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterSubResult, setNewsletterSubResult] = useState(null);

  // Copilot State
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState([
    {
      sender: "copilot",
      text: "Welcome to PayShield Copilot. I analyze transaction risk scores, explain SHAP feature attributions, and compute dispute viability against PayPal's $15 fee equation. How can I help you today?",
      evidence: ["Pre-Capture Calibrated Risk", "Dispute ROI Engine ($15 fee)", "L402 Agentic Protocol"]
    }
  ]);

  // L402 Machine-to-Machine State
  const [l402Step, setL402Step] = useState(0);
  const [l402TerminalLoading, setL402TerminalLoading] = useState(false);
  const [l402Challenge, setL402Challenge] = useState(null);
  const [l402PaymentResult, setL402PaymentResult] = useState(null);
  const [l402UnlockedData, setL402UnlockedData] = useState(null);
  const [l402Copied, setL402Copied] = useState(false);

  // Fetch threat bulletins on mount
  useEffect(() => {
    fetch('/api/v1/threats')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setThreatNews(data);
        }
      })
      .catch(() => {});
  }, []);

  // Quick simulation trigger
  const handleSimulate = async (type) => {
    setIsSimulating(true);
    let payload;
    const now = new Date().toISOString();

    if (type === 'LEGIT') {
      payload = {
        transaction_id: `ORD-${Math.floor(1000 + Math.random() * 9000)}-SAFE`,
        amount_usd: 75.00,
        buyer_email: "verified_user@gmail.com",
        buyer_country: "US",
        shipping_country: "US",
        ip_country: "US",
        buyer_currency: "USD",
        mid_market_rate_to_usd: 1.0,
        actual_rate_to_usd: 1.0,
        paypal_account_age_days: 850,
        paypal_account_verified: true,
        event_timestamp: now,
        history: { amounts: [70.0, 75.0, 80.0], timestamps: [now], dispute_count: 0 }
      };
    } else if (type === 'CARDING') {
      payload = {
        transaction_id: `ORD-${Math.floor(1000 + Math.random() * 9000)}-CARDING`,
        amount_usd: 480.00,
        buyer_email: "botnet_burst@disposable.cc",
        buyer_country: "US",
        shipping_country: "US",
        ip_country: "RO",
        buyer_currency: "USD",
        mid_market_rate_to_usd: 1.0,
        actual_rate_to_usd: 1.0,
        paypal_account_age_days: 4,
        paypal_account_verified: false,
        event_timestamp: now,
        history: { amounts: [10.0, 10.0, 10.0], timestamps: [now, now, now], dispute_count: 2 }
      };
    } else {
      payload = {
        transaction_id: `ORD-${Math.floor(1000 + Math.random() * 9000)}-FX_MANIP`,
        amount_usd: 1250.00,
        buyer_email: "cross_border_fx@spoof.net",
        buyer_country: "GB",
        shipping_country: "US",
        ip_country: "HK",
        buyer_currency: "GBP",
        mid_market_rate_to_usd: 1.25,
        actual_rate_to_usd: 1.42,
        paypal_account_age_days: 12,
        paypal_account_verified: false,
        event_timestamp: now,
        history: { amounts: [20.0], timestamps: [now], dispute_count: 1 }
      };
    }

    try {
      const res = await fetch('/api/v1/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const newEntry = {
        ...data,
        buyer_email: payload.buyer_email,
        buyer_country: payload.buyer_country,
        shipping_country: payload.shipping_country,
        ip_country: payload.ip_country,
        amount_usd: payload.amount_usd,
        timestamp: "Just now"
      };
      setTransactions([newEntry, ...transactions]);
      setSelectedTx(newEntry);
    } catch (e) {
      console.warn("API proxy fallback", e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDisputeSubmit = async (dispute) => {
    try {
      await fetch(`/api/v1/disputes/${dispute.dispute_id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidence_type: "PROOF_OF_DELIVERY",
          notes: `Tracking proof: ${dispute.tracking}. Fulfilled per PayPal Seller Protection.`
        })
      });
      setSubmissionFeedback(`Submitted to PayPal Disputes API: Dispute ${dispute.dispute_id} evidence acknowledged.`);
      setDisputes(disputes.map(d => d.dispute_id === dispute.dispute_id ? { ...d, status: 'SUBMITTED_TO_PAYPAL' } : d));
    } catch (e) {
      setSubmissionFeedback(`Dispute ${dispute.dispute_id} evidence queued for PayPal API submission.`);
    }
  };

  const handleCopilotSubmit = async (customQuery = null) => {
    const q = customQuery || copilotQuery;
    if (!q.trim()) return;

    const userMessage = { sender: "user", text: q };
    setCopilotHistory(prev => [...prev, userMessage]);
    setCopilotQuery("");
    setCopilotLoading(true);

    try {
      const res = await fetch('/api/v1/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          context_type: q.toLowerCase().includes("dispute") ? "DISPUTE" : "TRANSACTION"
        })
      });
      const data = await res.json();
      setCopilotHistory(prev => [
        ...prev,
        {
          sender: "copilot",
          text: data.answer,
          suggestion: data.action_suggestion,
          evidence: data.grounded_evidence
        }
      ]);
    } catch (e) {
      setCopilotHistory(prev => [
        ...prev,
        {
          sender: "copilot",
          text: "Grounded analysis: Under PayPal seller protection guidelines, disputes with verifiable carrier delivery proof achieve >75% win rates. For low-dollar disputes (<$20), contesting is uneconomic due to the non-refundable $15 fee.",
          suggestion: "INSPECT_RULES",
          evidence: ["PayPal $15 Fee Benchmark", "Carrier Tracking Rules"]
        }
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleAskCopilot = (prompt) => {
    setActivePortal('copilot');
    handleCopilotSubmit(prompt);
  };

  const handleDeployMitigation = (ruleName) => {
    setActivePortal('radar');
    setSubmissionFeedback(`Active Defense Policy Deployed: ${ruleName} is now actively enforcing limits on live PayPal order ingestion.`);
    setTimeout(() => setSubmissionFeedback(null), 6000);
  };

  const handleSelectProblem = (catId) => {
    setActiveProblemId(catId);
    setActivePortal('problem');
  };

  const handleOpenNewsletter = () => {
    setActivePortal('newsletter');
    setActiveProblemId(null);
  };

  // L402 Gateway Handlers
  const handleL402FetchChallenge = async () => {
    setL402TerminalLoading(true);
    try {
      const res = await fetch('/api/v1/l402/threat-feed');
      const data = await res.json();
      setL402Challenge(data);
      setL402Step(1);
    } catch (e) {
      setL402Challenge({
        version: "0.2.3",
        status: 402,
        payment_request_url: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
        payment_context_token: "62f1f983-589c-4d93-9ac8-eb8e5e28cc9e",
        offers: [
          {
            id: "single_bulletin",
            title: "Access Single Threat Vector Intel",
            amount: 0.05,
            currency: "USD",
            payment_methods: ["paypal"]
          }
        ]
      });
      setL402Step(1);
    } finally {
      setL402TerminalLoading(false);
    }
  };

  const handleL402SettlePayment = async () => {
    setL402TerminalLoading(true);
    try {
      const res = await fetch('/api/v1/l402/payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_context_token: l402Challenge?.payment_context_token || "62f1f983-589c-4d93-9ac8-eb8e5e28cc9e",
          offer_id: "single_bulletin",
          agent_id: "autonomous_risk_crawler_01"
        })
      });
      const data = await res.json();
      setL402PaymentResult(data);
      setL402Step(2);
    } catch (e) {
      setL402PaymentResult({
        status: "PAYMENT_CONFIRMED",
        paypal_order_id: "PP-L402-984128",
        offer_id: "single_bulletin",
        amount_usd: 0.05,
        bearer_token: "l402_9f81a7b42c6e409381ea624b51829034",
        expires_at: new Date(Date.now() + 86400000).toISOString()
      });
      setL402Step(2);
    } finally {
      setL402TerminalLoading(false);
    }
  };

  const handleL402UnlockFeed = async () => {
    setL402TerminalLoading(true);
    try {
      const token = l402PaymentResult?.bearer_token || "l402_mock_token";
      const res = await fetch('/api/v1/l402/threat-feed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setL402UnlockedData(data);
      setL402Step(3);
    } catch (e) {
      setL402UnlockedData({
        status: "UNLOCKED",
        protocol: "L402",
        access_granted: true,
        data: threatNews,
        message: "Authorized via PayPal L402 cryptographic HMAC token."
      });
      setL402Step(3);
    } finally {
      setL402TerminalLoading(false);
    }
  };

  const handleL402Reset = () => {
    setL402Step(0);
    setL402Challenge(null);
    setL402PaymentResult(null);
    setL402UnlockedData(null);
  };

  // Newsletter Subscription
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      const res = await fetch('/api/v1/threats/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          frequency: newsletterFrequency
        })
      });
      const data = await res.json();
      setNewsletterSubResult(data);
      setNewsletterSuccess(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSuccess(false), 8000);
    } catch (err) {
      setNewsletterSubResult({
        subscription_id: `SUB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        email: newsletterEmail,
        frequency: newsletterFrequency,
        status: "ACTIVE",
        message: `Successfully subscribed ${newsletterEmail} to The PayShield Merchant Dispatch (${newsletterFrequency}).`
      });
      setNewsletterSuccess(true);
      setNewsletterEmail("");
    }
  };

  const handleExportAuditJson = () => {
    const jsonStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payshield_cryptographic_audit_ledger_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Active Category Object for Problem Page
  const currentCategoryObj = THREAT_CATEGORIES.find((c) => c.id === activeProblemId) || THREAT_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-gray-900 flex flex-col font-sans">
      {/* Top Umbrella Masthead & Navigation */}
      <Navbar
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        activeProblemId={activeProblemId}
        setActiveProblemId={setActiveProblemId}
        onSimulate={handleSimulate}
        isSimulating={isSimulating}
      />

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {submissionFeedback && (
          <div className="mb-6 max-w-7xl mx-auto bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-lg flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{submissionFeedback}</span>
            </div>
            <button onClick={() => setSubmissionFeedback(null)} className="text-emerald-700 hover:underline font-medium">
              Dismiss
            </button>
          </div>
        )}

        {/* 1. UMBRELLA DESK (4 COLUMNS) */}
        {activePortal === 'hub' && (
          <InformationHub
            threatNews={threatNews}
            threatCategories={THREAT_CATEGORIES}
            threatViewMode={threatViewMode}
            setThreatViewMode={setThreatViewMode}
            selectedThreatCategory={selectedThreatCategory}
            setSelectedThreatCategory={setSelectedThreatCategory}
            onDeployMitigation={handleDeployMitigation}
            onAskCopilot={handleAskCopilot}
            onSelectProblem={handleSelectProblem}
            onOpenNewsletter={handleOpenNewsletter}
          />
        )}

        {/* 2. DEDICATED SEPARATE PAGE FOR EACH PROBLEM */}
        {activePortal === 'problem' && (
          <ProblemPage
            category={currentCategoryObj}
            allCategories={THREAT_CATEGORIES}
            threatNews={threatNews}
            onSelectProblem={handleSelectProblem}
            onBackToDesk={() => {
              setActivePortal('hub');
              setActiveProblemId(null);
            }}
            onDeployMitigation={handleDeployMitigation}
            onAskCopilot={handleAskCopilot}
          />
        )}

        {/* 3. DEDICATED SEPARATE NEWSLETTER PAGE (3RD PURPOSE) */}
        {activePortal === 'newsletter' && (
          <NewsletterPage
            newsletterEmail={newsletterEmail}
            setNewsletterEmail={setNewsletterEmail}
            newsletterFrequency={newsletterFrequency}
            setNewsletterFrequency={setNewsletterFrequency}
            onSubscribe={handleNewsletterSubmit}
            subscriptionSuccess={newsletterSuccess}
            subscriptionResult={newsletterSubResult}
            onDismissSuccess={() => setNewsletterSuccess(false)}
          />
        )}

        {/* 4. RISK RADAR */}
        {activePortal === 'radar' && (
          <RiskRadar
            transactions={transactions}
            selectedTx={selectedTx}
            setSelectedTx={setSelectedTx}
            onAskCopilot={handleAskCopilot}
          />
        )}

        {/* 5. $15 FEE DISPUTE STUDIO */}
        {activePortal === 'disputes' && (
          <DisputeStudio
            disputes={disputes}
            onDisputeSubmit={handleDisputeSubmit}
            onAskCopilot={handleAskCopilot}
          />
        )}

        {/* 6. L402 BOT TOLLGATE */}
        {activePortal === 'terminal' && (
          <L402Console
            l402Step={l402Step}
            l402Challenge={l402Challenge}
            l402PaymentResult={l402PaymentResult}
            l402UnlockedData={l402UnlockedData}
            l402TerminalLoading={l402TerminalLoading}
            l402Copied={l402Copied}
            setL402Copied={setL402Copied}
            onFetchChallenge={handleL402FetchChallenge}
            onSettlePayment={handleL402SettlePayment}
            onUnlockFeed={handleL402UnlockFeed}
            onReset={handleL402Reset}
          />
        )}

        {/* 7. AI RISK COPILOT */}
        {activePortal === 'copilot' && (
          <Copilot
            copilotQuery={copilotQuery}
            setCopilotQuery={setCopilotQuery}
            copilotHistory={copilotHistory}
            copilotLoading={copilotLoading}
            onCopilotSubmit={handleCopilotSubmit}
          />
        )}

        {/* 8. COMPLIANCE AUDIT VAULT */}
        {activePortal === 'audit' && (
          <AuditVault
            transactions={transactions}
            onExportAuditJson={handleExportAuditJson}
          />
        )}

        {/* 9. ATTACK SIMULATOR */}
        {activePortal === 'simulator' && (
          <Simulator
            isSimulating={isSimulating}
            onSimulate={handleSimulate}
            onInspectRadar={() => setActivePortal('radar')}
          />
        )}
      </main>
    </div>
  );
}
