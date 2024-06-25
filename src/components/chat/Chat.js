import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Message from './Message';
import { API_URLS } from '../../api/apiConfig';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [nickname] = useState(localStorage.getItem('name') || '');
  const [accessToken] = useState(localStorage.getItem('accessToken') || '');
  const [isConnected, setIsConnected] = useState(false);
  const [boothTitle, setBoothTitle] = useState('');
  const [boothId, setBoothId] = useState(null);

  const socketRef = useRef(null);
  const chatListRef = useRef(null);

  useEffect(() => {
    const storedBoothId = JSON.parse(sessionStorage.getItem('boothId'));
    if (storedBoothId && storedBoothId.boothId) {
      setBoothId(storedBoothId.boothId);
    }
  }, []);

  useEffect(() => {
    const fetchBoothTitle = async () => {
      try {
        if (!boothId) return;
        const response = await axios.get(
          API_URLS.BOOTH_GET_BY_ID.replace('{id}', boothId),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        setBoothTitle(response.data.title);
      } catch (error) {
        console.error('부스 제목 가져오기 에러', error);
      }
    };

    if (boothId) {
      fetchBoothTitle();
    }
  }, [boothId, accessToken]);

  useEffect(() => {
    if (!accessToken || !boothId) return;
    // const socket = io("http://localhost:5000", {
    const socket = io('https://js3.jsflux.co.kr', {
      path: '/socket',
      auth: { token: accessToken, userId: nickname }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('서버에 연결됨');
      socket.emit('joinRoom', boothId);
      setIsConnected(true);
    });

    socket.on('chat message', (data) => {
      setMessages(prevMessages => [...prevMessages, data]);

      axios.post(API_URLS.SAVE_CHAT_MESSAGE, {
        boothId: boothId,
        nickname: data.nickname,
        message: data.message,
        createdAt: new Date().toISOString()
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => {
        console.log('메시지 저장 성공:', response.data);
      })
      .catch(error => {
        console.error('메시지 저장 에러:', error);
      });
    });

    socket.on('disconnect', () => {
      console.log('서버와 연결 해제됨');
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('WebSocket 에러:', error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, boothId, nickname]);

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!isConnected) {
      console.error('소켓 연결 안됨');
      return;
    }

    if (input.trim()) {
      socketRef.current.emit('chat message', {
        message: input,
        nickname: nickname,
        roomId: boothId,
      });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg p-4">
      <span className="text-center text-white font-bold mb-4 bg-gray-700 rounded p-2">{boothTitle}</span>
      <div className="flex-grow overflow-y-auto mb-4 p-2 bg-gray-700 rounded" ref={chatListRef}>
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
      <div className="flex">
        <input
          type="text"
          className="flex-grow p-2 bg-gray-600 text-white rounded-l"
          placeholder="메시지를 입력하세요."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-r"
          onClick={sendMessage}
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default Chat;