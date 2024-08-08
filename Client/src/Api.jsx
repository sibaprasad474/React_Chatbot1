import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

// Fetch Quiz Code
export const fetchQuizCode = () => API.get('/quiz_code');

// Fetch User Names by Quiz Code (using POST and sending quiz_code in the request body)
export const fetchUserNamesByQuizCode = (quiz_code) => API.post('/user_names', { quiz_code });

// Insert Message (no change needed as it already sends data in the body)
export const insertMessage = (messageData) => API.post('/insert_message', messageData);

// Fetch Messages by To User Name (using POST and sending to_user_name in the request body)
export const fetchMessagesByToUserName = (to_user_name) => API.post('/messages', { to_user_name });

// Button Click Event (no change needed as it already sends data in the body)
export const buttonClickEvent = (data) => API.post('/button_click', data);

// Example of a function route with parameters in the body
export const fetchMessages = ({ fromUserName, toUserName }) => 
  API.post('/messages', { from_user_name: fromUserName, to_user_name: toUserName });
