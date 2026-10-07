# PathBack — Finding a safer path back home.
### A Consent-First Multimodal AI Platform for Missing-Person Investigation Support

```
   ██████╗  █████╗ ████████╗██╗  ██╗██████╗  █████╗  ██████╗██╗  ██╗
   ██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
   ██████╔╝███████║   ██║   ███████║██████╔╝███████║██║     █████╔╝ 
   ██╔═══╝ ██╔══██║   ██║   ██╔══██║██╔══██╗██╔══██║██║     ██╔═██╗ 
   ██║     ██║  ██║   ██║   ██║  ██║██████╔╝██║  ██║╚██████╗██║  ██╗
   ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
   Finding a safer path back home.
```

> **Tagline:** **Finding a safer path back home.**
> - **A safer path** between missing individuals and their families.
> - **A safer path** between fragmented records and actionable intelligence.
> - **A safer path** between multimodal AI recommendations and human investigator verification.
> - **A safer path** ensuring finding someone does not automatically mean exposing someone.

---

## 🏆 Hackathon Alignment & Primary Category

- **Primary Category:** **PS-16 — Multimodal AI**
- **Supporting Capabilities:**
  - **PS-3 Computer Vision & Visual Intelligence** (Age-Aware biological appearance analysis, coarse visual descriptors)
  - **PS-5 Intelligent Document Processing** (Extraction & summarization of police FIRs, hospital records, family intake records)
  - **PS-8 Decision Intelligence** (Multi-signal lead prioritization, 6-signal cross-case pattern clustering, risk triage)
  - **PS-13 AI Security, Privacy & Trust** (The Consent Wall, exact coordinate redaction, cryptographic audit ledger, anti-fraud perceptual hashing)

---

## 🌟 The Core Innovation: The Consent Wall

> ### *"Finding someone does not automatically mean exposing someone."*

Traditional missing-person platforms often function as unrestricted public face-search tools. This poses catastrophic risks to vulnerable individuals who may have fled domestic abuse, violent households, or human trafficking.

**Pathback enforces a strict 9-stage Consent Lifecycle:**
1. **Not Yet Located**
2. **Located, Identity Pending**
3. **Identity Verified, Consent Pending** *(The Consent Wall is actively raised; all coordinates, phone numbers, and addresses are locked)*
4. **Limited Disclosure Approved** *(Welfare confirmation without physical address)*
5. **Family Contact Approved** *(Mediated platform communication approved)*
6. **Restricted Disclosure** *(Partial communication; specific parties excluded)*
7. **Do Not Disclose** *(Subject declines reunification; authorities confirm safety; whereabouts permanently sealed)*
8. **Consent Withdrawn** *(Consent revoked at any time)*
9. **Reunification Supported** *(Safe, mutually consented reunification supported)*

---

## 🔬 Multimodal AI Architecture (Powered by Anthropic Claude)

Pathback implements a dedicated backend AI service layer using the official Anthropic Claude SDK (`@anthropic-ai/sdk`), backed by strict **Zod validation schemas** and deterministic fallback models for zero-setup execution:

```
                          ┌──────────────────────────┐
                          │   Multimodal Ingestion   │
                          │ Images, PDFs, Voice, CCTV│
                          └─────────────┬────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  Case Summary Engine │     │ Age-Aware Appearance │     │   Sighting Analysis  │
│  Milestones & Gaps   │     │ Maturation Modeling  │     │ Lead Scoring (0-100) │
└──────────┬───────────┘     └──────────┬───────────┘     └──────────┬───────────┘
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │   6-Signal Pattern Engine   │
                         │ Cross-Case Corridors & Hash │
                         └──────────────┬──────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │  Human Investigator Review  │
                         │    (Mandatory Human Gate)   │
                         └──────────────┬──────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │      THE CONSENT WALL       │
                         │ Autonomy & Redacted Comms   │
                         └─────────────────────────────┘
```

### 1. Case Summary Engine
Ingests intake records, police reports, and timeline events to generate an executive summary, identify critical missing information gaps (e.g. transit CCTV windows), and suggest initial review protocols.

### 2. Age-Aware Appearance Analysis
Analyzes biological maturation over elapsed missing years:
- **Stable Cranial Landmark Invariants:** Inter-pupillary distance, orbital frame geometry, collarbone marks, ear lobe morphology.
- **Changeable Confounders:** Hairstyle changes, facial hair, posture, weight variations, eyewear.
- *Strict Rule:* Never promises an exact photographic prediction. Always includes biological uncertainty statements.

