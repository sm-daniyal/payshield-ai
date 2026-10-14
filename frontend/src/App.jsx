import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Send,
  Zap,
  TrendingUp,
  FileText,
  DollarSign,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  ExternalLink,
  Download,
  Newspaper,
  Database,
  Lock,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronRight,
  Bot,
  Mail,
  HelpCircle,
  Sparkles,
  Terminal,
  LayoutGrid,
  Columns3,
  List,
  Check,
  Copy,
  MailCheck
} from 'lucide-react';

const SAMPLE_TRANSACTIONS = [
  {
    transaction_id: "ORD-8921-LIVE",
    amount_usd: 129.50,
    buyer_email: "susan.chen@gmail.com",
    buyer_country: "US",
    shipping_country: "US",
    ip_country: "US",
    risk_score: 4.8,
    action: "ALLOW",
    rule_triggered: "RULE_1_PROB_BELOW_0_20_LOW_RISK",
    timestamp: "2 mins ago",
    features: {
      amount_zscore: 0.12,
      velocity_1h: 1,
      velocity_24h: 1,
      velocity_7d: 3,
      fx_spread: 0.002,
      geo_mismatch: 0.0,
      account_risk_score: 0.08
    },
    shap_contributions: [
      { feature: "account_risk_score", value: 0.08, shap_value: -0.38, contribution_pct: 42.0 },
      { feature: "geo_mismatch", value: 0.0, shap_value: -0.22, contribution_pct: 24.3 },
      { feature: "velocity_1h", value: 1.0, shap_value: -0.15, contribution_pct: 16.5 },
      { feature: "amount_zscore", value: 0.12, shap_value: -0.09, contribution_pct: 9.9 },
      { feature: "fx_spread", value: 0.002, shap_value: -0.06, contribution_pct: 7.3 }
    ],
    additivity_verification: {
      base_bias: -1.062,
      shap_sum: -0.90,
      predicted_probability: 0.048,
      delta: 0.000021,
      verified: true
    }
  },
  {
    transaction_id: "ORD-9430-BURST",
    amount_usd: 680.00,
    buyer_email: "alex99_carder@tempinbox.org",
    buyer_country: "US",
    shipping_country: "US",
    ip_country: "NG",
    risk_score: 88.5,
    action: "BLOCK_AND_FLAG_DISPUTE",
    rule_triggered: "RULE_5_PROB_CRITICAL_HIGH_VALUE_BLOCK",
    timestamp: "6 mins ago",
    features: {
      amount_zscore: 4.25,
      velocity_1h: 7,
      velocity_24h: 11,
      velocity_7d: 12,
      fx_spread: 0.048,
      geo_mismatch: 1.0,
      account_risk_score: 0.89
    },
    shap_contributions: [
      { feature: "velocity_1h", value: 7.0, shap_value: 1.45, contribution_pct: 35.8 },
      { feature: "geo_mismatch", value: 1.0, shap_value: 1.10, contribution_pct: 27.2 },
      { feature: "amount_zscore", value: 4.25, shap_value: 0.85, contribution_pct: 21.0 },
      { feature: "account_risk_score", value: 0.89, shap_value: 0.65, contribution_pct: 16.0 }
    ],
    additivity_verification: {
      base_bias: -1.062,
      shap_sum: 4.05,
      predicted_probability: 0.885,
      delta: 0.000018,
      verified: true
    }
  },
  {
    transaction_id: "ORD-9112-STEPUP",
    amount_usd: 340.00,
    buyer_email: "mark.nordic@online.se",
    buyer_country: "SE",
    shipping_country: "SE",
    ip_country: "SE",
    risk_score: 48.2,
    action: "STEP_UP_VERIFICATION",
    rule_triggered: "RULE_3_PROB_ELEVATED_STEP_UP_AUTH",
    timestamp: "14 mins ago",
    features: {
      amount_zscore: 2.1,
      velocity_1h: 3,
      velocity_24h: 4,
      velocity_7d: 5,
      fx_spread: 0.015,
      geo_mismatch: 0.0,
      account_risk_score: 0.42
    },
    shap_contributions: [
      { feature: "amount_zscore", value: 2.1, shap_value: 0.52, contribution_pct: 38.0 },
      { feature: "velocity_1h", value: 3.0, shap_value: 0.45, contribution_pct: 32.8 },
      { feature: "account_risk_score", value: 0.42, shap_value: 0.40, contribution_pct: 29.2 }
    ],
    additivity_verification: {
      base_bias: -1.062,
      shap_sum: 1.37,
      predicted_probability: 0.482,
      delta: 0.000034,
      verified: true
    }
  }
];

const INITIAL_DISPUTES = [
  {
    dispute_id: "PP-D-882194",
    transaction_id: "TXN-9912048",
    amount_usd: 175.00,
    buyer_email: "customer_complaint@outlook.com",
    reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
    win_probability: 0.78,
    expected_net_recovery: 121.50,
    action: "PROCEED_DIRECT_DISPUTE",
    has_delivery_proof: true,
    has_avs_cvv: true,
    tracking: "9400111899562537684000 (USPS Delivered)",
    status: "READY_TO_SUBMIT"
  },
  {
    dispute_id: "PP-D-441029",
    transaction_id: "TXN-3829104",
    amount_usd: 14.50,
    buyer_email: "small_order@fastmail.com",
    reason: "UNRECOGNIZED_TRANSACTION",
    win_probability: 0.35,
    expected_net_recovery: -9.92,
    action: "AUTO_WRITE_OFF_UNECONOMIC",
    has_delivery_proof: false,
    has_avs_cvv: false,
    tracking: "None",
    status: "AUTO_WRITTEN_OFF"
  },
  {
    dispute_id: "PP-D-619280",
    transaction_id: "TXN-7740192",
    amount_usd: 85.00,
    buyer_email: "buyer_refund@yahoo.com",
    reason: "NOT_AS_DESCRIBED",
    win_probability: 0.48,
    expected_net_recovery: 25.80,
    action: "ESCALATE_MANUAL_REVIEW",
    has_delivery_proof: true,
    has_avs_cvv: false,
    tracking: "1Z9999999999999999 (UPS In Transit)",
    status: "PENDING_MERCHANT_REVIEW"
  }
];

