const express = require('express');
const router = express.Router();
const Message = require('../Controllers/Message');

let io; // Declare the io variable

// Set the io instance
const setSocketIo = (ioInstance) => {
    io = ioInstance;
    // Pass io to the controller
    Message.setSocketIo(io);
};

// Define the route to get Quiz Code
router.get('/quiz_code', Message.getQuizCode);

// Define the route to get user names by quiz code
// router.get('/user_names/:quiz_code', Message.getUserNamesByQuizCode);

router.post('/user_names', Message.getUserNamesByQuizCode);

// Define the route to insert a message
router.post('/insert_message', Message.insertMessage);

// Update the route to get messages by user name to use POST method
router.post('/messages', Message.getMessagesByToUserName);

// Define the route to handle button click events
router.post('/button_click', Message.handleButtonClick);

module.exports = {
    router,
    setSocketIo
};
