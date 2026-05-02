import { NextResponse } from 'next/server';

export async function GET() {
  // Return mock data directly as an array
  const certifications = [
    { id: 1, employee_id: 1, employee_name: 'John Doe', certification_name: 'First Aid', issued_date: '2023-01-15', expiry_date: '2026-01-15', status: 'valid' },
    { id: 2, employee_id: 1, employee_name: 'John Doe', certification_name: 'OSHA Safety', issued_date: '2023-03-10', expiry_date: '2026-03-10', status: 'valid' },
    { id: 3, employee_id: 2, employee_name: 'Jane Smith', certification_name: 'Electrical License', issued_date: '2022-06-20', expiry_date: '2025-06-20', status: 'valid' },
    { id: 4, employee_id: 2, employee_name: 'Jane Smith', certification_name: 'First Aid', issued_date: '2022-01-15', expiry_date: '2025-01-15', status: 'expired' },
    { id: 5, employee_id: 3, employee_name: 'Mike Johnson', certification_name: 'Forklift Operator', issued_date: '2023-08-01', expiry_date: '2026-08-01', status: 'valid' },
    { id: 6, employee_id: 3, employee_name: 'Mike Johnson', certification_name: 'Working at Heights', issued_date: '2023-09-15', expiry_date: '2026-09-15', status: 'valid' },
  ];
  
  return NextResponse.json(certifications);
}