### 3. Sighting Comparative Lead Engine
Evaluates submitted sightings against missing-person attributes using an explainable multi-signal lead score (0–100):
- Coarse appearance, age compatibility, spatial proximity, timeline bracket, attire consistency, and source reliability.
- **Clear Labels:** *Low Relevance*, *Possible Lead*, *High Relevance*, *Human Verification Required*.
- *Strict Rule:* Never outputs *"Confirmed Match"* or *"Same Person Detected"*.

### 4. Decision-Intelligence Risk Engine
Combines deterministic statutory rules with AI reasoning to classify cases into **NORMAL**, **HIGH**, or **CRITICAL** risk based on age (<12, <18, >65), medical vulnerabilities (Alzheimer's, insulin dependency), and abduction circumstances.

### 5. Cross-Case 6-Signal Pattern Recognition Engine
Discovers emerging transit corridors and recurring reports across multiple cases with transparent mathematical weighting:
- **Geographic Similarity (30%)** — Neighborhood and transit node clustering.
- **Timeline Similarity (20%)** — Temporal windows (e.g. 48-hour or 9-day active clusters).
- **Description Similarity (20%)** — Distinguishing witness traits.
- **Coarse Visual Similarity (15%)** — Probabilistic age and morphological compatibility.
- **Clothing Similarity (10%)** — Garment and color correlation.
- **Duplicate Report Evidence (5%)** — Perceptual image difference hashing (dHash) to flag reposted images without biometric facial searching.

---

## ⚖️ Responsible AI Governance Framework

| Approved Terminology | Strictly Prohibited Language |
| :--- | :--- |
| **Potential Lead** | ❌ Confirmed Identity by AI |
| **Potentially Related Reports** | ❌ Guaranteed Match |
| **AI-Assisted Analysis** | ❌ Same Person Detected |
| **Human Verification Required** | ❌ Automatic Reunification |
| **Consent Pending** | ❌ Autonomous Contact Disclosure |
| **Restricted Information** | ❌ Public Coordinate Exposure |

---

## 👥 Role-Based Access Control (RBAC)

1. **Public Reporter:**
   - Submit potential sightings with photos, approximate neighborhood, and voice recordings.
   - Exact case coordinates and investigator notes are completely hidden.
2. **Family Member:**
   - Register and manage authorized cases.
   - Upload evidence artifacts.
   - View approved leads and communicate safely through the mediated case channel.
3. **Investigator:**
   - Full access to assigned cases, evidence artifacts, and transit corridor clusters.
   - Execute AI engines (Summary, Age Progression, Risk, Multimodal Corridors).
   - Review and verify/reject sightings in the human review queue.
   - Manage risk priority overrides with mandatory logged justifications.
4. **Administrator:**
   - System telemetry and user role governance.
   - Anti-fraud queue (duplicate image collisions, rapid velocity flood suppression).
   - Tamper-evident cryptographic audit trail inspector.

---

## 🧪 Pre-Seeded Demonstration Dataset

The platform seeds a realistic synthetic demonstration dataset out-of-the-box:

### 🔑 Demo Accounts (Quick 1-Click Evaluation Bar included in UI)

| Role | Name | Phone Number | Password | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Sarah Jenkins | `+15550000001` | `Admin@123` | Governance, Audit Ledger, Fraud Flags, User Management |
| **Investigator** | Inspector Maya Sen (`INV-4402`) | `+15550000002` | `Investigator@123` | AI Engines, Pattern Clusters, Review Queue, Consent Wall |
| **Family Member** | Sunita Sharma | `+15550000003` | `Family@123` | Case Monitor, Sighting Review, Secure Messaging |
| **Public Reporter** | Rahul Verma | `+15550000004` | `Reporter@123` | Sighting Submission, Voice Speech-to-Text |

### 📁 Synthetic Cases
1. **`SET-2026-001` — Aarav Sharma (Age 16, High Risk):** Missing 9 days ago near Central Railway Station. Attire: Navy blue button-up shirt, dark trousers.
2. **`SET-2026-002` — Priya Patel (Age 24, Normal Priority):** Missing 18 days ago near University Metro. Attire: Yellow kurti, blue denim.
3. **`SET-2026-003` — Meera Das (Age 72, Critical Risk):** Located at community shelter; **Identity Verified, Consent Pending** status active.

### 📍 Synthetic Sightings & Clusters
- **`S-101`:** Platform 4 transit sighting (Navy shirt, charcoal trousers).
- **`S-102`:** West Bus Bay sighting (2.1 km transit corridor connection).
- **`S-103`:** Duplicate upload of S-101 image (Perceptual hash match flag).
- **`S-104`:** Visually similar but unrelated report (conflicting orange hoodie).
- **`S-105`:** Shelter intake report for Meera Das.
- **`CLUST-CENTRAL-01`:** Central Railway Station & Transit Corridor Reports (Relevance: 82/100).

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite 6, TypeScript, Tailwind CSS, Recharts, Lucide React, Axios, React Hook Form, Zod.
- **Backend:** Node.js, Express.js, TypeScript, Mongoose, MongoDB (with automatic in-memory fallback), JWT, bcryptjs, Zod, Multer, Helmet, express-rate-limit.
- **Multimodal AI:** Anthropic Claude 3.7 Sonnet (`@anthropic-ai/sdk`) with deterministic fallback engines.
- **File Storage:** Storage service abstraction with local storage implementation and Cloudinary deployment hooks.

---

## 🚀 Rapid Local Setup Guide

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Step 1: Install Dependencies
```bash
# In the project root:
npm run install:all
```

### Step 2: Configure Environment
Copy `.env.example` in `backend/.env`:
```bash
# Backend runs out-of-the-box with zero configuration using in-memory Mongo fallback!
# If you have MongoDB Atlas, you can optionally set MONGODB_URI in backend/.env
# If you have an Anthropic API Key, set ANTHROPIC_API_KEY in backend/.env
```

### Step 3: Start the Backend & Frontend Servers
```bash
# Terminal 1: Backend Server (Port 5000)
npm run dev:backend

# Terminal 2: Frontend Client (Port 3000)
npm run dev:frontend
```

Open your browser at **`http://localhost:3000`**. Use the **1-Click Demo Evaluation Bar** at the top to instantly explore the platform as any role!

---

## 🧭 Complete 3–5 Minute Evaluation Flow

1. **Landing Page:** Review the Pathback concept, Responsible AI rules, and category alignment.
2. **1-Click Login:** Click **"Investigator"** on the top bar (Inspector Maya Sen).
3. **Operational Dashboard:** Inspect Recharts analytics (Risk Distribution, Case Status, Sighting Volume).
4. **Open Case File:** Click into `SET-2026-001` (Aarav Sharma). Notice how exact coordinate data is protected.
5. **Run AI Suite:** Click **"AI Case Summary"** and **"Age-Aware Appearance"** to generate biological maturation insights.
6. **Sighting Submission:** Navigate to **"Submit Sighting"**. Try the Web Speech API voice recorder or upload an image.
7. **Pattern Insights:** Open **"Pattern Insights"** to review `CLUST-CENTRAL-01` (82/100 score, transit corridor map simulation, 6-signal weighting).
8. **Human Review Queue:** Open **"Review Queue"** and record an investigator determination with a logged rationale.
9. **The Consent Wall:** Open **"Consent Wall"** and select `SET-2026-003` (Meera Das). Experience how address and contact details remain strictly locked until a formal consent transition is recorded.
10. **Secure Comms:** Send a mediated message with a dummy phone number to watch the automated privacy redaction filter in action.
11. **Audit Ledger:** Inspect **"Audit History"** to verify every decision is cryptographically logged.

---

## 🔒 Security, Privacy & Integrity Highlights

- **Zero Unrestricted Facial Recognition:** Avoids biometric surveillance abuses.
- **Perceptual Image Hashing:** Difference hashing (`dHash`) identifies duplicate file uploads without identifying humans.
- **Location Redaction:** Non-investigator accounts see only approximate neighborhoods.
- **SMS OTP Cryptographic Verification:** Raw OTPs are never stored in the database.
- **Bcrypt Salt Rounds:** 12 rounds of cryptographic password hashing.
- **Mediated Channels:** Telephones and email addresses are automatically scrubbed from case chat.

---

## 📄 License & Ethical Usage
SETHU is licensed under the Apache-2.0 License. Strictly developed for positive humanitarian social impact and missing-person investigations.
