const express = require('express');
const router = express.Router();
const MessageController = require('../Controllers/MessageController');

let io; // Declare the io variable

// Set the io instance
const setSocketIo = (ioInstance) => {
    io = ioInstance;
    // Pass io to the controller if needed
    MessageController.setSocketIo(io);
};

// Define the route to get Quiz Code
router.get('/quiz_code', MessageController.getQuizCode);

router.get('/user_names/:quiz_code', MessageController.getUserNamesByQuizCode);

router.post('/insert_message', MessageController.insertMessage);

router.get('/messages/:to_user_name', MessageController.getMessagesByToUserName);
router.post('/button_click', MessageController.handleButtonClick);

module.exports = {
    router,
    setSocketIo
};
