// config/db.js
const mysql = require('mysql');

// Create a connection to the database
const con = mysql.createConnection({
     host: '103.39.241.181',
     user: 'alok',
     password: '@l0K@2023',
     database: 'total_assessment',

});

// Connect to the database
con.connect((err) => {
    if (err) {
        console.log('Error connecting to the database:', err);
    } else {
        console.log('Connected to the MySQL database.');
    }
});

module.exports = con;