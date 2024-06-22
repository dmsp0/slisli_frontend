import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { API_URLS } from "../../api/apiConfig";
import BoothLikeButton from "./BoothLikeButton";
import "../../style/Videopage.css";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import BoothCategory from "./Boothcategory";
import TimeUtils from "../common/TimeUtils";

function BoothDetail() {
  const { videoRoomId } = useParams();
  const { id } = useParams();
  const [booth, setBooth] = useState(null);
  const [username, setUsername] = useState("");
  const [userBoothId, setUserBoothId] = useState("");
  const [numParticipants, setNumParticipants] = useState(0);
  const [roomNumber, setRoomNumber] = useState("");
  const [janusInitialized, setJanusInitialized] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooth = async () => {
      try {
        const response = await axios.get(
          API_URLS.BOOTH_GET_BY_ID.replace("{id}", id)
        );
        let boothData = response.data;

        boothData = {
          ...boothData,
          memberId: boothData.memberId,
        };

        setUserBoothId(boothData.id);
        setBooth(boothData);
        setNumParticipants(boothData.maxPeople);
        setRoomNumber(boothData.videoRoomId);

        const localMemberId = parseInt(localStorage.getItem("member_id"), 10);

        console.log("Booth member_id:", boothData.memberId);
        console.log("Local member_id:", localMemberId);
        setIsCreator(parseInt(boothData.memberId, 10) === localMemberId);
        console.log(
          "isCreator set to:",
          parseInt(boothData.memberId, 10) === localMemberId
        );

        if (boothData.videoRoomId) {
          sessionStorage.setItem("roomNumber", boothData.videoRoomId);
        } else {
          const storedRoomNumber = sessionStorage.getItem("roomNumber");
          if (storedRoomNumber) {
            setRoomNumber(storedRoomNumber);
          }
        }
      } catch (error) {
        console.error("Error fetching booth", error);
      }
    };

    const member_id = localStorage.getItem("member_id");
    if (!member_id) {
      console.error("Member ID not found, redirecting to login.");
      navigate("/login");
      return;
    }

    setUsername(member_id);
    fetchBooth();

    const loggedInUser = { username: member_id };
    sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    console.log(
      "SessionStorage loggedInUser:",
      JSON.parse(sessionStorage.getItem("loggedInUser"))
    );

    const boothId = { boothId: id };
    sessionStorage.setItem("boothId", JSON.stringify(boothId));
    console.log(
      "SessionStorage boothId:",
      JSON.parse(sessionStorage.getItem("boothId"))
    );
    if (window.initjanus) {
      window.initjanus(() => {
        setJanusInitialized(true);
      });
    } else {
      console.error("Janus initialization function not found.");
    }
  }, [id, navigate]);

  const checkRoomExists = (roomNumber, callback) => {
    window.sfutest.send({
      message: {
        request: "exists",
        room: parseInt(roomNumber, 10),
      },
      success: function (result) {
        callback(result.exists);
      },
      error: function (error) {
        console.error("Error checking room existence:", error);
        callback(false);
      },
    });
  };

  const handleCreateRoom = () => {
    if (!janusInitialized || !window.sfutest) {
      alert("Janus가 초기화되지 않았습니다. 잠시 후 다시 시도하세요.");
      return;
    }

    const roomNum = parseInt(roomNumber, 10);
    checkRoomExists(roomNum, (exists) => {
      if (exists) {
        window.joinRoomAsHost(username, roomNum, (success) => {
          if (success) {
            window.localStorage.setItem("isHost", "true");
            navigate(`/booth/videoroom/${roomNum}`, {
              state: { numParticipants },
            });
          } else {
            console.error("Failed to join existing room as host");
          }
        });
      } else {
        window.createRoomAndJoinAsHost(
          username,
          numParticipants,
          roomNum,
          (success, createdRoomNumber) => {
            if (success) {
              window.localStorage.setItem("isHost", "true");
              navigate(`/booth/videoroom/${createdRoomNumber}`, {
                state: { numParticipants },
              });
            } else {
              console.error("Failed to create room");
            }
          }
        );
      }
    });
  };

  const handleJoinRoom = () => {
    const member_id = localStorage.getItem("member_id");
    if (!member_id) {
      console.error("Member ID not found, redirecting to login.");
      navigate("/login");
      return;
    }

    setUsername(member_id);

    if (!janusInitialized || !window.sfutest) {
      alert("Janus가 초기화되지 않았습니다. 잠시 후 다시 시도하세요.");
      return;
    }

    const roomNum = parseInt(roomNumber, 10);
    window.joinRoomAsParticipant(username, roomNum, (success) => {
      if (success) {
        window.localStorage.setItem("isHost", "false");
        navigate(`/booth/videoroom/${roomNum}`, { state: { numParticipants } });
      } else {
        console.error("Failed to join room");
      }
    });
  };

  const isCreateRoomDisabled = () => {
    if (!booth || !booth.startTime || !booth.endTime || !booth.date)
      return true;
    const eventStartDateTime = new Date(`${booth.date}T${booth.startTime}`);
    const eventEndDateTime = new Date(`${booth.date}T${booth.endTime}`);
    const now = new Date();
    return (
      now < new Date(eventStartDateTime.getTime() - 15 * 60 * 1000) ||
      now >= eventEndDateTime
    );
  };

  const isJoinRoomDisabled = () => {
    if (!booth || !booth.startTime || !booth.endTime || !booth.date)
      return true;
    const eventStartDateTime = new Date(`${booth.date}T${booth.startTime}`);
    const eventEndDateTime = new Date(`${booth.date}T${booth.endTime}`);
    const now = new Date();
    return now < eventStartDateTime || now >= eventEndDateTime;
  };

  if (!booth) {
    return <p>Loading...</p>;
  }

  console.log("Rendering component, isCreator:", isCreator);

  return (
    <div className="bg-gradient-to-b from-blue-900 to-blue-100 w-full min-h-screen flex flex-col items-center">
    <div className="bg-white rounded-lg flex flex-col sm:flex-row w-4/6 h-auto mt-24 p-12 mb-12">
      <div className="flex justify-center w-full sm:w-3/5 mx-auto items-center">
        <img
          src={booth.imgPath}
          alt={booth.title}
          className="h-full w-full object-cover object-center max-w-xl"
        />
      </div>
      <div className="flex-grow lg:border-l lg:border-gray-200 lg:pl-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold pt-4 text-blue-800">
            {booth.title}
          </h1>
          <div className="pt-4">
            <BoothLikeButton
              boothId={booth.boothId}
              member_id={localStorage.getItem("member_id")}
            />
          </div>
        </div>
        <p className="text-lg sm:text-xl text-gray-700 mt-2">
          <span className="font-semibold">카테고리 : </span>
          <span>{BoothCategory[booth.category]}</span>
        </p>
        <p className="text-lg sm:text-xl text-gray-700 mt-2">
          <span className="font-semibold">주최자 : </span>
          <span>{booth.openerName}</span>
        </p>
        <p className="text-lg sm:text-xl text-gray-700 mt-2">
          <span className="font-semibold">일시 : </span>
          <span>{booth.date}</span>
        </p>
        <p className="text-lg sm:text-xl text-gray-700 mt-2 ">
          <span className="font-semibold">부스 시간 : </span>
          <span>
            {TimeUtils(booth.startTime)} ~ {TimeUtils(booth.endTime)}
          </span>
        </p>
        <p className="text-lg sm:text-xl text-gray-700 mt-2">
          <span className="font-semibold">참가 인원 : </span>
          <span>{booth.maxPeople}</span>
        </p>
        <p className="text-lg sm:text-xl text-gray-700 mt-10">
          <span className="font-semibold">부스 소개 </span> <br />
        </p>
        <p className="text-lg sm:text-xl text-gray-700 mt-2">
          <span>{booth.info}</span>
        </p>
        <hr className="my-10" />
        <div className="text-center flex items-center justify-center gap-4 mt-4 pb-4">
          {isCreator ? (
            <button
              data-tooltip-content="시작 15분 전에 열립니다"
              data-tooltip-id={`  ${isCreateRoomDisabled() ? "tooltip" : ""}`}
              className={`text-white font-bold py-3 px-6 rounded-2xl transition duration-300 ${
                isCreateRoomDisabled()
                  ? "bg-gray-500"
                  : "bg-blue-500 hover:bg-blue-700"
              }`}
              onClick={handleCreateRoom}
              disabled={isCreateRoomDisabled()}
            >
              방 만들기
            </button>
          ) : (
            <button
              data-tooltip-content="시작 15분 전에 열립니다"
              data-tooltip-id={`  ${isJoinRoomDisabled() ? "tooltip" : ""}`}
              className={`text-white font-bold py-3 px-6 rounded-2xl transition duration-300 ${
                isJoinRoomDisabled()
                  ? "bg-gray-500"
                  : "bg-blue-500 hover:bg-blue-700"
              }`}
              onClick={handleJoinRoom}
              disabled={isJoinRoomDisabled()}
            >
              참여하기
            </button>
          )}
          <Tooltip
            id="tooltip"
            place="top"
            style={{
              backgroundColor: "rgb(051, 102, 204)",
              color: "#ffffff",
              borderRadius: "10px",
            }}
          />
        </div>
      </div>
    </div>
  </div>
  );
}

export default BoothDetail;
