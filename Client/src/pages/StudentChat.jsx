import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  IconButton,
  Paper,
  Modal,
  Tooltip,
  Stack,
  Box,
  Badge,
} from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CloseIcon from "@mui/icons-material/Close";
import MicIcon from "@mui/icons-material/Mic";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import { insertMessage, fetchMessagesByToUserName } from "../Api";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

function StudentChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  

  const students = [
    { id: 1, user_name: "STL296", first_name: "Alok", online: true },
    { id: 2, user_name: "STL173", first_name: "Sridhar", online: true },
    { id: 3, user_name: "STL433", first_name: "Itishree", online: false },
    // Add more students as needed
  ];

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      console.log("Received message:", message);

      const timestamp = message.created_on;
      const fromUser = message.from_user_name;
      const toUser = message.to_user_name;

      if (
        toUser === selectedUser?.user_name ||
        toUser === "All Users"
      ) {
        const newMessage = {
          text: message.message_body,
          sender: fromUser === selectedUser?.user_name ? "student" : "other",
          timestamp: formatTimestamp(timestamp),
        };

        // Add the message to the messages state only if it's not already there
        setMessages((prevMessages) => {
          const existingMessage = prevMessages.find(
            (msg) => msg.text === newMessage.text && msg.timestamp === newMessage.timestamp
          );
          if (!existingMessage) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });

        // Update unread messages count for the user if the modal is not open
        if (!open && toUser !== selectedUser?.user_name) {
          console.log(`Updating unread count for ${fromUser}`);
          setUnreadMessages((prevCounts) => {
            const newCount = (prevCounts[fromUser] || 0) + 1;
            console.log("New unread count:", newCount);
            return {
              ...prevCounts,
              [fromUser]: newCount,
            };
          });
        }
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [open, selectedUser]);

  const handleOpen = async (user) => {
    console.log("Opening chat with:", user.user_name);
    setSelectedUser(user);
    setOpen(true);
    setUnreadMessages((prevCounts) => ({ ...prevCounts, [user.user_name]: 0 }));

    try {
      const response = await fetchMessagesByToUserName(user.user_name);
      setMessages(
        response.data.map((message) => ({
          text: message.message_body,
          sender: message.from_user_name === user.user_name ? "student" : "other",
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
    return new Date().toISOString(); // ISO format
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
        timestamp: getCurrentTimestamp(), // Use current timestamp for the new message
      };

      // Add the message to the messages state before sending it
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
          to_user_name: 'examiner',
          quiz_code: "D4DB470E-7CA9-B8FE-040F-FE5F3D3CB510",
          message_body: currentMessage,
          created_by: "student",
          modified_by: "student",
          created_on: newMessage.timestamp, // Include created_on in the request
        });
        socket.emit("sendMessage", {
          ...newMessage,
          from_user_name: selectedUser.user_name,
          to_user_name: 'examiner',
        });
      } catch (error) {
        console.error("Failed to insert message", error);
      }
    } else {
      console.error("Message cannot be empty or no user selected");
    }
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
      <TableContainer component={Paper} sx={{ mt: 2, flexGrow: 1, overflowY: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#3c8dbc" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>User Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.user_name} onClick={() => handleOpen(student)}>
                <TableCell>{student.user_name}</TableCell>
                <TableCell>{student.first_name}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpen(student)}>
                    <Badge badgeContent={unreadMessages[student.user_name] || 0} color="error">
                      <ChatIcon />
                    </Badge>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box sx={style}>
          <Card>
            <Box sx={{ backgroundColor: "primary.light", color: "whitesmoke", p: 2 }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <SupportAgentIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                  <Typography variant="h6" component="span">
                    Chat with {selectedUser?.first_name || "Student"}
                  </Typography>
                </Grid>
                <Grid item>
                  <Tooltip title="Close">
                    <IconButton onClick={handleClose}>
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Box>
            <Box
              sx={{
                height: "32vh",
                backgroundColor: "#E3F2FD",
                overflowY: "auto",
                p: 2,
              }}
            >
              <Stack spacing={2}>
                {messages.map((message, index) => {
                  console.log("Message:", message); // Log the message to inspect its structure
                  return (
                    <Box
                      key={index}
                      sx={{
                        alignSelf: message.sender === "student" ? "flex-end" : "flex-start",
                        mb: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: message.sender === "student" ? "#D1C4E9" : "#BBDEFB",
                          color: "black",
                          p: 1,
                          borderRadius: 2,
                          wordWrap: "break-word",
                          display: "flex",
                          flexDirection: "column",
                          width: '10rem',
                        }}
                      >
                        {message.text}
                        <Typography variant="caption" sx={{ color: "gray", mt: 0.5 }}>
                          {message.timestamp}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
            <Grid container spacing={2} sx={{ padding: "5px", alignItems: "center" }}>
              <Grid item xs={9}>
                <input
                  type="text"
                  placeholder="Enter Your Message ....."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "5px",
                    border: "none",
                    borderRadius: "4px",
                    outline: "none",
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
                  <Tooltip title="Mic">
                    <IconButton>
                      <MicIcon fontSize="medium" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Screen Share">
                    <IconButton>
                      <ScreenShareIcon fontSize="medium" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send Message">
                    <IconButton
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: "primary.light",
                        borderRadius: "50%",
                      }}
                      onClick={handleSendMessage}
                    >
                      <SendIcon fontSize="small" sx={{ color: "white" }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Box>
      </Modal>
    </Card>
  );
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "40vw",
  height: "50vh",
  boxShadow: 24,
};

export default StudentChat;
