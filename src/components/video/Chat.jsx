import { useState } from "react";
import { svg_send } from "../../constants";

function Chat({ history, handleMessage }) {
  const [myMessage, setMyMessage] = useState("");

  const handleChange = (event) => {
    setMyMessage(event.target.value);
  };

  return (
    <div className="hidden md:flex flex-col-reverse w-[32%] max-h-[61vh] md:max-h-[73vh] mt-2">
      <div className="flex items-center justify-center space-x-3 mt-4">
        <input
          type="text"
          className="bg-secondary p-2 rounded-xl text-md w-[80%]"
          placeholder="Type a message..."
          value={myMessage}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleMessage(myMessage);
              setMyMessage("");
            }
          }}
        ></input>
        <button
          className="bg-green hover:bg-hover p-2 rounded-xl"
          onClick={() => {
            handleMessage(myMessage);
            setMyMessage("");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d={svg_send} />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-start overflow-auto hover:overflow-y-scroll h-[90%] bg-secondary rounded-xl">
        {history.length > 0 &&
          history.map((message, index) => (
            <div key={index} className="flex flex-col p-1 space-y-2">
              <label className="mx-2 font-bold">{message.user}</label>
              <span className="bg-secondary border-highlight border-2 mx-4 px-3 py-2 rounded-xl text-md">
                {message.contents}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Chat;
