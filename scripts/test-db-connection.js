/**
 * Database Connection Test Script
 * Run this to test your database connection without starting the full app
 * Usage: node scripts/test-db-connection.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectTimeout: 5000
};

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🧪 Database Connection Test");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`Host: ${config.host}:${config.port}`);
console.log(`User: ${config.user}`);
console.log(`Database: ${config.database}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

async function testConnection() {
    let connection;

    try {
        console.log("⏳ Attempting to connect...");
        connection = await mysql.createConnection(config);

        console.log("✅ Connection successful!\n");

        // Test query
        console.log("📊 Running test query...");
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log("✅ Query successful! Result:", rows[0].result);

        // Check database
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log("\n📁 Available databases:");
        databases.forEach(db => {
            const dbName = Object.values(db)[0];
            const marker = dbName === config.database ? '✅' : '  ';
            console.log(`${marker} ${dbName}`);
        });

        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ All tests passed! Your database connection works.");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    } catch (error) {
        console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("❌ Connection failed!");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("Error:", error.message);
        console.error("Code:", error.code);

        console.log("\n💡 Common Solutions:");

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log("   → Wrong username or password");
            console.log("   → Check DATABASE_USER and DATABASE_PASSWORD in .env");
        } else if (error.code === 'ECONNREFUSED') {
            console.log("   → Database server not running or not reachable");
            console.log("   → Check DATABASE_HOST and DATABASE_PORT in .env");
        } else if (error.code === 'ETIMEDOUT') {
            console.log("   → Connection timeout");
            console.log("   → Check firewall settings");
            console.log("   → Verify the server is accepting remote connections");
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log("   → Database does not exist");
            console.log("   → Create the database or use a different name");
        }

        console.log("\n📝 Current .env settings:");
        console.log(`   DATABASE_HOST=${config.host}`);
        console.log(`   DATABASE_PORT=${config.port}`);
        console.log(`   DATABASE_USER=${config.user}`);
        console.log(`   DATABASE_PASSWORD=${config.password ? '***' : '(empty)'}`);
        console.log(`   DATABASE_NAME=${config.database}`);

        process.exit(1);

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testConnection();
