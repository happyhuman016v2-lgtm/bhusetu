# BhuSetu (भू-सेतु) v2.0
### Bharat Unified Land Stack & Intelligent Cadastral Partition Engine
**Developed for HackITon '26 — KPR Institute of Engineering and Technology**

---

## 🎯 Executive Overview
**BhuSetu** is an open, high-precision geospatial land governance platform designed to resolve land disputes, detect 2D buffer encroachments, and automate equitable civil land divisions for co-owners under the 14-digit **Bhu-Aadhaar (ULPIN)** framework.

Tailored for **HackITon '26**, this prototype is built from scratch with modern frontend GIS technology to provide a clean, defensible, and mathematically rigorous solution for hackathon evaluations.

---

## 🚀 Key Innovations & Features

### 1. 🌟 Intelligent Land Partition & Fair Division Assistant
- **Problem**: When an ancestral or co-owned plot of land is divided among siblings or joint owners, disputes routinely erupt over unequal land cuts, loss of road frontage, and informal demarcation.
- **Solution**:
  - One-click **"Suggest Even Divide"** automatically calculates the principal geometric axis of the cadastral polygon.
  - Applies a continuous **numerical binary search sweep** using Turf.js geodesic algorithms to split the parcel into equal-area sub-plots with mathematical parity (>99% equity score).
  - Assigns sub-survey numbers (e.g. `102/4-A`, `102/4-B`), calculates road frontage access, and visualizes divided parcels in real-time on the map with custom color coding.
  - Generates a statutory **Memorandum of Land Partition & Survey Demarcation** ready for Tahsildar mutation under Section 131 of the Land Revenue Code.

### 2. 🌟 Dynamic Local Revenue Office & Officer Directory
- Whenever any parcel in India is selected on the map, BhuSetu instantly surfaces the **competent local revenue authority**:
  - **Office Name & Jurisdiction** (e.g., Sub-Registrar Office Sulur, Tahsildar Office Serilingampally).
  - **Designated Officer** with official designation, phone number, and official email.
  - One-click phone call, email trigger, and Google Maps direction links.
  - Public grievance window timings and official emergency land helpline.

### 3. 🛡️ 2D Polygon Conflict & Buffer Encroachment Detection
- Replaces high-overhead 3D drone point-clouds with instant, mathematically sound **2D Vector Buffer Intersections** (`turf.intersect`).
- Detects severe statutory conflicts:
  - **Full Tank Level (FTL) Lake Buffer Encroachment** (e.g., HYDRAA / Water Resources Act violations).
  - **National Highway (NH) Setback Corridor Violations** (15m widening alignment overlaps).
  - **Cadastral RoR vs Geodesic Satellite Area Discrepancies** (>5% title mismatches).

### 4. 🏷️ Deterministic Bhu-Aadhaar Trust Score & Property Card
- Heuristic algorithm calculates an authoritative **0–100 Trust Score** and letter grade (**A** to **F**) based on:
  - Spatial geodesic match ratio
  - Buffer encroachment penalties
  - Tax clearance status
  - Active court injunctions / bank mortgages
- Generates a printable **Digital Bhu-Aadhaar Property Card**.

### 5. 🏛️ Dual-Portal Governance Architecture
- **Citizen Portal**:
  - Public parcel search (by ULPIN, Survey No, Village, or Co-owner).
  - Interactive Land Division Assistant & deed preview.
  - Nearest officer directory.
- **Statutory Officer Portal** (Tahsildar / Sub-Registrar Console):
  - Protected by statutory authentication gate (`officer_admin` / `BhuSetu@2026`).
  - **Triage Queue**: Review pending civil land partition petitions submitted by citizens.
  - One-click **Sub-division Mutation Approval** with automatic Sub-ULPIN issuance.
  - **Form VII Notice Generator**: Automated statutory show-cause notice generator for buffer encroachments.
  - **Immutable Audit Trail**: Every administrative action is logged with a SHA-256 tamper-proof cryptographic hash.

### 6. 📂 Mock State Registry (RoR) Ingestion Engine
- Replaces gated state revenue APIs (Bhoomi, Dharani, AnyROR, Tamil Nilam) with a mock ingestion engine that parses standard Indian Record of Rights schemas in CSV or structured JSON format.

---

## 🛠️ Technology Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Warm Cartographic Survey Theme: Terra Cotta `#C85A32`, Parchment `#FBF9F5`, Charcoal `#23201F`)
- **Map Engine**: MapLibre GL JS (Vector / OSM Cartographic raster projection)
- **Spatial Analysis**: Turf.js (`@turf/turf` - Area, BBox, Intersect, Difference)
- **Icons**: Lucide React

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Development Server
```bash
cd bhusetu-hackiton
npm install
npm run dev
```

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## ⚖️ Hackathon Credentials for Demo
- **Officer Username**: `officer_admin` (or `judge`)
- **Officer Password**: `BhuSetu@2026` (or `hackiton`)

---
*Built with ❤️ for HackITon '26 at KPR Institute of Engineering and Technology.*
