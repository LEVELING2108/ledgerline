export const categories = ["Groceries", "Dining", "Transport", "Utilities", "Rent", "Entertainment"];

// Category → semantic color key, cycled across the limited reserved palette
export const categoryColorKey = (category) => {
  const map = {
    Groceries: "teal",
    Rent: "purple",
    Dining: "coral",
    Transport: "muted",
    Utilities: "purple",
    Entertainment: "teal",
  };
  return map[category] || "muted";
};

export const transactions = [
  { id: "t1", date: "2026-07-02", merchant: "Big Bazaar", category: "Groceries", amount: -2450, anomaly: false },
  { id: "t2", date: "2026-07-01", merchant: "Swiggy", category: "Dining", amount: -680, anomaly: false },
  { id: "t3", date: "2026-06-30", merchant: "Ola Cabs", category: "Transport", amount: -320, anomaly: false },
  { id: "t4", date: "2026-06-29", merchant: "Landlord — Rent", category: "Rent", amount: -18000, anomaly: false },
  { id: "t5", date: "2026-06-28", merchant: "Unknown POS Terminal", category: "Entertainment", amount: -9200, anomaly: true },
  { id: "t6", date: "2026-06-27", merchant: "Airtel", category: "Utilities", amount: -899, anomaly: false },
  { id: "t7", date: "2026-06-25", merchant: "BookMyShow", category: "Entertainment", amount: -600, anomaly: false },
  { id: "t8", date: "2026-06-24", merchant: "Zomato", category: "Dining", amount: -540, anomaly: false },
];

export const categoryBreakdown = [
  { category: "Rent", amount: 18000 },
  { category: "Groceries", amount: 7200 },
  { category: "Dining", amount: 4100 },
  { category: "Transport", amount: 2600 },
  { category: "Utilities", amount: 1800 },
  { category: "Entertainment", amount: 1500 },
];

export const monthlyTrend = [
  { month: "Feb", actual: 32800 },
  { month: "Mar", actual: 34200 },
  { month: "Apr", actual: 31900 },
  { month: "May", actual: 36400 },
  { month: "Jun", actual: 35200 },
  { month: "Jul", actual: null, forecast: 37100 },
];

export const alerts = [
  {
    id: "a1",
    title: "Unusual charge at Unknown POS Terminal",
    detail: "₹9,200 is 6.4x your average Entertainment transaction.",
    date: "2026-06-28",
    resolved: false,
  },
  {
    id: "a2",
    title: "Rent posted twice this cycle",
    detail: "Two ₹18,000 debits to the same payee within 3 days.",
    date: "2026-06-15",
    resolved: false,
  },
  {
    id: "a3",
    title: "Dining spend up 40% vs last month",
    detail: "₹4,100 so far this month vs ₹2,930 last month.",
    date: "2026-06-10",
    resolved: true,
  },
];

export const chatHistory = [
  { id: "c1", role: "assistant", text: "Hi Sourav — ask me anything about your spending, forecasts, or a specific transaction." },
  { id: "c2", role: "user", text: "How much did I spend on dining last month?" },
  {
    id: "c3",
    role: "assistant",
    text: "You spent ₹4,100 on Dining in June, up from ₹2,930 in May.",
    trace: "SELECT SUM(amount) FROM transactions WHERE category='Dining' AND month='2026-06'",
  },
];
