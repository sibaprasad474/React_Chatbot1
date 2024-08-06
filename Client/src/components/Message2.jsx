import React, { useState, useEffect } from 'react';
import {
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  Divider,
  Card,
  Grid,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Badge,
  InputBase
} from "@mui/material";
import { MessageRounded } from '@mui/icons-material';
import DataTable from "react-data-table-component";
import ChatIcon from '@mui/icons-material/Chat';
import {
  fetchQuizCode,
  fetchUserNamesByQuizCode,
  fetchMessagesByToUserName,
  insertMessage,
  buttonClickEvent,
} from "../Api";
import Chatbot2 from './Chatbot2';
import { io } from "socket.io-client";

const customStyles = {
  rows: {
    style: {
      minHeight: "40px",
    },
  },
  headCells: {
    style: {
      paddingLeft: "8px",
      paddingRight: "8px",
      backgroundColor: "#0D47A1",
      color: "white",
      minHeight: "35px",
      fontSize: "18px",
    },
  },
  cells: {
    style: {
      paddingLeft: "8px",
      paddingRight: "8px",
      paddingTop: "5px",
      paddingBottom: "5px",
    },
  },
};

const drawerWidth = 200;

const Message2 = () => {
  const [examList, setExamList] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [examineeList, setExamineeList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});

  const socket = io("http://localhost:8000");

  useEffect(() => {
    const getQuizData = async () => {
      try {
        const response = await fetchQuizCode();
        const quizData = response.data;
        setExamList(quizData);
      } catch (error) {
        console.error("Failed to fetch quiz data", error);
      }
    };
    getQuizData();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      setLoadingUserData(true);
      const getUserData = async () => {
        try {
          const response = await fetchUserNamesByQuizCode(selectedExam);
          const examineeData = response.data.map((examinee, index) => ({
            ...examinee,
            index: index + 1,
          }));
          setExamineeList(examineeData);
        } catch (error) {
          console.error("Failed to fetch user data", error);
        } finally {
          setLoadingUserData(false);
        }
      };
      getUserData();
    }
  }, [selectedExam]);

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      setUnreadMessages((prevCounts) => {
        const newCounts = {
          ...prevCounts,
          [message.from_user_name]: (prevCounts[message.from_user_name] || 0) + 1,
        };
        console.log("Updated unread messages:", newCounts);
        return newCounts;
      });
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket]);

  const handleChange = (event) => {
    setSelectedExam(event.target.value);
  };
  const handleMessageAllClick = async () => {
    try {
      await buttonClickEvent();
      alert('Message sent to all users');
    } catch (error) {
      console.error("Failed to send message to all users", error);
      alert('Failed to send message to all users');
    }
  };

  const handleChatClick = (user) => {
    setSelectedUser(user);
    setOpenModal(true);
    setUnreadMessages((prevCounts) => ({
      ...prevCounts,
      [user.user_name]: 0,
    }));
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const columns = [
    {
      name: "Serial No",
      selector: (row) => row.index,
      sortable: true,
    },
    {
      name: "Examinee User Name",
      selector: (row) => (<p style={{ fontSize: "16px" }}>{row.user_name}</p>),
      sortable: true,
    },
    {
      name: "Examinee Full Name",
      selector: (row) => (<p style={{ fontSize: "16px" }}>{row.full_name}</p>),
      sortable: true,
    },
    {
      name: "Action",
      width: "15%",
      cell: (row) => (
        <Button
          variant="contained"
          color="success"
          onClick={() => handleChatClick(row)}
          endIcon={
            <Badge badgeContent={unreadMessages[row.user_name] || 0} color="error">
              <ChatIcon />
            </Badge>
          }
        >
          Chat
        </Button>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ display: "flex", height: "100vh", backgroundColor: "default.light" }}>
        <CssBaseline />
        <Box component="main" sx={{ flexGrow: 1, p: 2, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
          <br />
          <Card sx={{ p: 2 }}>
            <Grid container sx={{ mt: 1, p: 2 }} justifyContent="center" spacing={2}>
              <Grid item lg={3}>
                <p variant="body1" fontWeight="600" style={{ padding: "10px", textAlign: "right" }}>Test Name:</p>
              </Grid>
              <Grid item lg={6}>
                <TextField
                  id="outlined-select-currency"
                  select
                  label="Select Your Test"
                  value={selectedExam}
                  onChange={handleChange}
                  fullWidth
                >
                  {examList.map((option) => (
                    <MenuItem key={option.quiz_code} value={option.quiz_code}>
                      {option.quiz_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item lg={3}>
                <Button variant='contained' sx={{ mt: 1 }} onClick={handleMessageAllClick}  color='info' startIcon={<MessageRounded />}>
                  Message All
                </Button>
              </Grid>
            </Grid>
            {selectedExam && (
              <DataTable
                customStyles={customStyles}
                columns={columns}
                data={examineeList}
                pagination
                fixedHeader
                fixedHeaderScrollHeight="450px"
                selectableRowsHighlight
                highlightOnHover
                subHeader
              />
            )}
          </Card>

          <Chatbot2 openModal={openModal} handleCloseModal={handleCloseModal} selectedUser={selectedUser} />
        </Box>
      </Box>
    </>
  );
};

export default Message2;
