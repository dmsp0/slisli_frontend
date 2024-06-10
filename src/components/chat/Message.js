// Message.js

import React from 'react';
import './Message.css';

const Message = ({ name, msg, time }) => {
  const nickname = "임시닉네임";

  return (
    <div className={`message ${name === nickname ? 'sent' : 'received'}`}>
      {!name === nickname && (
        <span className="profile">
          <span className="user">{name}</span>
          <img className="img" src="/images/simson.png" alt="profile" />
        </span>
      )}
      <span className="message-text">{msg}</span>
      <span className="time">{time}</span>
    </div>
  );
};

export default Message;
