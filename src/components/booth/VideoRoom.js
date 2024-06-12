/* global mystream, publishOwnFeed, myid, mypvtid, Janus, sfutest, bootbox, feeds, newRemoteFeed, notifyParticipantsOfRoomClosure */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import $ from "jquery"; // jQuery import
import '../../style/Videopage.css';
import Slider from "react-slick";
import VideoChat from "./VideoChat";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { NextArrow, PrevArrow } from "./CustomArrows";


const opaqueId = "videoroomtest-" + Janus.randomString(12);
const myroom = null; // 방 번호를 실제로 사용할 번호로 변경해야 합니다.
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
    const navigate = useNavigate();
    const { roomNumber } = useParams();
    const location = useLocation();


    window.onlocalstream = function(stream) {
        console.log(" ::: Got a local stream :::", stream);
        mystream = stream;
        Janus.attachMediaStream(document.getElementById('myvideo'), stream);
        if (isHost) {
            Janus.attachMediaStream(document.getElementById('videolocal'), stream);
        } else {
            Janus.attachMediaStream(document.getElementById('videoremote1'), stream);
        }


         // 스트림 트랙 종료 시 재시작 로직 추가
        stream.getTracks().forEach(track => {
        track.onended = function() {
            console.warn("Track ended:", track);
            // 스트림 재시작 로직
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                .then(newStream => {
                    mystream = newStream;
                    Janus.attachMediaStream(document.getElementById('myvideo'), newStream);
                    if (isHost) {
                        Janus.attachMediaStream(document.getElementById('videolocal'), newStream);
                    } else {
                        Janus.attachMediaStream(document.getElementById('videoremote1'), newStream);
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

   const newRemoteFeed = (id, display, audio, video) => {
    let remoteFeed = null;
    janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: opaqueId,
        success: function(pluginHandle) {
            remoteFeed = pluginHandle;
            remoteFeed.simulcastStarted = false;
            Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
            Janus.log("  -- This is a subscriber");
            let subscribe = {
                request: "join",
                room: myroom,
                ptype: "subscriber",
                feed: id,
                private_id: mypvtid
            };
            remoteFeed.videoCodec = video;
            remoteFeed.send({ message: subscribe });
        },
        error: function(error) {
            Janus.error("Error attaching plugin...", error);
            bootbox.alert("Error attaching plugin... " + error);
        },
        onmessage: function(msg, jsep) {
            Janus.debug(" ::: Got a message (subscriber) :::", msg);
            let event = msg["videoroom"];
            Janus.debug("Event: " + event);
            if (msg["error"]) {
                bootbox.alert(msg["error"]);
            } else if (event) {
                if (event === "attached") {
                    for (let i = 1; i < 6; i++) {
                        if (!feeds[i]) {
                            feeds[i] = remoteFeed;
                            remoteFeed.rfindex = i;
                            break;
                        }
                    }
                    remoteFeed.rfid = msg["id"];
                    remoteFeed.rfdisplay = msg["display"];
                    Janus.log("Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]);
                    $('#remote' + remoteFeed.rfindex).removeClass('hide').html(remoteFeed.rfdisplay).show();
                } else if (event === "event") {
                    let substream = msg["substream"];
                    let temporal = msg["temporal"];
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
                Janus.debug("Handling SDP as well...", jsep);
                remoteFeed.createAnswer({
                    jsep: jsep,
                    media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
                    success: function(jsep) {
                        Janus.debug("Got SDP!", jsep);
                        let body = { request: "start", room: myroom };
                        remoteFeed.send({ message: body, jsep: jsep });
                    },
                    error: function(error) {
                        Janus.error("WebRTC error:", error);
                        bootbox.alert("WebRTC error... " + error.message);
                    }
                });
            }
        },
        iceState: function(state) {
            Janus.log("ICE state of this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") changed to " + state);
        },
        webrtcState: function(on) {
            Janus.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
        },
        onlocalstream: function(stream) {
            // The subscriber stream is recvonly, we don't expect anything here
        },
        onremotestream: function(stream) {
            Janus.debug("Remote feed #" + remoteFeed.rfindex + ", stream:", stream);
            let addButtons = false;
            if ($('#remotevideo' + remoteFeed.rfindex).length === 0) {
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
                    const width = this.videoWidth;
                    const height = this.videoHeight;
                    $('#curres' + remoteFeed.rfindex).removeClass('hide').text(width + 'x' + height).show();
                    if (Janus.webRTCAdapter.browserDetails.browser === "firefox") {
                        setTimeout(function() {
                            const width = $("#remotevideo" + remoteFeed.rfindex).get(0).videoWidth;
                            const height = $("#remotevideo" + remoteFeed.rfindex).get(0).videoHeight;
                            $('#curres' + remoteFeed.rfindex).removeClass('hide').text(width + 'x' + height).show();
                        }, 2000);
                    }
                });
            }
            Janus.attachMediaStream($('#remotevideo' + remoteFeed.rfindex).get(0), stream);
            const videoTracks = stream.getVideoTracks();
            if (!videoTracks || videoTracks.length === 0) {
                $('#remotevideo' + remoteFeed.rfindex).hide();
                if ($('#videoremote' + remoteFeed.rfindex + ' .no-video-container').length === 0) {
                    $('#videoremote' + remoteFeed.rfindex).append(
                        '<div class="no-video-container">' +
                        '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                        '<span class="no-video-text">No remote video available</span>' +
                        '</div>');
                }
            } else {
                $('#videoremote' + remoteFeed.rfindex + ' .no-video-container').remove();
                $('#remotevideo' + remoteFeed.rfindex).removeClass('hide').show();
            }
            if (!addButtons) {
                return;
            }
            if (Janus.webRTCAdapter.browserDetails.browser === "chrome" || Janus.webRTCAdapter.browserDetails.browser === "firefox" ||
                Janus.webRTCAdapter.browserDetails.browser === "safari") {
                $('#curbitrate' + remoteFeed.rfindex).removeClass('hide').show();
                bitrateTimer[remoteFeed.rfindex] = setInterval(function() {
                    const bitrate = remoteFeed.getBitrate();
                    $('#curbitrate' + remoteFeed.rfindex).text(bitrate);
                    const width = $("#remotevideo" + remoteFeed.rfindex).get(0).videoWidth;
                    const height = $("#remotevideo" + remoteFeed.rfindex).get(0).videoHeight;
                    if (width > 0 && height > 0) {
                        $('#curres' + remoteFeed.rfindex).removeClass('hide').text(width + 'x' + height).show();
                    }
                }, 1000);
            }
        },
        oncleanup: function() {
            Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
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
};


    useEffect(() => {
        const { state } = location;
        if (state && state.numParticipants) {
            setNumParticipants(state.numParticipants.length - 1);
        }

        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (loggedInUser) {
            setUsername(loggedInUser.username);
            const storedRoomNumber = window.localStorage.getItem('roomNumber');
            const isHostFlag = window.localStorage.getItem('isHost') === 'true';
            setIsHost(isHostFlag);

            if (roomNumber || storedRoomNumber) {
                window.initjanus(() => {
                    window.sfutest.send({
                        message: {
                            request: "listparticipants",
                            room: parseInt(roomNumber || storedRoomNumber, 10)
                        },
                        success: function (result) {
                            if (result.participants) {
                                setNumParticipants(state.numParticipants); // 수신된 참가자 수로 설정
                            } else {
                                console.error("No participants field in response: ", result);
                            }
                        },
                        error: function (error) {
                            console.error("Failed to list participants:", error);
                        }
                    });

                    window.sfutest.onmessage = function(msg, jsep) {
                        try {
                            var event = msg["videoroom"];
                            if (event) {
                                if (event === "joined") {
                                    myid = msg["id"];
                                    mypvtid = msg["private_id"];
                                    if (msg["publishers"]) {
                                        var list = msg["publishers"];
                                        setNumParticipants(state.numParticipants); // 수신된 참가자 수로 설정
                                        for (var f in list) {
                                            var id = list[f]["id"];
                                            var display = list[f]["display"];
                                            var audio = list[f]["audio_codec"];
                                            var video = list[f]["video_codec"];
                                            newRemoteFeed(id, display, audio, video);
                                        }
                                    }
                                    if (isHost) {
                                        publishOwnFeed(true);
                                    }
                                } else if (event === "event") {
                                    if (msg["publishers"]) {
                                        var list = msg["publishers"];
                                        setNumParticipants(prev => prev + list.length);
                                        for (var f in list) {
                                            var id = list[f]["id"];
                                            var display = list[f]["display"];
                                            var audio = list[f]["audio_codec"];
                                            var video = list[f]["video_codec"];
                                            newRemoteFeed(id, display, audio, video);
                                        }
                                    } else if (msg["leaving"]) {
                                        var leaving = msg["leaving"];
                                        var remoteFeed = null;
                                        for (var i = 1; i <= numParticipants; i++) {
                                            if (feeds[i] && feeds[i].rfid == leaving) {
                                                remoteFeed = feeds[i];
                                                break;
                                            }
                                        }
                                        if (remoteFeed != null) {
                                            feeds[remoteFeed.rfindex] = null;
                                            remoteFeed.detach();
                                            setNumParticipants(prev => prev - 1);
                                        }
                                    } else if (msg["unpublished"]) {
                                        var unpublished = msg["unpublished"];
                                        if (unpublished === 'ok') {
                                            sfutest.hangup();
                                            return;
                                        }
                                        var remoteFeed = null;
                                        for (var i = 1; i <= numParticipants; i++) {
                                            if (feeds[i] && feeds[i].rfid == unpublished) {
                                                remoteFeed = feeds[i];
                                                break;
                                            }
                                        }
                                        if (remoteFeed != null) {
                                            feeds[remoteFeed.rfindex] = null;
                                            remoteFeed.detach();
                                            setNumParticipants(prev => prev - 1);
                                        }
                                    } else if (msg["error"]) {
                                        bootbox.alert(msg["error"]);
                                    }
                                }
                            }
                            if (jsep) {
                                Janus.debug("Handling SDP as well...", jsep);
                                if (jsep.type === "offer") {
                                    sfutest.createAnswer({
                                        jsep: jsep,
                                        media: { audioSend: false, videoSend: false }, // We want recvonly audio/video
                                        success: function(jsep) {
                                            Janus.debug("Got SDP!", jsep);
                                            myroom = roomNumber;
                                            var body = { request: "start", room: myroom };
                                            sfutest.send({ message: body, jsep: jsep });
                                        },
                                        error: function(error) {
                                            Janus.error("WebRTC error:", error);
                                            bootbox.alert("WebRTC error... " + error.message);
                                        }
                                    });
                                } else if (jsep.type === "answer") {
                                    sfutest.handleRemoteJsep({ jsep: jsep });
                                }
                            }
                        
                        } catch (error) {
                            Janus.error("Error handling message:", error);
                        }
                    };
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
            console.log("현재 오디오 트랙 상태: " + (!audioTrack.enabled ? "켜짐" : "꺼짐"));
        } else {
            console.warn("No audio track available to toggle.");
        }
    };

    const toggleMic = () => {
        toggleMute();
    };

    const toggleCam = () => {
        if (window.toggleCam) {
            window.toggleCam();
            setIsCamOff(prevState => !prevState);
        } else {
            console.warn("toggleCam 함수가 정의되지 않았습니다.");
        }
    };

    const closeRoomHandler = () => {
        if (isHost) {
            const room = parseInt(roomNumber || window.localStorage.getItem('roomNumber'), 10);
            window.closeRoom(room, (success) => {
                if (success) {
                    notifyParticipantsOfRoomClosure();
                }
            });
        } else {
            alert("호스트 권한이 없습니다.");
        }
    };

    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 5,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    initialSlide: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    const renderVideoPanels = () => {
        const panels = [];
        for (let i = 0; i < numParticipants; i++) {  // 참가자 수만큼 반복
            panels.push(
                <div className="p-2" key={i}>
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden relative">
                        <div className="bg-[#54c5d9] p-4 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                                Participant <br></br>#{i + 1} <span className="label label-info hide" id={`remote${i + 1}`}></span>
                            </h3>
                        </div>
                        <div className="relative w-full h-32">
                            <img src="/images/slisli.png" alt="slisli" className="w-6 h-6 absolute bottom-0 right-0 object-contain" />
                            <video className="relative videoremote w-full h-full" id={`videoremote${i + 1}`} autoPlay playsInline muted></video>
                        </div>
                    </div>
                </div>
            );
        }
        return panels;
    };

    useEffect(() => {
        window.toggleMute = toggleMute;
    }, []);


    return (
        <div className="grid grid-cols-4">
            <div className="col-span-3">
                <div className='bg-[#f0f8ff] w-full h-full'>
                    <div className="container mx-auto p-4" id="videos">
                        <div className="grid grid-cols-1 gap-4">
                            {isHost && (
                                <div className="bg-white shadow-lg rounded-lg overflow-hidden relative">
                                    <div className="bg-[#54c5d9] p-4 flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">
                                            Host Video {isHost && <span className="badge badge-primary">Host</span>}
                                        </h3>
                                    </div>
                                    <div className="relative w-full h-96">
                                        <img src="/images/slisli.png" alt="slisli" className="w-12 h-12 absolute bottom-0 right-0 object-contain" />
                                        <video className="relative w-full h-full" id="videolocal" autoPlay playsInline muted ></video>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-left mt-4 space-x-4">
                                <button className="btn btn-warning" onClick={toggleMic}>
                                    {isMicMuted ? "Unmute Mic" : "Mute Mic"}
                                </button>
                                <button className="btn btn-warning" onClick={toggleCam}>
                                    {isCamOff ? "Turn On Cam" : "Turn Off Cam"}
                                </button>
                                {isHost && (
                                    <button className="btn btn-danger" onClick={closeRoomHandler}>
                                        Close Room
                                    </button>
                                )}
                            </div>
                            <div className="bg-white w-3/5 shadow-lg rounded-lg overflow-hidden relative">
                                <div className="bg-[#54c5d9] p-4 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">
                                        My Video
                                    </h3>
                                </div>
                                <div className="relative w-full h-32">
                                    <img src="/images/slisli.png" alt="slisli" className="w-10 h-10 absolute bottom-0 right-0 object-contain" />
                                    <video className="relative w-full h-full videoremote" id="myvideo" autoPlay playsInline muted></video>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Slider {...settings}>
                                {renderVideoPanels()}
                            </Slider>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-span-1">
                <VideoChat />
            </div>
        </div>
    );
};

export default VideoRoom;