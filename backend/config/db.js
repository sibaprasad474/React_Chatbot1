const mysql = require('mysql2');

// Create a connection pool to the database
const pool = mysql.createPool({
    host: '103.39.241.181',
    user: 'alok',
    password: '@l0K@2023',
    database: 'total_assessment',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true
});

// Create a promise-based wrapper
const connection = pool.promise();

module.exports = connection;
