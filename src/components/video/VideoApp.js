import MainWindow from "./MainWindow";
import LoginWindow from "./LoginWindow";
import './VideoApp.css'; // 스타일을 적용하기 위한 CSS 파일을 임포트합니다.

import { useState } from "react";
import { svg_title_icon } from "../../constants"; // 상수로 정의된 SVG 아이콘을 임포트합니다.

const VideoApp = () => {
  // 상태 훅 설정
  const [isMain, setIsMain] = useState(false); // 메인 윈도우 표시 여부를 저장하는 상태 (초기값: false)
  const [createRoom, setCreateRoom] = useState(false); // 방 생성 여부를 저장하는 상태 (초기값: false)
  const [room, setRoom] = useState(); // 방 ID를 저장하는 상태
  const [username, setUsername] = useState(""); // 사용자 이름을 저장하는 상태

  // 클릭 핸들러 함수
  function handleClick(createRoom) {
    setIsMain(true); // 메인 윈도우를 표시하도록 상태 업데이트
    setCreateRoom(createRoom); // 방 생성 여부를 상태에 업데이트
  }

  // 나가기 핸들러 함수
  function handleLeave() {
    setIsMain(false); // 로그인 윈도우를 표시하도록 상태 업데이트
  }

  return (
      <div className="videobody flex items-center justify-center min-h-screen over flow-hidden">
        {isMain ? (
            <MainWindow
                room={room}
                username={username}
                onLeave={handleLeave}
                createRoom={createRoom}
            />
        ) : (
            <div className="w-full flex flex-col justify-center items-center">
              <div className="flex space-x-3 my-4 justify-center items-center">
                <svg
                    fill="white"
                    className="w-12 h-12"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                >
                  <path d={svg_title_icon} />
                </svg>
                <h1 className="text-white font-bold text-2xl text-center">
                  Video Conference App
                </h1>
              </div>
              <LoginWindow
                  handleClick={handleClick}
                  setRoomId={setRoom}
                  setUsername={setUsername}
              />
            </div>
        )}
      </div>
  );
};

export default VideoApp;
