import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import BasicAppbar from './components/BasicAppbar';
import Message from './pages/Message';
import StudentChat from './pages/StudentChat';

function App() {
  return (
      <Router>
        <BasicAppbar />
        <Routes>
          <Route path="/message" element={<Message />} />
          <Route path="/studentchat" element={<StudentChat />} />
          <Route path="/" element={<Navigate to="/message" />} />
        </Routes>
      </Router>
  );
}

export default App;
