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
var subscribedPublishers = [];

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
                                onmessage: onMessageReceived,

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



function initjanus(callback) {
     // sessionStorage에서 loggedInUser 값을 가져와 myusername 설정
     var loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
     myusername = loggedInUser ? loggedInUser.username : "anonymous";

    if (!Janus.isWebrtcSupported()) {
        bootbox.alert("WebRTC를 지원하지 않습니다...");
        return;
    }
    console.log("Janus 초기화 시작");
    if (!janus) {
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
    } else {
        attachPlugin(callback);
    }
}

function attachPlugin(callback, attempt = 1) {
    janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: opaqueId,
        success: function (pluginHandle) {
            sfutest = pluginHandle; // 전역 변수에 할당
            Janus.log("플러그인 연결됨! (" + sfutest.getPlugin() + ", id=" + sfutest.getId() + ")");
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
                sfutest.send({ message: { request: "configure", bitrate: bitrate } });
                return false;
            });
        },
        onmessage: onMessageReceived,
        onlocalstream: onlocalstream,
        onremotestream: onremotestream,
        oncleanup: function() {
            Janus.log(" ::: 플러그인 핸들링 클린업 :::");
        }
    });
}

function checkEnter(field, event) {
   var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
   if(theCode == 13) {
      registerUsername();
      return false;
   } else {
      return true;
   }
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

    console.log("방 생성 파라미터:", createRoom); // 디버그 로그

    sfutest.send({
        message: createRoom,
        success: function(result) {
            console.log("방 생성 결과:", result); // 방 생성 결과 로그 추가
            var event = result["videoroom"];
            Janus.debug("이벤트: " + event);
            if(event != undefined && event != null) {
                // 방 생성 성공
                console.log("방 생성 성공: " + result);
                var room = result["room"];
                console.log("생성된 방 번호: " + room);

                var register = { "request": "join", "room": room, "ptype": "publisher", "display": username };
                myusername = username;
                myroom = room; // 생성된 방 번호 저장
                console.log("방 참여 시도, 등록 메시지:", register); // 디버깅 로그 추가
                sfutest.send({
                    message: register,
                    success: function(joinResult) {
                        console.log("Successfully joined room as host:", joinResult); // 방 조인 결과 로그 추가
                        myid = joinResult["id"];
                        mypvtid = joinResult["private_id"];
                        window.localStorage.setItem('isHost', 'true');
                        publishOwnFeed(true);
                        if(callback) callback(true, room);
                    },
                    error: function(joinError) {
                        console.error("Error joining room as host:", joinError);
                        if(callback) callback(false);
                    }
                });

                window.localStorage.setItem('window.isHost', 'true');
                window.localStorage.setItem('hostUsername', username);

                setTimeout(() => {
                    closeRoom(room);
                }, 43200000); // 12시간 후 방 닫기

                if(callback) callback(true, room);
            } else {
                console.error("방 생성 실패, 이벤트가 없음:", result); // 에러 로그 추가
                if(callback) callback(false);
            }
        },
        error: function(error) {
            console.error("방 생성 중 오류 발생:", error);
            if(callback) callback(false);
        }
    });
}


