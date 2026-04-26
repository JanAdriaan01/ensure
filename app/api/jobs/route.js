// Add/modify the PUT handler in your existing jobs API
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { completion_status, po_status } = body;
    
    let updateFields = [];
    let values = [];
    
    if (completion_status !== undefined) {
      updateFields.push(`completion_status = $${updateFields.length + 1}`);
      values.push(completion_status);
    }
    if (po_status !== undefined) {
      updateFields.push(`po_status = $${updateFields.length + 1}`);
      values.push(po_status);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    values.push(id);
    const result = await query(
      `UPDATE jobs SET ${updateFields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}