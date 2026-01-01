import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Resolve the SQL file relative to this script file in a cross-platform way
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SQL_FILE = path.resolve(__dirname, '..', 'database', 'eventhall.sql');

const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const dbName = 'eventhall';

const run = async () => {
  try {
    const sql = await fs.readFile(SQL_FILE, 'utf8');
    console.log(`Read SQL file: ${SQL_FILE}`);

    // Create a connection with multipleStatements enabled so we can run the full file
    const connection = await mysql.createConnection({ host, user, password, multipleStatements: true });

    try {
      console.log(`Creating database '${dbName}' if it does not exist...`);
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);

      // Use the database and execute the SQL script
      await connection.query(`USE \`${dbName}\`;`);
      console.log('Executing SQL script (this may take a moment)...');
      await connection.query(sql);

      console.log(`✅ Successfully imported ${path.basename(SQL_FILE)} into database '${dbName}'.`);
    } finally {
      await connection.end();
    }
  } catch (err) {
    console.error('Failed to import SQL file:', err);
    process.exitCode = 1;
  }
};

run();
