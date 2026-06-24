import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Building2,
  ClipboardCheck,
  FileText,
  Gauge,
  Landmark,
  LandmarkIcon,
  Network,
  PiggyBank,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShieldEllipsis,
  SlidersHorizontal,
  Users,
  Zap,
} from "lucide-react";

export const dashboardNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Gauge },
  { name: "Onboarding", href: "/dashboard/onboarding", icon: ClipboardCheck },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Business Banking", href: "/dashboard/business-banking", icon: Landmark },
  { name: "Business profile", href: "/dashboard/business-profile", icon: Building2 },
  { name: "Accounts", href: "/dashboard/accounts", icon: Landmark },
  { name: "Transactions", href: "/dashboard/transactions", icon: ReceiptText },
  { name: "Payments", href: "/dashboard/payments", icon: Zap },
  { name: "Transfers", href: "/dashboard/transfers", icon: ArrowLeftRight },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Admin", href: "/dashboard/admin", icon: ShieldEllipsis },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const recentTransactions = [
  {
    id: "txn_001",
    name: "Acme Roofing payout",
    date: "Jun 24",
    amount: "+$8,450.00",
    tone: "text-electric-blue-bright",
    icon: ArrowDownLeft,
  },
  {
    id: "txn_002",
    name: "Partner-review transfer",
    date: "Jun 23",
    amount: "-$2,125.20",
    tone: "text-metal-red-bright",
    icon: ArrowUpRight,
  },
  {
    id: "txn_003",
    name: "Invoice VP23-1042",
    date: "Jun 22",
    amount: "+$14,900.00",
    tone: "text-gold-bright",
    icon: FileText,
  },
  {
    id: "txn_004",
    name: "Reserve sweep",
    date: "Jun 21",
    amount: "-$6,000.00",
    tone: "text-muted",
    icon: ArrowLeftRight,
  },
  {
    id: "txn_005",
    name: "Real-time payment activity",
    date: "Jun 20",
    amount: "+$3,275.84",
    tone: "text-electric-blue-bright",
    icon: Zap,
  },
];

export const accounts = [
  {
    name: "VP23 Operating",
    type: "Business checking",
    balance: "$128,430.18",
    routing: "121145349",
    account: "**** 2389",
    status: "Draft",
    rail: "ACH, RTP eligible",
  },
  {
    name: "VP23 Tax Reserve",
    type: "Business savings (future)",
    balance: "$32,000.00",
    routing: "121145349",
    account: "**** 7411",
    status: "Future",
    rail: "Interest controls pending",
  },
  {
    name: "VP23 Payroll",
    type: "Payroll funding",
    balance: "$18,640.72",
    routing: "121145349",
    account: "**** 6054",
    status: "Draft",
    rail: "ACH transfer eligible",
  },
];

export const transfers = [
  { id: "trf_9001", destination: "Tax Reserve", amount: "$6,000.00", status: "Simulated", date: "Jun 24" },
  { id: "trf_9000", destination: "Contractor payout", amount: "$2,125.20", status: "Pending", date: "Jun 23" },
  { id: "trf_8998", destination: "Payroll funding", amount: "$11,450.00", status: "Completed", date: "Jun 21" },
];

export const customers = [
  { name: "Northstar Construction", email: "ap@northstar.example", balance: "$14,900.00", status: "Invoice open", type: "Business", history: "4 invoices · $42,800 lifetime" },
  { name: "Redline Fabrication", email: "finance@redline.example", balance: "$0.00", status: "Paid", type: "Business", history: "9 invoices · $117,240 lifetime" },
  { name: "Blue Arc Logistics", email: "billing@bluearc.example", balance: "$8,450.00", status: "Ready", type: "Business", history: "2 invoices · $19,100 lifetime" },
  { name: "Maya Johnson", email: "maya.johnson@example.com", balance: "$725.00", status: "Consumer", type: "Consumer", history: "1 invoice · $725 lifetime" },
];

export const quickActions = [
  { label: "Send", icon: ArrowUpRight, href: "/dashboard/payments" },
  { label: "Receive", icon: ArrowDownLeft, href: "/dashboard/accounts" },
  { label: "Invoice", icon: FileText, href: "/dashboard/invoices" },
  { label: "Transfer", icon: ArrowLeftRight, href: "/dashboard/transfers" },
];

