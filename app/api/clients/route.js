import { NextResponse } from 'next/server';

const mockClients = [
  {
    id: 1,
    name: 'ABC Construction',
    contact_person: 'John Smith',
    email: 'john@abcconstruction.com',
    phone: '+27 11 123 4567',
    vat_number: 'ZA1234567890',
    status: 'active'
  },
  {
    id: 2,
    name: 'XYZ Developers',
    contact_person: 'Sarah Jones',
    email: 'sarah@xyzdevelopers.com',
    phone: '+27 21 987 6543',
    vat_number: 'ZA0987654321',
    status: 'active'
  },
  {
    id: 3,
    name: 'Smith Properties',
    contact_person: 'Mike Smith',
    email: 'mike@smithproperties.com',
    phone: '+27 31 456 7890',
    vat_number: 'ZA5678901234',
    status: 'inactive'
  }
];

export async function GET() {
  return NextResponse.json(mockClients);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newClient = {
      id: mockClients.length + 1,
      ...body,
      created_at: new Date().toISOString()
    };
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}