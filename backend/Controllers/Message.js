const connection = require('../config/db'); // Use the new connection pool module

let io;

exports.setSocketIo = (socketIo) => {
    io = socketIo;
};

exports.getQuizCode = async (req, res) => {
    try {
        const [results] = await connection.query(`
            SELECT * 
            FROM quizmaster 
            WHERE org_code = "STLIND"
            AND created_by = "EXAMINERSTLIND";
        `);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching quiz codes and names:', err);
        res.status(500).send('Error fetching quiz codes and names');
    }
};

exports.getUserNamesByQuizCode = async (req, res) => {
    const { quiz_code } = req.body; // Extract quiz_code from the body
    try {
        const [results] = await connection.query(`
            SELECT
                B.user_name,
                CONCAT(COALESCE(B.first_name, ''), ' ', COALESCE(B.middle_name, ''), ' ', COALESCE(B.last_name, '')) AS full_name,
                C.org_code,
                C.org_name,          
                D.quiz_name,
                E.exam_centre_name
            FROM
                quiz_examinee A
            LEFT JOIN
                usermaster B
            ON
                A.examinee_code = B.user_code
            LEFT JOIN
                organizationmaster C
            ON
                B.org_code = C.org_code
            LEFT JOIN
                quizmaster D
            ON
                A.quiz_code = D.quiz_code
            LEFT JOIN
                exam_centre_master E
            ON
                C.org_code = E.org_code
            WHERE
                A.quiz_code = ?
        `, [quiz_code]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching user names:', err);
        res.status(500).send('Error fetching user names');
    }
};

exports.getMessagesByToUserName = async (req, res) => {
    const { to_user_name } = req.body;
    try {
        const [results] = await connection.query(`
            SELECT message_body, created_on, created_by, from_user_name, to_user_name
            FROM message_master
            WHERE to_user_name = ? OR from_user_name = ?
        `, [to_user_name, to_user_name]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).send('Error fetching messages');
    }
};

exports.insertMessage = async (req, res) => {
    const { from_user_name, to_user_name, quiz_code, message_body, created_by, modified_by } = req.body;

    // Basic validation
    if (!from_user_name || !to_user_name || !quiz_code || !message_body || !created_by || !modified_by) {
        return res.status(400).send('Please fill in all fields');
    }

    try {
        const [result] = await connection.query(`
            INSERT INTO message_master (from_user_name, to_user_name, quiz_code, message_body, created_on, created_by, modified_by, modified_on)
            VALUES (?, ?, ?, ?, NOW(), ?, ?, NOW())
        `, [from_user_name, to_user_name, quiz_code, message_body, created_by, modified_by]);
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
    } catch (err) {
        console.error('Error inserting message:', err);
        res.status(500).send('Error inserting message');
    }
};

exports.handleButtonClick = (req, res) => {
    const { messageTitle, message } = req.body;
    
    // Emit both messageTitle and message to all connected users
    io.emit('button_clicked', { messageTitle, message });
    
    res.status(200).send('Event sent to all connected users');
};
