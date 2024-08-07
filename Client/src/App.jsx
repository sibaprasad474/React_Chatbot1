import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import BasicAppbar from './components/BasicAppbar';
import Message from './pages/Message';
import StudentChat from './pages/StudentChat';
import Message2 from './components/Message2';

function App() {
  return (
      <Router>
        <BasicAppbar />
        <Routes>
          <Route path="/message" element={<Message />} />
          <Route path="/studentchat" element={<StudentChat />} />
          <Route path="/" element={<Navigate to="/message2" />} />
          <Route path="/message2" element={<Message2/>} />
        </Routes>
      </Router>
  );
}

export default App;
