// app/api/employees/route.js - UPDATE THE SELECT query
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`
      SELECT 
        e.id,
        e.employee_number,
        e.name,
        e.surname,
        CONCAT(e.name, ' ', e.surname) as full_name,
        e.date_of_birth,
        e.nationality,
        e.passport_number,
        e.work_permit,
        e.company_start_date,
        e.hourly_rate,
        e.created_at,
        e.updated_at,
        EXTRACT(YEAR FROM age(CURRENT_DATE, e.date_of_birth)) as age,
        EXTRACT(YEAR FROM age(CURRENT_DATE, e.company_start_date)) as years_worked,
        'active' as status
      FROM employees e
      ORDER BY e.employee_number
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json([]);
  }
}