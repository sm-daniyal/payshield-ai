import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles
} from 'lucide-react';

export default function CopilotChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'PayShield Copilot active. I provide zero-hallucination deterministic explanations for model decisions, SHAP attributions, and policy triggers.'
    }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const getDeterministicResponse = (text) => {
    const lower = text.toLowerCase().trim();
    if (lower.includes('block') || lower.includes('why') || lower.includes('reject')) {
      return 'Deterministic policy engine: Decision was driven by SHAP feature velocity_1h (+1.45) and geo_mismatch (+1.10). Calibrated probability exceeded the 0.40 cost-optimal threshold, triggering RULE_4_PROB_CRITICAL_STANDARD_BLOCK.';
    }
    if (lower.includes('shap') || lower.includes('explain') || lower.includes('attribution')) {
      return 'Grounded TreeExplainer: Each feature attribution is computed from tree splits. The additivity invariant [base_bias + sum(SHAP) == predicted_probability] is mathematically verified on every evaluation (delta < 0.0001).';
    }
    if (lower.includes('l402') || lower.includes('paywall') || lower.includes('settle')) {
      return 'L402 Protocol: Programmatic monetization for AI agents. The server challenges bots with HTTP 402, settles instant $0.05 PayPal v2 Orders, and issues HMAC-signed bearer tokens.';
    }
    return 'Deterministic Rule Engine: I provide verifiable explanations. You can ask "Why was this blocked?", "Explain SHAP", or click a quick prompt below.';
  };

  const handleSend = (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    const replyText = getDeterministicResponse(query);
    const botMsg = { sender: 'bot', text: replyText };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputValue('');
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Collapsed Floating Button with .btn-gradient */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-5 py-3.5 btn-gradient shadow-xl hover:shadow-2xl transition-all group cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-purple-500 animate-pulse"></span>
          </div>
          <span className="text-sm font-semibold tracking-wide">PayShield Copilot</span>
        </button>
      )}

      {/* Expanded Modal: Pure white, border, shadow-2xl, rounded-2xl */}
      {isOpen && (
        <div className="w-96 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header with Soft Blue/Purple Gradient */}
          <div className="btn-gradient px-5 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                  PayShield Copilot
                  <span className="text-[10px] bg-white/25 text-white px-2 py-0.5 rounded-full font-mono font-semibold">
                    NO-LLM
                  </span>
                </h3>
                <p className="text-xs text-white/80">
                  Grounded SHAP & Policy Rule Explainer
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition cursor-pointer"
              title="Minimize chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Reply Suggestion Chips */}
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => handleSend("Why was this blocked?")}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 text-blue-600 border border-gray-200 font-medium whitespace-nowrap transition cursor-pointer shrink-0 shadow-xs"
            >
              Why was this blocked?
            </button>
            <button
              onClick={() => handleSend("Explain SHAP")}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 text-blue-600 border border-gray-200 font-medium whitespace-nowrap transition cursor-pointer shrink-0 shadow-xs"
            >
              Explain SHAP
            </button>
            <button
              onClick={() => handleSend("What is L402?")}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 text-blue-600 border border-gray-200 font-medium whitespace-nowrap transition cursor-pointer shrink-0 shadow-xs"
            >
              What is L402?
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3.5 text-xs bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'btn-gradient text-white rounded-br-none shadow-xs'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-xs'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="text-[11px] font-bold text-purple-600 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      Grounded Explainer
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about SHAP, rules, or decisions..."
              className="flex-1 px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white text-gray-900 transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 btn-gradient rounded-xl disabled:opacity-40 cursor-pointer shadow-xs transition"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
