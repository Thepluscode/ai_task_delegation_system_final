/**
 * Database Connection Test Script
 * 
 * This script tests the PostgreSQL database connection
 * with detailed error reporting to diagnose connection issues.
 */

const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  // Get connection details from environment or use defaults
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'robot_service',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
  
  const client = new Client(config);
  
  console.log('=== PostgreSQL Connection Test ===');
  console.log('Connection config:');
  // Show config but hide password
  console.log({
    ...config,
    password: '********',
  });
  
  try {
    console.log('\nAttempting to connect to PostgreSQL...');
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    console.log('\nTesting query execution...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Query successful - Database time: ${result.rows[0].current_time}`);
    
    console.log('\nTesting database metadata...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️ No tables found in the public schema');
    } else {
      console.log('Tables in database:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    await client.end();
    console.log('\n✅ Connection test completed successfully');
    return true;
  } catch (err) {
    console.error('\n❌ Failed to connect to PostgreSQL:');
    console.error('Error details:', err.message);
    
    // Provide more helpful guidance based on error type
    if (err.code === 'ECONNREFUSED') {
      console.error('\nPossible causes:');
      console.error('- PostgreSQL server is not running');
      console.error('- Incorrect host or port configuration');
      console.error('\nRecommendations:');
      console.error('1. Verify PostgreSQL is running: brew services list (Mac) or systemctl status postgresql (Linux)');
      console.error('2. Check .env file for correct DB_HOST and DB_PORT values');
    } else if (err.code === 'ENOTFOUND') {
      console.error('\nPossible cause: Host name cannot be resolved');
      console.error('\nRecommendation: Check DB_HOST value in .env file');
    } else if (err.code === '28P01') {
      console.error('\nPossible cause: Authentication failed - incorrect username or password');
      console.error('\nRecommendation: Check DB_USERNAME and DB_PASSWORD values in .env file');
    } else if (err.code === '3D000') {
      console.error('\nPossible cause: Database does not exist');
      console.error('\nRecommendations:');
      console.error('1. Create database: CREATE DATABASE robot_service;');
      console.error('2. Check DB_DATABASE value in .env file');
    }
    
    try {
      await client.end();
    } catch (closeErr) {
      // Ignore close errors
    }
    
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });