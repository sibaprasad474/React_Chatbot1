const express = require('express');
const router = express.Router();
const MessageController = require('../Controllers/MessageController');

let io; // Declare the io variable

// Set the io instance
const setSocketIo = (ioInstance) => {
    io = ioInstance;
    // Pass io to the controller
    MessageController.setSocketIo(io);
};

// Define the route to get Quiz Code
router.get('/quiz_code', MessageController.getQuizCode);

// Define the route to get user names by quiz code
// router.get('/user_names/:quiz_code', MessageController.getUserNamesByQuizCode);

router.post('/user_names', MessageController.getUserNamesByQuizCode);

// Define the route to insert a message
router.post('/insert_message', MessageController.insertMessage);

// Update the route to get messages by user name to use POST method
router.post('/messages', MessageController.getMessagesByToUserName);

// Define the route to handle button click events
router.post('/button_click', MessageController.handleButtonClick);

module.exports = {
    router,
    setSocketIo
};
