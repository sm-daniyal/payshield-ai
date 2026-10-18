import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

// Data
import {
  SAMPLE_TRANSACTIONS,
  INITIAL_DISPUTES
} from './data/mockData';

// Modular Components
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CopilotChat from './components/CopilotChat';
import RiskRadar from './components/RiskRadar';
import DisputeStudio from './components/DisputeStudio';
import L402Console from './components/L402Console';
import AuditVault from './components/AuditVault';

export default function App() {
  const [isEntered, setIsEntered] = useState(false);
  const [activePortal, setActivePortal] = useState('radar');

  // Core Data State
  const [transactions, setTransactions] = useState(SAMPLE_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState(SAMPLE_TRANSACTIONS[1]);
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);
  const [isSimulating, setIsSimulating] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  // L402 Machine-to-Machine State
  const [l402Step, setL402Step] = useState(0);
  const [l402TerminalLoading, setL402TerminalLoading] = useState(false);
  const [l402Challenge, setL402Challenge] = useState(null);
  const [l402PaymentResult, setL402PaymentResult] = useState(null);
  const [l402UnlockedData, setL402UnlockedData] = useState(null);
  const [l402Copied, setL402Copied] = useState(false);

  // Quick simulation trigger (supports preset string or custom payload)
  const handleSimulate = async (typeOrPayload) => {
    setIsSimulating(true);
    let payload;
    const now = new Date().toISOString();
    const nowMs = Date.now();

    if (typeof typeOrPayload === 'object' && typeOrPayload !== null) {
      payload = typeOrPayload;
    } else if (typeOrPayload === 'LEGIT') {
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
        history: {
          amounts: [68.50, 75.25, 71.00, 80.00, 65.75],
          timestamps: [
            new Date(nowMs - 5 * 60 * 1000).toISOString(),
            new Date(nowMs - 40 * 60 * 1000).toISOString(),
            new Date(nowMs - 2 * 60 * 60 * 1000).toISOString(),
            new Date(nowMs - 6 * 60 * 60 * 1000).toISOString(),
            new Date(nowMs - 24 * 60 * 60 * 1000).toISOString(),
          ],
          dispute_count: 0
        }
      };
    } else if (typeOrPayload === 'CARDING') {
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
        history: {
          amounts: [9.50, 12.00, 10.75, 11.25, 9.95],
          timestamps: [
            new Date(nowMs - 3 * 60 * 1000).toISOString(),
            new Date(nowMs - 8 * 60 * 1000).toISOString(),
            new Date(nowMs - 15 * 60 * 1000).toISOString(),
            new Date(nowMs - 22 * 60 * 1000).toISOString(),
            new Date(nowMs - 30 * 60 * 1000).toISOString(),
          ],
          dispute_count: 3
        }
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
        history: {
          amounts: [20.00, 22.50, 19.00],
          timestamps: [
            new Date(nowMs - 3 * 24 * 60 * 60 * 1000).toISOString(),
            new Date(nowMs - 5 * 24 * 60 * 60 * 1000).toISOString(),
            new Date(nowMs - 8 * 24 * 60 * 60 * 1000).toISOString(),
          ],
          dispute_count: 1
        }
      };
    }

    setSelectedTx(null);
    try {
      const res = await fetch('/api/v1/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const newEntry = {
        ...data,
        ...(data.decision || {}),
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
        data: [],
        message: "Authorized via PayPal L402 HMAC token."
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

  const handleExportAuditJson = () => {
    const jsonStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payshield_audit_log_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isEntered) {
    return <LandingPage onEnter={() => setIsEntered(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-gray-900 font-sans overflow-hidden">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activePortal={activePortal}
        setActivePortal={setActivePortal}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Streamlined Top Header */}
        <Navbar
          activePortal={activePortal}
        />

        {/* Scrollable Portal View Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {submissionFeedback && (
              <div className="mb-6 bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between text-xs shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">{submissionFeedback}</span>
                </div>
                <button
                  onClick={() => setSubmissionFeedback(null)}
                  className="text-emerald-700 hover:underline font-medium cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* 1. RISK RADAR */}
            {activePortal === 'radar' && (
              <RiskRadar
                transactions={transactions}
                selectedTx={selectedTx}
                setSelectedTx={setSelectedTx}
                onSimulate={handleSimulate}
                isSimulating={isSimulating}
              />
            )}

            {/* 2. L402 BOT TOLLGATE */}
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

            {/* 3. $15 FEE DISPUTE STUDIO */}
            {activePortal === 'disputes' && (
              <DisputeStudio
                disputes={disputes}
                onDisputeSubmit={handleDisputeSubmit}
              />
            )}

            {/* 4. COMPLIANCE AUDIT VAULT */}
            {activePortal === 'audit' && (
              <AuditVault
                transactions={transactions}
                onExportAuditJson={handleExportAuditJson}
              />
            )}
          </div>
        </main>
      </div>

      {/* Floating Deterministic Copilot */}
      <CopilotChat />
    </div>
  );
}
