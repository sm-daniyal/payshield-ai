# Frontend Dashboard Components Contract

## Overview
React 19 presentation and interactive simulation components providing merchants and hackathon judges with a real-time command center for transaction risk scoring, machine-payment tollgates, and dispute recovery.

## Interface
- `RiskRadar.jsx`: Pre-transaction trust scoring view. Features transaction injection simulator, preset scenarios (Normal, Velocity Spurt, Carding Bot, High-Value Cross-Border), live 0-100 gauge, and dynamic horizontal SHAP attribution waterfall.
- `L402Console.jsx`: Interactive terminal simulating HTTP 402 challenge flow. Allows triggering unauthenticated request, executing PayPal Orders v2 sandbox capture, receiving HMAC-SHA256 bearer token, and unlocking live threat intelligence feed.
- `DisputeStudio.jsx`: Autonomous dispute recovery management. Renders active claims, dynamic Expected Value calculations ($EV = P_{\text{win}} \times \text{Amount} - \text{Fee}$), auto-concede badges, and one-click evidence dossier transmission to PayPal Disputes v1.
- `AuditVault.jsx`: Cryptographic audit log inspector. Displays real-time transaction stream, SHA-256 hash chains, block verification badges, and raw JSON telemetry inspector.
- `CopilotChat.jsx`: Floating merchant copilot providing contextual assistance and rule explanations.
- `LandingPage.jsx`: Public landing page showcasing value proposition, architectural highlights, and live stats.
- `Navbar.jsx` & `Sidebar.jsx`: Global navigation and module routing.

## Invariants
- Zero Emojis: All UI badges, labels, and text adhere strictly to professional fintech standards.
- Visual Grounding: SHAP feature bars are dynamically colored based on sign (red for risk increase, green for risk reduction).
- Synchronized State: Simulated transactions instantly propagate to the Audit Vault.

## Side Effects
- Asynchronous HTTP fetches to backend REST endpoints (`/api/v1/*`).

## Verification
- Run: `npm run build`
