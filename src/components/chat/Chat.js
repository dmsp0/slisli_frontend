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
      auth: { token: accessToken, userId: nickname }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('joinRoom', boothId); // 채팅방에 참여하는 이벤트 보내기
      setIsConnected(true);  
    });

    socket.on('chat message', (data) => {
      setMessages(prevMessages => [...prevMessages, { ...data, time: new Date().toLocaleTimeString() }]);
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
  }, [accessToken, boothId, nickname]);

  const sendMessage = () => {
    if (!isConnected) {
      console.error('Socket is not connected');
      return;
    }

    if (input.trim()) {
      socketRef.current.emit('chat message', { message: input, userId: socketRef.current.id, nickname: nickname, roomId: boothId }); // roomId 전송
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-list">
        {messages.map((msg, index) => (
          <Message 
            key={index} 
            message={msg.message} 
            userId={msg.userId} 
            time={msg.time} 
            nickname={msg.nickname} 
          />
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
