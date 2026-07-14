import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// SSL configuration for AWS RDS
const sslConfig = process.env.DB_SSL === 'true' ? {
  rejectUnauthorized: false, // Set to true in production with proper CA
  // For production, you should use:
  // ca: fs.readFileSync('./rds-ca-2019-root.pem').toString(),
} : false;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'user_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: sslConfig,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.error('Please check your AWS RDS configuration:');
    console.error('1. Security Group inbound rules (port 5432)');
    console.error('2. Your IP is whitelisted');
    console.error('3. Database credentials are correct');
    console.error('4. RDS instance is in "available" state');
  } else {
    console.log('Database connected successfully');
    release();
  }
});

export default pool;