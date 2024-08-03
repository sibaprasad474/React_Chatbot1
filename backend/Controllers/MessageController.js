const con = require('../config/db');
const util = require('util');

// Promisify the query method
const query = util.promisify(con.query).bind(con);

// SQL queries
const GET_QUIZ_CODE_SQL = `
    SELECT * 
    FROM quizmaster 
    WHERE org_code = "STLIND"
    AND created_by = "EXAMINERSTLIND";
`;

const GET_USER_NAMES_BY_QUIZ_CODE_SQL = `
    SELECT *
    FROM usermaster um
    JOIN quiz_examinee qe ON um.user_code = qe.examinee_code
    WHERE qe.quiz_code = ?
`;

let io;

const setSocketIo = (socketIo) => {
    io = socketIo;
};

const getQuizCode = async (req, res) => {
    try {
        const results = await query(GET_QUIZ_CODE_SQL);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching quiz codes and names:', err);
        res.status(500).send('Error fetching quiz codes and names');
    }
};

const getUserNamesByQuizCode = async (req, res) => {
    const quizCode = req.params.quiz_code;
    try {
        const results = await query(GET_USER_NAMES_BY_QUIZ_CODE_SQL, [quizCode]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching user names:', err);
        res.status(500).send('Error fetching user names');
    }
};

const insertMessage = (req, res) => {
    const { from_user_name, to_user_name, quiz_code, message_body, created_by, modified_by } = req.body;

    // Basic validation
    if (!from_user_name || !to_user_name || !quiz_code || !message_body || !created_by || !modified_by) {
        return res.status(400).send('Please fill in all fields');
    }

    const sql = `
        INSERT INTO message_master (from_user_name, to_user_name, quiz_code, message_body, created_on, created_by, modified_by, modified_on)
        VALUES (?, ?, ?, ?, NOW(), ?, ?, NOW())
    `;

    con.query(sql, [from_user_name, to_user_name, quiz_code, message_body, created_by, modified_by], (err, result) => {
        if (err) {
            console.error('Error inserting message:', err);
            res.status(500).send('Error inserting message');
        } else {
            console.log('Message inserted, ID:', result.insertId);
            res.status(200).send('Message inserted successfully');

            // Emit the 'receiveMessage' event to all connected clients
            io.emit('receiveMessage', {
                from_user_name,
                to_user_name,
                quiz_code,
                message_body,
                created_on: new Date(),
                created_by,
                modified_by
            });
        }
    });
};

const getMessagesByToUserName = (req, res) => {
    const toUserName = req.params.to_user_name;

    const sql = `
        SELECT message_body, created_on, created_by, from_user_name, to_user_name
        FROM message_master
        WHERE to_user_name = ?
    `;

    con.query(sql, [toUserName], (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err);
            res.status(500).send('Error fetching messages');
        } else {
            res.status(200).json(results);
        }
    });
};

module.exports = {
    setSocketIo,
    getQuizCode,
    getUserNamesByQuizCode,
    insertMessage,
    getMessagesByToUserName
};
