import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  IconButton,
  Paper,
  Modal,
  Stack,
  Box,
  Badge,
  InputBase,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { insertMessage, fetchMessagesByToUserName } from "../Api";
import { io } from "socket.io-client";
import wp_bg from "../assets/images/wp_bg.jpg";

const socket = io("http://localhost:8000");

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  boxShadow: 24,
  height: 400,
  display: "flex",
  flexDirection: "column",
  backgroundColor: "white",
};

const footerStyle = {
  display: "flex",
  alignItems: "center",
  padding: "10px",
};

const chatBoxStyle = {
  flexGrow: 1,
  p: 1,
  overflowY: "auto",
  color: "white",
  backgroundImage: `url(${wp_bg})`,
};

const messageStyle = {
  p: 1,
  borderRadius: "10px 0px 10px 10px",
  maxWidth: "55%",
  boxShadow: "2px solid #6E6E6E",
  position: "relative",
  mb: 2,
  wordWrap: "break-word",
  display: "block",
};

const timeStampStyle = {
  display: "flex",
  alignItems: "center",
  color: "#616161",
  fontSize: "12px",
  mt: 0.5,
};
const darkWarningStyles = {
  width: 'auto',
  maxWidth: '500px',
  height: 'auto',
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: '#FF6F00', // Darker orange color
  color: '#FFF', // Text color
  '& .MuiAlert-icon': {
    color: '#FFF', // Icon color
  },
};


function StudentChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const students = [
    { id: 1, user_name: "STL296", first_name: "Alok", online: true },
    { id: 2, user_name: "STL173", first_name: "Sridhar", online: true },
    { id: 3, user_name: "STL433", first_name: "Itishree", online: false },
  ];

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      const timestamp = message.created_on;
      const fromUser = message.from_user_name;
      const toUser = message.to_user_name;

      if (toUser === selectedUser?.user_name || toUser === "All Users") {
        const newMessage = {
          text: message.message_body,
          sender: fromUser === selectedUser?.user_name ? "student" : "other",
          timestamp: formatTimestamp(timestamp),
        };

        setMessages((prevMessages) => {
          const existingMessage = prevMessages.find(
            (msg) =>
              msg.text === newMessage.text &&
              msg.timestamp === newMessage.timestamp
          );
          if (!existingMessage) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });

        if (!open && toUser !== selectedUser?.user_name) {
          setUnreadMessages((prevCounts) => {
            const newCount = (prevCounts[fromUser] || 0) + 1;
            return {
              ...prevCounts,
              [fromUser]: newCount,
            };
          });
        }
      }
    });

    socket.on("button_clicked", (data) => {
      setSnackbarMessage(data.message);
      setSnackbarOpen(true);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("button_clicked");
    };
  }, [open, selectedUser]);

  const handleOpen = async (user) => {
    setSelectedUser(user);
    setOpen(true);
    setUnreadMessages((prevCounts) => ({ ...prevCounts, [user.user_name]: 0 }));

    try {
      const response = await fetchMessagesByToUserName(user.user_name);
      setMessages(
        response.data.map((message) => ({
          text: message.message_body,
          sender:
            message.from_user_name === user.user_name ? "student" : "other",
          timestamp: formatTimestamp(message.created_on),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMessages([]);
    setCurrentMessage("");
    setSelectedUser(null);
  };

  const getCurrentTimestamp = () => {
    return new Date().toISOString();
  };

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
        sender: "student",
        recipient: selectedUser.user_name,
        timestamp: getCurrentTimestamp(),
      };

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: newMessage.text,
          sender: newMessage.sender,
          timestamp: formatTimestamp(newMessage.timestamp),
        },
      ]);
      setCurrentMessage("");

      try {
        await insertMessage({
          from_user_name: selectedUser.user_name,
          to_user_name: "examiner",
          quiz_code: "D4DB470E-7CA9-B8FE-040F-FE5F3D3CB510",
          message_body: currentMessage,
          created_by: "student",
          modified_by: "student",
          created_on: newMessage.timestamp,
        });
        socket.emit("sendMessage", {
          ...newMessage,
          from_user_name: selectedUser.user_name,
          to_user_name: "examiner",
        });
      } catch (error) {
        console.error("Failed to insert message", error);
      }
    } else {
      console.error("Message cannot be empty or no user selected");
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Card
      sx={{
        width: "80vw",
        p: 2,
        m: "auto",
        boxShadow: "rgba(0, 0, 0, 0.15) 0px 2px 5px",
        height: "40vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TableContainer
        component={Paper}
        sx={{ mt: 2, flexGrow: 1, overflowY: "auto" }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#3c8dbc" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                User Name
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Name
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow
                key={student.user_name}
                onClick={() => handleOpen(student)}
              >
                <TableCell>{student.user_name}</TableCell>
                <TableCell>{student.first_name}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpen(student)}
                  >
                    <Badge
                      badgeContent={unreadMessages[student.user_name] || 0}
                      color="error"
                    >
                      <ChatIcon />
                    </Badge>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              backgroundColor: "#01579B",
            }}
          >
            <Typography variant="h6" sx={{ color: "white", margin: 0 }}>
              Chat with {selectedUser?.first_name || "Student"}
            </Typography>
            <IconButton onClick={handleClose}>
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
                    message.sender === "student" ? "flex-end" : "flex-start",
                  backgroundColor:
                    message.sender === "student" ? "#C8E6C9" : "#BBDEFB",
                  borderRadius:
                    message.sender === "student"
                      ? "10px 0px 10px 10px"
                      : "0px 10px 10px 10px",
                  marginRight: message.sender === "student" ? "0" : "auto",
                  marginLeft: message.sender === "student" ? "auto" : "0",
                }}
              >
                {message.text}
                <Box sx={timeStampStyle}>
                  <AccessTimeIcon
                    style={{ fontSize: "12px", marginRight: "4px" }}
                  />
                  {message.timestamp}
                  <DoneAllIcon
                    style={{ fontSize: "12px", marginLeft: "4px" }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={footerStyle}>
            <InputBase
              placeholder="Type a message"
              fullWidth
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <IconButton color="primary" onClick={handleSendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Modal>
      <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={handleSnackbarClose}
        severity="warning"
        sx={darkWarningStyles}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
    </Card>
  );
}

export default StudentChat;