export const balanceMetrics = [
  { label: "Total Balance", value: "$179,070.90", detail: "Across checking, reserves, and payroll" },
  { label: "Available Balance", value: "$128,430.18", detail: "Ready for ACH, wire, RTP, and invoices" },
  { label: "Pending Activity", value: "$10,575.20", detail: "3 payment items awaiting review" },
];

export const bankingProducts = [
  {
    title: "Checking Accounts",
    status: "Application ready",
    body: "Operating, payroll, and reserve checking with routing/account details and payment rail eligibility.",
    icon: LandmarkIcon,
  },
  {
    title: "Savings Accounts",
    status: "Future",
    body: "High-yield reserve product placeholder for sponsor-bank approval and interest disclosures.",
    icon: PiggyBank,
  },
  {
    title: "Account Details",
    status: "Available",
    body: "Routing number, account mask, ledger balance, available balance, and Column entity mapping.",
    icon: ShieldCheck,
  },
];

export const paymentRails = [
  {
    name: "ACH",
    speed: "Same day / next day",
    status: "Application ready",
    limit: "$25,000 per transfer",
    icon: Network,
  },
  {
    name: "Wires",
    speed: "Domestic wire window",
    status: "Partner bank required",
    limit: "$100,000 review limit",
    icon: Landmark,
  },
  {
    name: "Real-Time Payments",
    speed: "Instant eligible transfers",
    status: "Future rail",
    limit: "$10,000 pilot limit",
    icon: Zap,
  },
];

export const invoiceCapabilities = [
  "Branded VP23 invoices with dark premium layout",
  "PDF export placeholder through browser print/save",
  "Customer history connected to invoice records",
  "Future payment links after compliance approval",
];

export const onboardingSteps = [
  { title: "User account", status: "Ready", body: "Supabase email/password session and protected routes." },
  { title: "Business profile", status: "In progress", body: "Legal entity, EIN last four, address, and industry intake." },
  { title: "KYB/KYC verification", status: "Required", body: "Beneficial owners, control person, sanctions screening, and document checks." },
  { title: "Column entity mapping", status: "Prepared", body: "Prepare entity/account payloads and store Column identifiers server-side after approval." },
  { title: "Bank sponsor approval", status: "External dependency", body: "Partner-bank program approval before production money movement." },
];

export const adminQueues = [
  {
    title: "KYB queue",
    metric: "7 pending",
    body: "Business applications awaiting verification, ownership review, and document checks.",
    icon: ClipboardCheck,
  },
  {
    title: "Compliance queue",
    metric: "3 escalations",
    body: "Sanctions, adverse media, prohibited business type, and manual review workflows.",
    icon: ShieldCheck,
  },
  {
    title: "Risk dashboard",
    metric: "Medium",
    body: "Velocity limits, transfer anomalies, return rates, and account health monitoring.",
    icon: SlidersHorizontal,
  },
  {
    title: "Partner bank settings",
    metric: "Sponsor needed",
    body: "Program configuration for sponsor bank, BIN/rail access, limits, and disclosures.",
    icon: Landmark,
  },
];

export const securityHighlights = [
  "Supabase Auth protects dashboard routes",
  "RLS policies scope data to the authenticated owner",
  "Column API key is only read by server route handlers",
  "Banking features remain gated until partner approval",
];

export const complianceTodos = [
  "TODO: Add production KYB/KYC onboarding and beneficial owner collection before live money movement.",
  "TODO: Add compliance review, OFAC screening, and audit retention before enabling production Column transfers.",
  "TODO: Replace integration placeholders with signed webhooks, idempotency keys, and reconciliation workflows.",
];

export const settingsCards = [
  { title: "Authentication", body: "Supabase email/password sessions with server-side route protection.", icon: ShieldCheck },
  { title: "Accounts", body: "Account application data is isolated behind backend API routes.", icon: Landmark },
  { title: "Database", body: "Profiles, businesses, customers, and invoices are RLS-protected.", icon: Landmark },
];
