import './Message.css';

const Message = ({ userId, message, time, nickname }) => {
  const myName = localStorage.getItem('name');
  const isSentByMe = nickname === myName; // 수정된 부분: userId 대신 nickname으로 비교

  return (
    <div className={`message ${isSentByMe ? 'sent' : 'received'}`}>
      {!isSentByMe && (
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
