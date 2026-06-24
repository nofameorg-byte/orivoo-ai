import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Building2,
  CreditCard,
  FileText,
  Gauge,
  Landmark,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

export const dashboardNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Gauge },
  { name: "Business profile", href: "/dashboard/business-profile", icon: Building2 },
  { name: "Accounts", href: "/dashboard/accounts", icon: Landmark },
  { name: "Transactions", href: "/dashboard/transactions", icon: ReceiptText },
  { name: "Transfers", href: "/dashboard/transfers", icon: ArrowLeftRight },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
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
    name: "Column sandbox transfer",
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
    icon: WalletCards,
  },
];

export const accounts = [
  {
    name: "VP23 Operating",
    type: "Business checking",
    balance: "$128,430.18",
    routing: "121145349",
    account: "**** 2389",
    status: "Sandbox",
  },
  {
    name: "VP23 Tax Reserve",
    type: "Reserve account",
    balance: "$32,000.00",
    routing: "121145349",
    account: "**** 7411",
    status: "Sandbox",
  },
  {
    name: "VP23 Payroll",
    type: "Payroll funding",
    balance: "$18,640.72",
    routing: "121145349",
    account: "**** 6054",
    status: "Sandbox",
  },
];

export const transfers = [
  { id: "trf_9001", destination: "Tax Reserve", amount: "$6,000.00", status: "Simulated", date: "Jun 24" },
  { id: "trf_9000", destination: "Contractor payout", amount: "$2,125.20", status: "Pending", date: "Jun 23" },
  { id: "trf_8998", destination: "Payroll funding", amount: "$11,450.00", status: "Completed", date: "Jun 21" },
];

export const customers = [
  { name: "Northstar Construction", email: "ap@northstar.example", balance: "$14,900.00", status: "Invoice open" },
  { name: "Redline Fabrication", email: "finance@redline.example", balance: "$0.00", status: "Paid" },
  { name: "Blue Arc Logistics", email: "billing@bluearc.example", balance: "$8,450.00", status: "Ready" },
];

export const quickActions = [
  { label: "Send", icon: ArrowUpRight, href: "/dashboard/transfers" },
  { label: "Receive", icon: ArrowDownLeft, href: "/dashboard/accounts" },
  { label: "Invoice", icon: FileText, href: "/dashboard/invoices" },
  { label: "Transfer", icon: ArrowLeftRight, href: "/dashboard/transfers" },
];

export const securityHighlights = [
  "Supabase Auth protects dashboard routes",
  "RLS policies scope data to the authenticated owner",
  "Column API key is only read by server route handlers",
  "Sandbox mode keeps bank movement simulated for MVP",
];

export const complianceTodos = [
  "TODO: Add production KYB/KYC onboarding and beneficial owner collection before live money movement.",
  "TODO: Add compliance review, OFAC screening, and audit retention before enabling production Column transfers.",
  "TODO: Replace sandbox placeholders with signed webhooks, idempotency keys, and reconciliation workflows.",
];

export const settingsCards = [
  { title: "Authentication", body: "Supabase email/password sessions with server-side route protection.", icon: ShieldCheck },
  { title: "Cards & accounts", body: "Sandbox account data is isolated behind backend API routes.", icon: CreditCard },
  { title: "Database", body: "Profiles, businesses, customers, and invoices are RLS-protected.", icon: Landmark },
];
