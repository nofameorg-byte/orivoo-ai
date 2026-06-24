import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Building2,
  ClipboardCheck,
  Palette,
  FileText,
  Gauge,
  Landmark,
  LandmarkIcon,
  ListChecks,
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
  { name: "Brand", href: "/dashboard/brand", icon: Palette },
  { name: "Partner Review", href: "/dashboard/partner-review", icon: ClipboardCheck },
  { name: "Compliance Binder", href: "/dashboard/compliance-binder", icon: FileText },
  { name: "Pitch", href: "/dashboard/pitch", icon: ArrowUpRight },
  { name: "Business Banking", href: "/dashboard/business-banking", icon: Landmark },
  { name: "Business profile", href: "/dashboard/business-profile", icon: Building2 },
  { name: "Accounts", href: "/dashboard/accounts", icon: Landmark },
  { name: "Transactions", href: "/dashboard/transactions", icon: ReceiptText },
  { name: "Payments", href: "/dashboard/payments", icon: Zap },
  { name: "Transfers", href: "/dashboard/transfers", icon: ArrowLeftRight },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Applications", href: "/dashboard/applications", icon: ListChecks },
  { name: "Ledger", href: "/dashboard/ledger", icon: ReceiptText },
  { name: "Statements", href: "/dashboard/statements", icon: FileText },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
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
    rail: "Subject to partner approval",
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
    rail: "Subject to partner approval",
  },
];

export const transfers = [
  { id: "trf_9001", destination: "Tax Reserve", amount: "$6,000.00", status: "Prepared", date: "Jun 24" },
  { id: "trf_9000", destination: "Contractor payout", amount: "$2,125.20", status: "Pending", date: "Jun 23" },
  { id: "trf_8998", destination: "Payroll funding", amount: "$11,450.00", status: "Reviewed", date: "Jun 21" },
];

export const customers = [
  { id: "northstar-construction", name: "Northstar Construction", email: "ap@northstar.example", phone: "+1 803 555 0198", balance: "$14,900.00", status: "Invoice open", type: "Business", history: "4 invoices · $42,800 lifetime" },
  { id: "redline-fabrication", name: "Redline Fabrication", email: "finance@redline.example", phone: "+1 803 555 0124", balance: "$0.00", status: "Paid", type: "Business", history: "9 invoices · $117,240 lifetime" },
  { id: "blue-arc-logistics", name: "Blue Arc Logistics", email: "billing@bluearc.example", phone: "+1 803 555 0172", balance: "$8,450.00", status: "Ready", type: "Business", history: "2 invoices · $19,100 lifetime" },
  { id: "maya-johnson", name: "Maya Johnson", email: "maya.johnson@example.com", phone: "+1 803 555 0159", balance: "$725.00", status: "Consumer", type: "Consumer", history: "1 invoice · $725 lifetime" },
];

export const customerActivity = [
  { label: "Invoice VP23-1042 created", date: "Jun 22", type: "Invoice" },
  { label: "Document request sent", date: "Jun 21", type: "Compliance" },
  { label: "Customer profile updated", date: "Jun 20", type: "Profile" },
  { label: "Payment workflow prepared", date: "Jun 19", type: "Transfer" },
];

export const accountApplications = [
  { product: "Business checking application", status: "Submitted", owner: "VP23", updated: "Jun 24", detail: "Ready for internal review after KYB package completion." },
  { product: "Business savings application", status: "Draft", owner: "VP23", updated: "Jun 23", detail: "Future product pending sponsor-bank review and disclosures." },
  { product: "Operating account add-on", status: "Under Review", owner: "VP23", updated: "Jun 22", detail: "Internal compliance review in progress." },
];

export const applicationStatuses = [
  "Draft",
  "Submitted",
  "Under Review",
  "Approved",
  "Rejected",
];

