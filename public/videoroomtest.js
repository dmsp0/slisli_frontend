var version = 1.2;
var server = null;
server = "https://janus.jsflux.co.kr/janus"; //jsflux janus server url

var janus = null;
var sfutest = null;
var opaqueId = "videoroomtest-"+Janus.randomString(12);

var myroom = null; // 초기화

// URL 파라미터에서 방 번호를 가져오는 함수
function getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

// 방 번호를 설정하는 부분
if (getQueryStringValue("room") !== "") {
    myroom = parseInt(getQueryStringValue("room"));
} else {
    myroom = parseInt(sessionStorage.getItem('roomNumber'));
}

if (!myroom || isNaN(myroom)) {
    console.error("방 번호가 설정되지 않았습니다.");
    // 방 번호가 없으면 기본 방 번호를 설정하거나 오류 처리
    myroom = 1234; // 예시 기본 방 번호
}

// 방 번호를 올바르게 설정했는지 콘솔에 출력하여 확인합니다.
console.log("현재 설정된 방 번호:", myroom);


var myusername = null;
var myid = null;
var mystream = null;
var mypvtid = null;

var feeds = [];
var bitrateTimer = [];

var doSimulcast = (getQueryStringValue("simulcast") === "yes" || getQueryStringValue("simulcast") === "true");
var doSimulcast2 = (getQueryStringValue("simulcast2") === "yes" || getQueryStringValue("simulcast2") === "true");
var subscriber_mode = (getQueryStringValue("subscriber-mode") === "yes" || getQueryStringValue("subscriber-mode") === "true");

$(document).ready(function() {
	// Initialize the library (all console debuggers enabled)
	Janus.init({debug: "all", callback: function() {
		// Use a button to start the demo
		$('#start').one('click', function() {

			$(this).attr('disabled', true).unbind('click');
			// Make sure the browser supports WebRTC
			if(!Janus.isWebrtcSupported()) {
				bootbox.alert("No WebRTC support... ");
				return;
			}
			// Create session
			janus = new Janus(
				{
					server: server,
					success: function() {
						// Attach to VideoRoom plugin
						janus.attach(
							{
								plugin: "janus.plugin.videoroom",
								opaqueId: opaqueId,
								success: function(pluginHandle) {
									$('#details').remove();
									sfutest = pluginHandle;
									Janus.log("Plugin attached! (" + sfutest.getPlugin() + ", id=" + sfutest.getId() + ")");
                                    sfutest.onmessage = onmessage;
                                    janusConfigured = true; // Janus 설정 완료
                                    registerUsername(); // 사용자 등록 및 방 참여
									Janus.log("  -- This is a publisher/manager");
									// Prepare the username registration
									$('#videojoin').removeClass('hide').show();
									$('#registernow').removeClass('hide').show();
									$('#register').click(registerUsername);
									$('#roomname').focus();
									$('#start').removeAttr('disabled').html("Stop")
										.click(function() {
											$(this).attr('disabled', true);
											janus.destroy();
										});

                    Janus.log("Room List > ");
                    //roomList();
								},
								error: function(error) {
									Janus.error("  -- Error attaching plugin...", error);
									bootbox.alert("Error attaching plugin... " + error);
								},
								consentDialog: function(on) {
									Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
									if(on) {
										// Darken screen and show hint
										$.blockUI({
											message: '<div><img src="up_arrow.png"/></div>',
											css: {
												border: 'none',
												padding: '15px',
												backgroundColor: 'transparent',
												color: '#aaa',
												top: '10px',
												left: (navigator.mozGetUserMedia ? '-100px' : '300px')
											} });
									} else {
										// Restore screen
										$.unblockUI();
									}
								},
								iceState: function(state) {
									Janus.log("ICE state changed to " + state);
								},
								mediaState: function(medium, on) {
									Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
								},
								webrtcState: function(on) {
									Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
									$("#videolocal").parent().parent().unblock();
									if(!on)
										return;
									$('#publish').remove();
									// This controls allows us to override the global room bitrate cap
									$('#bitrate').parent().parent().removeClass('hide').show();
									$('#bitrate a').click(function() {
										var id = $(this).attr("id");
										var bitrate = parseInt(id)*1000;
										if(bitrate === 0) {
											Janus.log("Not limiting bandwidth via REMB");
										} else {
											Janus.log("Capping bandwidth to " + bitrate + " via REMB");
										}
										$('#bitrateset').html($(this).html() + '<span class="caret"></span>').parent().removeClass('open');
										sfutest.send({ message: { request: "configure", bitrate: bitrate }});
										return false;
									});
								},
								onmessage: function(msg, jsep) {
									Janus.debug(" ::: Got a message (publisher) :::", msg);
									var event = msg["videoroom"];
									Janus.debug("Event: " + event);
									if(event) {
										if(event === "joined") {
											// Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
											myid = msg["id"];
											mypvtid = msg["private_id"];
											Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);
											if(subscriber_mode) {
												$('#videojoin').hide();
												$('#videos').removeClass('hide').show();
											} else {
												publishOwnFeed(true);
											}
											// Any new feed to attach to?
											if(msg["publishers"]) {
												var list = msg["publishers"];
												Janus.debug("Got a list of available publishers/feeds:", list);
												for(var f in list) {
													var id = list[f]["id"];
													var display = list[f]["display"];
													var audio = list[f]["audio_codec"];
													var video = list[f]["video_codec"];
													Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
													newRemoteFeed(id, display, audio, video);
												}
											}
										} else if(event === "destroyed") {
											// The room has been destroyed
											Janus.warn("The room has been destroyed!");
											bootbox.alert("The room has been destroyed", function() {
												window.location.reload();
											});
										} else if(event === "event") {
											// Any new feed to attach to?
											if(msg["publishers"]) {
												var list = msg["publishers"];
												Janus.debug("Got a list of available publishers/feeds:", list);
												for(var f in list) {
													var id = list[f]["id"];
													var display = list[f]["display"];
													var audio = list[f]["audio_codec"];
													var video = list[f]["video_codec"];
													Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
													newRemoteFeed(id, display, audio, video);
												}
											} else if(msg["leaving"]) {
												// One of the publishers has gone away?
												var leaving = msg["leaving"];
												Janus.log("Publisher left: " + leaving);
												var remoteFeed = null;
												for(var i=1; i<6; i++) {
													if(feeds[i] && feeds[i].rfid == leaving) {
														remoteFeed = feeds[i];
														break;
													}
												}
												if(remoteFeed != null) {
													Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
													$('#remote'+remoteFeed.rfindex).empty().hide();
													$('#videoremote'+remoteFeed.rfindex).empty();
													feeds[remoteFeed.rfindex] = null;
													remoteFeed.detach();
												}
											} else if(msg["unpublished"]) {
												// One of the publishers has unpublished?
												var unpublished = msg["unpublished"];
												Janus.log("Publisher left: " + unpublished);
												if(unpublished === 'ok') {
													// That's us
													sfutest.hangup();
													return;
												}
												var remoteFeed = null;
												for(var i=1; i<6; i++) {
													if(feeds[i] && feeds[i].rfid == unpublished) {
														remoteFeed = feeds[i];
														break;
													}
												}
												if(remoteFeed != null) {
													Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
													$('#remote'+remoteFeed.rfindex).empty().hide();
													$('#videoremote'+remoteFeed.rfindex).empty();
													feeds[remoteFeed.rfindex] = null;
													remoteFeed.detach();
												}
											} else if(msg["error"]) {
												if(msg["error_code"] === 426) {
													// This is a "no such room" error: give a more meaningful description
													bootbox.alert(
														"<p>Apparently room <code>" + myroom + "</code> (the one this demo uses as a test room) " +
														"does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.jcfg</code> " +
														"configuration file? If not, make sure you copy the details of room <code>" + myroom + "</code> " +
														"from that sample in your current configuration file, then restart Janus and try again."
													);
												} else {
													bootbox.alert(msg["error"]);
												}
											}
										}
									}
									if(jsep) {
										Janus.debug("Handling SDP as well...", jsep);
										sfutest.handleRemoteJsep({ jsep: jsep });
										// Check if any of the media we wanted to publish has
										// been rejected (e.g., wrong or unsupported codec)
										var audio = msg["audio_codec"];
										if(mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
											// Audio has been rejected
											toastr.warning("Our audio stream has been rejected, viewers won't hear us");
										}
										var video = msg["video_codec"];
										if(mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
											// Video has been rejected
											toastr.warning("Our video stream has been rejected, viewers won't see us");
											// Hide the webcam video
											$('#myvideo').hide();
											$('#videolocal').append(
												'<div class="no-video-container">' +
													'<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
													'<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
												'</div>');
										}
									}
								},
								onlocalstream: onlocalstream,
									
								onremotestream: onremotestream,
								oncleanup: function() {
									Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
									mystream = null;
									$('#videolocal').html('<button id="publish" class="btn btn-primary">Publish</button>');
									$('#publish').click(function() { publishOwnFeed(true); });
									$("#videolocal").parent().parent().unblock();
									$('#bitrate').parent().parent().addClass('hide');
									$('#bitrate a').unbind('click');
								},
								
							});
					},
					error: function(error) {
						Janus.error(error);
						bootbox.alert(error, function() {
							window.location.reload();
						});
					},
					destroyed: function() {
						window.location.reload();
					}
				});
		});
	}});
});

