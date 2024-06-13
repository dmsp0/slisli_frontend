import VideoContainer from "./VideoContainer";
import Chat from "./Chat";
import Participants from "./Participants";
import {
  svg_call,
  svg_camOff,
  svg_camOn,
  svg_mic,
  svg_mute,
} from "../../constants";

import { useRef, useState, useEffect } from "react";
import janus, { Janus } from "janus-gateway";

function MainWindow({ room, username, onLeave, createRoom }) {
  //Button variables
  const [isChat, setIsChat] = useState(false);
  const [isMic, setIsMic] = useState(true);
  const [isCam, setIsCam] = useState(true);

  const [participants, setParticipants] = useState({});

  //Configuration variables
  const SERVER_URL = "https://janus.jsflux.co.kr/janus";

  let roomId = room
      ? room
      : Math.floor(Math.random() * (39999 - 30000 + 1)) + 30000;
  const [janusInstance, setJanusInstance] = useState();
  const [roomLabel, setRoomLabel] = useState(roomId);

  //Text Room variables
  const textOpaqueId = Janus.randomString(12);
  let textPlugin = null;
  let transactions = {};
  let textParticipants = {};
  let textId = null;

  const [messagePlugin, setMessagePlugin] = useState(null);
  const [textMessage, setTextMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);

  function initJanus() {
    return new Promise((resolve, reject) => {
      Janus.init({
        callback: () => {
          const janus = new Janus({
            server: SERVER_URL,
            success: () => {
              setJanusInstance(janus);
              console.log("Janus initialized successfuly!");
              resolve();
            },
            error: (err) => {
              console.log("Janus initialization failed !");
              console.log("ERROR: " + err);
              reject();
            },
          });
        },
      });
    });
  }

  function JanusTextRoom() {
    janusInstance.attach({
      plugin: "janus.plugin.textroom",
      opaqueId: textOpaqueId,
      success: (pluginHandle) => {
        textPlugin = pluginHandle;
        setMessagePlugin(pluginHandle);
        console.log(`Attached plugin ${textPlugin.getPlugin()}`);
        const setupRequest = { request: "setup" };
        textPlugin.send({ message: setupRequest });
      },
      error: (error) => {
        console.error("Error attaching text room!");
        console.error(error);
      },
      onmessage: (message, jsep) => {
        console.log("Got a message (Text Room)");
        if (message.error) console.error(message.error);
        if (jsep) {
          textPlugin.createAnswer({
            jsep: jsep,
            tracks: [{ type: "data" }],
            success: (jsep) => {
              console.log("Got SDP! (Text Room)");
              const ackRequest = { request: "ack" };
              textPlugin.send({ message: ackRequest, jsep: jsep });
            },
            error: (error) => {
              console.error("WebRTC Error");
              console.error(error);
            },
          });
        }
      },
      ondataopen: (label, protocol) => {
        console.log("Data Channel is open (Text Room)");
        console.log(parseInt(roomId));

        if (createRoom) {
          let transaction = Janus.randomString(12);
          transactions[transaction] = handleTransaction;
          const createRequest = {
            textroom: "create",
            transaction: transaction,
            permanent: false,
            is_private: false,
            room: parseInt(roomId),
          };
          textPlugin.data({
            text: JSON.stringify(createRequest),
            error: (error) => {
              console.error(error);
            },
          });
        } else {
          textId = Janus.randomString(12);
          let transaction = Janus.randomString(12);
          const joinRequest = {
            textroom: "join",
            transaction: transaction,
            room: parseInt(roomId),
            username: textId,
            display: username,
          };
          transactions[transaction] = handleTransaction;
          textPlugin.data({
            text: JSON.stringify(joinRequest),
            error: (error) => {
              console.error(error);
            },
          });
        }
      },
      ondata: (data) => {
        console.log("Got DATA! (Text Room)");
        console.log(data);
        const json = JSON.parse(data);
        if (transactions[json.transaction]) {
          transactions[json.transaction](json);
          delete transactions[json.transaction];
        }
        if (json.textroom === "message") {
          const contents = json.text;
          const from = json.from;
          const date = json.date;
          const sender = json.display ? json.display : textParticipants[from];
          setMessageHistory((items) => [
            ...items,
            { contents: contents, user: sender },
          ]);
        } else if (json.textroom === "announcement") {
          const contents = json.text;
          const date = json.date;
          const sender = "Announcement";
          setMessageHistory((items) => [
            ...items,
            { contents: contents, user: sender },
          ]);
        } else if (json.textroom === "join") {
          const username = json.username;
          textParticipants[username] = json.display;
          setParticipants((prevData) => {
            return {
              ...prevData,
              [username]: json.display,
            };
          });
        } else if (json.textroom === "leave") {
          const username = json.username;
          delete textParticipants[username];
          setParticipants(textParticipants);
        }
      },
    });
  }

  function handleTransaction(response) {
    if (response.textroom === "error") {
      console.error(response);
      if (response.error_code === 417) console.error("NO SUCH ROOM");
      return;
    }
    if (response.participants) {
      response.participants.forEach((participant) => {
        textParticipants[participant.username] = participant.display;
        setParticipants((prevData) => {
          return {
            ...prevData,
            [participant.username]: participant.display,
          };
        });
      });
    }
    if (response.room) {
      console.log("Created room!(Text Room) Joining.");
      textId = Janus.randomString(12);
      let transaction = Janus.randomString(12);
      const joinRequest = {
        textroom: "join",
        transaction: transaction,
        room: parseInt(roomId),
        username: textId,
        display: username,
      };
      transactions[transaction] = handleTransaction;
      textPlugin.data({
        text: JSON.stringify(joinRequest),
        error: (error) => {
          console.error(error);
        },
      });
    }
  }

  function sendMessage(text) {
    if (!text) return;
    const sendRequest = {
      textroom: "message",
      transaction: Janus.randomString(12),
      room: parseInt(roomLabel),
      text: text,
    };
    messagePlugin.data({
      text: JSON.stringify(sendRequest),
      error: (error) => {
        console.error(error);
      },
    });
  }
  function formatDate(date) {
    return;
  }
  useEffect(() => {
    initJanus();
  }, []);

  useEffect(() => {
    if (janusInstance) JanusTextRoom();
  }, [janusInstance]);

  useEffect(() => {
    if (textMessage) sendMessage(textMessage);
  }, [textMessage, messagePlugin, roomLabel]);

  return (
      <div className="bg-primary text-white text-poppins mx-2 w-[95%] h-[95vh] sm:h-[90vh] md:h-[95vh] flex flex-col justify-center md:justify-start  items-start rounded-xl md:px-9">
        <div className="flex justify-between pt-4 mb-2 sm:mb-5 w-full">
          <label className="text-xl lg:text-2xl font-bold mx-3 md:mx-0">
            Room ID: {roomLabel ? roomLabel : 0}
          </label>
          <div className="hidden md:flex w-[32%] ">
            <button
                className={`${
                    isChat
                        ? "bg-green text-white"
                        : "bg-secondary text-disabled hover:text-white"
                } px-8 py-2 rounded-xl text-lg font-bold`}
                onClick={() => setIsChat((prev) => !prev)}
                disabled={isChat}
            >
              Chat
            </button>
            <button
                className={`${
                    !isChat
                        ? "bg-green text-white"
                        : "bg-secondary text-disabled hover:text-white"
                } px-4 py-2 rounded-xl text-lg font-bold`}
                onClick={() => setIsChat((prev) => !prev)}
                disabled={!isChat}
            >
              Participants
            </button>
          </div>
        </div>
        <div className="flex justify-center md:justify-between flex-wrap md:w-full">
          {janusInstance && (
              <VideoContainer
                  janusInstance={janusInstance}
                  room={roomId}
                  setRoom={setRoomLabel}
                  createRoom={createRoom}
                  username={username}
                  isMic={isMic}
                  isCam={isCam}
              />
          )}
          {isChat ? (
              <Chat history={messageHistory} handleMessage={setTextMessage} />
          ) : (
              participants.length !== 0 && (
                  <Participants participants={participants} />
              )
          )}
          <div className="flex justify-center space-x-2 md:w-[65%] my-2">
            {/* Need to add onClick to Buttons, maybe change icon by state*/}
            <button
                className="bg-secondary border-highlight border-2 p-3 rounded-full"
                onClick={() => setIsMic((prev) => !prev)}
            >
              <svg
                  fill="white"
                  className="w-7 h-7"
                  viewBox="0 0 56 56"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path d={isMic ? svg_mic : svg_mute} />
              </svg>
            </button>
            <button
                className="bg-secondary border-highlight border-2 px-[14px] py-3 rounded-full"
                onClick={() => setIsCam((prev) => !prev)}
            >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
              >
                <path d={isCam ? svg_camOn : svg_camOff} />
              </svg>
            </button>
            <button
                className="bg-[#b74040] hover:bg-[#b52626] border-highlight border-2 px-[14px] py-3 rounded-full"
                onClick={() => {
                  janusInstance.destroy();
                  setJanusInstance(null);
                  onLeave();
                }}
            >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
              >
                <path fillRule="evenodd" d={svg_call} clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
  );
}

export default MainWindow;