export const ledgerEntries = [
  { id: "ldg_1001", date: "2026-06-24", customer: "Northstar Construction", description: "Invoice VP23-1042", type: "Invoice", status: "Posted", amount: "+$14,900.00" },
  { id: "ldg_1002", date: "2026-06-23", customer: "Redline Fabrication", description: "Prepared transfer", type: "Transfer", status: "Review", amount: "-$2,125.20" },
  { id: "ldg_1003", date: "2026-06-22", customer: "Blue Arc Logistics", description: "Receivable update", type: "Customer", status: "Posted", amount: "+$8,450.00" },
  { id: "ldg_1004", date: "2026-06-21", customer: "VP23", description: "Reserve allocation", type: "Internal", status: "Pending", amount: "-$6,000.00" },
];

export const statements = [
  { id: "stmt_2026_06", period: "June 2026", status: "Draft", generated: "Pending", totalCredits: "$26,625.84", totalDebits: "$8,125.20" },
  { id: "stmt_2026_05", period: "May 2026", status: "Ready", generated: "Jun 1, 2026", totalCredits: "$91,400.00", totalDebits: "$44,280.35" },
  { id: "stmt_2026_04", period: "April 2026", status: "Ready", generated: "May 1, 2026", totalCredits: "$78,900.00", totalDebits: "$31,945.18" },
];

export const notifications = [
  { id: "ntf_001", title: "Application update", body: "Business checking application moved to internal review.", unread: true, type: "Application" },
  { id: "ntf_002", title: "Compliance request", body: "Upload an operating agreement to complete KYB review.", unread: true, type: "Compliance" },
  { id: "ntf_003", title: "Invoice paid", body: "Invoice VP23-1042 was marked paid in the receivables workflow.", unread: false, type: "Invoice" },
  { id: "ntf_004", title: "Transfer reviewed", body: "Prepared transfer record was marked reviewed after internal review.", unread: false, type: "Transfer" },
];

export const phase4AdminQueues = [
  { title: "Customer review queue", count: "9", body: "Customer profiles awaiting notes, document checks, or receivables review." },
  { title: "Application review queue", count: "6", body: "Business checking and savings applications requiring internal action." },
  { title: "Document review queue", count: "14", body: "Uploaded files awaiting verification, rejection, or more information requests." },
  { title: "Risk alerts", count: "4", body: "Velocity, document, and customer activity alerts pending review." },
  { title: "Activity logs", count: "128", body: "User, customer, invoice, document, and admin actions captured for audit review." },
];

export const auditLogEvents = [
  "User login",
  "Document upload",
  "Application submission",
  "Invoice creation",
  "Customer creation",
  "Admin review action",
];

export const quickActions = [
  { label: "Send", icon: ArrowUpRight, href: "/dashboard/payments" },
  { label: "Receive", icon: ArrowDownLeft, href: "/dashboard/accounts" },
  { label: "Invoice", icon: FileText, href: "/dashboard/invoices" },
  { label: "Transfer", icon: ArrowLeftRight, href: "/dashboard/transfers" },
];

export const balanceMetrics = [
  { label: "Total Balance", value: "$179,070.90", detail: "Across checking, reserves, and payroll" },
  { label: "Available Balance", value: "$128,430.18", detail: "Displayed for planning; movement is subject to partner approval" },
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
    body: "Routing number, account mask, ledger balance display, and Column entity mapping.",
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
    speed: "Future rapid transfers",
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
  "TODO: Add production KYB/KYC onboarding and beneficial owner collection before partner-approved money movement.",
  "TODO: Add compliance review, OFAC screening, and audit retention before enabling production Column transfers.",
  "TODO: Replace integration placeholders with signed webhooks, idempotency keys, and reconciliation workflows.",
];

export const settingsCards = [
  { title: "Authentication", body: "Supabase email/password sessions with server-side route protection.", icon: ShieldCheck },
  { title: "Accounts", body: "Account application data is isolated behind backend API routes.", icon: Landmark },
  { title: "Database", body: "Profiles, businesses, customers, and invoices are RLS-protected.", icon: Landmark },
];
