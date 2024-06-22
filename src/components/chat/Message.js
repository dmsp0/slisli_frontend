import './Message.css';

const Message = ({ userId, message, time, nickname }) => {
  const myName = localStorage.getItem('name');
  const isSentByMe = nickname === myName;
  const isSystemMessage = userId === 'system';

  return (
    <div className={`message ${isSentByMe ? 'sent' : 'received'} ${isSystemMessage ? 'system' : ''}`}>
      {!isSentByMe && !isSystemMessage && (
        <span className="profile">
          <span className="user">{nickname}</span>
        </span>
      )}
      <span className="message-text">{message}</span>
      <span className="time">{time}</span>
    </div>
  );
};

export default Message;
