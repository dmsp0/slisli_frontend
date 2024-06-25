/* global mystream,unpublishOwnFeed, myusername,sfutest, stream, toastr,opaqueId, localVideoElement,remoteVideoElement, remoteVideoRefs,subscriber_mode, publishOwnFeed, myid, mypvtid,server, janus,Janus,newRemoteFeed,myroom,registerUsername, sfutest, bootbox, feeds,  notifyParticipantsOfRoomClosure */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import BrowserNotSupportedIcon from "@mui/icons-material/BrowserNotSupported";
import $ from "jquery";
import 'block-ui';
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { renderToString } from "react-dom/server";
import Chat from "../chat/Chat";
// import placeholderImage from "../../img/profile.png"; // 이미지 파일을 import

function toggleMute() {
  var muted = sfutest.isAudioMuted();
  Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
  if (muted) sfutest.unmuteAudio();
  else sfutest.muteAudio();
  muted = sfutest.isAudioMuted();

  const micIconHtml = renderToString(muted ? <MicOffIcon className="mr-1" /> : <MicIcon className="mr-1" />);
  const buttonText = muted ? "마이크켜기" : "마이크끄기";

  $("#mute").html(micIconHtml + buttonText);
  $("#mute").toggleClass("bg-blue-500 bg-red-500");
}

function toggleVideo() {
  var videoEnabled = !sfutest.isVideoMuted();
  Janus.log((videoEnabled ? "Disabling" : "Enabling") + " local video...");
  if (videoEnabled) {
    sfutest.muteVideo();
    $("#myvideo").hide();
    $("#placeholder").show();
    $("#unpublish").hide();
    $("#publish").show();
  } else {
    sfutest.unmuteVideo();
    $("#myvideo").show();
    $("#placeholder").hide();
    $("#unpublish").show();
    $("#publish").hide();
  }
}

