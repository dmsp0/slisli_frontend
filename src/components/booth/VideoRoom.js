/* global mystream, stream, toastr, localVideoElement,remoteVideoElement, remoteVideoRefs, publishOwnFeed, myid, mypvtid, Janus, sfutest, bootbox, feeds, newRemoteFeed, notifyParticipantsOfRoomClosure */

import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import $ from "jquery"; // jQuery import
import { ReactComponent as MicIcon } from '../../img/mic.svg'; // 마이크 아이콘
import { ReactComponent as MicOffIcon } from '../../img/MicOff.svg'; // 줄이 그어진 마이크 아이콘
import { ReactComponent as CamIcon } from '../../img/cam.svg'; // 캠 아이콘
import { ReactComponent as CamOffIcon } from '../../img/CamOff.svg'; // 줄이 그어진 캠 아이콘
import { ReactComponent as LeaveIcon } from '../../img/leave.svg'; // 나가기 아이콘
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


// [jsflux] 새로운 유저 들어왔을때
function newRemoteFeed(id, display, audio, video) {
    console.log("새 원격 피드 생성 시도, ID: ", id);
    console.log("구독 요청 전에 방 번호 확인:", myroom); // 방 번호 확인 로그 추가

    if (!id) {
        console.error("유효하지 않은 피드 ID");
        return;
    }

    var remoteFeed = null;
    janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: opaqueId,
        success: function(pluginHandle) {
            remoteFeed = pluginHandle;
            remoteFeed.simulcastStarted = false;
            Janus.log("플러그인 부착 완료! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
            Janus.log("  -- 구독자입니다");

            sfutest = pluginHandle;

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
                    subscribe["offer_video"] = false;
                }
            }
            remoteFeed.videoCodec = video;
            remoteFeed.send({
                message: subscribe,
                success: function(response) {
                    console.log("구독 요청에 성공했습니다:", response);
                    if (!response) {
                        console.error("구독 요청에 대한 응답이 없습니다.");
                        return;
                    }
                    console.log("구독 요청 응답 데이터:", JSON.stringify(response, null, 2));
                    // Subscribe 성공 시 feeds 배열 업데이트
                    for (var i = 1; i < 20; i++) {
                        if (!feeds[i]) {
                            feeds[i] = remoteFeed;
                            remoteFeed.rfindex = i;
                            break;
                        }
                    }
                    remoteFeed.rfid = id;
                    remoteFeed.rfdisplay = display;
                    remoteFeed.stream = new MediaStream(); // 초기화
                },
                error: function(error) {
                    console.error("구독 요청 중 오류 발생:", error);
                }
            });
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
                    media: { audioSend: false, videoSend: false },
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
            var addButtons = false;
            var videoElementId = `#videoremote${remoteFeed.rfindex}`;
            var videoElement = document.getElementById(`videoremote${remoteFeed.rfindex}`);

            if (!videoElement) {
                console.error("videoElement를 찾을 수 없습니다.", videoElementId);
                return;
            }

            if ($(videoElementId).length === 0) {
                addButtons = true;
                $('#videoremote' + remoteFeed.rfindex).append('<video class="rounded centered" id="waitingvideo' + remoteFeed.rfindex + '" width="100%" height="100%" />');
                $('#videoremote' + remoteFeed.rfindex).append('<video class="rounded centered relative hide" id="remotevideo' + remoteFeed.rfindex + '" width="100%" height="100%" autoplay playsinline/>');
                $('#videoremote' + remoteFeed.rfindex).append(
                    '<span class="label label-primary hide" id="curres' + remoteFeed.rfindex + '" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;"></span>' +
                    '<span class="label label-info hide" id="curbitrate' + remoteFeed.rfindex + '" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;"></span>');
                $("#remotevideo" + remoteFeed.rfindex).bind("playing", function() {
                    if (remoteFeed.spinner) {
                        remoteFeed.spinner.stop();
                    }
                    remoteFeed.spinner = null;
                    $('#waitingvideo' + remoteFeed.rfindex).remove();
                    if (this.videoWidth) {
                        $('#remotevideo' + remoteFeed.rfindex).removeClass('hide').show();
                    }
                    var width = this.videoWidth;
                    var height = this.videoHeight;
                    $('#curres' + remoteFeed.rfindex).removeClass('hide').text(width + 'x' + height).show();
                    if (Janus.webRTCAdapter.browserDetails.browser === "firefox") {
                        setTimeout(function() {
                            var videoElement = $("#remotevideo" + remoteFeed.rfindex).get(0);
                            if (videoElement) {
                                var width = videoElement.videoWidth;
                                var height = videoElement.videoHeight;
                                $('#curres' + remoteFeed.rfindex).removeClass('hide').text(width + 'x' + height).show();
                            } else {
                                console.error("videoElement가 정의되지 않았습니다.");
                            }
                        }, 200);
                    }
                });

                $("#remotevideo" + remoteFeed.rfindex).on("loadedmetadata", function() {
                    var width = this.videoWidth;
                    var height = this.videoHeight;
                    $('#curres' + remoteFeed.rfindex).removeClass('hide').text(width + 'x' + height).show();
                });
            }

            Janus.attachMediaStream(videoElement, stream);
            var videoElement = $(videoElementId).get(0);
            if (videoElement) {
                Janus.attachMediaStream(videoElement, stream);
                var videoTracks = stream.getVideoTracks();
                if (!videoTracks || videoTracks.length === 0) {
                    $(videoElementId).hide();
                    if ($('#videoremote' + remoteFeed.rfindex + ' .no-video-container').length === 0) {
                        $('#videoremote' + remoteFeed.rfindex).append(
                            '<div class="no-video-container">' +
                            '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                            '<span class="no-video-text">사용 가능한 원격 비디오가 없습니다</span>' +
                            '</div>');
                    }
                } else {
                    $('#videoremote' + remoteFeed.rfindex + ' .no-video-container').remove();
                    $(videoElementId).removeClass('hide').show();
                }
                if (!addButtons) {
                    return;
                }
                if (Janus.webRTCAdapter.browserDetails.browser === "chrome" || Janus.webRTCAdapter.browserDetails.browser === "firefox" ||
                    Janus.webRTCAdapter.browserDetails.browser === "safari") {
                    $('#curbitrate' + remoteFeed.rfindex).removeClass('hide').show();
                    bitrateTimer[remoteFeed.rfindex] = setInterval(function() {
                        var bitrate = remoteFeed.getBitrate();
                        $('#curbitrate' + remoteFeed.rfindex).text(bitrate);
                        var width = videoElement.videoWidth;
                        var height = videoElement.videoHeight;
                        if (width > 0 && height > 0) {
                            $('#curres' + remoteFeed.rfindex).removeClass('hide').text(width + 'x' + height).show();
                        } else {
                            console.error("비디오 요소의 너비와 높이를 가져올 수 없습니다.");
                        }
                    }, 1000);
                }
            } else {
                console.error("videoElement가 정의되지 않았습니다.");
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
            if (bitrateTimer[remoteFeed.rfindex]) {
                clearInterval(bitrateTimer[remoteFeed.rfindex]);
            }
            bitrateTimer[remoteFeed.rfindex] = null;
            remoteFeed.simulcastStarted = false;
            $('#simulcast' + remoteFeed.rfindex).remove();

            feeds[remoteFeed.rfindex] = null;
        }
    });
}



    useEffect(() => {
        if (mystream) {
            const attachStreamToElement = (elementRef, stream, elementName) => {
                if (elementRef && elementRef.current) {
                    Janus.attachMediaStream(elementRef.current, stream);
                } else {
                    console.warn(`${elementName} element not found. Retrying...`);
                }
            };
    
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
    
            // Initial check
            if (isHost) {
                attachStreamToElement(localVideoRef, mystream, "videolocal");
            } else {
                attachStreamToElement(remoteVideoRef.current[0], mystream, "videoremote0");
            }
        }
    }, [mystream, isHost]);
    

    // onlocalstream 함수에서 비디오 트랙 활성화 비활성화 논리 추가
window.onlocalstream = function (stream) {
    console.log(" ::: Got a local stream :::", stream);
    mystream = stream;

    const attachStreamToElement = (element, stream) => {
        if (element) {
            Janus.attachMediaStream(element, stream);
        } else {
            console.error("Element not found.");
        }
    };

    const waitForElementAndAttachStream = (elementRef, stream, elementName) => {
        const interval = setInterval(() => {
            if (elementRef.current) {
                attachStreamToElement(elementRef.current, stream);
                clearInterval(interval);
            } else {
                console.warn(`${elementName} element not found. Retrying...`);
            }
        }, 100); // 100ms 간격으로 재시도
    };

    if (isHost) {
        waitForElementAndAttachStream(localVideoRef, stream, "videolocal");
    } else {
        waitForElementAndAttachStream(remoteVideoRef.current[0], stream, "videoremote0");
    }

    // 스트림 트랙 종료 시 재시작 로직 추가
    stream.getTracks().forEach(track => {
        track.onended = function () {
            console.warn("Track ended:", track);
            // 스트림 재시작 로직
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                .then(newStream => {
                    mystream = newStream;
                    newStream.getVideoTracks()[0].enabled = false;  // 기본적으로 비디오 트랙을 비활성화
                    newStream.getAudioTracks()[0].enabled = false;  // 기본적으로 오디오 트랙을 비활성화

                    if (isHost) {
                        waitForElementAndAttachStream(localVideoRef, newStream, "videolocal");
                    } else {
                        waitForElementAndAttachStream(remoteVideoRef.current[0], stream, "videoremote0");
                    }
                })
                .catch(err => {
                    console.error("Failed to get new user media", err);
                });
        };
    });

    const videoTracks = stream.getVideoTracks();
    if (!videoTracks || videoTracks.length === 0) {
        console.log("No webcam available");
    }
};


   
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
                            consentDialog: (on) => {
                                Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
                            },
                            iceState: (state) => {
                                Janus.log("ICE state changed to " + state);
                            },
                            mediaState: (medium, on) => {
                                Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                            },
                            webrtcState: (on) => {
                                Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
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
                                                newRemoteFeed(id, display, audio, video);
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
                                                newRemoteFeed(id, display, audio, video);
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
                                // The publisher stream is sendonly, we don't expect anything here
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
        const storedIsHost = window.localStorage.getItem('isHost');
        const storedHostUsername = window.localStorage.getItem('hostUsername');
        setIsHost(storedIsHost === 'true');
        setHostUsername(storedHostUsername || "");
    }, []);

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
            } else {
                console.warn("비디오 요소를 찾을 수 없습니다.");
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

    useEffect(() => {
        const attachStreamToVideoElements = () => {
            if (remoteVideoRef.current && feeds) {
                feeds.forEach((feed, index) => {
                    if (feed && remoteVideoRef.current[index]) {
                        console.log(`Attaching stream to video element for feed ${index}`);
                        Janus.attachMediaStream(remoteVideoRef.current[index], feed.stream);
                    }
                });
            }
        };
    
        // 비디오 엘리먼트에 스트림을 연결
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
        for (let i = 0; i < numParticipants; i++) {
            const index = isHost ? i + 1 : i; // 호스트는 1부터 시작하고, 참가자는 0부터 시작
            panels.push(
                <div className="participant-video slider-item" key={index}>
                    <video className="relative videoremote" id={`videoremote${index}`} autoPlay playsInline ref={(el) => remoteVideoRef.current[index] = el}></video>
                </div>
            );
        }
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
