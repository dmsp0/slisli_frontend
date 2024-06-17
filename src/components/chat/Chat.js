import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Message from './Message';
import './Chat.css';

const Chat = ({ boothId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [nickname] = useState(localStorage.getItem('name') || '');
  const [accessToken] = useState(localStorage.getItem('accessToken') || '');
  const [isConnected, setIsConnected] = useState(false);  

  const socketRef = useRef(null);

  useEffect(() => {
    if (!accessToken || !boothId) return;

    const socket = io('http://localhost:5000', {
      path: '/socket',
      auth: { token: accessToken }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('joinRoom', boothId);
      setIsConnected(true);  
    });

    socket.on('chat message', (data) => {
      setMessages(prevMessages => [...prevMessages, data]);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);  
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, boothId]);

  const sendMessage = () => {
    if (!isConnected) {
      console.error('Socket is not connected');
      return;
    }

    if (input.trim()) {
      socketRef.current.emit('chat message', { message: input, name: nickname, time: new Date().toLocaleTimeString() });
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-list">
        {messages.map((msg, index) => (
          <Message key={index} name={msg.name} msg={msg.message} time={msg.time} nickname={nickname} />
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="메시지를 입력하세요."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
};

export default Chat;
