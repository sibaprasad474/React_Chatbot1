// MessageContext.jsx
import React, { createContext, useState } from 'react';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [newMessage, setNewMessage] = useState(null);

  return (
    <MessageContext.Provider value={{ newMessage, setNewMessage }}>
      {children}
    </MessageContext.Provider>
  );
};
