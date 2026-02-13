import type { ExpenseCategory } from '@/types';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'office-supplies',
    name: 'Office, Stationery & Software',
    hmrcCategory: 'Office costs',
    icon: 'Monitor',
    description: 'Costs for running your workspace, from paper clips to software subscriptions.',
  },
  {
    id: 'travel',
    name: 'Travel & Mileage',
    hmrcCategory: 'Travel costs',
    icon: 'Car',
    description: 'Business travel expenses including fuel, parking, and public transport.',
  },
  {
    id: 'working-from-home',
    name: 'Working from Home',
    hmrcCategory: 'Business premises costs',
    icon: 'Home',
    description: 'Proportion of home costs used for business: heating, broadband, rent.',
  },
  {
    id: 'professional-services',
    name: 'Professional Fees & Insurance',
    hmrcCategory: 'Legal and financial costs',
    icon: 'Shield',
    description: 'Accountancy fees, professional indemnity insurance, legal costs.',
  },
  {
    id: 'marketing',
    name: 'Advertising & Marketing',
    hmrcCategory: 'Advertising costs',
    icon: 'Megaphone',
    description: 'Website hosting, social media ads, business cards, PR.',
  },
  {
    id: 'clothing',
    name: 'Clothing & Uniform',
    hmrcCategory: 'Clothing costs',
    icon: 'Shirt',
    description: 'Protective clothing, uniforms, costumes for performers.',
  },
  {
    id: 'training',
    name: 'Training & Development',
    hmrcCategory: 'Training costs',
    icon: 'GraduationCap',
    description: 'Courses, books, and conferences directly related to your business.',
  },
  {
    id: 'staff',
    name: 'Staff & Subcontractor Costs',
    hmrcCategory: 'Staff costs',
    icon: 'Users',
    description: 'Salaries, subcontractor payments, employer NI contributions.',
  },
  {
    id: 'stock-materials',
    name: 'Stock & Materials',
    hmrcCategory: 'Cost of goods bought for resale',
    icon: 'Package',
    description: 'Raw materials, stock for resale, packaging.',
  },
  {
    id: 'financial',
    name: 'Interest & Bank Charges',
    hmrcCategory: 'Interest on bank and business loans',
    icon: 'Landmark',
    description: 'Bank charges, overdraft interest, hire purchase interest.',
  },
];

export const HMRC_BOX_MAP: Record<string, string> = {
  'office-supplies': 'Office costs',
  'travel': 'Travel costs',
  'working-from-home': 'Business premises costs',
  'professional-services': 'Legal and financial costs',
  'marketing': 'Advertising costs',
  'clothing': 'Clothing costs',
  'training': 'Training costs',
  'staff': 'Staff costs',
  'stock-materials': 'Cost of goods bought for resale',
  'financial': 'Interest on bank and business loans',
};

export function getCategoryById(id: string): ExpenseCategory | undefined {
  return EXPENSE_CATEGORIES.find((c) => c.id === id);
}

export function getHmrcBox(categoryId: string): string {
  return HMRC_BOX_MAP[categoryId] || 'Other allowable business expenses';
}

