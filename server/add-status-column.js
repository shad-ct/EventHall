import pool from './db.js';

async function addStatusColumn() {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      "ALTER TABLE event_registrations ADD COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING' AFTER registration_type"
    );
    console.log('Status column added successfully');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Status column already exists');
    } else {
      console.error('Error:', error);
    }
  } finally {
    connection.release();
    await pool.end();
  }
}

addStatusColumn();