function checkEnter(field, event) {
	var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
	if(theCode == 13) {
		registerUsername();
		return false;
	} else {
		return true;
	}
}

// [jsflux] 방생성 및 조인
function registerUsername() {
    var register = {
        request: "join",
        room: myroom,
        ptype: "publisher",
        display: myusername
    };
    sfutest.send({ message: register });
}


function createRoomAndJoinAsHost(username, participants, roomNumber, callback) {
    var createRoom = {
        request: "create",
        room: parseInt(roomNumber),  // 사용자가 입력한 방 번호 사용
        permanent: false,
        record: false,
        publishers: parseInt(participants),  // 참가자 수를 정수로 변환하여 사용
        bitrate: 128000,
        fir_freq: 10,
        ptype: "publisher",
        description: "test",
        is_private: false
    };

    console.log("Creating room with the following parameters:", createRoom); // Debug log

    sfutest.send({
        message: createRoom,
        success: function (result) {
            console.log("Janus response:", result); // Debug log
            var event = result["videoroom"];
            if (event !== undefined && event !== null) {
                console.log("Room Create Result: ", result);
                var room = result["room"];
                console.log("Room created: ", room);

                var register = { request: "join", room: room, ptype: "publisher", display: username };
                myusername = username;
                myroom = room; // 생성된 방 번호 저장
                sfutest.send({
                    message: register,
                    success: function (result) {
                        console.log("Joined room as host:", result); // Debug log
                        janusConfigured = true; // 방 생성 및 조인 완료
                    },
                    error: function (error) {
                        console.error("Error joining room as host:", error);
                    }
                });

                window.localStorage.setItem('window.isHost', 'true');
                window.localStorage.setItem('hostUsername', username);

                setTimeout(closeRoom, 43200000); // 12시간 후 방 닫기

                if (callback) callback(true, room);
            } else {
                if (callback) callback(false);
            }
        },
        error: function (error) {
            console.error("Error creating room:", error);
            if (callback) callback(false);
        }
    });
}




function joinRoomAsParticipant(username, roomNumber, callback) {
    var register = { request: "join", room: roomNumber, ptype: "publisher", display: username };
    myusername = username;
    myroom = roomNumber; // 참여하는 방 번호 저장
    sfutest.send({
        message: register,
        success: function (result) {
            console.log("Joined room as participant:", result); // Debug log
            janusConfigured = true; // 방 조인 완료
            window.localStorage.setItem('isHost', 'false');
            if (callback) callback(true);
        },
        error: function (error) {
            console.error("Error joining room:", error);
            if (callback) callback(false);
        }
    });
}


// 방을 닫는 함수
function closeRoom(room, callback) {
    var body = { request: "destroy", room: room };
    sfutest.send({
        message: body,
        success: function(result) {
            if(result.videoroom === 'destroyed') {
                console.log("Room closed: " + room);
                window.localStorage.removeItem('window.isHost');
                window.localStorage.removeItem('hostUsername');
                window.localStorage.removeItem('roomNumber');
                if(callback) callback(true);
            }
        },
        error: function(error) {
            console.error("Error closing room:", error);
            if(callback) callback(false);
        }
    });
}


function checkRoomExists(roomNumber, callback) {
    const request = {
        request: "exists",
        room: parseInt(roomNumber, 10)
    };

    window.sfutest.send({
        message: request,
        success: function(result) {
            if (result.exists) {
                callback(true);
            } else {
                callback(false);
            }
        },
        error: function(error) {
            console.error("Error checking room existence:", error);
            callback(false);
        }
    });
}

function joinRoomAsHost(username, roomNumber, callback) {
    const register = {
        request: "join",
        room: parseInt(roomNumber, 10),
        ptype: "publisher",
        display: username
    };

    window.sfutest.send({
        message: register,
        success: function(result) {
            console.log(`Joined room ${roomNumber} as host`);
            if (callback) callback(true);
        },
        error: function(error) {
            console.error("Error joining room as host:", error);
            if (callback) callback(false);
        }
    });
}

window.joinRoomAsHost = joinRoomAsHost;



// 참가자에게 메시지를
function notifyParticipantsOfRoomClosure() {
    var message = {
        request: "message",
        text: "호스트가 방송을 종료했습니다.",
        videoroom: 'destroyed'
    };
    sfutest.send({
        message: message,
        success: function() {
            alert("방이 닫혔습니다. 홈 페이지로 이동합니다.");
            window.location.href = '/';
        },
        error: function(error) {
            console.error("Failed to send notification", error);
            alert("방을 닫는 중 오류가 발생했습니다.");
        }
    });
}



