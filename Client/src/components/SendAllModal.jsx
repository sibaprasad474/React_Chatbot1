import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/system';
import { Modal, Backdrop, Button, TextField, Divider, Typography, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useSpring, animated } from '@react-spring/web'; // Import useSpring
import { buttonClickEvent } from "../Api";

export default function SendAllModal({ open, handleClose, examineeList }) {
  const [messageTitle, setMessageTitle] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSend = async () => {
    try {
      const users = examineeList.map(examinee => examinee.user_name);
      console.log(users);
      
      await buttonClickEvent({ messageTitle, message});
      
      handleClose();
    } catch (error) {
      console.error("Failed to send message to all users", error);
      alert('Failed to send message to all users');
    }
  };

  return (
    <CustomModal
      aria-labelledby="message-all-modal-title"
      aria-describedby="message-all-modal-description"
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={StyledBackdrop}
    >
      <Fade in={open}>
        <ModalContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: "10px", backgroundColor: "#01579B" }}>
            <Typography variant="h6" sx={{ color: "white", margin: 0 }}>
              Message All Examinee
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon style={{ color: "white" }} />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ flexGrow: 1, p: 1, minHeight: 200 }}>
            <TextField
              label="Message Title"
              fullWidth
              margin="normal"
              value={messageTitle}
              onChange={(e) => setMessageTitle(e.target.value)}
            />
            <TextField
              id="message-box"
              label="Message"
              placeholder='Type your message here...'
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              sx={{ height: 100, mt: 1 }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Box>
          <Divider />
          <Button
            sx={{ float: "right", m: 2, width: '30%', ml: 35 }}
            variant='contained'
            color='info'
            endIcon={<SendIcon />}
            fontSize='small'
            onClick={handleSend}
          >
            Send
          </Button>
        </ModalContent>
      </Fade>
    </CustomModal>
  );
}

SendAllModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  examineeList: PropTypes.array.isRequired,
};

const CustomModal = styled(Modal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;

const Fade = React.forwardRef(function Fade(props, ref) {
  const { in: open, children, onEnter, onExited, ...other } = props;
  const style = useSpring({
    from: { opacity: 0 },
    to: { opacity: open ? 1 : 0 },
    onStart: () => {
      if (open && onEnter) {
        onEnter(null, true);
      }
    },
    onRest: () => {
      if (!open && onExited) {
        onExited(null, true);
      }
    },
  });

  return (
    <animated.div ref={ref} style={style} {...other}>
      {children}
    </animated.div>
  );
});

Fade.propTypes = {
  children: PropTypes.element.isRequired,
  in: PropTypes.bool,
  onEnter: PropTypes.func,
  onExited: PropTypes.func,
};

const ModalContent = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
`;
