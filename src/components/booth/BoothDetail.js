/* global sfutest*/
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

  useEffect(() => {
    if (!booth || !booth.startTime || !booth.date) return;
  
    const eventStartDateTime = new Date(`${booth.date}T${booth.startTime}`);
    const now = new Date();
  
    let redirectTime;
  
    if (isCreator) {
      redirectTime = new Date(eventStartDateTime.getTime() - 15 * 60 * 1000); // 호스트는 15분 전
    } else {
      redirectTime = eventStartDateTime; // 참가자는 정확히 시작 시간
    }
  
    if (now < redirectTime) {
      const timeToRedirect = redirectTime - now;
      const timer = setTimeout(() => {
        window.location.reload(); // 페이지 새로고침
      }, timeToRedirect);
  
      return () => clearTimeout(timer); // cleanup timer on component unmount
    }
  }, [booth, isCreator]);

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
    const roomNum = parseInt(roomNumber, 10);
    window.localStorage.setItem('isHost', 'true');

    navigate(`/booth/videoroom/${roomNum}`, {
      state: { username, roomNum, roomTitle: booth.title, numParticipants },
    });
  };
  
  const handleJoinRoom = () => {
    const roomNum = parseInt(roomNumber, 10);
    window.localStorage.setItem('isHost', 'false');

    navigate(`/booth/videoroom/${roomNum}`, {
      state: { username, roomNum, roomTitle: booth.title, numParticipants },
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

      <div className="bg-white rounded-lg w-3/4 h-auto mt-24 p-10 mb-12 grid grid-cols-2">
        <div className="flex justify-center w-full mx-auto items-center">
          <img
            src={booth.imgPath}
            alt={booth.title}
            className="h-full w-full object-cover object-center max-w-xl"
          />
        </div>
      
        <div className="border-l-2 border-gray-200 pl-8 lg:ml-5 ">

          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold pt-4 text-blue-800">
              {booth.title}
            </h1>
            <div className="pt-4">
            <BoothLikeButton
              boothId={booth.boothId}
              member_id={localStorage.getItem("member_id")}
              />
            </div>
          </div>

              <div>
          <table className="mx-auto text-center table-fixed w-full mb-10">
            <thead className="text-xl text-gray-700">
              <tr>
                <th className="border-r-2 pb-1">카테고리</th>
                <th className="border-l-2 pb-1">주최자</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-r-2">{BoothCategory[booth.category]}</td>
                <td className="border-l-2">{booth.openerName}</td>
              </tr>
            </tbody>
            <thead className="">
              <tr className="text-xl text-gray-700">
                <th className="border-r-2 pt-5 pb-1">날짜</th>
                <th className="border-l-2 pt-5 pb-1">개최 시간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-r-2">{booth.date}</td>
                <td className="border-l-2">{TimeUtils(booth.startTime)} ~ {TimeUtils(booth.endTime)}</td>
              </tr>
            </tbody>
          </table>
        
          <p className="text-xl text-gray-700 font-semibold mb-1">부스 소개 </p>
          <p className="text-l text-gray-700">{booth.info}</p>
          </div>

          <div className="text-center items-center justify-center gap-4 mt-8 border-t-2 border-gray-200 pt-8">

          <p className="text-l sm:text-xl text-gray-700 mb-3">
            <span className="font-semibold pr-3">참가 인원</span>
            <span>최대 {booth.maxPeople}명</span>
          </p>
            {isCreator ? (
              <button
                data-tooltip-content='시작 15분 전에 열립니다'
                data-tooltip-id='tooltip'
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
                data-tooltip-content='개최 후에 열립니다' 
                data-tooltip-id='tooltip'
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
            {isCreateRoomDisabled() || isJoinRoomDisabled() ? (
                            <Tooltip
                                id='tooltip'
                                content='시작 15분 전에 열립니다'
                                place="top"
                                style={{ backgroundColor: "rgb(51, 102, 204)", color: "#ffffff", borderRadius: "10px" }}
                            />
                        ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoothDetail;