// [jsflux] 방 참여자
function participantsList(room){
    var listHtml = "";
    var roomPQuery = {
        "request" : "listparticipants",
        "room" : Number(room )
    }
    sfutest.send({ "message": roomPQuery, success:function(result){
        console.log("participants List: " + JSON.stringify(result));
        var listP = result["participants"];
        listHtml += '<table>';
        $(listP).each(function(i, object) {
            listHtml += '<tr>';
            listHtml += '   <td>' + object.display + '</td>';
            listHtml += '   <td>' + object.talking + '</td>';
            listHtml += '</tr>';
        });
        listHtml += '</table>';
        $("#room_" + room).html(listHtml);
    }});
}

// [jsflux] 내 화상화면 시작
function publishOwnFeed(useAudio) {
    if (!window.sfutest) {
        console.warn("sfutest 객체가 없습니다. publishOwnFeed를 호출할 수 없습니다.");
        return;
    }

    $('#publish').attr('disabled', true).unbind('click');
    sfutest.createOffer({
        media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true },
        success: function(jsep) {
            Janus.debug("Got publisher SDP!", jsep);
            var publish = { request: "configure", audio: true, video: true };
            sfutest.send({
                message: publish,
                jsep: jsep,
                success: function(response) {
                    Janus.debug("Publisher successfully configured", response);
                },
                error: function(error) {
                    Janus.error("Error configuring publisher:", error);
                    bootbox.alert("Error configuring publisher: " + error.message);
                    $('#publish').removeAttr('disabled').click(function() { publishOwnFeed(true); });
                }
            });
        },
        error: function(error) {
            Janus.error("WebRTC error:", error);
            bootbox.alert("WebRTC error... " + error.message);
            $('#publish').removeAttr('disabled').click(function() { publishOwnFeed(true); });
        }
    });
}






window.sfutest.onmessage = function(msg, jsep) {
    console.log("Received message: ", msg); // 디버깅용 로그 추가
    try {
        var event = msg["videoroom"];
        console.log("Received event: ", event); // 이벤트 로그 추가
        if (event) {
            if (event === "joined") {
                myid = msg["id"];
                mypvtid = msg["private_id"];
                Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);
                if(subscriber_mode) {
                    $('#videojoin').hide();
                    $('#videos').removeClass('hide').show();
                } else {
                    publishOwnFeed(true);
                }
                if(msg["publishers"]) {
                    var list = msg["publishers"];
                    Janus.debug("Got a list of available publishers/feeds:", list);
                    for(var f in list) {
                        var id = list[f]["id"];
                        var display = list[f]["display"];
                        var audio = list[f]["audio_codec"];
                        var video = list[f]["video_codec"];
                        Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                        newRemoteFeed(id, display, audio, video);
                    }
                }
            } else if (event === "event") {
                if (msg["publishers"]) {
                    var list = msg["publishers"];
                    Janus.debug("Got a list of available publishers/feeds:", list);
                    setNumParticipants(list.length); // 참가자 수 업데이트
                    for (var f in list) {
                        var id = list[f]["id"];
                        var display = list[f]["display"];
                        var audio = list[f]["audio_codec"];
                        var video = list[f]["video_codec"];
                        Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                        if (id) {
                            if (!feeds.some(feed => feed && feed.rfid === id)) {
                                newRemoteFeed(id, display, audio, video);
                            } else {
                                console.warn("Feed already exists with ID:", id);
                            }
                        } else {
                            console.error("Invalid feed ID:", id);
                        }
                    }
                } else if (msg["leaving"]) {
                    var leaving = msg["leaving"];
                    Janus.log("Publisher left: " + leaving);
                    var remoteFeed = null;
                    for (var i = 1; i < 6; i++) {
                        if (feeds[i] && feeds[i].rfid == leaving) {
                            remoteFeed = feeds[i];
                            break;
                        }
                    }
                    if (remoteFeed != null) {
                        Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                        $('#remote' + remoteFeed.rfindex).empty().hide();
                        $('#videoremote' + remoteFeed.rfindex).empty();
                        feeds[remoteFeed.rfindex] = null;
                        remoteFeed.detach();
                        setNumParticipants(prev => prev - 1);
                    }
                } else if (msg["unpublished"]) {
                    var unpublished = msg["unpublished"];
                    Janus.log("Publisher unpublished: " + unpublished);
                    if (unpublished === 'ok') {
                        sfutest.hangup();
                        return;
                    }
                    var remoteFeed = null;
                    for (var i = 1; i < 6; i++) {
                        if (feeds[i] && feeds[i].rfid == unpublished) {
                            remoteFeed = feeds[i];
                            break;
                        }
                    }
                    if (remoteFeed != null) {
                        Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                        $('#remote' + remoteFeed.rfindex).empty().hide();
                        $('#videoremote' + remoteFeed.rfindex).empty();
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
            sfutest.handleRemoteJsep({
                jsep: jsep,
                success: function() {
                    Janus.log("Successfully handled remote JSEP.");
                },
                error: function(error) {
                    Janus.error("Error handling remote JSEP: ", error);
                }
            });
        }
    } catch (error) {
        Janus.error("Error handling message:", error);
    }
};








// function toggleMic() {
//     if (window.toggleMute) {
//         window.toggleMute();
//     } else {
//         console.warn("toggleMute 함수가 정의되지 않았습니다.");
//     }
// }

// // 카메라 기능 on/off
// function toggleCam() {
//     if (!janusConfigured) {
//         console.warn("Janus participant is not configured yet.");
//         return;
//     }
//     if (mystream && mystream.getVideoTracks().length > 0) {
//         var videoTrack = mystream.getVideoTracks()[0];
//         videoTrack.enabled = !videoTrack.enabled;
//         console.log("현재 비디오 트랙 상태: " + (videoTrack.enabled ? "켜짐" : "꺼짐"));

//         // 비디오 요소 업데이트
//         var videoElement = document.getElementById('videolocal') || document.getElementById('videoremote0');
//         if (videoElement) {
//             videoElement.srcObject = mystream;
//         } else {
//             console.warn("비디오 요소를 찾을 수 없습니다.");
//         }

//         if (sfutest && sfutest.webrtcStuff && sfutest.webrtcStuff.pc) {
//             sfutest.send({
//                 message: {
//                     request: "configure",
//                     video: videoTrack.enabled
//                 }
//             });
//         } else {
//             console.warn("Janus participant is not configured yet.");
//         }
//     } else {
//         console.warn("No video track available to toggle.");
//     }
// }

// function toggleMute() {
//     if (!window.sfutest) {
//         console.warn("플러그인 핸들이 없습니다.");
//         return;
//     }
//     const pc = window.sfutest.webrtcStuff ? window.sfutest.webrtcStuff.pc : null;
//     console.log("toggleMute PeerConnection state:", pc ? pc.iceConnectionState : "No PeerConnection");
//     if (!pc) {
//         console.warn("유효한 PeerConnection이 없습니다.");
//         return;
//     }
//     const audioTracks = mystream ? mystream.getAudioTracks() : [];
//     console.log("Current audioTracks:", audioTracks);
//     if (audioTracks.length === 0) {
//         console.warn("오디오 트랙이 없습니다.");
//         return;
//     }
//     const audioTrack = audioTracks[0];
//     const enabled = !audioTrack.enabled;
//     audioTrack.enabled = enabled;
//     console.log("Audio " + (enabled ? "unmuted" : "muted"));
// }

// [jsflux] 방나가기
function unpublishOwnFeed() {
	// Unpublish our stream
	$('#unpublish').attr('disabled', true).unbind('click');
	var unpublish = { request: "unpublish" };
	sfutest.send({ message: unpublish });
}

// // [jsflux] 새로운 유저 들어왔을때
// function newRemoteFeed(id, display, audio, video) {
//     console.log("새 원격 피드 생성 시도, ID: ", id);

//     if (!id) {
//         console.error("유효하지 않은 피드 ID");
//         return;
//     }

//     var remoteFeed = null;
//     janus.attach({
//         plugin: "janus.plugin.videoroom",
//         opaqueId: opaqueId,
//         success: function(pluginHandle) {
//             remoteFeed = pluginHandle;
//             remoteFeed.simulcastStarted = false;
//             Janus.log("플러그인 부착 완료! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
//             Janus.log("  -- 구독자입니다");

//             sfutest = pluginHandle;

//             sfutest.onmessage = onmessage;

//             var subscribe = {
//                 request: "join",
//                 room: myroom,
//                 ptype: "subscriber",
//                 feed: id,
//                 private_id: mypvtid
//             };

//             console.log("구독 요청 데이터:", subscribe);

//             if (Janus.webRTCAdapter.browserDetails.browser === "safari" &&
//                 (video === "vp9" || (video === "vp8" && !Janus.safariVp8))) {
//                 if (video) {
//                     video = video.toUpperCase();
//                     toastr.warning("퍼블리셔가 " + video + " 코덱을 사용 중입니다. Safari에서 지원하지 않으므로 비디오를 비활성화합니다.");
//                     subscribe["offer_video"] = false;
//                 }
//             }
//             remoteFeed.videoCodec = video;
//             remoteFeed.send({ message: subscribe });
//         },
//         error: function(error) {
//             Janus.error("플러그인 부착 중 오류 발생...", error);
//             bootbox.alert("플러그인 부착 중 오류 발생: " + error);
//         },
//         onmessage: function(msg, jsep) {
//             Janus.debug(" ::: 구독자로부터 메시지를 받았습니다 :::", msg);
//             var event = msg["videoroom"];
//             Janus.debug("이벤트: " + event);
//             if (msg["error"]) {
//                 bootbox.alert(msg["error"]);
//             } else if (event) {
//                 if (event === "attached") {
//                     for (var i = 1; i < 6; i++) {
//                         if (!feeds[i]) {
//                             feeds[i] = remoteFeed;
//                             remoteFeed.rfindex = i;
//                             break;
//                         }
//                     }
//                     remoteFeed.rfid = msg["id"];
//                     remoteFeed.rfdisplay = msg["display"];
//                     Janus.log("피드 " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ")에 성공적으로 연결되었습니다. 룸 " + msg["room"] + "에서");
//                     $('#remote' + remoteFeed.rfindex).removeClass('hide').html(remoteFeed.rfdisplay).show();
//                 } else if (event === "event") {
//                     var substream = msg["substream"];
//                     var temporal = msg["temporal"];
//                     if ((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
//                         if (!remoteFeed.simulcastStarted) {
//                             remoteFeed.simulcastStarted = true;
//                             addSimulcastButtons(remoteFeed.rfindex, remoteFeed.videoCodec === "vp8" || remoteFeed.videoCodec === "h264");
//                         }
//                         updateSimulcastButtons(remoteFeed.rfindex, substream, temporal);
//                     }
//                 }
//             }
//             if (jsep) {
//                 Janus.debug("SDP 처리 중...", jsep);
//                 remoteFeed.createAnswer({
//                     jsep: jsep,
//                     media: { audioSend: false, videoSend: false },
//                     success: function(jsep) {
//                         Janus.debug("SDP 생성 완료!", jsep);
//                         var body = { request: "start", room: myroom };
//                         remoteFeed.send({ message: body, jsep: jsep });
//                     },
//                     error: function(error) {
//                         Janus.error("WebRTC 오류 발생:", error);
//                         bootbox.alert("WebRTC 오류 발생: " + error.message);
//                     }
//                 });
//             }
//         },
//         iceState: function(state) {
//             Janus.log("이 WebRTC PeerConnection의 ICE 상태 (피드 #" + remoteFeed.rfindex + ")가 " + state + "로 변경되었습니다.");
//         },
//         webrtcState: function(on) {
//             Janus.log("Janus가 이 WebRTC PeerConnection (피드 #" + remoteFeed.rfindex + ")이 " + (on ? "업" : "다운") + " 상태라고 알립니다.");
//         },
//         onlocalstream: function(stream) {
//             // 구독자 스트림은 recvonly이므로 여기서는 아무 것도 기대하지 않습니다
//         },
//         onremotestream: function(stream) {
//             Janus.debug("원격 피드 #" + remoteFeed.rfindex + ", 스트림:", stream);
//             var addButtons = false;
//             var videoElementId = '#videoremote' + remoteFeed.rfindex;
//             if ($(videoElementId).length === 0) {
//                 addButtons = true;
//                 $('#videoremote' + remoteFeed.rfindex).append('<video class="rounded centered" id="waitingvideo' + remoteFeed.rfindex + '" width="100%" height="100%" />');
//                 $('#videoremote' + remoteFeed.rfindex).append('<video class="rounded centered relative hide" id="remotevideo' + remoteFeed.rfindex + '" width="100%" height="100%" autoplay playsinline/>');
//                 $('#videoremote' + remoteFeed.rfindex).append(
//                     '<span class="label label-primary hide" id="curres' + remoteFeed.rfindex + '" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;"></span>' +
//                     '<span class="label label-info hide" id="curbitrate' + remoteFeed.rfindex + '" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;"></span>');
//                 $("#remotevideo" + remoteFeed.rfindex).bind("playing", function() {
//                     if (remoteFeed.spinner) {
//                         remoteFeed.spinner.stop();
//                     }
//                     remoteFeed.spinner = null;
//                     $('#waitingvideo' + remoteFeed.rfindex).remove();
//                     if (this.videoWidth) {
//                         $('#remotevideo' + remoteFeed.rfindex).removeClass('hide').show();
//                     }
//                     var width = this.videoWidth;
//                     var height = this.videoHeight;
//                     $('#curres' + remoteFeed.rfindex).removeClass('hide').text(width + 'x' + height).show();
//                     if (Janus.webRTCAdapter.browserDetails.browser === "firefox") {
//                         setTimeout(function() {
//                             var videoElement = $("#remotevideo" + remoteFeed.rfindex).get(0);
//                             if (videoElement) {
//                                 var width = videoElement.videoWidth;
//                                 var height = videoElement.videoHeight;
//                                 $('#curres' + remoteFeed.rfindex).removeClass('hide').text(width + 'x' + height).show();
//                             } else {
//                                 console.error("videoElement가 정의되지 않았습니다.");
//                             }
//                         }, 2000);
//                     }
//                 });

//                 $("#remotevideo" + remoteFeed.rfindex).on("loadedmetadata", function() {
//                     var width = this.videoWidth;
//                     var height = this.videoHeight;
//                     $('#curres' + remoteFeed.rfindex).removeClass('hide').text(width + 'x' + height).show();
//                 });
//             }

//             var videoElement = $(videoElementId).get(0);
//             if (videoElement) {
//                 Janus.attachMediaStream(videoElement, stream);
//                 var videoTracks = stream.getVideoTracks();
//                 if (!videoTracks || videoTracks.length === 0) {
//                     $(videoElementId).hide();
//                     if ($('#videoremote' + remoteFeed.rfindex + ' .no-video-container').length === 0) {
//                         $('#videoremote' + remoteFeed.rfindex).append(
//                             '<div class="no-video-container">' +
//                             '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
//                             '<span class="no-video-text">사용 가능한 원격 비디오가 없습니다</span>' +
//                             '</div>');
//                     }
//                 } else {
//                     $('#videoremote' + remoteFeed.rfindex + ' .no-video-container').remove();
//                     $(videoElementId).removeClass('hide').show();
//                 }
//                 if (!addButtons) {
//                     return;
//                 }
//                 if (Janus.webRTCAdapter.browserDetails.browser === "chrome" || Janus.webRTCAdapter.browserDetails.browser === "firefox" ||
//                     Janus.webRTCAdapter.browserDetails.browser === "safari") {
//                     $('#curbitrate' + remoteFeed.rfindex).removeClass('hide').show();
//                     bitrateTimer[remoteFeed.rfindex] = setInterval(function() {
//                         var bitrate = remoteFeed.getBitrate();
//                         $('#curbitrate' + remoteFeed.rfindex).text(bitrate);
//                         var width = videoElement.videoWidth;
//                         var height = videoElement.videoHeight;
//                         if (width > 0 && height > 0) {
//                             $('#curres' + remoteFeed.rfindex).removeClass('hide').text(width + 'x' + height).show();
//                         } else {
//                             console.error("비디오 요소의 너비와 높이를 가져올 수 없습니다.");
//                         }
//                     }, 1000);
//                 }
//             } else {
//                 console.error("videoElement가 정의되지 않았습니다.");
//             }
//         },
//         oncleanup: function() {
//             Janus.log(" ::: 원격 피드 " + id + "에 대한 정리 알림을 받았습니다 :::");
//             if (remoteFeed.spinner) {
//                 remoteFeed.spinner.stop();
//             }
//             remoteFeed.spinner = null;
//             $('#remotevideo' + remoteFeed.rfindex).remove();
//             $('#waitingvideo' + remoteFeed.rfindex).remove();
//             $('#novideo' + remoteFeed.rfindex).remove();
//             $('#curbitrate' + remoteFeed.rfindex).remove();
//             $('#curres' + remoteFeed.rfindex).remove();
//             if (bitrateTimer[remoteFeed.rfindex]) {
//                 clearInterval(bitrateTimer[remoteFeed.rfindex]);
//             }
//             bitrateTimer[remoteFeed.rfindex] = null;
//             remoteFeed.simulcastStarted = false;
//             $('#simulcast' + remoteFeed.rfindex).remove();

//             feeds[remoteFeed.rfindex] = null;
//         }
//     });
// }









// Helper to parse query string
function getQueryStringValue(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Helpers to create Simulcast-related UI, if enabled
function addSimulcastButtons(feed, temporal) {
	var index = feed;
	$('#remote'+index).parent().append(
		'<div id="simulcast'+index+'" class="btn-group-vertical btn-group-vertical-xs pull-right">' +
		'	<div class"row">' +
		'		<div class="btn-group btn-group-xs" style="width: 100%">' +
		'			<button id="sl'+index+'-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to higher quality" style="width: 33%">SL 2</button>' +
		'			<button id="sl'+index+'-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to normal quality" style="width: 33%">SL 1</button>' +
		'			<button id="sl'+index+'-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to lower quality" style="width: 34%">SL 0</button>' +
		'		</div>' +
		'	</div>' +
		'	<div class"row">' +
		'		<div class="btn-group btn-group-xs hide" style="width: 100%">' +
		'			<button id="tl'+index+'-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 2" style="width: 34%">TL 2</button>' +
		'			<button id="tl'+index+'-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 1" style="width: 33%">TL 1</button>' +
		'			<button id="tl'+index+'-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 0" style="width: 33%">TL 0</button>' +
		'		</div>' +
		'	</div>' +
		'</div>'
	);
	// Enable the simulcast selection buttons
	$('#sl' + index + '-0').removeClass('btn-primary btn-success').addClass('btn-primary')
		.unbind('click').click(function() {
			toastr.info("Switching simulcast substream, wait for it... (lower quality)", null, {timeOut: 2000});
			if(!$('#sl' + index + '-2').hasClass('btn-success'))
				$('#sl' + index + '-2').removeClass('btn-primary btn-info').addClass('btn-primary');
			if(!$('#sl' + index + '-1').hasClass('btn-success'))
				$('#sl' + index + '-1').removeClass('btn-primary btn-info').addClass('btn-primary');
			$('#sl' + index + '-0').removeClass('btn-primary btn-info btn-success').addClass('btn-info');
			feeds[index].send({ message: { request: "configure", substream: 0 }});
		});
	$('#sl' + index + '-1').removeClass('btn-primary btn-success').addClass('btn-primary')
		.unbind('click').click(function() {
			toastr.info("Switching simulcast substream, wait for it... (normal quality)", null, {timeOut: 2000});
			if(!$('#sl' + index + '-2').hasClass('btn-success'))
				$('#sl' + index + '-2').removeClass('btn-primary btn-info').addClass('btn-primary');
			$('#sl' + index + '-1').removeClass('btn-primary btn-info btn-success').addClass('btn-info');
			if(!$('#sl' + index + '-0').hasClass('btn-success'))
				$('#sl' + index + '-0').removeClass('btn-primary btn-info').addClass('btn-primary');
			feeds[index].send({ message: { request: "configure", substream: 1 }});
		});
	$('#sl' + index + '-2').removeClass('btn-primary btn-success').addClass('btn-primary')
		.unbind('click').click(function() {
			toastr.info("Switching simulcast substream, wait for it... (higher quality)", null, {timeOut: 2000});
			$('#sl' + index + '-2').removeClass('btn-primary btn-info btn-success').addClass('btn-info');
			if(!$('#sl' + index + '-1').hasClass('btn-success'))
				$('#sl' + index + '-1').removeClass('btn-primary btn-info').addClass('btn-primary');
			if(!$('#sl' + index + '-0').hasClass('btn-success'))
				$('#sl' + index + '-0').removeClass('btn-primary btn-info').addClass('btn-primary');
			feeds[index].send({ message: { request: "configure", substream: 2 }});
		});
	if(!temporal)	// No temporal layer support
		return;
	$('#tl' + index + '-0').parent().removeClass('hide');
	$('#tl' + index + '-0').removeClass('btn-primary btn-success').addClass('btn-primary')
		.unbind('click').click(function() {
			toastr.info("Capping simulcast temporal layer, wait for it... (lowest FPS)", null, {timeOut: 2000});
			if(!$('#tl' + index + '-2').hasClass('btn-success'))
				$('#tl' + index + '-2').removeClass('btn-primary btn-info').addClass('btn-primary');
			if(!$('#tl' + index + '-1').hasClass('btn-success'))
				$('#tl' + index + '-1').removeClass('btn-primary btn-info').addClass('btn-primary');
			$('#tl' + index + '-0').removeClass('btn-primary btn-info btn-success').addClass('btn-info');
			feeds[index].send({ message: { request: "configure", temporal: 0 }});
		});
	$('#tl' + index + '-1').removeClass('btn-primary btn-success').addClass('btn-primary')
		.unbind('click').click(function() {
			toastr.info("Capping simulcast temporal layer, wait for it... (medium FPS)", null, {timeOut: 2000});
			if(!$('#tl' + index + '-2').hasClass('btn-success'))
				$('#tl' + index + '-2').removeClass('btn-primary btn-info').addClass('btn-primary');
			$('#tl' + index + '-1').removeClass('btn-primary btn-info').addClass('btn-info');
			if(!$('#tl' + index + '-0').hasClass('btn-success'))
				$('#tl' + index + '-0').removeClass('btn-primary btn-info').addClass('btn-primary');
			feeds[index].send({ message: { request: "configure", temporal: 1 }});
		});
	$('#tl' + index + '-2').removeClass('btn-primary btn-success').addClass('btn-primary')
		.unbind('click').click(function() {
			toastr.info("Capping simulcast temporal layer, wait for it... (highest FPS)", null, {timeOut: 2000});
			$('#tl' + index + '-2').removeClass('btn-primary btn-info btn-success').addClass('btn-info');
			if(!$('#tl' + index + '-1').hasClass('btn-success'))
				$('#tl' + index + '-1').removeClass('btn-primary btn-info').addClass('btn-primary');
			if(!$('#tl' + index + '-0').hasClass('btn-success'))
				$('#tl' + index + '-0').removeClass('btn-primary btn-info').addClass('btn-primary');
			feeds[index].send({ message: { request: "configure", temporal: 2 }});
		});
}

function updateSimulcastButtons(feed, substream, temporal) {
	// Check the substream
	var index = feed;
	if(substream === 0) {
		toastr.success("Switched simulcast substream! (lower quality)", null, {timeOut: 2000});
		$('#sl' + index + '-2').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#sl' + index + '-1').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#sl' + index + '-0').removeClass('btn-primary btn-info btn-success').addClass('btn-success');
	} else if(substream === 1) {
		toastr.success("Switched simulcast substream! (normal quality)", null, {timeOut: 2000});
		$('#sl' + index + '-2').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#sl' + index + '-1').removeClass('btn-primary btn-info btn-success').addClass('btn-success');
		$('#sl' + index + '-0').removeClass('btn-primary btn-success').addClass('btn-primary');
	} else if(substream === 2) {
		toastr.success("Switched simulcast substream! (higher quality)", null, {timeOut: 2000});
		$('#sl' + index + '-2').removeClass('btn-primary btn-info btn-success').addClass('btn-success');
		$('#sl' + index + '-1').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#sl' + index + '-0').removeClass('btn-primary btn-success').addClass('btn-primary');
	}
	// Check the temporal layer
	if(temporal === 0) {
		toastr.success("Capped simulcast temporal layer! (lowest FPS)", null, {timeOut: 2000});
		$('#tl' + index + '-2').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#tl' + index + '-1').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#tl' + index + '-0').removeClass('btn-primary btn-info btn-success').addClass('btn-success');
	} else if(temporal === 1) {
		toastr.success("Capped simulcast temporal layer! (medium FPS)", null, {timeOut: 2000});
		$('#tl' + index + '-2').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#tl' + index + '-1').removeClass('btn-primary btn-info btn-success').addClass('btn-success');
		$('#tl' + index + '-0').removeClass('btn-primary btn-success').addClass('btn-primary');
	} else if(temporal === 2) {
		toastr.success("Capped simulcast temporal layer! (highest FPS)", null, {timeOut: 2000});
		$('#tl' + index + '-2').removeClass('btn-primary btn-info btn-success').addClass('btn-success');
		$('#tl' + index + '-1').removeClass('btn-primary btn-success').addClass('btn-primary');
		$('#tl' + index + '-0').removeClass('btn-primary btn-success').addClass('btn-primary');
	}
}
// onlocalstream function 수정


// function onlocalstream(stream) {
//     Janus.debug(" ::: Got a local stream :::", stream);
//     mystream = stream;
//     const pc = sfutest.webrtcStuff ? sfutest.webrtcStuff.pc : null;
//     console.log("onlocalstream PeerConnection state:", pc ? pc.iceConnectionState : "No PeerConnection");

//     if (!pc) {
//         console.warn("유효한 PeerConnection이 없습니다.");
//         return;
//     }

//     $('#videojoin').hide();
//     $('#videos').removeClass('hide').show();
//     if ($('#myvideo').length === 0) {
//         $('#videolocal').append('<video class="rounded centered" id="myvideo" width="100%" height="100%" autoplay playsinline muted="muted"/>');
//         $('#videolocal').append('<button class="btn btn-warning btn-xs" id="mute" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;">Mute</button>');
//         $('#mute').click(toggleMute);
//         $('#videolocal').append('<button class="btn btn-warning btn-xs" id="unpublish" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;">Unpublish</button>');
//         $('#unpublish').click(unpublishOwnFeed);
//         $('#videolocal').append('<button class="btn btn-warning btn-xs" id="toggleCam" style="position: absolute; bottom: 0px; left: 100px; margin: 15px;">Toggle Camera</button>');
//         $('#toggleCam').click(toggleCam);
//     }
//     $('#publisher').removeClass('hide').html(myusername).show();
//     Janus.attachMediaStream($('#myvideo').get(0), stream);
//     $("#myvideo").get(0).muted = "muted";
//     if (sfutest.webrtcStuff.pc.iceConnectionState !== "completed" &&
//         sfutest.webrtcStuff.pc.iceConnectionState !== "connected") {
//         $("#videolocal").parent().parent().block({
//             message: '<b>Publishing...</b>',
//             css: {
//                 border: 'none',
//                 backgroundColor: 'transparent',
//                 color: 'white'
//             }
//         });
//     }
//     var videoTracks = stream.getVideoTracks();
//     if (!videoTracks || videoTracks.length === 0) {
//         $('#myvideo').hide();
//         if ($('#videolocal .no-video-container').length === 0) {
//             $('#videolocal').append(
//                 '<div class="no-video-container">' +
//                 '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
//                 '<span class="no-video-text">No webcam available</span>' +
//                 '</div>');
//         }
//     } else {
//         $('#videolocal .no-video-container').remove();
//         $('#myvideo').removeClass('hide').show();
//     }

//     // ICE 연결 상태 변경에 대한 로깅 추가
//     sfutest.webrtcStuff.pc.oniceconnectionstatechange = function(event) {
//         Janus.log("ICE connection state changed to " + sfutest.webrtcStuff.pc.iceConnectionState);
//         if (sfutest.webrtcStuff.pc.iceConnectionState === "connected" || sfutest.webrtcStuff.pc.iceConnectionState === "completed") {
//             Janus.log("ICE connection established");
//             $("#videolocal").parent().parent().unblock();
//         } else if (sfutest.webrtcStuff.pc.iceConnectionState === "failed" || sfutest.webrtcStuff.pc.iceConnectionState === "disconnected") {
//             Janus.warn("ICE connection failed or disconnected. Please check your network connection.");
//             $("#videolocal").parent().parent().unblock();
//         }
//     };

//     // 로컬 스트림의 각 트랙 상태를 로깅
//     stream.getTracks().forEach(track => {
//         Janus.log(`Track kind: ${track.kind}, enabled: ${track.enabled}, muted: ${track.muted}`);
//         track.onended = () => {
//             Janus.log(`Track of kind ${track.kind} ended.`);
//         };
//     });
    
// }


function onlocalstream(stream) {
    console.log("Local stream received:", stream);
    console.log("isHost value:", window.isHost); // 디버깅용

    const localVideoElement = document.getElementById('videolocal');
    const remoteVideoElement = document.getElementById('videoremote0');
    const myVideoElement = window.isHost ? localVideoElement : remoteVideoElement;

    if (myVideoElement) {
        if ('srcObject' in myVideoElement) {
            myVideoElement.srcObject = stream;
        } else {
            myVideoElement.src = window.URL.createObjectURL(stream);
        }
        myVideoElement.muted = true;
        myVideoElement.volume = 0;
        myVideoElement.play().catch(error => {
            console.error("Error playing the video:", error);
        });
    } else {
        console.error("myVideoElement not found.");
    }

    mystream = stream;

    // 트랙 종료 시 재초기화 로직 추가
    stream.getTracks().forEach(track => {
        track.onended = function() {
            console.warn("Track ended:", track);
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                .then(newStream => {
                    onlocalstream(newStream);
                })
                .catch(err => {
                    console.error("Failed to get new user media", err);
                });
        };
    });
}





function onremotestream(stream) {
    Janus.debug(" ::: Got a remote stream :::", stream);

    // Find an available video element for the remote stream
    let availableIndex = -1;
    for (let i = 1; i <= numParticipants - 2; i++) {
        const videoElement = document.getElementById(`remotevideo${i}`);
        if (videoElement && !videoElement.srcObject) {
            availableIndex = i;
            break;
        }
    }

    if (availableIndex === -1) {
        console.error('No available video element for remote stream.');
        return;
    }

    const videoElement = document.getElementById(`remotevideo${availableIndex}`);
    if (!videoElement) {
        console.error('Remote video element not found.');
        return;
    }

    if ('srcObject' in videoElement) {
        videoElement.srcObject = stream;
    } else {
        videoElement.src = window.URL.createObjectURL(stream);
    }

    videoElement.addEventListener('loadedmetadata', function() {
        if (this.videoWidth && this.videoHeight) {
            var videoWidth = this.videoWidth;
            var videoHeight = this.videoHeight;
            const curResElement = document.getElementById(`curres${availableIndex}`);
            if (curResElement) {
                curResElement.classList.remove('hide');
                curResElement.textContent = `${videoWidth}x${videoHeight}`;
            } else {
                console.error(`Element with id curres${availableIndex} not found.`);
            }
        } else {
            console.error('Video dimensions are not available.');
        }
    });

    videoElement.play().then(() => {
        console.log("Remote video playing");
    }).catch((error) => {
        console.error("Error playing remote video:", error);
    });
}



// ICE 상태 변경에 대한 로깅 추가
function onICEStateChange(event) {
    const pc = event.target;
    console.log(`ICE state changed to ${pc.iceConnectionState}`);
    if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        console.log("ICE connection established");
    } else if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
        console.warn("ICE connection failed or disconnected. Please check your network connection.");
    }
}

function onCleanup() {
    Janus.log(" ::: 클린업 알림 수신: 이제 비공개 상태입니다 :::");
    mystream = null;
    const localVideoElement = document.getElementById('myvideo');
    if (localVideoElement) {
        localVideoElement.srcObject = null;
    }
    $("#videolocal").html('<button id="publish" class="btn btn-primary">퍼블리시</button>');
    $("#publish").click(function () {
        publishOwnFeed(true);
    });
    $("#videolocal").parent().parent().unblock();
    $("#bitrate").parent().parent().addClass("hide");
    $("#bitrate a").unbind("click");

    // Remove remote video element safely
    const remoteVideoElement = document.getElementById('remotevideo');
    if (remoteVideoElement) {
        remoteVideoElement.srcObject = null;
        $('#remotevideo').remove();
    }
}

function initjanus(callback) {
    if (!Janus.isWebrtcSupported()) {
        bootbox.alert("WebRTC를 지원하지 않습니다...");
        return;
    }
    console.log("Janus 초기화 시작");
    janus = new Janus({
        server: server,
        success: function () {
            console.log("Janus 세션 생성 성공");
            attachPlugin(callback);
        },
        error: function (error) {
            Janus.error(error);
            bootbox.alert("Janus 서버 연결 오류: " + error, function () {
                window.location.reload();
            });
        },
        destroyed: function () {
            window.location.reload();
        },
    });
}

function attachPlugin(callback, attempt = 1) {
    janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: opaqueId,
        success: function (pluginHandle) {
            console.log("VideoRoom 플러그인에 연결 성공");
            window.sfutest = pluginHandle;
            Janus.log("플러그인 연결됨! (" + window.sfutest.getPlugin() + ", id=" + window.sfutest.getId() + ")");
            Janus.log("  -- 퍼블리셔/매니저입니다.");
            if (callback) callback();
        },
        error: function (error) {
            Janus.error("  -- 플러그인 연결 오류...", error);
            if (attempt < 3) {
                console.log(`플러그인 연결 재시도 중... (시도 횟수: ${attempt})`);
                setTimeout(() => attachPlugin(callback, attempt + 1), 2000); // 2초 후 재시도
            } else {
                bootbox.alert("플러그인 연결 오류... " + error);
            }
        },
        consentDialog: function (on) {
            Janus.debug("권한 요청 다이얼로그가 " + (on ? "켜졌습니다" : "꺼졌습니다") + " 이제");
            if (on) {
                $.blockUI({
                    message: '<div><img src="up_arrow.png"/></div>',
                    css: {
                        border: "none",
                        padding: "15px",
                        backgroundColor: "transparent",
                        color: "#aaa",
                        top: "10px",
                        left: navigator.mozGetUserMedia ? "-100px" : "300px",
                    },
                });
            } else {
                $.unblockUI();
            }
        },
        iceState: function (state) {
            Janus.log("ICE 상태가 " + state + "로 변경되었습니다.");
            if (state === "connected") {
                console.log("ICE 연결이 성공적으로 완료되었습니다.");
            } else if (state === "failed") {
                console.error("ICE 연결이 실패했습니다.");
            }
        },
        mediaState: function (medium, on) {
            Janus.log("Janus가 우리의 " + medium + " 수신을 " + (on ? "시작" : "중지") + "했습니다.");
        },
        webrtcState: function (on) {
            Janus.log("Janus가 우리의 WebRTC PeerConnection이 " + (on ? "활성화" : "비활성화") + "되었습니다.");
            $("#videolocal").parent().parent().unblock();
            if (!on) return;
            $("#publish").remove();
            $("#bitrate").parent().parent().removeClass("hide").show();
            $("#bitrate a").click(function () {
                var id = $(this).attr("id");
                var bitrate = parseInt(id) * 1000;
                if (bitrate === 0) {
                    Janus.log("REMB를 통해 대역폭을 제한하지 않습니다.");
                } else {
                    Janus.log("REMB를 통해 대역폭을 " + bitrate + "으로 제한합니다.");
                }
                $("#bitrateset")
                    .html($(this).html() + '<span class="caret"></span>')
                    .parent()
                    .removeClass("open");
                window.sfutest.send({ message: { request: "configure", bitrate: bitrate } });
                return false;
            });
        },
        onmessage: function (msg, jsep) {
            Janus.debug(" ::: 메시지 수신 (퍼블리셔) :::", msg);
            var event = msg["videoroom"];
            Janus.debug("이벤트: " + event);
            if (event) {
                if (event === "joined") {
                    myid = msg["id"];
                    mypvtid = msg["private_id"];
                    Janus.log("방 " + msg["room"] + "에 ID " + myid + "로 성공적으로 참여했습니다.");
                    if (!subscriber_mode) {
                        publishOwnFeed(true);
                    }
                    if (msg["publishers"]) {
                        var list = msg["publishers"];
                        Janus.debug("사용 가능한 퍼블리셔/피드 목록을 받았습니다:", list);
                        for (var f in list) {
                            var id = list[f]["id"];
                            var display = list[f]["display"];
                            var audio = list[f]["audio_codec"];
                            var video = list[f]["video_codec"];
                            Janus.debug("  >> [" + id + "] " + display + " (오디오: " + audio + ", 비디오: " + video + ")");
                            newRemoteFeed(id, display, audio, video);
                        }
                    }
                } else if (event === "destroyed") {
                    Janus.warn("방이 파괴되었습니다!");
                    if (typeof window.onJanusMessage === "function") {
                        window.onJanusMessage({ text: "호스트가 방송을 종료했습니다.", videoroom: 'destroyed' });
                    }
                    bootbox.alert("방이 파괴되었습니다.", function () {
                        window.location.reload();
                    });
                } else if (event === "event") {
                    if (msg["publishers"]) {
                        var list = msg["publishers"];
                        Janus.debug("사용 가능한 퍼블리셔/피드 목록을 받았습니다:", list);
                        for (var f in list) {
                            var id = list[f]["id"];
                            var display = list[f]["display"];
                            var audio = list[f]["audio_codec"];
                            var video = list[f]["video_codec"];
                            Janus.debug("  >> [" + id + "] " + display + " (오디오: " + audio + ", 비디오: " + video + ")");
                            newRemoteFeed(id, display, audio, video);
                        }
                    } else if (msg["leaving"]) {
                        var leaving = msg["leaving"];
                        Janus.log("퍼블리셔가 떠났습니다: " + leaving);
                        var remoteFeed = null;
                        for (var i = 1; i <= 6; i++) {
                            if (feeds[i] && feeds[i].rfid == leaving) {
                                remoteFeed = feeds[i];
                                break;
                            }
                        }
                        if (remoteFeed != null) {
                            Janus.debug("피드 " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ")가 방을 떠났습니다, 분리합니다.");
                            $("#remote" + remoteFeed.rfindex).empty().hide();
                            $("#videoremote" + remoteFeed.rfindex).empty();
                            feeds[remoteFeed.rfindex] = null;
                            remoteFeed.detach();
                        }
                    } else if (msg["unpublished"]) {
                        var unpublished = msg["unpublished"];
                        Janus.log("퍼블리셔가 비공개로 전환되었습니다: " + unpublished);
                        if (unpublished === "ok") {
                            window.sfutest.hangup();
                            return;
                        }
                        var remoteFeed = null;
                        for (var i = 1; i <= 6; i++) {
                            if (feeds[i] && feeds[i].rfid == unpublished) {
                                remoteFeed = feeds[i];
                                break;
                            }
                        }
                        if (remoteFeed != null) {
                            Janus.debug("피드 " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ")가 방을 떠났습니다, 분리합니다.");
                            $("#remote" + remoteFeed.rfindex).empty().hide();
                            $("#videoremote" + remoteFeed.rfindex).empty();
                            feeds[remoteFeed.rfindex] = null;
                            remoteFeed.detach();
                        }
                    } else if (msg["error"]) {
                        bootbox.alert(msg["error"]);
                    }
                }
            }
            if (jsep) {
                Janus.debug("SDP 처리 중...", jsep);
                window.sfutest.handleRemoteJsep({ jsep: jsep });
            }
        },
        onlocalstream: onlocalstream,
        onremotestream: onremotestream,
        oncleanup: function() {
            Janus.log(" ::: 플러그인 핸들링 클린업 :::");
        }
    });
}



// 전역 객체에 추가
window.initjanus = initjanus;
window.registerUsername = registerUsername;
window.toggleMute = toggleMute;
window.toggleCam = toggleCam;
window.createRoomAndJoinAsHost = createRoomAndJoinAsHost;
window.joinRoomAsParticipant = joinRoomAsParticipant;
window.closeRoom = closeRoom;
window.onlocalstream = onlocalstream;
window.isHost = isHost;