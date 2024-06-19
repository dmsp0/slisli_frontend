import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { API_URLS } from '../../api/apiConfig';
import BoothLikeButton from './BoothLikeButton';
import '../../style/Videopage.css';

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
                const response = await axios.get(API_URLS.BOOTH_GET_BY_ID.replace('{id}', id));
                let boothData = response.data;

                // 여기서 데이터를 변환하여 일관된 케이스로 만듭니다.
                boothData = {
                    ...boothData,
                    memberId: boothData.memberId
                };

                setUserBoothId(boothData.id);
                setBooth(boothData);
                setNumParticipants(boothData.maxPeople);
                setRoomNumber(boothData.videoRoomId);

                const localMemberId = parseInt(localStorage.getItem('member_id'), 10);

                console.log("Booth member_id:", boothData.memberId);
                console.log("Local member_id:", localMemberId);
                setIsCreator(parseInt(boothData.memberId, 10) === localMemberId);
                console.log("isCreator set to:", parseInt(boothData.memberId, 10) === localMemberId);

                // 세션 스토리지에 roomNumber 저장
                if (boothData.videoRoomId) {
                    sessionStorage.setItem('roomNumber', boothData.videoRoomId);
                } else {
                    const storedRoomNumber = sessionStorage.getItem('roomNumber');
                    if (storedRoomNumber) {
                        setRoomNumber(storedRoomNumber);
                    }
                }
            } catch (error) {
                console.error('Error fetching booth', error);
            }
        };

        const member_id = localStorage.getItem('member_id');
        if (!member_id) {
            console.error("Member ID not found, redirecting to login.");
            navigate('/login');
            return;
        }

        setUsername(member_id);
        fetchBooth();

        // 세션 스토리지에 사용자 정보 저장
        const loggedInUser = { username: member_id };
        sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        console.log("SessionStorage loggedInUser:", JSON.parse(sessionStorage.getItem('loggedInUser')));


        const boothId = { boothId: id };
        sessionStorage.setItem('boothId', JSON.stringify(boothId));
        console.log("SessionStorage boothId:", JSON.parse(sessionStorage.getItem('boothId')));
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
                room: parseInt(roomNumber, 10)
            },
            success: function (result) {
                callback(result.exists);
            },
            error: function (error) {
                console.error("Error checking room existence:", error);
                callback(false);
            }
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
                        window.localStorage.setItem('isHost', 'true');
                        navigate(`/booth/videoroom/${roomNum}`, { state: { numParticipants } });
                    } else {
                        console.error("Failed to join existing room as host");
                    }
                });
            } else {
                window.createRoomAndJoinAsHost(username, numParticipants, roomNum, (success, createdRoomNumber) => {
                    if (success) {
                        window.localStorage.setItem('isHost', 'true');
                        navigate(`/booth/videoroom/${createdRoomNumber}`, { state: { numParticipants } });
                    } else {
                        console.error("Failed to create room");
                    }
                });
            }
        });
    };

    const handleJoinRoom = () => {
        const member_id = localStorage.getItem('member_id');
        if (!member_id) {
            console.error("Member ID not found, redirecting to login.");
            navigate('/login');
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
                window.localStorage.setItem('isHost', 'false');
                navigate(`/booth/videoroom/${roomNum}`, { state: { numParticipants } });
            } else {
                console.error("Failed to join room");
            }
        });
    };

    const isCreateRoomDisabled = () => {
        if (!booth || !booth.startTime || !booth.endTime || !booth.date) return true;
        const eventStartDateTime = new Date(`${booth.date}T${booth.startTime}`);
        const eventEndDateTime = new Date(`${booth.date}T${booth.endTime}`);
        const now = new Date();
        return now < new Date(eventStartDateTime.getTime() - 15 * 60 * 1000) || now >= eventEndDateTime;
    };

    const isJoinRoomDisabled = () => {
        if (!booth || !booth.startTime || !booth.endTime || !booth.date) return true;
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
            <div className="container mx-auto p-20 flex justify-center flex-1">
                <div className="bg-white rounded-lg flex flex-col sm:flex-row w-4/5 h-auto" >
                    <div className="relative w-full sm:w-1/2 h-auto">
                        <img src={booth.imgPath} alt={booth.title} className="absolute top-0 left-0 w-full h-full object-cover" />
                    </div>
                    <div className="w-full sm:w-1/2 flex-col justify-center p-2">
                        <div className='text-center'>
                            <div className='flex justify-between items-center mb-10 ml-10 pr-10'>
                                <h1 className="text-3xl font-bold pt-4">{booth.title}</h1>
                                <BoothLikeButton boothId={booth.boothId} member_id={localStorage.getItem('member_id')} />
                            </div>
                            <div className='justify-center text-left ml-10 mb-10 pr-8'>
                                <p className="text-gray-700">{booth.info}</p>
                                <p className="text-gray-700 mt-4"><span className="font-semibold">카테고리</span> <br /> {booth.category}</p>
                                <p className="text-gray-700 mt-4"><span className="font-semibold">일시</span> <br /> {booth.date}</p>
                                <p className="text-gray-700 mt-4"><span className="font-semibold">부스 시간</span> <br /> {booth.startTime} ~ {booth.endTime}</p>
                                <p className="text-gray-700 mt-4"><span className="font-semibold">참가 인원</span> <br /> {booth.maxPeople}</p>
                                <p className="text-gray-700 mt-4"><span className="font-semibold">주최자</span> <br /> {booth.openerName}</p>
                            </div>
                        </div>
                        <div className="text-center flex items-center justify-center gap-4 mt-4 pb-4">
                            {isCreator ? (
                                <button 
                                className={`font-bold py-2 px-4 rounded-full transition duration-300 ${isCreateRoomDisabled() ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
                                onClick={handleCreateRoom} 
                                disabled={isCreateRoomDisabled()}
                            >
                                방 만들기
                            </button>
                            ) : (
                                <button 
                                className={`font-bold py-2 px-4 rounded-full transition duration-300 ${isJoinRoomDisabled() ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
                                onClick={handleJoinRoom} 
                                disabled={isJoinRoomDisabled()}
                                >            
                                참여하기
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BoothDetail;