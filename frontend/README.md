# PayShield AI Frontend Blueprint

## System Overview
Modern, responsive single-page merchant dashboard built with React 19, Vite, and Tailwind CSS. Replaces default boilerplate with an institutional-grade financial monitoring console featuring real-time SHAP explainability charts, L402 machine-payment simulation, and cryptographic audit inspection.

## Subdirectories & System Boundaries
- [src/components](./src/components/README.md): Core dashboard modules (RiskRadar, L402Console, DisputeStudio, AuditVault).
- [src/assets](./src/assets): Static brand assets, architectural diagrams, and illustrations.
- [src/data](./src/data): Mock datasets and transaction presets for offline demonstration.

## Global Invariants
- React 19 Strict Mode: High-performance concurrent rendering without deprecated lifecycle methods.
- Zero Emojis Policy: Codebase, UI text, and documentation maintain a professional fintech aesthetic.
- Design System: Dark-slate UI palette (`bg-slate-900`, `border-slate-800`) with high-contrast accessibility compliance.

## System Verification
- Run: `npm run build`
