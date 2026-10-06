# 🌿 CarbonCreditNG

**CarbonCreditNG** is a decentralized, blockchain-powered carbon credit marketplace built on the **BOT Chain Testnet**. It enables NGOs to tokenize verified tree-planting initiatives, allows verifiers to audit these projects, and empowers companies to purchase and permanently retire carbon credits—generating transparent, immutable certificates of environmental impact.

---

## ✨ Features

- **Role-Based Architecture:** Secure roles managed via smart contracts (`Admin`, `NGO`, and `Verifier`).
- **NGO Hub:** Submit tree-planting projects with IPFS evidence and list verified credits directly on the marketplace.
- **Verifier Queue:** Independent verifier role to review project evidence and allocate verified tonnes of CO2 (`tCO2e`).
- **Decentralized Marketplace:** Companies can instantly purchase verified carbon credits using USDT.
- **Retirement & Certification:** Buyers can permanently burn (retire) their credits to offset emissions and generate a visually stunning, shareable Certificate of Retirement.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, React Hot Toast.
- **Web3 Integration:** Ethers.js (v6).
- **Smart Contracts:** Solidity, Foundry, OpenZeppelin.
- **Network:** BOT Chain Testnet.

---

## 📜 Smart Contract Addresses (BOT Chain Testnet)

- **CarbonProjects (Registry):** `0xbb41Ab9660C8a91AcAcfB785f8c19C0230792A65`
- **CarbonMarket (Marketplace):** `0x7C5dc9A45028A81c3819F3F74D72c2D276Cc1dE4`
- **MockUSDT (Testing Currency):** `0x6ec7Db19cC767EF3847c55F96242b329bb2BAe91`

*Note: You can view these contracts on the [BOT Chain Explorer](https://scan.botchain.ai).*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm
- MetaMask Extension installed in your browser

### 1. Clone & Install
```bash
git clone https://github.com/your-username/carbon-credit-ng.git
cd carbon-credit-ng
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory and add the contract addresses:
```env
NEXT_PUBLIC_PROJECTS_ADDRESS=0xbb41Ab9660C8a91AcAcfB785f8c19C0230792A65
NEXT_PUBLIC_MARKET_ADDRESS=0x7C5dc9A45028A81c3819F3F74D72c2D276Cc1dE4
NEXT_PUBLIC_USDT_ADDRESS=0x6ec7Db19cC767EF3847c55F96242b329bb2BAe91
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 How to Test the Platform

The platform is fully operational on the BOT Chain Testnet. Follow this exact flow to test all features:

### Step 1: Mint Mock USDT
Connect your wallet to the dApp. Click the **"GET USDT"** button in the navigation bar to instantly mint 10,000 Mock USDT to your wallet for testing purposes.

### Step 2: Assign Roles (Admin)
1. Go to the **Admin Dashboard** (`/admin`).
2. Add a wallet address and click **Grant NGO Role**.
3. Add a *different* wallet address and click **Grant Verifier Role**. *(Note: The smart contract strictly prevents the same address from holding both roles to avoid conflicts of interest).*

### Step 3: Submit a Project (NGO)
1. Switch to your NGO wallet.
2. Navigate to the **NGO Hub** (`/ngo`) and click **Submit New Project**.
3. Enter project details (e.g., location, trees planted, and an IPFS CID for evidence) and submit the transaction.

### Step 4: Verify the Project (Verifier)
1. Switch to your Verifier wallet.
2. Go to the **Verifier Queue** (`/verifier`).
3. Review the pending project, enter the verified tonnes of CO2, and click **Approve**.

### Step 5: List on Market (NGO)
1. Switch back to your NGO wallet and return to the **NGO Hub**.
2. Your project will now show as approved with an unlisted balance of credits.
3. Enter the amount to list and a price (in USDT), then click **List on Market**.

### Step 6: Buy & Retire Credits (Company/Buyer)
1. Switch to any buyer wallet (ensure you have Mock USDT).
2. Go to the **Marketplace** (`/market`) and buy credits from the active listing.
3. Go to the **Company Dashboard** (`/company`) to view your purchased credits.
4. Select the credits, enter your company name, and click **Permanently Retire Credits**.
5. View and share your beautiful **Certificate of Retirement**!

---

## 📄 License
This project is licensed under the MIT License.
