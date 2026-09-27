const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool to handle multiple concurrent queries efficiently
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export promise-based interface for async/await support
module.exports = pool.promise();