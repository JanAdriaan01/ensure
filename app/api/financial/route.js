import { NextResponse } from 'next/server';

export async function GET() {
  const stats = {
    totalRevenue: 125000,
    totalExpenses: 78450,
    netProfit: 46550,
    pendingInvoices: 32500,
    overduePayments: 12500,
    monthlyData: [
      { month: 'Jan', revenue: 25000, expenses: 18000 },
      { month: 'Feb', revenue: 28000, expenses: 18500 },
      { month: 'Mar', revenue: 32000, expenses: 19500 },
      { month: 'Apr', revenue: 40000, expenses: 22450 },
    ]
  };
  return NextResponse.json(stats);
}