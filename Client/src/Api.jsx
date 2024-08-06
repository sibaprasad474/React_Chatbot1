// frontend/src/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

export const fetchQuizCode = () => API.get('/quiz_code');

export const fetchUserNamesByQuizCode = (quiz_code) => API.get(`/user_names/${quiz_code}`);

export const insertMessage = (messageData) => API.post('/insert_message', messageData);

// New route for fetching messages by username
export const fetchMessagesByToUserName = (to_user_name) => API.get(`/messages/${to_user_name}`);

export const buttonClickEvent = () => API.post('/button_click');

