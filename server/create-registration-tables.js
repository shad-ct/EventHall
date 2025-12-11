import pool from './db.js';

const createTables = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Creating registration_form_questions table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS registration_form_questions (
        id VARCHAR(255) PRIMARY KEY,
        event_id VARCHAR(255) NOT NULL,
        question_category VARCHAR(100) NOT NULL,
        question_key VARCHAR(255) NOT NULL,
        question_text VARCHAR(500) NOT NULL,
        question_type ENUM('text', 'email', 'dropdown', 'textarea', 'url', 'yes/no', 'multi-select') DEFAULT 'text',
        options JSON,
        is_required BOOLEAN DEFAULT FALSE,
        display_order INT DEFAULT 0,
        is_custom BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        UNIQUE KEY unique_event_question (event_id, question_key),
        INDEX idx_event_id (event_id),
        INDEX idx_question_category (question_category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ registration_form_questions table created');

    console.log('Creating registration_form_responses table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS registration_form_responses (
        id VARCHAR(255) PRIMARY KEY,
        registration_id VARCHAR(255) NOT NULL,
        question_id VARCHAR(255) NOT NULL,
        answer_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (registration_id) REFERENCES event_registrations(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES registration_form_questions(id) ON DELETE CASCADE,
        INDEX idx_registration_id (registration_id),
        INDEX idx_question_id (question_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ registration_form_responses table created');

    console.log('Checking event_registrations table for registration_type column...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'eventhall' 
      AND TABLE_NAME = 'event_registrations' 
      AND COLUMN_NAME = 'registration_type'
    `);

    if (columns.length === 0) {
      console.log('Adding registration_type column to event_registrations...');
      await connection.query(`
        ALTER TABLE event_registrations 
        ADD COLUMN registration_type ENUM('EXTERNAL', 'FORM') DEFAULT 'EXTERNAL' AFTER event_id
      `);
      console.log('✓ registration_type column added');
    } else {
      console.log('✓ registration_type column already exists');
    }

    console.log('Checking events table for registration_method column...');
    const [eventColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'eventhall' 
      AND TABLE_NAME = 'events' 
      AND COLUMN_NAME = 'registration_method'
    `);

    if (eventColumns.length === 0) {
      console.log('Adding registration_method column to events...');
      await connection.query(`
        ALTER TABLE events 
        ADD COLUMN registration_method ENUM('EXTERNAL', 'FORM') DEFAULT 'EXTERNAL' AFTER external_registration_link
      `);
      console.log('✓ registration_method column added');
    } else {
      console.log('✓ registration_method column already exists');
    }

    console.log('\n✅ All registration tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
};

createTables();
