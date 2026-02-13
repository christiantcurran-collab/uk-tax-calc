export interface Profile {
  id: string;
  full_name: string | null;
  business_name: string | null;
  employment_type: 'sole_trader' | 'limited_company';
  tax_year: string;
  income_band: 'basic' | 'higher' | 'additional';
  vat_registered: boolean;
  stripe_customer_id: string | null;
  subscription_status: 'none' | 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';
  trial_ends_at: string | null;
  current_period_end: string | null;
  preferred_categories: string[] | null;
  mileage_method: 'simplified' | 'actual';
  home_office_method: 'flat_rate' | 'actual';
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string | null;
  merchant: string | null;
  date: string;
  category_id: string;
  hmrc_box: string;
  is_partial_claim: boolean;
  business_proportion: number;
  claimable_amount: number;
  includes_vat: boolean;
  vat_amount: number | null;
  receipt_image_path: string | null;
  receipt_thumbnail_path: string | null;
  ai_extracted_data: Record<string, unknown> | null;
  entry_method: 'manual' | 'ai_scan' | 'import';
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MileageEntry {
  id: string;
  user_id: string;
  date: string;
  from_location: string;
  to_location: string;
  miles: number;
  purpose: string;
  is_return_trip: boolean;
  rate_pence: number;
  amount: number;
  created_at: string;
}

export interface SavedRoute {
  id: string;
  user_id: string;
  name: string;
  from_location: string;
  to_location: string;
  miles: number;
  is_return: boolean;
  created_at: string;
}

export interface AIUsage {
  id: string;
  user_id: string;
  billing_period: string;
  receipt_scans: number;
  categorisation_queries: number;
  estimated_cost_pence: number;
  created_at: string;
  updated_at: string;
}

export interface ReceiptScanResult {
  merchant: string | null;
  date: string | null;
  total_amount: number | null;
  vat_amount: number | null;
  items: { description: string; amount: number }[];
  suggested_category: string;
  category_reasoning: string;
  confidence: number;
}

export interface CategoriseResult {
  claimable: boolean | 'partial';
  answer: string;
  category_id: string;
  hmrc_box: string | null;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  hmrcCategory: string;
  icon: string;
  description: string;
}

