// Chat.js

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Message from './Message';
import './Chat.css';

const socket = io('http://localhost:5000', {
  path: '/socket',
});

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    const fetchRoomId = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/getRoomId');
        const data = await response.json();
        setRoomId(data.roomId);
        joinRoom(data.roomId);
      } catch (error) {
        console.error('Error fetching roomId:', error);
      }
    };

    fetchRoomId();

    socket.on('chatting', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = (room) => {
    socket.emit('joinRoom', room);
  };

  const sendMessage = () => {
    if (input.trim() && nickname.trim()) {
      const param = {
        name: nickname,
        msg: input,
        time: new Date().toLocaleTimeString(),
        isSent: true, // 보낸 메시지 여부 추가
      };
      socket.emit('chatting', param);
      setInput('');
      setMessages((prevMessages) => [...prevMessages, param]);
    }
  };

  return (
    <div className="chat-container">
      <input
        type="text"
        placeholder="Enter your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <div className="chat-list">
        {messages.map((msg, index) => (
          <Message
            key={index}
            name={msg.name}
            msg={msg.msg}
            time={msg.time}
            isSent={msg.isSent} // 메시지 송신 여부 전달
          />
        ))}
      </div>
      <input
        type="text"
        placeholder="Enter your message"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage();
          }
        }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
