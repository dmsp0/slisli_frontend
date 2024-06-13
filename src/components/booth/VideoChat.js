// import React, { useState, useEffect, useRef } from "react";
// import io from "socket.io-client";
// import './chatStyle.css'; // 필요한 스타일 시트를 가져옵니다.
//
// const socket = io();
//
// const VideoChat = () => {
//   const [nickname, setNickname] = useState("");
//   const [chatInput, setChatInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const displayContainerRef = useRef(null);
//
//   useEffect(() => {
//     socket.on("chatting", (data) => {
//       setMessages((prevMessages) => [...prevMessages, data]);
//       scrollToBottom();
//     });
//
//     return () => {
//       socket.off("chatting");
//     };
//   }, []);
//
//   const scrollToBottom = () => {
//     if (displayContainerRef.current) {
//       displayContainerRef.current.scrollTo(0, displayContainerRef.current.scrollHeight);
//     }
//   };
//
//   const send = () => {
//     if (nickname && chatInput) {
//       const param = {
//         name: nickname,
//         msg: chatInput,
//         time: new Date().toLocaleTimeString()
//       };
//       socket.emit("chatting", param);
//       setChatInput("");
//     }
//   };
//
//   const handleInputChange = (e) => {
//     setChatInput(e.target.value);
//   };
//
//   const handleNicknameChange = (e) => {
//     setNickname(e.target.value);
//   };
//
//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       send();
//     }
//   };
//
//   return (
//     <div className="video-chat">
//       <input
//         type="text"
//         id="nickname"
//         placeholder="Enter your nickname"
//         value={nickname}
//         onChange={handleNicknameChange}
//       />
//       <ul className="chatting-list">
//         {messages.map((msg, index) => (
//           <li key={index} className={nickname === msg.name ? "sent" : "received"}>
//             <span className="profile">
//               <span className="user">{msg.name}</span>
//               <img className="img" src="/images/simson.png" alt="any" />
//             </span>
//             <span className="message">{msg.msg}</span>
//             <span className="time">{msg.time}</span>
//           </li>
//         ))}
//       </ul>
//       <div className="input-container">
//         <input
//           type="text"
//           className="chatting-input"
//           placeholder="Enter your message"
//           value={chatInput}
//           onChange={handleInputChange}
//           onKeyPress={handleKeyPress}
//         />
//         <button className="send-button" onClick={send}>Send</button>
//       </div>
//       <div className="display-container" ref={displayContainerRef}></div>
//     </div>
//   );
// };
//
// export default VideoChat;
