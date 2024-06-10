const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const path = require("path");
const server = http.createServer(app);
const socketIO = require("socket.io");
const moment = require("moment");

const io = socketIO(server);

// CORS 설정
app.use(cors());

// 정적 파일에 대한 경로 설정
app.use(express.static(path.join(__dirname, 'public')));

// favicon.ico와 logo192.png에 대한 접근 권한 허용
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

app.get('/logo192.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'logo192.png'));
});

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("chatting", (data) => {
    const { name, msg } = data;
    io.emit("chatting", {
      name: name,
      msg: msg,
      time: moment(new Date()).format("h:ss A"),
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
