import React from 'react';
import './Message.css';

const Message = ({ userId, message, time, name }) => {
  const isSentByMe = userId === name;

  return (
    <div className={`message ${isSentByMe ? 'sent' : 'received'}`}>
      {!isSentByMe && (
        <span className="profile">
          <span className="user">{name}</span>
        </span>
      )}
      <span className="message-text">{message}</span>
      <span className="time">{time}</span>
    </div>
  );
};

export default Message;
