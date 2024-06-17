import React from 'react';
import './Message.css';

const Message = ({ name, msg, time, nickname }) => {
  const isSentByMe = name === nickname;

  return (
    <div className={`message ${isSentByMe ? 'sent' : 'received'}`}>
      {!isSentByMe && (
        <span className="profile">
          <span className="user">{nickname}</span>
        </span>
      )}
      <span className="message-text">{msg}</span>
      <span className="time">{time}</span>
    </div>
  );
};

export default Message;
