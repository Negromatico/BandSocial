import React, { createContext, useContext, useState } from 'react';

const ChatDockContext = createContext();

export const useChatDock = () => {
  const context = useContext(ChatDockContext);
  if (!context) {
    throw new Error('useChatDock debe usarse dentro de ChatDockProvider');
  }
  return context;
};

export const ChatDockProvider = ({ children }) => {
  const [chatToOpen, setChatToOpen] = useState(null);

  const openChat = (chatInfo) => {
    // chatInfo debe tener: { with, withEmail, withNombre, chatId, avatar, initialMessage }
    // initialMessage es opcional y se enviará automáticamente al abrir el chat
    setChatToOpen(chatInfo);
  };

  return (
    <ChatDockContext.Provider value={{ chatToOpen, openChat, setChatToOpen }}>
      {children}
    </ChatDockContext.Provider>
  );
};
