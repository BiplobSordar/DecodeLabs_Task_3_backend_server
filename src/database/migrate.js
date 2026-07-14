import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migration on AWS RDS...');
    console.log(`📡 Host: ${process.env.DB_HOST}`);
    
    // Test connection
    const result = await client.query('SELECT version()');
    console.log('✅ Connected to PostgreSQL:', result.rows[0].version);
    
    // Check if database exists
    const dbCheck = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [process.env.DB_NAME || 'user_management']
    );
    
    if (dbCheck.rows.length === 0) {
      console.log(`📝 Creating database: ${process.env.DB_NAME}`);
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    }
    
    // Read and execute migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Creating tables...');
    await client.query(migrationSQL);
    console.log('✅ Tables created successfully!');
    
    // Check if we need to seed data
    const checkRoles = await client.query('SELECT COUNT(*) FROM roles');
    const roleCount = parseInt(checkRoles.rows[0].count);
    
    if (roleCount === 0) {
      console.log('🌱 Seeding data...');
      const seedPath = path.join(__dirname, 'seeds', '001_seed_data.sql');
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSQL);
      console.log('✅ Data seeded successfully!');
    } else {
      console.log(`ℹ️ Roles already exist (${roleCount} found). Skipping seed.`);
    }
    
    // Check if refresh_tokens table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'refresh_tokens'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('📝 Creating refresh_tokens table...');
      const refreshTokenSQL = `
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token TEXT NOT NULL UNIQUE,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            revoked BOOLEAN DEFAULT FALSE,
            device_info TEXT,
            ip_address INET,
            user_agent TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked ON refresh_tokens(revoked);
      `;
      await client.query(refreshTokenSQL);
      console.log('✅ refresh_tokens table created successfully!');
    } else {
      console.log('ℹ️ refresh_tokens table already exists.');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === '28P01') {
      console.error('🔑 Authentication failed - check username/password');
    } else if (error.code === '3D000') {
      console.error('📁 Database does not exist - create it first');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused - check security group and IP whitelist');
    } else if (error.code === '23505') {
      console.error('⚠️ Duplicate key error - data already exists. Skipping...');
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrate().catch(console.error);