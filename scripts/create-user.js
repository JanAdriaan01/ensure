const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'your_database_url_here',
  ssl: { rejectUnauthorized: false }
});

async function createUser() {
  const email = 'jan@netcamsa.co.za';
  const password = '0615458693';
  const name = 'Jan Naude';
  const phone = '0615458693';
  
  // Hash the password
  const hash = await bcrypt.hash(password, 10);
  console.log('Generated password hash:', hash);
  console.log('');
  
  // Insert user
  try {
    // First ensure columns exist
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
    `);
    
    // Delete existing user
    await pool.query(`DELETE FROM users WHERE email = $1`, [email]);
    
    // Insert new user
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, name, phone, role, is_active)
      VALUES ($1, $2, $3, $4, 'admin', true)
      RETURNING id, email, name, role
    `, [email, hash, name, phone]);
    
    console.log('✓ User created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', result.rows[0].id);
    console.log('Role:', result.rows[0].role);
    console.log('');
    console.log('You can now log in at: /login');
    
  } catch (error) {
    console.error('Error creating user:', error.message);
  } finally {
    await pool.end();
  }
}

createUser();