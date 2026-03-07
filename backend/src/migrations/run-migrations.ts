import fs from 'fs';
import path from 'path';
import pool from '../config/database';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    const migrationPath = path.join(__dirname, '../../migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