function VideoRoom() {
  const location = useLocation();
  const { username: user_id, roomNum, roomTitle, numParticipants } = location.state;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState(user_id);
  const [userId, setUserId] = useState(user_id);
  const [roomName, setRoomName] = useState(roomNum);
  const [roomDescription, setRoomDescription] = useState(roomTitle);
  const [boothId, setBoothId] = useState('');

  const [participants, setParticipants] = useState([]);

  const [isConnected, setIsConnected] = useState(false);
  const [isRoomCreated, setIsRoomCreated] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const initjanus = () => {
    if (!Janus.isWebrtcSupported()) {
      bootbox.alert("No WebRTC support... ");
      return;
    }
    janus = new Janus({
      server: server,
      success: function () {
        janus.attach({
          plugin: "janus.plugin.videoroom",
          opaqueId: opaqueId,
          success: function (pluginHandle) {
            sfutest = pluginHandle;
            $("#details").remove();
            $("#videojoin").removeClass("hide").show();
            $("#registernow").removeClass("hide").show();
            $("#register").click(registerUsername);
            $("#roomname").focus();
            $("#start")
              .removeAttr("disabled")
              .html("Stop")
              .click(function () {
                $(this).attr("disabled", true);
                janus.destroy();
              });
          },
          error: function (error) {
            Janus.error("  -- Error attaching plugin...", error);
            bootbox.alert("Error attaching plugin... " + error);
          },
          consentDialog: function (on) {
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
            Janus.log("ICE state changed to " + state);
          },
          mediaState: function (medium, on) {
            Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
          },
          webrtcState: function (on) {
            Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
            $("#videolocal").parent().parent().unblock();
            if (!on) return;
            $("#publish").remove();
            $("#bitrate").parent().parent().removeClass("hide").show();
            $("#bitrate a").click(function () {
              var id = $(this).attr("id");
              var bitrate = parseInt(id) * 1000;
              if (bitrate === 0) {
                Janus.log("Not limiting bandwidth via REMB");
              } else {
                Janus.log("Capping bandwidth to " + bitrate + " via REMB");
              }
              $("#bitrateset")
                .html($(this).html() + '<span class="caret"></span>')
                .parent()
                .removeClass("open");
              sfutest.send({ message: { request: "configure", bitrate: bitrate } });
              return false;
            });
          },
          onmessage: function (msg, jsep) {
            Janus.debug(" ::: Got a message (publisher) :::", msg);
            var event = msg["videoroom"];
            Janus.debug("Event: " + event);
            if (event) {
              if (event === "joined") {
                myid = msg["id"];
                mypvtid = msg["private_id"];
                Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);
                setParticipants((prev) => [...prev, { id: myid, display: username, isLocal: true }]);
                if (subscriber_mode) {
                  $("#videojoin").hide();
                  $("#videos").removeClass("hide").show();
                } else {
                  publishOwnFeed(true);
                }
                if (msg["publishers"]) {
                  var list = msg["publishers"];
                  for (var f in list) {
                    var id = list[f]["id"];
                    var display = list[f]["display"];
                    var audio = list[f]["audio_codec"];
                    var video = list[f]["video_codec"];
                    newRemoteFeed(id, display, audio, video);
                    setParticipants((prev) => [...prev, { id, display, isLocal: false }]);
                  }
                }
              } else if (event === "destroyed") {
                Janus.warn("The room has been destroyed!");
                bootbox.alert("The room has been destroyed", function () {
                  window.location.reload();
                });
              } else if (event === "event") {
                if (msg["publishers"]) {
                  var list = msg["publishers"];
                  for (var f in list) {
                    var id = list[f]["id"];
                    var display = list[f]["display"];
                    var audio = list[f]["audio_codec"];
                    var video = list[f]["video_codec"];
                    newRemoteFeed(id, display, audio, video);
                    setParticipants((prev) => [...prev, { id, display, isLocal: false }]);
                  }
                } else if (msg["leaving"]) {
                  var leaving = msg["leaving"];
                  var remoteFeed = null;
                  for (var i = 1; i < 6; i++) {
                    if (feeds[i] && feeds[i].rfid == leaving) {
                      remoteFeed = feeds[i];
                      break;
                    }
                  }
                  if (remoteFeed != null) {
                    $("#remote" + remoteFeed.rfindex).empty().hide();
                    $("#videoremote" + remoteFeed.rfindex).empty();
                    feeds[remoteFeed.rfindex] = null;
                    remoteFeed.detach();
                    setParticipants((prev) => prev.filter((p) => p.id !== leaving));
                  }
                } else if (msg["unpublished"]) {
                  var unpublished = msg["unpublished"];
                  if (unpublished === "ok") {
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
                    $("#remote" + remoteFeed.rfindex)
                      .empty()
                      .hide();
                    $("#videoremote" + remoteFeed.rfindex).empty();
                    feeds[remoteFeed.rfindex] = null;
                    remoteFeed.detach();
                    setParticipants((prev) => prev.filter((p) => p.id !== unpublished));
                  }
                } else if (msg["error"]) {
                  if (msg["error_code"] === 426) {
                    bootbox.alert(
                      "<p>Apparently room <code>" +
                      myroom +
                      "</code> (the one this demo uses as a test room) " +
                      "does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.jcfg</code> " +
                      "configuration file? If not, make sure you copy the details of room <code>" +
                      myroom +
                      "</code> " +
                      "from that sample in your current configuration file, then restart Janus and try again."
                    );
                  } else {
                    bootbox.alert(msg["error"]);
                  }
                }
              }
            }
            if (jsep) {
              sfutest.handleRemoteJsep({ jsep: jsep });
              var audio = msg["audio_codec"];
              if (mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
                toastr.warning("Our audio stream has been rejected, viewers won't hear us");
              }
              var video = msg["video_codec"];
              if (mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
                toastr.warning("Our video stream has been rejected, viewers won't see us");
                $("#myvideo").hide();
                $("#videolocal").append(
                  '<div class="no-video-container">' +
                  '<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
                  '<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
                  "</div>"
                );
              }
            }
          },
          onlocalstream: function (stream) {
            mystream = stream;
            $("#videojoin").hide();
            $("#videos").removeClass("hide").show();
            if ($("#myvideo").length === 0) {
              $("#videolocal").append(
                '<video class="rounded centered" id="myvideo" width="100%" height="100%" autoplay playsinline muted="muted"/>'
              );
              $("#videolocal").append(
                `<button id="mute" class="bg-blue-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline inline-flex items-center mb-2">
                  ${renderToString(<MicIcon className="mr-1" />)}
                  마이크끄기
                </button>`
              );

              $("#mute").click(toggleMute);
              $("#videolocal").append(
                `<button id="unpublish" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline inline-flex items-center ml-4 mb-2">
                  ${renderToString(<VideoCallIcon className="mr-1" />)}
                  화면끄기
                </button>`
              );

              $("#videolocal").append(
                `<button id="publish" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline inline-flex items-center ml-4 mb-2 hidden">
                  ${renderToString(<BrowserNotSupportedIcon className="mr-1" />)}
                  화면송출
                </button>`
              );

              $("#unpublish").click(toggleVideo);
              $("#publish").click(toggleVideo);
            }
            $("#publisher").removeClass("hide").html(myusername).show();
            $("#publisher").css("color", getColorFromString(myusername));
            Janus.attachMediaStream($("#myvideo").get(0), stream);
            $("#myvideo").get(0).muted = "muted";
            if (
              sfutest.webrtcStuff.pc.iceConnectionState !== "completed" &&
              sfutest.webrtcStuff.pc.iceConnectionState !== "connected"
            ) {
              $("#videolocal")
                .parent()
                .parent()
                .block({
                  message: "<b>Publishing...</b>",
                  css: {
                    border: "none",
                    backgroundColor: "transparent",
                    color: "white",
                  },
                });
            }
            var videoTracks = stream.getVideoTracks();
            if (!videoTracks || videoTracks.length === 0) {
              $("#myvideo").hide();
              $("#placeholder").show();
            } else {
              $("#placeholder").hide();
              $("#myvideo").removeClass("hide").show();
            }
          },
          onremotestream: function (stream) {
            Janus.debug(" ::: Got a remote stream :::", stream);
            const remoteFeedId = stream.id;
            const remoteFeed = feeds.find(feed => feed.stream.id === remoteFeedId);
            if (remoteFeed) {
              Janus.attachMediaStream($(`#videoremote${remoteFeed.rfindex}`).get(0), stream);
            }
          },
          oncleanup: function () {
            mystream = null;
            $("#videolocal").html(
                `<button id="publish" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ml-4 inline-flex items-center">
                  ${renderToString(<BrowserNotSupportedIcon className="mr-1" />)}
                  화면송출
                </button>`
              );
            $("#publish").click(function () {
              publishOwnFeed(true);
            });
            $("#videolocal").parent().parent().unblock();
            $("#bitrate").parent().parent().addClass("hide");
            $("#bitrate a").unbind("click");
          },
        });
      },
      error: function (error) {
        Janus.error(error);
        bootbox.alert(error, function () {
          window.location.reload();
        });
      },
      destroyed: function () {
        window.location.reload();
      },
    });
  };

  useEffect(() => {
    initjanus();
  }, []);

  const destroytest = () => {
    janus.destroy();
    navigate("/");
  };

  const handleRegisterClick = () => {
    if (username === "") {
      alert("채팅방에서 사용할 닉네임을 입력해주세요.");
      return;
    }
    if (/[^a-zA-Z0-9]/.test(username)) {
      alert("닉네임은 영문만 가능합니다.");
      return;
    }
    setUserId(username);
    setIsRoomCreated(true);
  };

  const getColorFromString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 50%, 50%)`;
    return color;
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }
  }, [messages]);

  return (
    <div className="bg-[#2C2F33] h-screen">
      <div className="flex h-full">
        <div className="flex flex-col w-3/4 h-full p-2">
          {!isRoomCreated && (
            <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-8 m-auto">
              <MicIcon />
              <MicOffIcon />
              <h1 className="text-2xl lg:text-4xl font-bold text-center mb-8">방 참여 하기</h1>
              <div className="space-y-4" id="registernow">
                <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
                  <label className="w-24" htmlFor="roomname">
                    방번호
                  </label>
                  <input
                    type="text"
                    placeholder="방번호를 입력하세요"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="flex-grow p-2 border rounded bg-gray-200 text-gray-700"
                    id="roomname"
                    readOnly
                  />
                </div>
                <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
                  <label className="w-24" htmlFor="username">
                    유저이름
                  </label>
                  <input
                    type="text"
                    placeholder="내 대화명"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-grow p-2 border rounded bg-gray-200 text-gray-700"
                    id="username"
                    readOnly
                  />
                </div>
                <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
                  <label className="w-24" htmlFor="description">
                    방제목
                  </label>
                  <input
                    type="text"
                    placeholder="방제목"
                    className="flex-grow p-2 border rounded bg-gray-200 text-gray-700"
                    id="description"
                    value={roomDescription}
                    readOnly
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    className="bg-blue-600 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline inline-flex items-center mb-2"
                    onClick={handleRegisterClick}
                    id="register"
                  >
                    참여하기
                  </button>
                  <button
                    className="bg-blue-0 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline inline-flex items-center mb-2"
                    onClick={destroytest}
                  >
                    나가기
                  </button>
                </div>
              </div>
            </div>
          )}
          {isRoomCreated && (
            <div className="w-full bg-[#2C2F33] p-2 rounded-lg h-full flex flex-col" id="videos">
              <div className="flex justify-end mb-2">
                <button
                  className="bg-black hover:bg-gray-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline inline-flex items-center"
                  onClick={destroytest}
                >
                  나가기
                </button>
              </div>
              <div className="flex-grow flex h-3/5">
                <div className="flex-grow bg-[#2C2F33] p-4 rounded shadow-lg mr-4">
                  <h3 className="text-lg font-bold mb-2 text-white">
                    <span
                      className="badge badge-primary"
                      id="publisher"
                      style={{ color: getColorFromString(userId) }}
                    >
                      {userId}
                    </span>
                  </h3>
                  <div className="panel-body h-full" id="videolocal"></div>
                </div>
                <div className="w-1/4 h-full overflow-y-auto">
                  {participants
                    .filter(participant => !participant.isLocal)
                    .slice(0, 1)
                    .map((participant, index) => (
                      <div key={participant.id} className="bg-[#2C2F33] h-1/3 p-4 rounded shadow mb-4">
                        <h3 className="text-lg font-bold mb-2 text-white">
                          <span
                            className={`badge badge-info`}
                            id={`remote${index + 1}`}
                            style={{ color: getColorFromString(participant.display) }}
                          >
                            {participant.display}
                          </span>
                        </h3>
                        <div className="panel-body h-32" id={`videoremote${index + 1}`}></div>
                      </div>
                    ))}
                  {participants
                    .filter(participant => !participant.isLocal)
                    .slice(1)
                    .map((participant, index) => (
                      <div key={participant.id} className="bg-[#2C2F33] h-1/3 p-4 rounded shadow mb-4">
                        <h3 className="text-lg font-bold mb-2 text-white">
                          <span
                            className={`badge badge-info`}
                            id={`remote${index + 2}`}
                            style={{ color: getColorFromString(participant.display) }}
                          >
                            {participant.display}
                          </span>
                        </h3>
                        <div className="panel-body h-32" id={`videoremote${index + 2}`}></div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="w-1/4 h-full p-2">
          <div className="bg-[#2C2F33] p-4 rounded-lg shadow-lg h-full">
            <Chat boothId={boothId} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoRoom;