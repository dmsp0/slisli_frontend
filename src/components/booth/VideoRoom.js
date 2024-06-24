/* global mystream, stream, toastr, localVideoElement,remoteVideoElement, remoteVideoRefs, publishOwnFeed, myid, mypvtid, Janus, sfutest, bootbox, feeds,  notifyParticipantsOfRoomClosure */

import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios'; // Axios import
import $ from "jquery"; // jQuery import
import { ReactComponent as MicIcon } from '../../img/mic.svg'; // 마이크 아이콘
import { ReactComponent as MicOffIcon } from '../../img/MicOff.svg'; // 줄이 그어진 마이크 아이콘
import { ReactComponent as CamIcon } from '../../img/cam.svg'; // 캠 아이콘
import { ReactComponent as CamOffIcon } from '../../img/CamOff.svg'; // 줄이 그어진 캠 아이콘
import { ReactComponent as LeaveIcon } from '../../img/leave.svg'; // 나가기 아이콘
import { API_URLS } from '../../api/apiConfig';
import io from 'socket.io-client';
import Chat from "../chat/Chat";

const opaqueId = "videoroomtest-" + Janus.randomString(12);
let myroom = null; // 방 번호를 실제로 사용할 번호로 변경해야 합니다.
let bitrateTimer = [];
let janus;

const addSimulcastButtons = (index, isPublisher) => {
    // Simulcast 버튼 추가 로직
};

const updateSimulcastButtons = (index, substream, temporal) => {
    // Simulcast 버튼 업데이트 로직
};



const VideoRoom = () => {
    const [username, setUsername] = useState("");
    const [numParticipants, setNumParticipants] = useState(0);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [hostId, setHostId] = useState(null);
    const [hostUsername, setHostUsername] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0); // 슬라이더 인덱스 상태 추가
    const [boothId, setBoothId] = useState('');
    const navigate = useNavigate();
    const storedRoomNumber = sessionStorage.getItem('roomNumber');
    const roomNumber = storedRoomNumber ? parseInt(storedRoomNumber, 10) : null;
    const location = useLocation();
   

    let feeds = []; // 배열로 초기화
    const myVideoRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef([]);
    
    

    useEffect(() => {
        // sessionStorage에서 boothId 가져오기
        const boothIdFromStorage = sessionStorage.getItem('boothId');
        setBoothId(boothIdFromStorage);
      }, []);
    
      useEffect(() => {
        if (!boothId) return;
    
        // 소켓 연결
        const socket = io('http://localhost:5000', {
          path: '/socket',
          auth: { token: localStorage.getItem('accessToken') }, // 토큰 전달
        });
    
        socket.on('connect', () => {
          console.log('Connected to server');
          socket.emit('joinRoom', boothId); // 방 번호 전달
        });
    
        return () => {
          // 컴포넌트 언마운트 시 소켓 연결 해제
          socket.disconnect();
        };
      }, [boothId]);


      useEffect(() => {
        const fetchHostId = async () => {
            try {
                const response = await axios.get(API_URLS.BOOTH_HOSTSELECT, {  
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // 요청 헤더에 JWT 토큰을 추가
                    },
                });
                setHostId(response.data);
            } catch (error) {
                console.error('Failed to fetch host ID:', error);
                if (error.response) {
                    console.error('Error response:', error.response.data);
                }
            }
        };
    
        console.log('Access Token:', localStorage.getItem('accessToken'));
        fetchHostId();
        console.log("호스트 여부 확인", isHost , "myid 확인", myid);
    
        if (isHost) {
            axios.post(API_URLS.BOOTH_HOSTINSERT, { hostId: myid }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // 요청 헤더에 JWT 토큰을 추가
                },
            })
            .then(response => {
                console.log('Host ID set successfully');
            })
            .catch(error => {
                console.error('Failed to set host ID:', error);
                if (error.response) {
                    console.error('Error response:', error.response.data);
                }
            });
        }
    }, [isHost, myid]);
    
    
    
    


useEffect(() => {
    const storedIsHost = window.localStorage.getItem('isHost');
    const storedHostUsername = window.localStorage.getItem('hostUsername');
    const isHostFlag = storedIsHost === 'true';
    setIsHost(isHostFlag);
    window.isHost = isHostFlag; // 상태 설정 후 window.isHost 설정
    setHostUsername(storedHostUsername || "");
}, []);


// 마지막으로 추가된 피드 ID를 저장하는 변수
var lastFeedId = null;

// [jsflux] 새로운 유저 들어왔을때
window.newRemoteFeed = function(id, display, audio, video) {
    console.log("새 원격 피드 생성 시도, ID: ", id);
    
    if(id === lastFeedId){
        return;
    }


    // 이미 존재하는 피드인지 확인
    if (feeds.some(feed => feed && feed.rfid === id)) {
        console.log(`Feed with id ${id} already exists.`);
        return;
    }

    lastFeedId = id;
    var remoteFeed = null;
    janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: opaqueId,
        success: function(pluginHandle) {
            remoteFeed = pluginHandle;
            remoteFeed.simulcastStarted = false;
            Janus.log("플러그인 부착 완료! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
            Janus.log("  -- 구독자입니다");

            var subscribe = {
                request: "join",
                room: myroom,
                ptype: "subscriber",
                feed: id,
                private_id: mypvtid
            };

            console.log("구독 요청 데이터:", JSON.stringify(subscribe, null, 2));

            if (Janus.webRTCAdapter.browserDetails.browser === "safari" &&
                (video === "vp9" || (video === "vp8" && !Janus.safariVp8))) {
                if (video) {
                    video = video.toUpperCase();
                    toastr.warning("퍼블리셔가 " + video + " 코덱을 사용 중입니다. Safari에서 지원하지 않으므로 비디오를 비활성화합니다.");
                    subscribe.offer_video = false;  // 비디오 비활성화
                }
            }
            remoteFeed.videoCodec = video;
            remoteFeed.send({ message: subscribe });
        },
        error: function(error) {
            Janus.error("플러그인 부착 중 오류 발생...", error);
            bootbox.alert("플러그인 부착 중 오류 발생: " + error);
        },
        onmessage: function(msg, jsep) {
            Janus.debug(" ::: 구독자로부터 메시지를 받았습니다 :::", msg);
            var event = msg["videoroom"];
            Janus.debug("이벤트: " + event);
            if (msg["error"]) {
                bootbox.alert(msg["error"]);
            } else if (event) {
                if (event === "attached") {
                    for (var i = 1; i < 20; i++) {
                        if (!feeds[i]) {
                            feeds[i] = remoteFeed;
                            remoteFeed.rfindex = i;
                            break;
                        }
                    }
                    remoteFeed.rfid = msg["id"];
                    remoteFeed.rfdisplay = msg["display"];
                    Janus.log("피드 " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ")에 성공적으로 연결되었습니다. 룸 " + msg["room"] + "에서");
                    $('#remote' + remoteFeed.rfindex).removeClass('hide').html(remoteFeed.rfdisplay).show();
                } else if (event === "event") {
                    var substream = msg["substream"];
                    var temporal = msg["temporal"];
                    if ((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
                        if (!remoteFeed.simulcastStarted) {
                            remoteFeed.simulcastStarted = true;
                            addSimulcastButtons(remoteFeed.rfindex, remoteFeed.videoCodec === "vp8" || remoteFeed.videoCodec === "h264");
                        }
                        updateSimulcastButtons(remoteFeed.rfindex, substream, temporal);
                    }
                }
            }
            if (jsep) {
                Janus.debug("SDP 처리 중...", jsep);
                remoteFeed.createAnswer({
                    jsep: jsep,
                    media: { audioSend: true, videoSend: true },
                    success: function(jsep) {
                        Janus.debug("SDP 생성 완료!", jsep);
                        var body = { request: "start", room: myroom };
                        remoteFeed.send({ message: body, jsep: jsep });
                    },
                    error: function(error) {
                        Janus.error("WebRTC 오류 발생:", error);
                        bootbox.alert("WebRTC 오류 발생: " + error.message);
                    }
                });
            }
        },
        iceState: function(state) {
            Janus.log("이 WebRTC PeerConnection의 ICE 상태 (피드 #" + remoteFeed.rfindex + ")가 " + state + "로 변경되었습니다.");
        },
        webrtcState: function(on) {
            Janus.log("Janus가 이 WebRTC PeerConnection (피드 #" + remoteFeed.rfindex + ")이 " + (on ? "업" : "다운") + " 상태라고 알립니다.");
        },
        onlocalstream: function(stream) {
            // 구독자 스트림은 recvonly이므로 여기서는 아무 것도 기대하지 않습니다
        },
        onremotestream: function(stream) {
            Janus.debug("원격 피드 #" + remoteFeed.rfindex + ", 스트림:", stream);
            var videoElementId = `videoremote${remoteFeed.rfindex}`;
            var videoElement = document.getElementById(videoElementId);
        
            console.log("호스트 아이디 확인", hostId);
            if (hostId === id) {
                videoElement = document.getElementById('videolocal');
            } else {
                if (!videoElement) {
                    // 비디오 요소가 존재하지 않으면 동적으로 생성
                    const videoContainer = document.createElement('div');
                    videoContainer.className = 'participant-video slider-item';
                    videoContainer.innerHTML = `<video class="relative videoremote" id="${videoElementId}" autoPlay playsInline></video>`;
                    document.querySelector('.slider-wrapper').appendChild(videoContainer);
        
                    // 새로 생성한 비디오 요소 참조
                    videoElement = document.getElementById(videoElementId);
                }
            }
        
            if (videoElement) {
                Janus.attachMediaStream(videoElement, stream);
        
                videoElement.addEventListener("playing", function() {
                    if (remoteFeed.spinner) {
                        remoteFeed.spinner.stop();
                    }
                    remoteFeed.spinner = null;
                    var waitingVideo = document.getElementById(`waitingvideo${remoteFeed.rfindex}`);
                    if (waitingVideo) {
                        waitingVideo.remove();
                    }
                    if (this.videoWidth) {
                        videoElement.classList.remove('hide');
                        videoElement.style.display = 'block';
                    }
                    var width = this.videoWidth;
                    var height = this.videoHeight;
                    var curresElement = document.getElementById(`curres${remoteFeed.rfindex}`);
                    if (curresElement) {
                        curresElement.classList.remove('hide');
                        curresElement.textContent = `${width}x${height}`;
                    }
                });
        
                videoElement.addEventListener("loadedmetadata", function() {
                    var width = this.videoWidth;
                    var height = this.videoHeight;
                    var curresElement = document.getElementById(`curres${remoteFeed.rfindex}`);
                    if (curresElement) {
                        curresElement.classList.remove('hide');
                        curresElement.textContent = `${width}x${height}`;
                    }
                });
        
                var videoTracks = stream.getVideoTracks();
                if (!videoTracks || videoTracks.length === 0) {
                    videoElement.style.display = 'none';
                    if (!document.querySelector(`#videoremote${remoteFeed.rfindex} .no-video-container`)) {
                        const noVideoContainer = document.createElement('div');
                        noVideoContainer.className = 'no-video-container';
                        noVideoContainer.innerHTML = '<i class="fa fa-video-camera fa-5 no-video-icon"></i><span class="no-video-text">사용 가능한 원격 비디오가 없습니다</span>';
                        videoElement.parentNode.appendChild(noVideoContainer);
                    }
                } else {
                    var noVideoContainer = document.querySelector(`#videoremote${remoteFeed.rfindex} .no-video-container`);
                    if (noVideoContainer) {
                        noVideoContainer.remove();
                    }
                    videoElement.classList.remove('hide');
                    videoElement.style.display = 'block';
                }
        
                if (Janus.webRTCAdapter.browserDetails.browser === "chrome" || Janus.webRTCAdapter.browserDetails.browser === "firefox" || Janus.webRTCAdapter.browserDetails.browser === "safari") {
                    var curbitrateElement = document.getElementById(`curbitrate${remoteFeed.rfindex}`);
                    if (curbitrateElement) {
                        curbitrateElement.classList.remove('hide');
                    }
                    remoteFeed.bitrateTimer = setInterval(function() {
                        var bitrate = remoteFeed.getBitrate();
                        var curbitrateElement = document.getElementById(`curbitrate${remoteFeed.rfindex}`);
                        if (curbitrateElement) {
                            curbitrateElement.textContent = bitrate;
                        }
                        var width = videoElement.videoWidth;
                        var height = videoElement.videoHeight;
                        if (width > 0 && height > 0) {
                            var curresElement = document.getElementById(`curres${remoteFeed.rfindex}`);
                            if (curresElement) {
                                curresElement.classList.remove('hide');
                                curresElement.textContent = `${width}x${height}`;
                            }
                        } else {
                            $('#videoremote'+remoteFeed.rfindex+ ' .no-video-container').remove();
                            $('#remotevideo'+remoteFeed.rfindex).removeClass('hide').show();
                        }
                    }, 1000);
                }
            } else {
                console.error("videoElement를 찾을 수 없습니다.");
            }
        },
        oncleanup: function() {
            Janus.log(" ::: 원격 피드 " + id + "에 대한 정리 알림을 받았습니다 :::");
            if (remoteFeed.spinner) {
                remoteFeed.spinner.stop();
            }
            remoteFeed.spinner = null;
            $('#remotevideo' + remoteFeed.rfindex).remove();
            $('#waitingvideo' + remoteFeed.rfindex).remove();
            $('#novideo' + remoteFeed.rfindex).remove();
            $('#curbitrate' + remoteFeed.rfindex).remove();
            $('#curres' + remoteFeed.rfindex).remove();
            if (remoteFeed.bitrateTimer) {
                clearInterval(remoteFeed.bitrateTimer);
            }
            bitrateTimer[remoteFeed.rfindex] = null;
            remoteFeed.simulcastStarted = false;
            $('#simulcast' + remoteFeed.rfindex).remove();
        
            feeds[remoteFeed.rfindex] = null;
            
            // 비디오 요소 제거
            var videoElementId = `videoremote${remoteFeed.rfindex}`;
            var videoElement = document.getElementById(videoElementId);
            if (videoElement) {
                videoElement.parentElement.remove(); // 비디오 요소의 부모 요소 제거
                console.log("비디오 요소가 성공적으로 제거되었습니다:", videoElementId);
            } else {
                console.error("제거할 비디오 요소를 찾을 수 없습니다:", videoElementId);
            }
        }
        
        
        
    });
}

useEffect(() => {
    const { state } = location;
    if (state && state.numParticipants) {
        setNumParticipants(state.numParticipants);
    }
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        setUsername(loggedInUser.username);
        const storedRoomNumber = window.localStorage.getItem('roomNumber');
        const isHostFlag = window.localStorage.getItem('isHost') === 'true';
        setIsHost(isHostFlag);
        window.isHost = isHostFlag; // 호스트 여부 전역변수로 설정 

        if (roomNumber || storedRoomNumber) {
            console.log("Room number found:", roomNumber || storedRoomNumber);
            myroom = roomNumber || storedRoomNumber; // myroom 설정
            console.log("myroom 설정:", myroom);
            window.initjanus(() => {
                // Janus 초기화
                janus = new Janus({
                    server: window.server,
                    success: () => {
                        janus.attach({
                            plugin: "janus.plugin.videoroom",
                            opaqueId: opaqueId,
                            success: (pluginHandle) => {
                                sfutest = pluginHandle;
                                Janus.log("Plugin attached! (" + sfutest.getPlugin() + ", id=" + sfutest.getId() + ")");
                                Janus.log("  -- This is a subscriber");

                                // 방 참가
                                var register = {
                                    request: "join",
                                    room: myroom,
                                    ptype: "publisher",
                                    display: username,
                                };
                                sfutest.send({ message: register });
                            },
                            error: (error) => {
                                Janus.error("  -- Error attaching plugin...", error);
                                bootbox.alert("Error attaching plugin... " + error);
                            },
                            onmessage: (msg, jsep) => {
                                Janus.debug(" ::: Got a message :::", msg);
                                var event = msg["videoroom"];
                                Janus.debug("Event: " + event);
                                if (event) {
                                    if (event === "joined") {
                                        myid = msg["id"];
                                        mypvtid = msg["private_id"];
                                        Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);
                                        if (msg["publishers"]) {
                                            var list = msg["publishers"];
                                            Janus.debug("Got a list of available publishers/feeds:", list);
                                            for (var f in list) {
                                                var id = list[f]["id"];
                                                var display = list[f]["display"];
                                                var audio = list[f]["audio_codec"];
                                                var video = list[f]["video_codec"];
                                                Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                                window.newRemoteFeed(id, display, audio, video);
                                            }
                                        }
                                    } else if (event === "destroyed") {
                                        Janus.warn("The room has been destroyed!");
                                        bootbox.alert("The room has been destroyed", () => {
                                            window.location.reload();
                                        });
                                    } else if (event === "event") {
                                        if (msg["publishers"]) {
                                            var list = msg["publishers"];
                                            Janus.debug("Got a list of available publishers/feeds:", list);
                                            for (var f in list) {
                                                var id = list[f]["id"];
                                                var display = list[f]["display"];
                                                var audio = list[f]["audio_codec"];
                                                var video = list[f]["video_codec"];
                                                Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                                window.newRemoteFeed(id, display, audio, video);
                                            }
                                        } else if (msg["leaving"]) {
                                            var leaving = msg["leaving"];
                                            Janus.log("Publisher left: " + leaving);
                                            var remoteFeed = null;
                                            for (var i = 1; i < 20; i++) {
                                                if (feeds[i] && feeds[i].rfid == leaving) {
                                                    remoteFeed = feeds[i];
                                                    break;
                                                }
                                            }
                                            if (remoteFeed != null) {
                                                Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                                                $('#remote' + remoteFeed.rfindex).empty().hide();
                                                feeds[remoteFeed.rfindex] = null;
                                                remoteFeed.detach();
                                            }
                                        } else if (msg["unpublished"]) {
                                            var unpublished = msg["unpublished"];
                                            Janus.log("Publisher left: " + unpublished);
                                            if (unpublished === 'ok') {
                                                sfutest.hangup();
                                                return;
                                            }
                                            var remoteFeed = null;
                                            for (var i = 1; i < 20; i++) {
                                                if (feeds[i] && feeds[i].rfid == unpublished) {
                                                    remoteFeed = feeds[i];
                                                    break;
                                                }
                                            }
                                            if (remoteFeed != null) {
                                                Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                                                $('#remote' + remoteFeed.rfindex).empty().hide();
                                                feeds[remoteFeed.rfindex] = null;
                                                remoteFeed.detach();
                                            }
                                        } else if (msg["error"]) {
                                            bootbox.alert(msg["error"]);
                                        }
                                    }
                                }
                                if (jsep) {
                                    Janus.debug("Handling SDP as well...", jsep);
                                    sfutest.handleRemoteJsep({ jsep: jsep });
                                }
                            },
                            onlocalstream: (stream) => {
                                Janus.debug(" ::: Got a local stream :::", stream);
                                mystream = stream;
                                Janus.attachMediaStream($('#myvideo').get(0), stream);
                                if (sfutest.webrtcStuff.pc.iceConnectionState !== "completed" &&
                                    sfutest.webrtcStuff.pc.iceConnectionState !== "connected") {
                                    $("#videolocal").parent().parent().block({
                                        message: '<b>Publishing...</b>',
                                        css: {
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: 'white'
                                        }
                                    });
                                }
                                var videoTracks = stream.getVideoTracks();
                                if (!videoTracks || videoTracks.length === 0) {
                                    $('#myvideo').hide();
                                    if ($('#videolocal .no-video-container').length === 0) {
                                        $('#videolocal').append(
                                            '<div class="no-video-container">' +
                                            '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                            '<span class="no-video-text">No webcam available</span>' +
                                            '</div>');
                                    }
                                } else {
                                    $('#videolocal .no-video-container').remove();
                                    $('#myvideo').removeClass('hide').show();
                                }
                            },
                            onremotestream: (stream) => {
                                Janus.debug(" ::: Got a remote stream :::", stream);
                                const addRemoteFeed = (feedId, stream) => {
                                    // 원격 피드를 위한 비디오 요소 동적으로 생성
                                    const videoElement = document.createElement('video');
                                    videoElement.setAttribute('id', `videoremote${feedId}`);
                                    videoElement.setAttribute('width', '100%');
                                    videoElement.setAttribute('height', 'auto');
                                    videoElement.setAttribute('autoplay', true);
                                    videoElement.setAttribute('playsinline', true);
                                    Janus.attachMediaStream(videoElement, stream);
                                    document.getElementById('remotes').appendChild(videoElement);
                                };

                                // 기존 피드를 처리
                                for (var i = 1; i < 20; i++) {
                                    if (feeds[i] && feeds[i].rfid == stream.id) {
                                        Janus.debug(`Remote feed ${feeds[i].rfid} is already being processed`);
                                        return;
                                    }
                                }
                                
                                // 새로운 피드를 처리
                                var remoteFeed = null;
                                for (var i = 1; i < 20; i++) {
                                    if (!feeds[i]) {
                                        feeds[i] = {
                                            rfid: stream.id,
                                            feed: stream
                                        };
                                        addRemoteFeed(stream.id, stream);
                                        break;
                                    }
                                }
                            },
                            oncleanup: () => {
                                Janus.log(" ::: Got a cleanup notification :::");
                                mystream = null;
                                $('#myvideo').remove();
                                $('#videolocal').parent().parent().unblock();
                            }
                        });
                    },
                    error: (error) => {
                        Janus.error(error);
                        bootbox.alert(error, () => {
                            window.location.reload();
                        });
                    },
                    destroyed: () => {
                        window.location.reload();
                    }
                });
            });
        } else {
            console.error("No room number found.");
            navigate('/');
        }

        window.onJanusMessage = (msg) => {
            if (msg.text === "호스트가 방송을 종료했습니다." || msg.videoroom === 'destroyed') {
                alert("호스트가 방송을 종료했습니다. 홈 페이지로 이동합니다.");
                navigate('/');
                window.location.reload();
            }
        };
    } else {
        navigate('/login');
    }
}, [navigate, roomNumber, location.state]);

