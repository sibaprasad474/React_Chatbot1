import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/system';
import { Modal as BaseModal, Backdrop, Button, TextField } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';
import { buttonClickEvent } from "../Api";

export default function SendAllModal({ open, handleClose }) {
  const [message, setMessage] = React.useState("");

  const handleSend = async () => {
    try {
      await buttonClickEvent({ message });
      alert('Message sent to all users');
      handleClose();
    } catch (error) {
      console.error("Failed to send message to all users", error);
      alert('Failed to send message to all users');
    }
  };

  return (
    <div>
      <Modal
        aria-labelledby="spring-modal-title"
        aria-describedby="spring-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={StyledBackdrop}
      >
        <Fade in={open}>
          <ModalContent>
            <TextField
              id="spring-modal-description"
              label="Enter message"
              variant="outlined"
              fullWidth
              margin="normal"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={handleSend}>Send</Button>
          </ModalContent>
        </Fade>
      </Modal>
    </div>
  );
}

SendAllModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

const Modal = styled(BaseModal)`
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
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
`;
