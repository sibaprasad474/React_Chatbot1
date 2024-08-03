import React, { useState, useEffect } from "react";
import {
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Checkbox,
  Card,
  IconButton,
  Paper,
  TextField,
  Modal,
  Tooltip,
  Stack,
  Skeleton,
  Box,
} from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CloseIcon from "@mui/icons-material/Close";
import MicIcon from "@mui/icons-material/Mic";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import SendIcon from "@mui/icons-material/Send";
import { io } from "socket.io-client";
import {
  fetchQuizCode,
  fetchUserNamesByQuizCode,
  fetchMessagesByToUserName,
  insertMessage,
} from "../Api";

function Message() {
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState({});
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [quizData, setQuizData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [selectedQuizCode, setSelectedQuizCode] = useState("");
  const [loadingQuizData, setLoadingQuizData] = useState(true);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [userType, setUserType] = useState("examiner");
  const [unreadMessages, setUnreadMessages] = useState({});

  const socket = io("http://localhost:8000");

  useEffect(() => {
    return () => {
      socket.off("receiveMessage");
    };
  }, [socket]);

  useEffect(() => {
    const getQuizData = async () => {
      try {
        const response = await fetchQuizCode();
        setQuizData(response.data);
      } catch (error) {
        console.error("Failed to fetch quiz data", error);
      } finally {
        setLoadingQuizData(false);
      }
    };
    getQuizData();
  }, []);

  useEffect(() => {
    if (selectedQuizCode) {
      setLoadingUserData(true);
      const getUserData = async () => {
        try {
          const response = await fetchUserNamesByQuizCode(selectedQuizCode);
          setUserData(response.data);
        } catch (error) {
          console.error("Failed to fetch user data", error);
        } finally {
          setLoadingUserData(false);
        }
      };
      getUserData();
    }
  }, [selectedQuizCode]);

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => ({
        ...prevMessages,
        [message.to_user_name]: [
          ...(prevMessages[message.to_user_name] || []),
          {
            ...message,
            timestamp: new Date(message.created_on).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ],
      }));

      if (selectedUser?.user_name !== message.from_user_name) {
        setUnreadMessages((prevCounts) => ({
          ...prevCounts,
          [message.from_user_name]:
            (prevCounts[message.from_user_name] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedUser, socket]);

  const handleSelectAll = () => {
    if (selected.length === userData.length) {
      setSelected([]);
    } else {
      setSelected(userData.map((user) => user.user_name));
    }
  };

  const handleCheckboxChange = (userName) => {
    setSelected((prevSelected) =>
      prevSelected.includes(userName)
        ? prevSelected.filter((item) => item !== userName)
        : [...prevSelected, userName]
    );
  };

  const handleMessageAll = () => {
    setSelected(userData.map((user) => user.user_name));
    setSelectedUser({ user_name: "All Users", first_name: "All Users" });
    setOpen(true); // Open the modal
  };

  const handleOpen = async (user) => {
    setSelectedUser(user);
    setOpen(true);
    setUnreadMessages((prevCounts) => ({
      ...prevCounts,
      [user.user_name]: 0,
    }));
    try {
      const response = await fetchMessagesByToUserName(user.user_name);
      setMessages((prevMessages) => ({
        ...prevMessages,
        [user.user_name]: response.data.map((message) => ({
          ...message,
          timestamp: new Date(message.created_on).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      }));
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleSendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const newMessage = {
        from_user_name: userType,
        to_user_name: selectedUser.user_name,
        message_body: currentMessage,
        created_by: userType,
        modified_by: userType,
        created_on: new Date().toISOString(),
      };
      setCurrentMessage("");
      try {
        await insertMessage({
          from_user_name: userType,
          to_user_name: selectedUser.user_name,
          quiz_code: selectedQuizCode,
          message_body: currentMessage,
          created_by: userType,
          modified_by: userType,
        });

        setMessages((prevMessages) => ({
          ...prevMessages,
          [selectedUser.user_name]: [
            ...(prevMessages[selectedUser.user_name] || []),
            {
              ...newMessage,
              timestamp: new Date(newMessage.created_on).toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              ),
            },
          ],
        }));

        socket.emit("sendMessage", newMessage);
      } catch (error) {
        console.error("Failed to insert message", error);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    // console.log(timestamp);

    return timestamp;
  };

  return (
    <Card
      sx={{
        width: "80vw",
        p: 2,
        m: "auto",
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
        mt: 5,
        borderRadius: 3,
      }}
    >
      <Grid container sx={{ width: "90%" }}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              justifyContent: "center",
            }}
          >
            <Typography variant="h6" sx={{ mr: 2 }}>
              Test:
            </Typography>
            <FormControl variant="outlined" sx={{ minWidth: 400, mr: 2 }}>
              <Select
                value={selectedQuizCode}
                onChange={(e) => setSelectedQuizCode(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select
                </MenuItem>
                {loadingQuizData ? (
                  <Skeleton variant="rectangular" width="100%" height={40} />
                ) : (
                  quizData.map((quiz) => (
                    <MenuItem key={quiz.quiz_code} value={quiz.quiz_code}>
                      {quiz.quiz_name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={handleMessageAll}
              sx={{ mr: 2 }}
            >
              Message All
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSelectAll}
              sx={{ mr: 2 }}
            >
              {selected.length === userData.length && userData.length > 0
                ? "Deselect All"
                : "Select All"}
            </Button>
          </Box>
          {loadingUserData ? (
            <Skeleton variant="text" />
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#3b84bf" }}>
                    <TableCell>
                      <Checkbox
                        checked={
                          selected.length === userData.length &&
                          userData.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>User</TableCell>
                    <TableCell sx={{ color: "white" }}>Username</TableCell>
                    <TableCell sx={{ color: "white" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userData.map((user) => (
                    <TableRow key={user.user_name}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(user.user_name)}
                          onChange={() => handleCheckboxChange(user.user_name)}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={unreadMessages[user.user_name] || 0}
                          arrow
                        >
                            {user.user_name}
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={unreadMessages[user.user_name] || 0}
                          arrow
                        >
                            {user.first_name}
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Badge
                          badgeContent={unreadMessages[user.user_name] || 0}
                          color="error"
                        >
                          <Button
                            onClick={() => handleOpen(user)}
                            variant="contained"
                            color="primary"
                          >
                            Chat
                          </Button>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
        <Grid item xs={9}>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "60vw",
                maxWidth: "600px",
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
                // p: 2,
              }}
            >
              <Card>
                <Box
                  sx={{
                    backgroundColor: "primary.light",
                    color: "whitesmoke",
                    p: 2,
                  }}
                >
                  <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item>
                      <SupportAgentIcon
                        sx={{ verticalAlign: "middle", mr: 1 }}
                      />
                      <Typography variant="h6" component="span">
                        Chat with{" "}
                        {selectedUser?.user_name === "All Users"
                          ? "All Users"
                          : selectedUser?.first_name || "User"}
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
                    p: 2,
                    height: "50vh",
                    overflowY: "auto",
                  }}
                >
                  <Stack spacing={2}>
                    {selectedUser && selectedUser.user_name === "All Users"
                      ? Object.keys(messages).flatMap((user) =>
                          messages[user].map((message, index) => (
                            <Box
                              key={index}
                              sx={{
                                alignSelf:
                                  message.from_user_name === userType
                                    ? "flex-end"
                                    : "flex-start",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  backgroundColor:
                                    message.from_user_name === userType
                                      ? "primary.main"
                                      : "grey.300",
                                  color:
                                    message.from_user_name === userType
                                      ? "whitesmoke"
                                      : "black",
                                  borderRadius: 1,
                                  p: 1,
                                  maxWidth: "90%", // Increased width
                                  wordWrap: "break-word",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {message.message_body}
                                <Typography
                                  variant="caption"
                                  sx={{
                                    alignSelf:
                                      message.from_user_name === userType
                                        ? "flex-end"
                                        : "flex-start",
                                    color:
                                      message.from_user_name === userType
                                        ? "whitesmoke"
                                        : "black",
                                    mt: 0.5,
                                  }}
                                >
                                  {formatTimestamp(message.timestamp)}
                                </Typography>
                              </Typography>
                            </Box>
                          ))
                        )
                      : messages[selectedUser?.user_name]?.map(
                          (message, index) => (
                            <Box
                              key={index}
                              sx={{
                                alignSelf:
                                  message.from_user_name === userType
                                    ? "flex-end"
                                    : "flex-start",
                                    width: '10rem',
                                    borderRadius: 2,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  backgroundColor:
                                    message.from_user_name === userType
                                      ? "primary.main"
                                      : "grey.300",
                                  color:
                                    message.from_user_name === userType
                                      ? "whitesmoke"
                                      : "black",
                                  borderRadius: 1,
                                  p: 1,
                                  maxWidth: "90%", // Increased width
                                  wordWrap: "break-word",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {message.message_body}
                                <Typography
                                  variant="caption"
                                  sx={{
                                    alignSelf:
                                      message.from_user_name === userType
                                        ? "flex-end"
                                        : "flex-start",
                                    color:
                                      message.from_user_name === userType
                                        ? "whitesmoke"
                                        : "black",
                                    mt: 0.5,
                                  }}
                                >
                                  {formatTimestamp(message.timestamp)}
                                </Typography>
                              </Typography>
                            </Box>
                          )
                        )}
                  </Stack>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderTop: 1,
                    borderColor: "divider",
                    p: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <IconButton>
                      <MicIcon fontSize="medium" />
                    </IconButton>
                  <IconButton>
                      <ScreenShareIcon fontSize="medium" />
                    </IconButton>
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    sx={{ ml: 1 }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Card>
            </Box>
          </Modal>
        </Grid>
      </Grid>
    </Card>
  );
}

export default Message;