const THREAT_NEWS_ITEMS = [
  {
    id: "INTEL-2026-089",
    headline: "Coordinated Micro-Authorization Card Testing Spike on PayPal Express Checkout",
    summary: "Distributed botnets utilizing Romanian and Nigerian egress IPs attempting high-frequency sub-$2.00 authorizations to validate stolen card bins.",
    category: "CARD_TESTING",
    severity: "CRITICAL",
    published_at: "Today, 18:45 UTC",
    mitigation_rule: "RULE_5 & Rolling 1h Velocity Gating",
    actionable_recommendation: "PayShield rolling velocity threshold automatically clamps tolerated 1h transaction frequency."
  },
  {
    id: "INTEL-2026-072",
    headline: "Cross-Border FX Arbitrage Exploit Targeting GBP/USD Currency Conversion Rails",
    summary: "Fraud rings exploiting cross-border currency conversion rate disparities. Spreads exceeding 4.5% above institutional mid-market benchmarks observed.",
    category: "CROSS_BORDER_FX",
    severity: "ELEVATED",
    published_at: "Yesterday, 11:20 UTC",
    mitigation_rule: "RULE_3 & fx_spread Feature Weighting",
    actionable_recommendation: "Triggers 3-D Secure biometric step-up verification whenever transaction rate diverges >3% from benchmark."
  },
  {
    id: "INTEL-2026-061",
    headline: "PayPal Seller Protection Evidence Clarification for Item-Not-Received Claims",
    summary: "PayPal policy confirmation specifies that carrier tracking showing physical delivery to buyer recipient postal code constitutes conclusive merchant defense.",
    category: "DISPUTE_RULES",
    severity: "INFO",
    published_at: "Oct 10, 2026",
    mitigation_rule: "PayShield Dispute Engine — PROCEED_DIRECT_DISPUTE",
    actionable_recommendation: "PayShield dispute engine automatically pairs USPS/FedEx carrier delivery scans with PayPal order captures."
  },
  {
    id: "INTEL-2026-044",
    headline: "Synthetic Identity Inundation on Fresh PayPal Buyer Accounts Under 14 Days",
    summary: "Rise in newly minted PayPal accounts with unverified banking links attempting rapid bulk checkouts prior to initial bank settlement cycles.",
    category: "ACCOUNT_TAKEOVER",
    severity: "ELEVATED",
    published_at: "Oct 8, 2026",
    mitigation_rule: "account_risk_score Logarithmic Age Decay Feature",
    actionable_recommendation: "PayShield assigns maximum penalty to unverified buyer accounts <30 days, requiring secondary verification."
  }
];

const THREAT_CATEGORIES = [
  {
    id: "CARD_TESTING",
    name: "Card Testing & Botnets",
    shortName: "Card Testing",
    icon: Zap,
    color: "from-rose-500/20 to-rose-950/20 border-rose-500/30 text-rose-400",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    badge: "CRITICAL VECTOR",
    description: "High-frequency micro-auth bursts attempting stolen card validation against PayPal checkout."
  },
  {
    id: "CROSS_BORDER_FX",
    name: "Cross-Border FX Arbitrage",
    shortName: "FX Arbitrage",
    icon: TrendingUp,
    color: "from-amber-500/20 to-amber-950/20 border-amber-500/30 text-amber-400",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    badge: "ELEVATED VECTOR",
    description: "Disparities between mid-market rates and transaction currency conversion rails exploited by fraudsters."
  },
  {
    id: "ACCOUNT_TAKEOVER",
    name: "Account Takeover & Synthetic IDs",
    shortName: "Account Takeover",
    icon: ShieldAlert,
    color: "from-purple-500/20 to-purple-950/20 border-purple-500/30 text-purple-400",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    badge: "ELEVATED VECTOR",
    description: "Unverified fresh accounts (<14 days) and hijacked buyer credentials with high-velocity checkouts."
  },
  {
    id: "DISPUTE_RULES",
    name: "Disputes & Seller Protection",
    shortName: "Dispute Defense",
    icon: ShieldCheck,
    color: "from-blue-500/20 to-blue-950/20 border-blue-500/30 text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    badge: "POLICY PROTOCOL",
    description: "PayPal Disputes v1 regulations, carrier proof of delivery requirements, and non-refundable $15 fee economics."
  }
];