useEffect(() => {
    if (mystream) {
        const attachStreamToElement = (elementRef, stream, elementName) => {
            if (elementRef && elementRef.current) {
                if (elementRef.current.srcObject !== stream) {
                    elementRef.current.srcObject = null; // 기존 스트림 해제
                    Janus.attachMediaStream(elementRef.current, stream);
                } else {
                    console.warn(`${elementName} element already has the stream.`);
                }
            } else {
                console.warn(`${elementName} element not found. Retrying...`);
            }
        };

        // 초기 체크
        if (isHost) {
            attachStreamToElement(localVideoRef, mystream, "videolocal");
        } else {
            attachStreamToElement(remoteVideoRef.current[0], mystream, "videoremote0");
        }

        const observerCallback = (mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    if (isHost && localVideoRef.current) {
                        attachStreamToElement(localVideoRef, mystream, "videolocal");
                        observer.disconnect();
                    } else if (!isHost && remoteVideoRef.current[0]) {
                        attachStreamToElement(remoteVideoRef.current[0], mystream, "videoremote0");
                        observer.disconnect();
                    }
                }
            }
        };

        const observer = new MutationObserver(observerCallback);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
        };
    }
}, [mystream, isHost]);

    const toggleMute = () => {
        if (mystream && mystream.getAudioTracks().length > 0) {
            var audioTrack = mystream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicMuted(!audioTrack.enabled);
            console.log("현재 오디오 트랙 상태: " + (!audioTrack.enabled ? "꺼짐" : "켜짐"));
            sfutest.send({ 
                message: {
                    request: "configure",
                    audio: audioTrack.enabled
                }
            });
        } else {
            console.warn("No audio track available to toggle.");
        }
    };

    const toggleMic = () => {
        toggleMute();
    };

    const toggleCam = () => {
        if (mystream && mystream.getVideoTracks().length > 0) {
            var videoTrack = mystream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsCamOff(!videoTrack.enabled);
            console.log("현재 비디오 트랙 상태: " + (!videoTrack.enabled ? "꺼짐" : "켜짐"));

             // 비디오 트랙 상태를 업데이트합니다.
             const videoElement = isHost ? localVideoRef.current : remoteVideoRef.current[0];
             if (videoElement) {
                videoElement.srcObject = mystream;
            } else {;
            }
            if (sfutest && sfutest.webrtcStuff && sfutest.webrtcStuff.pc) {
                sfutest.send({
                    message: {
                        request: "configure",
                        video: videoTrack.enabled
                    }
                });
            } else {
                console.warn("Janus participant is not configured yet.");
            }
            
        } else {
            console.warn("No video track available to toggle.");
        }
    };


    // useEffect에서 비디오 엘리먼트에 스트림 연결
    useEffect(() => {
        const attachStreamToVideoElements = () => {
            if (remoteVideoRef.current && feeds) {
                feeds.forEach((feed, index) => {
                    if (feed && remoteVideoRef.current[index] && feed.stream !== remoteVideoRef.current[index].srcObject) {
                        console.log(`Attaching stream to video element for feed ${index}`);
                        Janus.attachMediaStream(remoteVideoRef.current[index], feed.stream);
                    }
                });
            }
        };

        attachStreamToVideoElements();
    }, [feeds]);
        


    const closeRoomHandler = () => {
        if (isHost) {
            const room = parseInt(roomNumber || window.localStorage.getItem('roomNumber'), 10);
            window.closeRoom(room, (success) => {
                if (success) {
                    notifyParticipantsOfRoomClosure();
                }
            });
        } else {
            navigate('/');
        }
    };


    const renderVideoPanels = () => {
        const panels = [];
        const isHost = localStorage.getItem('isHost') === 'true';

        // 조건에 따라 패널 추가
        // if (!isHost) {
        //     panels.push(
        //         <div className="participant-video slider-item" key="initial-video">
        //             <video className="relative videoremote" id="videoremote0" autoPlay playsInline muted ref={(el) => remoteVideoRef.current[0] = el}></video>
        //         </div>
        //     );
        // }
        // 모든 구독된 피드에 대해 패널을 추가합니다
        feeds.forEach((feed, index) => {
            if (feed && feed.rfid !== myid && feed.rfdisplay) { // display가 존재하는 경우에만 렌더링
                panels.push(
                    <div className="participant-video slider-item" key={feed.rfid}>
                        <video className="relative videoremote" id={`videoremote${feed.rfindex}`} autoPlay playsInline ref={(el) => remoteVideoRef.current[feed.rfindex] = el}></video>
                    </div>
                );
            }
        });
        return panels;
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };
    
    const handleNext = () => {
        if (currentIndex < Math.ceil((numParticipants - 1) / 5) - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };
    
    useEffect(() => {
        const slideWidth = document.querySelector('.slider-item')?.offsetWidth + 10 || 0; // margin 포함
        const sliderWrapper = document.querySelector('.slider-wrapper');
        if (sliderWrapper) {
            sliderWrapper.style.transform = `translateX(-${currentIndex * slideWidth * 5}px)`;
        }
    }, [currentIndex, numParticipants]);


   
    return (
        <div className="video-chat-container">
            <div className="video-container">
                <div className="slider-container">
                    <div className="slider-wrapper">
                        {renderVideoPanels()}
                    </div>
                </div>
                <div className="slider-controls">
                    <button className="prev" onClick={handlePrev}>이전</button>
                    <button className="next" onClick={handleNext}>다음</button>
                </div>
                <div className="host-video-container">
                <video className="host-video" id="videolocal" autoPlay playsInline muted ref={localVideoRef}></video>
                <div className="video-controls">
                    <button onClick={toggleMic}>
                        {isMicMuted ? <MicOffIcon /> : <MicIcon />}
                    </button>
                    <button onClick={toggleCam}>
                        {isCamOff ? <CamOffIcon /> : <CamIcon />}
                    </button>
                    <button onClick={closeRoomHandler} className="leave">
                        <LeaveIcon />
                    </button>
                </div>
             </div>
             </div>
            <div className="chat-container">
             <Chat boothId={boothId} />
            </div>
        </div>
    );
};

export default VideoRoom;
