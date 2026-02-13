import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QuidWise Pro — Expense Tracker for UK Freelancers',
  description:
    'Track expenses, scan receipts with AI, and get HMRC-ready tax reports. Built for UK freelancers and sole traders. £5/month.',
  keywords: [
    'expense tracker',
    'UK freelancer',
    'sole trader',
    'HMRC',
    'self assessment',
    'receipt scanner',
    'tax deductions',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
