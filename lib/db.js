import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

export async function getJobs() {
  const result = await query(`
    SELECT j.*, 
      COALESCE(SUM(al.hours_worked), 0) as total_hours,
      COUNT(al.id) as log_entries
    FROM jobs j
    LEFT JOIN attendance_logs al ON j.id = al.job_id
    GROUP BY j.id
    ORDER BY j.id DESC
  `);
  return result.rows;
}

export async function createJob(jobData) {
  const { lc_number, po_status, completion_status, monthly_work_done } = jobData;
  const result = await query(
    `INSERT INTO jobs (lc_number, po_status, completion_status, monthly_work_done)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [lc_number, po_status || 'pending', completion_status || 'not_started', monthly_work_done || 0]
  );
  return result.rows[0];
}

export async function updateJob(id, updates) {
  const { po_status, completion_status } = updates;
  
  if (completion_status === 'completed') {
    const completed_month = new Date().toISOString().slice(0, 7);
    const job = await query('SELECT lc_number, monthly_work_done FROM jobs WHERE id = $1', [id]);
    
    await query(
      `INSERT INTO completed_invoices (job_id, lc_number, completion_date, total_work_done, invoice_month)
       VALUES ($1, $2, CURRENT_DATE, $3, $4)`,
      [id, job.rows[0].lc_number, job.rows[0].monthly_work_done, completed_month]
    );
    
    await query(
      'UPDATE jobs SET po_status = $1, completion_status = $2, completed_month = $3 WHERE id = $4',
      [po_status, completion_status, completed_month, id]
    );
  } else {
    await query(
      'UPDATE jobs SET po_status = $1, completion_status = $2 WHERE id = $3',
      [po_status, completion_status, id]
    );
  }
  
  const result = await query('SELECT * FROM jobs WHERE id = $1', [id]);
  return result.rows[0];
}

export async function deleteJob(id) {
  await query('DELETE FROM jobs WHERE id = $1', [id]);
  return { success: true };
}

export async function addAttendance(jobId, log_date, hours_worked, notes) {
  await query(
    `INSERT INTO attendance_logs (job_id, log_date, hours_worked, notes)
     VALUES ($1, $2, $3, $4)`,
    [jobId, log_date, hours_worked, notes]
  );
  
  await query(`
    UPDATE jobs 
    SET monthly_work_done = (
      SELECT COALESCE(SUM(hours_worked), 0)
      FROM attendance_logs 
      WHERE job_id = $1 
      AND EXTRACT(YEAR_MONTH FROM log_date) = EXTRACT(YEAR_MONTH FROM CURRENT_DATE)
    )
    WHERE id = $1
  `, [jobId]);
  
  return { success: true };
}

export async function getJobWithAttendance(id) {
  const jobResult = await query('SELECT * FROM jobs WHERE id = $1', [id]);
  const logsResult = await query(
    'SELECT * FROM attendance_logs WHERE job_id = $1 ORDER BY log_date DESC',
    [id]
  );
  return { job: jobResult.rows[0], logs: logsResult.rows };
}

export async function getCompletedInvoices() {
  const result = await query(`
    SELECT ci.*, j.completion_status
    FROM completed_invoices ci
    JOIN jobs j ON ci.job_id = j.id
    ORDER BY ci.completion_date DESC
  `);
  return result.rows;
}

export async function getTotalCompletedWork() {
  const result = await query(`
    SELECT 
      COALESCE(SUM(monthly_work_done), 0) as total_work_done,
      COUNT(*) as total_jobs_completed
    FROM jobs
    WHERE completion_status = 'completed'
  `);
  return result.rows[0];
}