function checkPublisherList() {
    var request = { request: "listparticipants", room: myroom };
    sfutest.send({
        message: request,
        success: function(result) {
            try {
                console.log("퍼블리셔 목록 응답: ", result);
                if (result && result.participants) {
                    var publishers = result.participants.length;
                    for (var f in publishers) {
                        var id = publishers[f]["id"];
                        var display = publishers[f]["display"];
                        var audio = publishers[f]["audio_codec"];
                        var video = publishers[f]["video_codec"];
                        if (id === myid) {
                            console.log("퍼블리셔 실행됨: [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                            window.ewRemoteFeed(id, display, audio, video);
                        } else {
                            
                        }
                    }
                } else {
                    console.error("퍼블리셔 목록 응답에 참가자 정보가 없습니다: ", result);
                }
            } catch (e) {
            console.error("퍼블리셔 목록 확인 중 오류 발생: ", error);
            }
        },
        error: function(error) {
            console.error("퍼블리셔 목록 확인 중 오류 발생: ", error);
        }
    });
}


function publishOwnFeed(useAudio) {
    if (!sfutest) {
        console.warn("sfutest 객체가 없습니다. publishOwnFeed를 호출할 수 없습니다.");
        return;
    }

    console.log("publishOwnFeed 함수 호출됨, useAudio:", useAudio);
    console.log("sfutest 객체:", sfutest);

    $('#publish').attr('disabled', true).unbind('click');

    const mediaOptions = {
        audioRecv: false,
        videoRecv: false,
        audioSend: useAudio,
        videoSend: true
    };

    console.log("media 옵션:", mediaOptions);

    sfutest.createOffer({
        media: mediaOptions,
        success: function(jsep) {
            console.log("퍼블리셔 SDP 획득!", jsep);
            var publish = { request: "configure", audio: useAudio, video: true };
            console.log("퍼블리시 메시지: ", publish);

            sfutest.send({
                message: publish,
                jsep: jsep,
                success: function(result) {
                    console.log("퍼블리셔 설정 성공 응답:", result);  // 추가된 로그
                    if (result && result.videoroom === 'event' && result.configured === 'ok') {
                        console.log("퍼블리셔가 성공적으로 등록되었습니다.");
                        setTimeout(checkPublisherList, 2000); // 퍼블리셔 목록 확인
                    } else {
                        console.error("퍼블리셔 설정 실패:", result);
                    }
                },
                error: function(error) {
                    console.error("퍼블리셔 설정 중 오류 발생:", error);
                    if (error.responseText) {
                        console.log("퍼블리셔 설정 중 오류 발생 - 응답:", error.responseText);
                    }
                }
            });
        },
        error: function(error) {
            Janus.error("WebRTC 오류:", error);
            console.log("WebRTC 오류 객체:", error);
            if (error.name === "NotAllowedError") {
                alert("카메라와 마이크에 접근할 수 없습니다. 브라우저 설정을 확인하세요.");
            } else {
                bootbox.alert("WebRTC 오류... " + error.message);
            }
            $('#publish').removeAttr('disabled').click(function() { publishOwnFeed(useAudio); });
        },
        iceState: function(state) {
            console.log("ICE 상태:", state);
        }
    });
}

var sfutest = null;
var opaqueId = "videoroomtest-" + Janus.randomString(12);

// 이 함수는 onmessage 이벤트를 처리합니다
function onMessageReceived(msg, jsep) {
    console.log("onmessage 함수 호출됨");
    console.log("수신된 메시지: ", JSON.stringify(msg, null, 2)); // 전체 메시지 로그
    try {
        var event = msg["videoroom"];
        console.log("수신된 이벤트: ", event); // 이벤트 로그 추가
        if (event) {
            if (event === "joined") {
                console.log("Join 이벤트 수신: ", msg);
                myid = msg["id"];
                mypvtid = msg["private_id"];
                Janus.log("방 " + msg["room"] + "에 ID " + myid + "로 성공적으로 참가함");

                if (subscriber_mode) {
                    $('#videojoin').hide();
                    $('#videos').removeClass('hide').show();
                } else {
                    publishOwnFeed(true);
                }

                if (msg["publishers"] && msg["publishers"].length > 0) {
                    var list = msg["publishers"];
                    console.log("메시지확이니", msg["publishers"])
                    Janus.debug("Got a list of available publishers/feeds:", list);
                    for (var f in list) {
                        var id = list[f]["id"];
                        var display = list[f]["display"];
                        var audio = list[f]["audio_codec"];
                        var video = list[f]["video_codec"];
                        Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                        if(id === myid){
                        window.newRemoteFeed(id, display, audio, video);
                        }
                    }
                } else {
                    // 퍼블리셔 목록이 없으면 체크 리스트 호출
                    console.log("퍼블리셔 목록이 없습니다.");
                    setTimeout(checkPublisherList, 2000); // 2초 후 퍼블리셔 목록 확인
                }
            } else if (event === "event") {
                console.log("이벤트 이벤트 수신: ", msg);
                if (msg["publishers"]) {
                    var list = msg["publishers"];
                    Janus.debug("Got a list of available publishers/feeds:", list);
                    for (var f in list) {
                        var id = list[f]["id"];
                        var display = list[f]["display"];
                        var audio = list[f]["audio_codec"];
                        var video = list[f]["video_codec"];
                        Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                        if(id === myid){
                        window.newRemoteFeed(id, display, audio, video);
                        }
                    }
                }else if (msg["error_code"] === 424) {
                    console.error("Invalid request on unconfigured participant: ", msg["error"]);
                    // 재구성 요청
                    configureParticipant();
                } else {
                    console.log("퍼블리셔 목록이 없습니다.");
                }
            } else if (event === "destroyed") {
                if (typeof window.onJanusMessage === "function") {
                    window.onJanusMessage({ text: "호스트가 방송을 종료했습니다.", videoroom: 'destroyed' });
                }
                bootbox.alert("방이 파괴되었습니다.", function () {
                    window.location.reload();
                });
            } else if (event === "leaving") {
                var leaving = msg["leaving"];
                Janus.log("퍼블리셔 떠남: " + leaving);
                var remoteFeed = null;
                for (var i = 0; i < feeds.length; i++) {
                    if (feeds[i] && feeds[i].rfid == leaving) {
                        remoteFeed = feeds[i];
                        break;
                    }
                }
                if (remoteFeed != null) {
                    Janus.debug("피드 " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ")가 방을 떠남, 분리 중");
                    $('#remote' + remoteFeed.rfindex).empty().hide();
                    $('#videoremote' + remoteFeed.rfindex).empty();
                    feeds[remoteFeed.rfindex] = null;
                    remoteFeed.detach();                }
            } else if (event === "unpublished") {
                var unpublished = msg["unpublished"];
                Janus.log("퍼블리셔 언퍼블리시됨: " + unpublished);
                if (unpublished === 'ok') {
                    sfutest.hangup();
                    return;
                }
                var remoteFeed = null;
                for (var i = 0; i < feeds.length; i++) {
                    if (feeds[i] && feeds[i].rfid == unpublished) {
                        remoteFeed = feeds[i];
                        break;
                    }
                }
                if (remoteFeed != null) {
                    Janus.debug("피드 " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ")가 방을 떠남, 분리 중");
                    $('#remote' + remoteFeed.rfindex).empty().hide();
                    $('#videoremote' + remoteFeed.rfindex).empty();
                    feeds[remoteFeed.rfindex] = null;
                    remoteFeed.detach();
                }
            } else if (event === "error") {
                bootbox.alert(msg["error"]);
            }
        }
        if (jsep) {
            Janus.debug("SDP 처리 중...", jsep);
            sfutest.handleRemoteJsep({ jsep: jsep });
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
    } catch (error) {
        Janus.error("메시지 처리 중 오류 발생:", error);
    }
}

function configureParticipant() {
    var configure = {
        request: "configure",
        audio: true,
        video: true
    };
    sfutest.send({
        message: configure,
        success: function(result) {
            console.log("참가자 재구성 성공:", result);
        },
        error: function(error) {
            console.error("참가자 재구성 중 오류 발생:", error);
        }
    });
}

function joinRoomAsParticipant(username, roomNumber, callback) {
    var register = { "request": "join", "room": roomNumber, "ptype": "publisher", "display": username };
    myusername = username;
    myroom = roomNumber; // 참여하는 방 번호 저장
    sfutest.send({
        message: register,
        success: function (result) {
            console.log("Joined room as participant:", result); // Debug log
            janusConfigured = true; // 방 조인 완료
            window.localStorage.setItem('isHost', 'false');

            // 방에 참가한 후 퍼블리셔 목록을 요청
            checkPublisherList();
            
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

    sfutest.send({
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

    sfutest.send({
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


// [jsflux] 방나가기
function unpublishOwnFeed() {
   // Unpublish our stream
   $('#unpublish').attr('disabled', true).unbind('click');
   var unpublish = { request: "unpublish" };
   sfutest.send({ message: unpublish });
}


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
      '   <div class"row">' +
      '      <div class="btn-group btn-group-xs" style="width: 100%">' +
      '         <button id="sl'+index+'-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to higher quality" style="width: 33%">SL 2</button>' +
      '         <button id="sl'+index+'-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to normal quality" style="width: 33%">SL 1</button>' +
      '         <button id="sl'+index+'-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to lower quality" style="width: 34%">SL 0</button>' +
      '      </div>' +
      '   </div>' +
      '   <div class"row">' +
      '      <div class="btn-group btn-group-xs hide" style="width: 100%">' +
      '         <button id="tl'+index+'-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 2" style="width: 34%">TL 2</button>' +
      '         <button id="tl'+index+'-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 1" style="width: 33%">TL 1</button>' +
      '         <button id="tl'+index+'-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 0" style="width: 33%">TL 0</button>' +
      '      </div>' +
      '   </div>' +
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
   if(!temporal)   // No temporal layer support
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


function onlocalstream(stream) {
    console.log("Local stream received:", stream);
    const isHost = localStorage.getItem('isHost') === 'true'; // localStorage에서 isHost 값을 가져옴
    console.log("isHost value:", isHost); // 디버깅용

    let myVideoElement;

    if (isHost) {
        myVideoElement = document.getElementById('videolocal');
    } else {
        // myVideoElement = document.getElementById('videoremote0');
    }

    if (myVideoElement) {
        if ('srcObject' in myVideoElement) {
            if (myVideoElement.srcObject !== stream) {
                myVideoElement.srcObject = stream;
            } else {
                console.warn("Element already has the stream.");
            }
        } else {
            if (myVideoElement.src !== window.URL.createObjectURL(stream)) {
                myVideoElement.src = window.URL.createObjectURL(stream);
            } else {
                console.warn("Element already has the stream.");
            }
        }
        myVideoElement.muted = true;
        myVideoElement.volume = 0;
        myVideoElement.play().catch(error => {
            console.error("비디오 재생 오류:", error);
        });
    } else {
        console.error("myVideoElement를 찾을 수 없습니다.");
    }

    mystream = stream;

    if (sfutest && sfutest.webrtcStuff && sfutest.webrtcStuff.pc) {
        const iceState = sfutest.webrtcStuff.pc.iceConnectionState;
        console.log("Current ICE state:", iceState);
        if (iceState !== "completed" && iceState !== "connected") {
            $("#videolocal").parent().parent().block({
                message: '<b>Publishing...</b>',
                css: {
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'white'
                }
            });
        }
    } else {
        console.warn("sfutest or webrtcStuff or pc is not defined.");
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

    // 트랙 종료 시 재초기화 로직 추가
    stream.getTracks().forEach(track => {
        track.onended = function() {
            console.warn("Track ended:", track);
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                .then(newStream => {
                    onlocalstream(newStream);
                })
                .catch(err => {
                    console.error("권한 요청 중 오류 발생:", err);
                    alert("카메라와 마이크에 대한 접근 권한을 허용해 주세요.");
                });
        };
    });
}



function onremotestream(stream) {
    Janus.debug(" ::: 원격 스트림 수신 :::", stream);


    // 원격 스트림을 위한 사용 가능한 비디오 요소 찾기
    let availableIndex = -1;
    for (let i = 1; i <= numParticipants - 2; i++) {
        const videoElement = document.getElementById(`videoremote${i}`);
        if (videoElement && !videoElement.srcObject) {
            availableIndex = i;
            break;
        }
    }

    if (availableIndex === -1) {
        console.error('원격 스트림을 위한 사용 가능한 비디오 요소가 없습니다.');
        return;
    }

    const videoElement = document.getElementById(`videoremote${availableIndex}`);
    if (!videoElement) {
        console.error('원격 비디오 요소를 찾을 수 없습니다.');
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
                console.error(`curres${availableIndex} 요소를 찾을 수 없습니다.`);
            }
        } else {
            console.error('비디오 크기를 가져올 수 없습니다.');
        }
    });

    videoElement.play().then(() => {
        console.log("원격 비디오 재생 중");
    }).catch((error) => {
        console.error("원격 비디오 재생 오류:", error);
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
    const remoteVideoElement = document.getElementById('videoremote');
    if (remoteVideoElement) {
        remoteVideoElement.srcObject = null;
        $('#videoremote').remove();
    }
}




// 전역 객체에 추가
window.initjanus = initjanus;
window.createRoomAndJoinAsHost = createRoomAndJoinAsHost;
window.joinRoomAsParticipant = joinRoomAsParticipant;
window.closeRoom = closeRoom;
window.onlocalstream = onlocalstream;
