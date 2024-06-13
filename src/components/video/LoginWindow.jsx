import { useState } from "react";

// LoginWindow 컴포넌트는 handleClick, setRoomId, setUsername이라는 세 가지 props를 받습니다.
function LoginWindow({ handleClick, setRoomId, setUsername }) {
    return (

        <div className="bg-primary text-white text-poppins mx-2 w-[90%] sm:w-4/6 md:w-1/2 lg:w-2/5 flex flex-col px-6 ss:px-[5%] rounded-xl">
            {/* 사용자 이름 입력 필드 */}
            <label className="text-2xl mt-6 ml-2">Username</label>
            <input
                id="usernameInput"
                type="text"
                className="bg-secondary border-highlight border-2 p-2 rounded-xl text-lg text-gray-600"
                onChange={(e) => setUsername(e.target.value)} // 입력 값이 변경될 때 setUsername 함수를 호출하여 상태를 업데이트합니다.
            ></input>

            {/* 룸 ID 입력 필드 */}
            <label className="text-2xl mt-6 ml-2">Room ID</label>
            <input
                id="roomInput"
                type="text"
                className="bg-secondary border-highlight border-2 p-2 rounded-xl text-lg text-gray-600"
                placeholder="(Join Only)"
                onChange={(e) => setRoomId(e.target.value)} // 입력 값이 변경될 때 setRoomId 함수를 호출하여 상태를 업데이트합니다.
            ></input>

            {/* CREATE 및 JOIN 버튼 */}
            <div className="my-6 flex flex-col space-y-3 ss:flex-row ss:space-y-0 ss:justify-between ">
                <button
                    id="createButton"
                    className="bg-green px-5 py-2 rounded-xl font-bold hover:bg-hover active:translate-y-1 ss:text-xl"
                    onClick={() => handleClick(true)} // 클릭 시 handleClick 함수를 호출하여 true 값을 전달합니다 (방 생성).
                >
                    CREATE
                </button>
                <button
                    id="joinButton"
                    className="bg-green px-8 py-2 rounded-xl font-bold hover:bg-hover active:translate-y-1 ss:text-xl"
                    onClick={() => handleClick(false)} // 클릭 시 handleClick 함수를 호출하여 false 값을 전달합니다 (방 참가).
                >
                    JOIN
                </button>
            </div>
        </div>

    );
}

export default LoginWindow;
