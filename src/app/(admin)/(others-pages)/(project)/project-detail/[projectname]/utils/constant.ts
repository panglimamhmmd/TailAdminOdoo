  // utils/constants.ts

export const PROJECT_TAGS = {
  CONSTRUCTION: 1,
  INTERIOR: 2,
  DESIGN: 3,
} as const;

export const EXPENSE_CATEGORIES = [
  { label: "Pelaksana", pct: 35 },
  { label: "Tukang", pct: 25 },
  { label: "Vendor", pct: 30 },
  { label: "Overhead", pct: 10 },
] as const;

export const MOCK_TIMELINE = {
  startDate: "12 March 2025",
  endDate: "12 May 2025",
  elapsed: "45 Days",
  remaining: "15 Days",
} as const;

export const MOCK_PROJECT_INFO = {
  manager: "John Doe",
  client: "ACME Corporation",
  budget: "$500,000",
  location: "New York, USA",
} as const;

export const MOCK_STAGES = [
  { label: "Design", percent: 90 },
  { label: "Construction", percent: 70 },
  { label: "Interior", percent: 85 },
] as const;