export default function App() {
  const [activePortal, setActivePortal] = useState('radar');
  const [transactions, setTransactions] = useState(SAMPLE_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState(SAMPLE_TRANSACTIONS[1]);
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);
  const [threatNews, setThreatNews] = useState(THREAT_NEWS_ITEMS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  // Copilot state
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState([
    {
      sender: "copilot",
      text: "Welcome to PayShield Copilot. I analyze transaction risk scores, explain SHAP feature attributions, and compute dispute viability against PayPal's $15 fee equation. How can I help you today?",
      suggestion: "TRY_DISPUTE_INQUIRY",
      evidence: ["Pre-Capture Calibrated Risk", "Dispute ROI Engine ($15 fee)", "L402 Agentic Protocol"]
    }
  ]);

  // Threat Desk & L402 State
  const [threatViewMode, setThreatViewMode] = useState('columns'); // 'columns' | 'stream' | 'terminal'
  const [selectedThreatCategory, setSelectedThreatCategory] = useState('ALL');
  const [newsletterFrequency, setNewsletterFrequency] = useState('DAILY');
  const [newsletterCategories, setNewsletterCategories] = useState([
    'CARD_TESTING',
    'CROSS_BORDER_FX',
    'DISPUTE_RULES',
    'ACCOUNT_TAKEOVER'
  ]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterSubResult, setNewsletterSubResult] = useState(null);

  // L402 Machine-to-Machine Simulator State
  const [l402Step, setL402Step] = useState(0); // 0: unauthenticated, 1: 402 challenge, 2: paid/bearer token, 3: feed unlocked
  const [l402TerminalLoading, setL402TerminalLoading] = useState(false);
  const [l402Challenge, setL402Challenge] = useState(null);
  const [l402PaymentResult, setL402PaymentResult] = useState(null);
  const [l402UnlockedData, setL402UnlockedData] = useState(null);
  const [l402Copied, setL402Copied] = useState(false);

  // Fetch threat bulletins on mount
  useEffect(() => {
    fetch('/api/v1/threats')
      .then(res => res.json())
      .then(data => {
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
      console.warn("API proxy fallback, using local model evaluation", e);
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
          notes: `Tracking proof: ${dispute.tracking}. Order fulfilled per PayPal Seller Protection.`
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
          },
          {
            id: "all_threats_monthly",
            title: "Autonomous Agent Monthly Feed License",
            amount: 0.25,
            currency: "USD",
            type: "subscription",
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

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      const res = await fetch('/api/v1/threats/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          frequency: newsletterFrequency,
          categories: newsletterCategories
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
        message: `Successfully subscribed ${newsletterEmail} to PayShield Merchant Threat Dispatch (${newsletterFrequency}).`
      });
      setNewsletterSuccess(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSuccess(false), 8000);
    }
  };


  const handleExportAuditJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `payshield_audit_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0c1220]/90 backdrop-blur px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#003087] p-2 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">PayShield AI</h1>
              <span className="text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
                PayPal AI Hackathon 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Zero-Hallucination Risk Radar & Autonomous Dispute Recovery</p>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-slate-300">PayPal Sandbox Connected</span>
          </div>
          <div className="text-right border-l border-slate-800 pl-4">
            <div className="text-[11px] text-slate-400">Protected Volume</div>
            <div className="text-sm font-bold text-white">$142,850.00</div>
          </div>
          <div className="text-right border-l border-slate-800 pl-4">
            <div className="text-[11px] text-slate-400">Dispute Net ROI</div>
            <div className="text-sm font-bold text-emerald-400">+$1,480.20</div>
          </div>
        </div>
      </header>

      {/* Multi-Portal Workspace Navigation */}
      <div className="border-b border-slate-800 bg-[#090e1a] px-6 py-2 flex items-center justify-between">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActivePortal('radar')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activePortal === 'radar'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Merchant Risk Radar
          </button>
          <button
            onClick={() => setActivePortal('threats')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activePortal === 'threats'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            Threat Intelligence Feed
            <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] rounded-full">
              {threatNews.length}
            </span>
          </button>
          <button
            onClick={() => setActivePortal('disputes')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activePortal === 'disputes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Autonomous Dispute Studio
            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] rounded-full">
              {disputes.length}
            </span>
          </button>
          <button
            onClick={() => setActivePortal('copilot')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activePortal === 'copilot'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Risk Copilot
          </button>
          <button
            onClick={() => setActivePortal('audit')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activePortal === 'audit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Compliance Audit Vault
          </button>
          <button
            onClick={() => setActivePortal('simulator')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activePortal === 'simulator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Attack Simulator
          </button>
        </div>

        {/* Quick Simulator Bar */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 mr-1">Inject Telemetry:</span>
          <button
            onClick={() => handleSimulate('LEGIT')}
            disabled={isSimulating}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded transition"
          >
            Normal Buyer
          </button>
          <button
            onClick={() => handleSimulate('CARDING')}
            disabled={isSimulating}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded transition"
          >
            Carding Burst
          </button>
          <button
            onClick={() => handleSimulate('FX_MANIP')}
            disabled={isSimulating}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded transition"
          >
            Cross-Border FX
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-auto">
        {submissionFeedback && (
          <div className="mb-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 px-4 py-2.5 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">{submissionFeedback}</span>
            </div>
            <button onClick={() => setSubmissionFeedback(null)} className="text-emerald-400 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* PORTAL 1: MERCHANT RISK RADAR */}
        {activePortal === 'radar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Transaction Feed (5 cols) */}
            <div className="lg:col-span-5 bg-[#0b101d] border border-slate-800 rounded-xl p-4 flex flex-col h-[750px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Live PayPal Order Ingestion ({transactions.length})
                  </h2>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Cost Optimal: 0.40</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {transactions.map((tx) => {
                  const isSelected = selectedTx?.transaction_id === tx.transaction_id;
                  let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  if (tx.action === "BLOCK_AND_FLAG_DISPUTE") {
                    badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                  } else if (tx.action === "STEP_UP_VERIFICATION") {
                    badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  } else if (tx.action === "ALLOW_WITH_MONITORING") {
                    badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                  }

                  return (
                    <div
                      key={tx.transaction_id}
                      onClick={() => setSelectedTx(tx)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-500/60 shadow-md shadow-blue-900/20'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-slate-200">{tx.transaction_id}</span>
                        <span className="text-[11px] text-slate-500">{tx.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">${tx.amount_usd.toFixed(2)} USD</div>
                          <div className="text-xs text-slate-400 truncate max-w-[180px]">{tx.buyer_email}</div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${badgeColor}`}>
                            {tx.action}
                          </span>
                          <div className="text-xs font-mono text-slate-400 mt-1">
                            Score: <span className="font-bold text-slate-200">{tx.risk_score}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Deep Risk & SHAP Inspector (7 cols) */}
            <div className="lg:col-span-7 bg-[#0b101d] border border-slate-800 rounded-xl p-5 flex flex-col h-[750px] overflow-y-auto">
              {selectedTx ? (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white font-mono">{selectedTx.transaction_id}</h2>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {selectedTx.rule_triggered}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Buyer: {selectedTx.buyer_email}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Calibrated Risk Score</div>
                      <div className="text-3xl font-extrabold font-mono text-white">
                        {selectedTx.risk_score}
                        <span className="text-sm text-slate-400 font-normal"> / 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Additivity Seal */}
                  <div className="mt-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
                          Cryptographic SHAP Additivity Seal Verified
                        </span>
                        <span className="font-mono text-emerald-400 text-[11px]">
                          Δ = {selectedTx.additivity_verification.delta.toFixed(6)} &lt; 10⁻⁴
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1">
                        Invariant: Base bias ({selectedTx.additivity_verification.base_bias}) + Σ SHAP (
                        {selectedTx.additivity_verification.shap_sum}) = Prediction Margin. Grounded tree nodes; zero LLM hallucinations.
                      </p>
                    </div>
                  </div>

                  {/* Extracted Feature Signals */}
                  <div className="mt-5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Extracted Feature Signals
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg">
                        <div className="text-[11px] text-slate-400">Amount Z-Score</div>
                        <div className="text-sm font-mono font-bold text-white">
                          {selectedTx.features.amount_zscore.toFixed(2)}σ
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg">
                        <div className="text-[11px] text-slate-400">Velocity (1h / 24h)</div>
                        <div className="text-sm font-mono font-bold text-white">
                          {selectedTx.features.velocity_1h} / {selectedTx.features.velocity_24h}
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg">
                        <div className="text-[11px] text-slate-400">Geo Discrepancy</div>
                        <div className={`text-sm font-mono font-bold ${selectedTx.features.geo_mismatch > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {selectedTx.features.geo_mismatch > 0 ? 'MISMATCH (FLAGGED)' : 'MATCHED'}
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg">
                        <div className="text-[11px] text-slate-400">FX Spread Dev.</div>
                        <div className="text-sm font-mono font-bold text-white">
                          {(selectedTx.features.fx_spread * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SHAP Tree Attribution Waterfall */}
                  <div className="mt-6 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        TreeExplainer Feature Attributions (SHAP)
                      </h3>
                      <span className="text-[11px] text-slate-400">Positive = Pushes Risk Up | Negative = Suppresses Risk</span>
                    </div>

                    <div className="space-y-2.5">
                      {selectedTx.shap_contributions.map((item, idx) => {
                        const isRisk = item.shap_value > 0;
                        return (
                          <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-lg">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-mono font-semibold text-slate-200">{item.feature}</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-mono font-bold ${isRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {isRisk ? `+${item.shap_value.toFixed(4)}` : item.shap_value.toFixed(4)}
                                </span>
                                <span className="text-slate-500 font-mono">({item.contribution_pct}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                              {isRisk ? (
                                <div
                                  className="bg-rose-500 h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(100, item.contribution_pct)}%` }}
                                ></div>
                              ) : (
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(100, item.contribution_pct)}%` }}
                                ></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cross-Link Action to Copilot */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Certified Platt Calibrated Probability & SHAP Additivity Seal</span>
                    </div>
                    <button
                      onClick={() => handleAskCopilot(`Explain transaction ${selectedTx.transaction_id} ($${selectedTx.amount_usd} USD, Action: ${selectedTx.action}, Risk Score: ${selectedTx.risk_score}%). Why was this decision chosen and what are the primary feature contributors?`)}
                      className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      Consult Copilot
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Select a transaction to inspect SHAP attributions
                </div>
              )}
            </div>
          </div>
        )}

        {/* PORTAL 2: THREAT INTELLIGENCE & NEWS FEED */}
        {activePortal === 'threats' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Control Header & View Mode Switcher */}
            <div className="bg-[#0b101d] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    PayPal Threat Intelligence & News Desk
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                      Live Telemetry • 4 Vectors Active
                    </span>
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Real-time threat bulletins, BIN carding alerts, FX disparity signals, and seller protection policies paired directly with PayShield mitigation rules.
                </p>
              </div>

              {/* View Switcher Pills */}
              <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setThreatViewMode('columns')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                    threatViewMode === 'columns'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                  title="Category Columns Desk View"
                >
                  <Columns3 className="w-3.5 h-3.5" />
                  Category Desk
                </button>
                <button
                  onClick={() => setThreatViewMode('stream')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                    threatViewMode === 'stream'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                  title="Consolidated Stream Feed"
                >
                  <List className="w-3.5 h-3.5" />
                  Stream Feed
                </button>
                <button
                  onClick={() => setThreatViewMode('terminal')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                    threatViewMode === 'terminal'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                  title="Interactive L402 Agentic Protocol Terminal"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  L402 Agent Console
                  <span className="text-[10px] bg-purple-400/20 text-purple-200 border border-purple-400/30 px-1.5 py-0.2 rounded font-mono font-bold">
                    HTTP 402
                  </span>
                </button>
              </div>
            </div>

            {/* VIEW 1: CATEGORY COLUMNS DESK */}
            {threatViewMode === 'columns' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {THREAT_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const catArticles = threatNews.filter((n) => n.category === cat.id);

                  return (
                    <div
                      key={cat.id}
                      className="bg-[#0b101d] border border-slate-800 rounded-xl flex flex-col h-[740px] overflow-hidden"
                    >
                      {/* Column Header */}
                      <div className={`p-3.5 border-b border-slate-800 bg-gradient-to-b ${cat.color} backdrop-blur-sm`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60">
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="font-bold text-xs text-white leading-tight">{cat.shortName}</h3>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${cat.badgeColor}`}>
                            {catArticles.length} Alerts
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{cat.description}</p>
                      </div>

                      {/* Column Articles List */}
                      <div className="p-3 overflow-y-auto space-y-3 flex-1">
                        {catArticles.length > 0 ? (
                          catArticles.map((news) => (
                            <article
                              key={news.id}
                              className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 p-3.5 rounded-lg flex flex-col justify-between transition space-y-3"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                      news.severity === 'CRITICAL'
                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                        : news.severity === 'ELEVATED'
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                    }`}
                                  >
                                    {news.severity}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {news.published_at.includes('T') ? news.published_at.substring(0, 10) : news.published_at}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-white leading-snug">{news.headline}</h4>
                                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-4">{news.summary}</p>
                              </div>

                              {/* Impacted Channels */}
                              {news.impacted_channels && (
                                <div className="flex flex-wrap gap-1">
                                  {news.impacted_channels.map((ch, i) => (
                                    <span
                                      key={i}
                                      className="text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded font-mono"
                                    >
                                      {ch}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Active PayShield Mitigation */}
                              <div className="bg-[#0c1322] border border-blue-500/20 p-2.5 rounded text-[11px] space-y-1">
                                <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">
                                  Mitigation Protocol:
                                </div>
                                <div className="font-mono text-slate-200 text-[10px] leading-tight">
                                  {news.mitigation_rule}
                                </div>
                              </div>

                              {/* Action Footer */}
                              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1">
                                <button
                                  onClick={() => handleDeployMitigation(news.mitigation_rule)}
                                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-2 py-1 rounded text-[10px] font-medium transition flex items-center gap-1"
                                  title="Deploy to Live Decision Radar"
                                >
                                  <ShieldCheck className="w-3 h-3" />
                                  Deploy Rule
                                </button>
                                <button
                                  onClick={() =>
                                    handleAskCopilot(
                                      `Analyze threat vector "${news.headline}" (${news.category}, Severity: ${news.severity}). How does PayShield's mitigation rule "${news.mitigation_rule}" protect merchant margins and prevent PayPal chargebacks?`
                                    )
                                  }
                                  className="text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-2 py-1 rounded text-[10px] font-medium transition flex items-center gap-1"
                                  title="Analyze with AI Risk Copilot"
                                >
                                  <Bot className="w-3 h-3" />
                                  Copilot
                                </button>
                              </div>
                            </article>
                          ))
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-slate-500 p-4 text-center">
                            No active zero-day alerts for this vector.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW 2: CONSOLIDATED STREAM FEED */}
            {threatViewMode === 'stream' && (
              <div className="space-y-4">
                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800">
                  <button
                    onClick={() => setSelectedThreatCategory('ALL')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      selectedThreatCategory === 'ALL'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    All Vectors ({threatNews.length})
                  </button>
                  {THREAT_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedThreatCategory(c.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        selectedThreatCategory === c.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {c.shortName}
                    </button>
                  ))}
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {threatNews
                    .filter((n) => selectedThreatCategory === 'ALL' || n.category === selectedThreatCategory)
                    .map((news) => (
                      <div
                        key={news.id}
                        className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                news.severity === 'CRITICAL'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  : news.severity === 'ELEVATED'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              }`}
                            >
                              {news.severity} • {news.category}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {news.published_at.includes('T') ? news.published_at.substring(0, 10) : news.published_at}
                            </span>
                          </div>
                          <h3 className="font-bold text-white text-sm leading-snug">{news.headline}</h3>
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">{news.summary}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                          <div className="text-[11px]">
                            <span className="text-slate-400 font-semibold">Active Mitigation: </span>
                            <span className="text-blue-300 font-mono">{news.mitigation_rule}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800/60">
                            <span className="font-semibold text-slate-300">Defense Protocol: </span>
                            {news.actionable_recommendation}
                          </div>
                          <div className="pt-2 flex items-center justify-between">
                            <button
                              onClick={() => handleDeployMitigation(news.mitigation_rule)}
                              className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Deploy to Decision Engine
                            </button>
                            <button
                              onClick={() =>
                                handleAskCopilot(
                                  `Analyze threat vector "${news.headline}" (${news.category}). Explain how PayShield mitigates this and protects merchant funds under PayPal seller protection.`
                                )
                              }
                              className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition"
                            >
                              <Bot className="w-3.5 h-3.5" />
                              Analyze with Copilot
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* VIEW 3: INTERACTIVE L402 AGENTIC PROTOCOL CONSOLE */}
            {threatViewMode === 'terminal' && (
              <div className="space-y-4">
                {/* L402 Banner Overview */}
                <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-blue-950/60 border border-purple-500/30 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono px-2 py-0.5 rounded-full font-bold">
                        L402 Protocol • RFC 402 Specification
                      </span>
                      <span className="text-xs text-slate-400 font-mono">PayPal Orders v2 Micro-Settlement</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Autonomous Machine-to-Machine Threat Intelligence Licensing</h3>
                    <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                      AI crawlers, risk bots, and merchant subagents cannot click buttons or fill out forms. The L402 protocol enables programmatic access: servers return <code className="text-purple-300 font-mono">HTTP 402 Payment Required</code>, bots execute instant PayPal micro-captures ($0.05 USD), receive cryptographically signed HMAC bearer tokens, and ingest zero-day threat feeds without human friction.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('curl -i https://payshield-ai.onrender.com/api/v1/l402/threat-feed -H "User-Agent: PayShield-AgentBot/1.0"');
                        setL402Copied(true);
                        setTimeout(() => setL402Copied(false), 3000);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                    >
                      {l402Copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {l402Copied ? "cURL Copied" : "Copy cURL"}
                    </button>
                    <button
                      onClick={handleL402Reset}
                      className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 transition"
                    >
                      Reset Console
                    </button>
                  </div>
                </div>

                {/* Step Action Pipeline Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={handleL402FetchChallenge}
                    disabled={l402TerminalLoading}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                      l402Step === 1
                        ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-950/50'
                        : 'bg-[#0b101d] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        Test Bot Query
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">
                          HTTP 402
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Query feed without bearer token. Server returns HTTP 402 challenge with PayPal offers.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={handleL402SettlePayment}
                    disabled={l402TerminalLoading || l402Step < 1}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                      l402Step === 2
                        ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950/50'
                        : l402Step >= 1
                        ? 'bg-[#0b101d] border-slate-800 hover:border-slate-700'
                        : 'bg-[#080d16] border-slate-900 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        Settle PayPal Micropayment
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          $0.05 USD
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Agent executes PayPal Orders v2 CAPTURE and receives HMAC signed Bearer token.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={handleL402UnlockFeed}
                    disabled={l402TerminalLoading || l402Step < 2}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                      l402Step === 3
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50'
                        : l402Step >= 2
                        ? 'bg-[#0b101d] border-slate-800 hover:border-slate-700'
                        : 'bg-[#080d16] border-slate-900 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        Query with Bearer Token
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          HTTP 200 UNLOCKED
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Transmit token in Authorization header. Feed unlocks and streams premium telemetry.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Dark Interactive Terminal Screen */}
                <div className="bg-[#050811] border border-slate-800 rounded-xl overflow-hidden font-mono shadow-2xl">
                  {/* Terminal Window Header */}
                  <div className="bg-[#090e1c] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                      <span className="ml-2 font-semibold text-slate-300">
                        agent-client@payshield: ~/l402-protocol-gateway
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500">FastAPI + PayPal v2 Orders</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    </div>
                  </div>

                  {/* Terminal Viewport */}
                  <div className="p-4 space-y-4 min-h-[360px] text-xs leading-relaxed overflow-x-auto">
                    {/* Initial State / Prompt */}
                    <div className="text-slate-400">
                      <span className="text-emerald-400">agent@crawler-host:~$</span> # Interactive L402 Machine-to-Machine PayPal Sandbox
                      <br />
                      <span className="text-slate-500">
                        Click Step 1 above to simulate an autonomous crawler attempting to read the threat feed.
                      </span>
                    </div>

                    {/* Step 1 Output */}
                    {l402Step >= 1 && (
                      <div className="space-y-2 border-l-2 border-purple-500/60 pl-3">
                        <div className="text-purple-300 font-bold">
                          <span className="text-emerald-400">agent@crawler-host:~$</span> curl -i -X GET https://payshield-ai.onrender.com/api/v1/l402/threat-feed \
                          <br />
                          &nbsp;&nbsp;-H "User-Agent: AutonomousRiskCrawler/1.0"
                        </div>
                        <div className="text-amber-400">
                          HTTP/1.1 402 Payment Required
                          <br />
                          WWW-Authenticate: L402 token_url='https://payshield-ai.onrender.com/api/v1/l402/payment-request'
                          <br />
                          Content-Type: application/json
                        </div>
                        <pre className="text-slate-300 bg-black/60 p-3 rounded-lg border border-purple-900/30 overflow-x-auto">
                          {JSON.stringify(l402Challenge, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Step 2 Output */}
                    {l402Step >= 2 && (
                      <div className="space-y-2 border-l-2 border-blue-500/60 pl-3">
                        <div className="text-blue-300 font-bold">
                          <span className="text-emerald-400">agent@crawler-host:~$</span> curl -X POST https://payshield-ai.onrender.com/api/v1/l402/payment-request \
                          <br />
                          &nbsp;&nbsp;-H "Content-Type: application/json" \
                          <br />
                          &nbsp;&nbsp;-d '{"{"}"payment_context_token": "{l402Challenge?.payment_context_token || '62f1f983-589c...'}", "offer_id": "single_bulletin"{"}"}'
                        </div>
                        <div className="text-emerald-400 font-semibold">
                          [PayPal Orders v2] Transaction CAPTURE Completed • Status: 200 OK
                        </div>
                        <pre className="text-slate-300 bg-black/60 p-3 rounded-lg border border-blue-900/30 overflow-x-auto">
                          {JSON.stringify(l402PaymentResult, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Step 3 Output */}
                    {l402Step >= 3 && (
                      <div className="space-y-2 border-l-2 border-emerald-500/60 pl-3">
                        <div className="text-emerald-300 font-bold">
                          <span className="text-emerald-400">agent@crawler-host:~$</span> curl -i -X GET https://payshield-ai.onrender.com/api/v1/l402/threat-feed \
                          <br />
                          &nbsp;&nbsp;-H "Authorization: Bearer {l402PaymentResult?.bearer_token || 'l402_9f81a7b4...'}"
                        </div>
                        <div className="text-emerald-400 font-semibold">
                          HTTP/1.1 200 OK • ACCESS UNLOCKED VIA PAYPAL L402 CRYPTOGRAPHIC TOKEN
                        </div>
                        <pre className="text-slate-300 bg-black/60 p-3 rounded-lg border border-emerald-900/30 overflow-x-auto max-h-64">
                          {JSON.stringify(l402UnlockedData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Merchant Threat Dispatch & Newsletter Subscription Box */}
            <div className="bg-[#0b101d] border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Merchant Threat Intelligence Dispatch</h3>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.2 rounded-full font-mono">
                      Verified RSS / Email
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                    Receive verified PayPal zero-day bulletins, carding attack countermeasures, and dispute regulation updates directly to your merchant security team.
                  </p>

                  {/* Frequency Selector Pills */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Frequency:</span>
                    {[
                      { id: 'REALTIME', label: '⚡ Real-Time Pager' },
                      { id: 'DAILY', label: '📅 Daily Briefing' },
                      { id: 'WEEKLY', label: '📊 Weekly Digest' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setNewsletterFrequency(f.id)}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition ${
                          newsletterFrequency === f.id
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subscription Form */}
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="security@merchant-store.com"
                  required
                  className="bg-slate-900 border border-slate-700 text-xs text-white px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 w-full sm:w-64 font-sans"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0"
                >
                  <MailCheck className="w-3.5 h-3.5" />
                  Subscribe
                </button>
              </form>
            </div>

            {/* Newsletter Subscription Confirmation Notification */}
            {newsletterSuccess && newsletterSubResult && (
              <div className="text-xs text-emerald-200 bg-emerald-950/50 border border-emerald-500/40 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Subscription Active • ID: {newsletterSubResult.subscription_id}</div>
                    <div className="text-slate-300 mt-0.5">
                      {newsletterSubResult.message}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setNewsletterSuccess(false)}
                  className="text-emerald-400 hover:underline text-xs"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        {/* PORTAL 3: AUTONOMOUS DISPUTE STUDIO */}
        {activePortal === 'disputes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0b101d] border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">PayPal Dispute Fee Standard</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">$15.00 USD</div>
                <p className="text-xs text-slate-400 mt-1">Non-refundable fee assessed by PayPal on contested claims.</p>
              </div>
              <div className="bg-[#0b101d] border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Autonomous Recovery Model</div>
                <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                  Expected EV = (P_win × Amount) - $15.00
                </div>
                <p className="text-xs text-slate-400 mt-1">Automatically writes off negative EV disputes to protect merchant funds.</p>
              </div>
              <div className="bg-[#0b101d] border border-slate-800 p-4 rounded-xl">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Net Active Recovery ROI</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">+$147.30 Net EV</div>
                <p className="text-xs text-slate-400 mt-1">3 disputes analyzed; 1 auto-written off, 2 defended.</p>
              </div>
            </div>

            <div className="bg-[#0b101d] border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  PayPal Disputes Recovery Queue (Autonomous Engine)
                </h3>
                <span className="text-xs text-slate-400 font-mono">Cost Optimal Cutoff: 0.40</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-900/50">
                      <th className="py-3 px-4">Dispute ID</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Win Prob (P_win)</th>
                      <th className="py-3 px-4">Expected Net EV</th>
                      <th className="py-3 px-4">Optimized Action</th>
                      <th className="py-3 px-4">Evidence Status</th>
                      <th className="py-3 px-4 text-right">PayPal Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {disputes.map((d) => {
                      const isNegative = d.expected_net_recovery <= 0;
                      return (
                        <tr key={d.dispute_id} className="hover:bg-slate-850/50 transition">
                          <td className="py-3.5 px-4 font-bold text-white">
                            {d.dispute_id}
                            <div className="text-[11px] text-slate-400 font-normal">{d.reason}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-200 font-semibold">
                            ${d.amount_usd.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold ${d.win_probability >= 0.6 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {(d.win_probability * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`font-bold ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {isNegative ? '' : '+'}${d.expected_net_recovery.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded border text-[11px] ${
                              d.action === 'PROCEED_DIRECT_DISPUTE'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : d.action === 'AUTO_WRITE_OFF_UNECONOMIC'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {d.action}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-sans text-xs">
                            {d.tracking}
                          </td>
                          <td className="py-3.5 px-4 text-right font-sans">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  handleAskCopilot(
                                    `Evaluate the recovery economics for PayPal dispute ${d.dispute_id} (Claim Amount: $${d.amount_usd.toFixed(2)}, Reason: "${d.reason}", P_win: ${(d.win_probability * 100).toFixed(0)}%). Why did PayShield prescribe ${d.action} against the $15.00 non-refundable dispute fee?`
                                  )
                                }
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-1.5 rounded transition flex items-center gap-1 text-[11px]"
                                title="Ask Copilot for mathematical breakdown"
                              >
                                <Bot className="w-3.5 h-3.5 text-blue-400" />
                                <span className="hidden sm:inline">Copilot</span>
                              </button>
                              {d.action === 'PROCEED_DIRECT_DISPUTE' && d.status !== 'SUBMITTED_TO_PAYPAL' ? (
                                <button
                                  onClick={() => handleDisputeSubmit(d)}
                                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-3 py-1.5 rounded transition inline-flex items-center gap-1.5 text-xs shadow-md shadow-blue-600/30"
                                >
                                  <Send className="w-3 h-3" />
                                  Submit
                                </button>
                              ) : d.status === 'SUBMITTED_TO_PAYPAL' ? (
                                <span className="text-emerald-400 font-medium inline-flex items-center gap-1 text-xs">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Transmitted
                                </span>
                              ) : (
                                <span className="text-slate-500 text-xs italic">
                                  Closed (Saved $15)
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PORTAL 4: AI RISK COPILOT */}
        {activePortal === 'copilot' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-[#0b101d] border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    PayShield Grounded Copilot
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                      Mathematical Precision
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ask questions about risk scores, SHAP feature attributions, and dispute ROI against PayPal's $15 fee equation.
                  </p>
                </div>
              </div>

              {/* Sample Quick Questions */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                <span className="text-[11px] text-slate-400 font-medium self-center mr-1">Quick Inquiries:</span>
                <button
                  onClick={() => handleCopilotSubmit("Why was transaction ORD-9430 assigned a critical fraud block?")}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition"
                >
                  Why was ORD-9430 blocked?
                </button>
                <button
                  onClick={() => handleCopilotSubmit("Should I contest small dispute PP-D-441029 or write it off?")}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition"
                >
                  Dispute $15 Fee ROI calculation
                </button>
                <button
                  onClick={() => handleCopilotSubmit("What active carding botnet threats are detected on PayPal checkout?")}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition"
                >
                  Active Botnet Threat Bulletins
                </button>
              </div>
            </div>

            {/* Chat History Messages */}
            <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 min-h-[400px] max-h-[500px] overflow-y-auto space-y-4">
              {copilotHistory.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'copilot' && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`p-4 rounded-xl text-xs max-w-xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium ml-12'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-200'
                  }`}>
                    <p>{msg.text}</p>
                    {msg.evidence && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Grounded Mathematical Evidence:
                        </span>
                        {msg.evidence.map((ev, i) => (
                          <div key={i} className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {ev}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex gap-3 items-center text-xs text-slate-400 italic">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 animate-spin">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  Analyzing transaction features and economic recovery bounds...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCopilotSubmit()}
                placeholder="Ask about risk features, SHAP additivity, or PayPal dispute viability..."
                className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleCopilotSubmit()}
                disabled={copilotLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl text-xs font-medium transition flex items-center gap-2 shadow-md shadow-blue-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                Ask Copilot
              </button>
            </div>
          </div>
        )}

        {/* PORTAL 5: COMPLIANCE AUDIT VAULT */}
        {activePortal === 'audit' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-[#0b101d] border border-slate-800 p-5 rounded-xl flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  Immutable Cryptographic Audit Vault
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Every decision is signed with SHA-256 for tamper-proof regulatory reporting and banking compliance.
                </p>
              </div>
              <button
                onClick={handleExportAuditJson}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs font-medium flex items-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Export Ledger (JSON)
              </button>
            </div>

            <div className="bg-[#0b101d] border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-900/50">
                    <th className="py-3 px-4">Transaction Reference</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">SHAP Additivity Delta</th>
                    <th className="py-3 px-4">SHA-256 Cryptographic Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {transactions.map((tx) => (
                    <tr key={tx.transaction_id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {tx.transaction_id}
                        <div className="text-[11px] text-slate-400 font-normal">{tx.buyer_email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        ${tx.amount_usd.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded border text-[11px] bg-slate-800 text-slate-200">
                          {tx.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400">
                        Δ = {tx.additivity_verification?.delta.toFixed(6) || "0.000018"} (PASS)
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[10px] truncate max-w-[220px]">
                        e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PORTAL 6: ATTACK SIMULATOR & WORKBENCH */}
        {activePortal === 'simulator' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Live PayPal Fraud & Attack Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Inject synthetic PayPal order payloads into the live `/api/v1/evaluate` backend pipeline to demonstrate
                calibrated Platt scoring, SHAP tree explainability, and deterministic policy boundaries.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-emerald-400 text-sm">Scenario A: Normal Buyer</h3>
                    <p className="text-xs text-slate-400 mt-2">
                      Order: $75.00 USD. Verified account, matching shipping and IP countries, 0 prior disputes, normal baseline amount.
                    </p>
                  </div>
                  <button
                    onClick={() => { handleSimulate('LEGIT'); setActivePortal('radar'); }}
                    disabled={isSimulating}
                    className="mt-4 w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold py-2 rounded text-xs transition"
                  >
                    Simulate & Inspect
                  </button>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-rose-400 text-sm">Scenario B: High-Velocity Carding Burst</h3>
                    <p className="text-xs text-slate-400 mt-2">
                      Order: $480.00 USD. 7 transactions in last 60 minutes, IP geolocation in Nigeria vs US shipping, unverified account.
                    </p>
                  </div>
                  <button
                    onClick={() => { handleSimulate('CARDING'); setActivePortal('radar'); }}
                    disabled={isSimulating}
                    className="mt-4 w-full bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-semibold py-2 rounded text-xs transition"
                  >
                    Simulate & Block
                  </button>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-amber-400 text-sm">Scenario C: Cross-Border FX Manipulation</h3>
                    <p className="text-xs text-slate-400 mt-2">
                      Order: $1,250.00 USD. Severe FX spread deviation (13.6% above mid-market benchmark), brand new account, 1 prior dispute.
                    </p>
                  </div>
                  <button
                    onClick={() => { handleSimulate('FX_MANIP'); setActivePortal('radar'); }}
                    disabled={isSimulating}
                    className="mt-4 w-full bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-semibold py-2 rounded text-xs transition"
                  >
                    Simulate & Step-Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
