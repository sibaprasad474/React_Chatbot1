import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Divider,
  Typography,
  IconButton,
  InputBase,
  Button
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import wp_bg from "../assets/images/wp_bg.jpg";
import {
  fetchMessagesByToUserName,
  insertMessage,
} from "../Api";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  boxShadow: 24,
  height: 400,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
};

const footerStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
};

const chatBoxStyle = {
  flexGrow: 1,
  p: 1,
  overflowY: 'auto',
  color: 'white',
  backgroundImage: `url(${wp_bg})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
};

const messageStyle = {
  p: 1,
  borderRadius: "10px 0px 10px 10px",
  maxWidth: "55%",
  boxShadow: "2px solid #6E6E6E",
  position: 'relative',
  mb: 2,
  wordWrap: 'break-word',
  display: 'block',
};

const timeStampStyle = {
  display: 'flex',
  alignItems: 'center',
  color: "#616161",
  fontSize: "12px",
  mt: 0.5,
};

const Chatbot2 = ({ openModal, handleCloseModal, selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  // Global variable for concatenated user name and code
  const userCode = `${selectedUser?.user_name}${selectedUser?.user_code}`;

  useEffect(() => {
    if (openModal && selectedUser) {
      // Fetch initial messages
      fetchMessages();

      // Set up socket listener
      socket.on("receiveMessage", (message) => {
        if (message.to_user_name === userCode || message.to_user_name === "All Users") {
          setMessages((prevMessages) => [...prevMessages, formatMessage(message)]);
        }
      });

      // Clean up socket listener on unmount or modal close
      return () => {
        socket.off("receiveMessage");
      };
    }
  }, [openModal, selectedUser, messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetchMessagesByToUserName(userCode);
      setMessages(response.data.map(formatMessage));
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const formatMessage = (message) => ({
    text: message.message_body,
    sender: message.from_user_name === userCode ? "student" : "examiner",
    timestamp: formatTimestamp(message.created_on),
  });

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "No Timestamp";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = async () => {
    if (currentMessage.trim() !== "" && selectedUser) {
      const newMessage = {
        text: currentMessage,
        sender: "examiner",
        recipient: userCode,
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, formatMessage(newMessage)]);
      setCurrentMessage("");

      try {
        await insertMessage({
          from_user_name: 'examiner',
          to_user_name: userCode,
          quiz_code: "D4DB470E-7CA9-B8FE-040F-FE5F3D3CB510",
          message_body: currentMessage,
          created_by: "examiner",
          modified_by: "examiner",
          created_on: newMessage.timestamp,
        });
        socket.emit("sendMessage", {
          ...newMessage,
          from_user_name: 'examiner',
          to_user_name: userCode,
        });
      } catch (error) {
        console.error("Failed to insert message", error);
      }
    } else {
      console.error("Message cannot be empty or no user selected");
    }
  };

  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="user-details-modal"
      aria-describedby="modal-to-show-user-details"
    >
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: "10px", backgroundColor: "#01579B" }}>
          <Typography variant="h6" sx={{ color: "white", margin: 0 }}>
            Chat with {selectedUser?.full_name}
          </Typography>
          <IconButton onClick={handleCloseModal}>
            <CloseIcon style={{ color: "white" }} />
          </IconButton>
        </Box>
        <Divider sx={{ backgroundColor: "white" }} />
        <Box sx={chatBoxStyle}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                ...messageStyle,
                alignSelf:
                  message.sender === "examiner" ? "flex-end" : "flex-start",
                backgroundColor:
                  message.sender === "examiner" ? "#d6d6d6" : "#BBDEFB",
                borderRadius:
                  message.sender === "examiner"
                    ? "10px 0px 10px 10px"
                    : "0px 10px 10px 10px",
                marginRight: message.sender === "examiner" ? "0" : "auto",
                marginLeft: message.sender === "examiner" ? "auto" : "0",
              }}
            >
              {message.text}
              <Box sx={timeStampStyle}>
                <AccessTimeIcon style={{ fontSize: "12px", marginRight: "4px" }} />
                {message.timestamp}
                <DoneAllIcon style={{ fontSize: "12px", marginLeft: "4px" }} />
              </Box>
            </Box>
          ))}
        </Box>
        <Divider sx={{ backgroundColor: "white" }} />
        <Box sx={footerStyle}>
          <InputBase
            sx={{ ml: 1, flex: 1, color: "#6E6E6E" }}
            placeholder="Type a message..."
            inputProps={{ 'aria-label': 'type a message' }}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage}>
            <SendIcon color='info' />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default Chatbot2;
