import { useRef, useEffect, useState } from "react";
import { Janus } from "janus-gateway";

import { svg_mic, svg_mute } from "../../constants";

function VideoContainer({
                          janusInstance,
                          room,
                          setRoom,
                          createRoom,
                          username,
                          isCam,
                          isMic,
                        }) {
  //variables used for setting the grid shape
  const [res, setRes] = useState(window.innerWidth);
  const [resH, setResH] = useState(window.innerHeight);
  const [gridSize, setGridSize] = useState(1);
  const colNum = Math.ceil(Math.sqrt(gridSize));
  const rowNum = Math.ceil(gridSize / colNum);
  function handleResize() {
    setRes(window.innerWidth);
  }
  window.addEventListener("resize", handleResize);

  //local variables
  const localVideo = useRef(null);
  const [localTracks, setLocalTracks] = useState([]);

  //all feed info
  const [feeds, setFeeds] = useState({});
  const [feedPlaceholders, setFeedPlaceholders] = useState({});
  let feedsState = {};
  let feedStreams = {};
  const [feedsNum, setFeedsNum] = useState(1);
  const [feedPublished, setFeedPublished] = useState(true);
  const [audioPublished, setAudioPublished] = useState(true);

  //references for videos/audios of other participants
  const videoRefs = useRef({});
  const addVideoRef = (key) => (ref) => {
    videoRefs.current[key] = ref;
  };
  const audioRefs = useRef({});
  const addAudioRef = (key) => (ref) => {
    audioRefs.current[key] = ref;
  };

  //config info
  const opaqueId = Janus.randomString(12);
  let publisherSFU = null;
  const [camSFU, setCamSFU] = useState(null);
  let myId = null;
  let roomId = room;

  function janusPublish() {
    janusInstance.attach({
      plugin: "janus.plugin.videoroom",
      opaqueId: opaqueId,
      success: (pluginHandle) => {
        console.log("Publisher plugin attached !");
        console.log(pluginHandle);

        publisherSFU = pluginHandle;
        setCamSFU(pluginHandle);

        if (createRoom) {
          let createRequest = {
            request: "create",
            permanent: false,
            is_private: false,
            videocodec: "vp9",
            room: parseInt(roomId),
          };
          pluginHandle.send({
            message: createRequest,
            success: (result) => {
              console.log("Created room! Joining.");
              setRoom(result.room);

              let request = {
                request: "join",
                room: parseInt(roomId),
                ptype: "publisher",
                display: username,
              };

              pluginHandle.send({ message: request });
            },
          });
        } else {
          let request = {
            request: "join",
            room: parseInt(roomId),
            ptype: "publisher",
            display: username,
          };

          pluginHandle.send({ message: request });
        }
      },
      onmessage: (message, jsep) => {
        console.log("Got message! (Publisher)");
        if (jsep) console.log({ message, jsep });
        else console.log(message);

        if (message.videoroom === "joined") {
          console.log("Joined room! Creating offer.");
          console.log("My ID: ", message.id);

          myId = message.id;

          publishFeed();

          if (message.publishers) {
            if (message.publishers.length !== 0) {
              message.publishers.forEach((publisher) => {
                const id = publisher.id;
                const display = publisher.display;
                const streams = publisher.streams.map((stream) => ({
                  ...stream,
                  id: id,
                  display: display,
                }));
                feedStreams[publisher.id] = streams;
                janusSubscribe(publisher);
              });
            }
          }
        } else if (message.videoroom === "destroyed") {
          window.location.reload();
        } else if (message.videoroom === "event") {
          if (message.streams) {
            const id = myId;
            const display = username;
            const streams = message.streams.map((stream) => ({
              ...stream,
              id: id,
              display: display,
            }));
            feedStreams[myId] = streams;
          } else if (message.publishers) {
            console.log(message.publishers);
            if (message.publishers.length !== 0) {
              message.publishers.forEach((publisher) => {
                if (!feedStreams[publisher.id]) {
                  const id = publisher.id;
                  const display = publisher.display;
                  const streams = publisher.streams.map((stream) => ({
                    ...stream,
                    id: id,
                    display: display,
                  }));
                  feedStreams[publisher.id] = streams;
                  janusSubscribe(publisher);
                }
              });
            }
          } else if (message.unpublished) {
            if (message.unpublished === "ok") {
              publisherSFU.hangup();
              return;
            }
            console.log(`Publisher unpublished ${message.unpublished}`);
            let remoteFeed = null;
            for (let i = 1; i < 10; i++)
              if (feedsState[i] && feedsState[i].rfid == message.leaving) {
                remoteFeed = feedsState[i];
                break;
              }
            if (remoteFeed) {
              console.log(remoteFeed);
              console.log(feedsState);
              delete feedsState[remoteFeed.rfindex];
              setFeeds(feedsState);
              videoRefs.current[remoteFeed.rfindex].srcObject = null;
            }
            delete feedStreams[message.unpublished];
          } else if (message.leaving) {
            console.log(`Publisher left ${message.leaving}`);
            let remoteFeed = null;
            for (let i = 1; i < 10; i++)
              if (feedsState[i] && feedsState[i].rfid == message.leaving) {
                remoteFeed = feedsState[i];
                break;
              }
            if (remoteFeed) {
              console.log(remoteFeed);
              console.log(feedsState);
              delete feedsState[remoteFeed.rfindex];
              setFeeds(feedsState);
              videoRefs.current[remoteFeed.rfindex].srcObject = null;
            }
            setFeedsNum((num) => num - 1);
            delete feedStreams[message.leaving];
          }
        }
        if (jsep) {
          console.log("Handling SDP ...");
          console.log(jsep);
          publisherSFU.handleRemoteJsep({ jsep: jsep });
        }
      },
      webrtcState: (on) => {
        console.log(
            "Janus says our WebRTC PeerConnection is " +
            (on ? "up" : "down") +
            " now"
        );
      },
      iceState: (state) => {
        console.log("ICE state changed to " + state);
      },
      mediaState: (medium, on, mid) => {
        console.log(
            `Janus ${on ? "started" : "stopped"} receiving our ${medium}`
        );
      },
      slowLink: (uplink, lost, mid) => {
        console.log("problems " + uplink ? "sending" : "receiving");
        console.log("packets on mid: " + mid);
        console.log("packets lost: " + lost);
      },
      onlocaltrack: (track, on) => {
        console.log(`local track ${on ? "added" : "removed"}: `);
        console.log(track);

        const trackId = track.id.replace(/[{}]/g, "");
        if (!on) {
          let stream = localTracks[trackId];
          if (stream) {
            try {
              let tracks = stream.getTracks();
              tracks.forEach((mst) => {
                if (mst !== null && mst !== undefined) mst.stop();
              });
            } catch (e) {}
          }
          delete localTracks[trackId];
        }
        let stream = localTracks[trackId];
        if (stream) return;
        if (track.kind === "video") {
          stream = new MediaStream([track]);
          setLocalTracks((prevData) => {
            return {
              ...prevData,
              [trackId]: stream,
            };
          });
        }
      },
      oncleanup: () => {
        console.log("We just got unpublished (CLEANUP)");
        delete feedStreams[myId];
        setLocalTracks([]);
        localVideo.current.srcObject = null;
        //possibly change the cam button state
      },
    });
  }

  function publishFeed() {
    let tracks = [];
    tracks.push({ type: "audio", capture: true, recv: false });
    tracks.push({
      type: "video",
      capture: true,
      recv: false,
      simulcast: true,
      svc: true,
    });
    if (publisherSFU) {
      console.log("Sending track offer...");
      publisherSFU.createOffer({
        tracks: tracks,
        success: (jsep) => {
          console.log("Got SDP! " + jsep);
          const publish = {
            request: "publish",
            audio: true,
            video: true,
            audiocodec: "opus",
            videocodec: "vp9",
          };
          publisherSFU.send({ message: publish, jsep: jsep });
        },
        error: (error) => {
          console.log("Failed to get SDP! " + error);
        },
      });
    }
  }

  function janusSubscribe(currPublisher) {
    console.log("Trying to subscribe...");
    console.log(currPublisher);
    let remoteFeed = null;
    //Possibly  check streams
    if (!currPublisher.streams)
      currPublisher.streams = feedStreams[currPublisher.id];

    janusInstance.attach({
      plugin: "janus.plugin.videoroom",
      opaqueId: opaqueId,
      success: (pluginHandle) => {
        remoteFeed = pluginHandle;
        remoteFeed.remoteTracks = {};
        remoteFeed.simulcastStarted = false;
        remoteFeed.svcStarted = false;
        console.log("Plugin for Subscriber attached !");
        let subscription = [];
        currPublisher.streams.forEach((stream) => {
          subscription.push({
            feed: currPublisher.id,
            mid: stream.mid,
          });
          remoteFeed.rfid = currPublisher.id;
          remoteFeed.username = currPublisher.display;
        });
        let subscribeRequest = {
          request: "join",
          room: parseInt(roomId),
          ptype: "subscriber",
          streams: subscription,
        };
        remoteFeed.send({ message: subscribeRequest });
      },
      error: (error) => {
        console.log("Error attaching subscribe plugin!");
        console.log(error);
      },
      onmessage: (msg, jsep) => {
        console.log("|||Got a subscriber message!|||");
        console.log(msg);
        console.log(roomId);
        if (msg.error) console.log("||ERROR!!!||");
        if (msg.videoroom)
          if (msg.videoroom === "attached") {
            console.log(`Attached to feed in room ${msg.room}!!!`);
            console.log(feeds);
            console.log(remoteFeed);
            for (let i = 1; i < 10; i++)
              if (!feedsState[i]) {
                remoteFeed.rfindex = i;
                setFeeds((prevData) => {
                  return {
                    ...prevData,
                    [i]: remoteFeed,
                  };
                });
                feedsState[i] = remoteFeed;
                setFeedsNum(feedsNum + 1);
                break;
              }
          } else if (msg.videoroom === "event") {
            const substream = msg.substream;
            const temporal = msg.temporal;
          }
        if (jsep) {
          console.log("Handling SDP (subscriber)...");
          console.log(jsep);
          const stereo = jsep.sdp.indexOf("stereo=1") !== -1;
          remoteFeed.createAnswer({
            jsep: jsep,
            tracks: [{ type: "data" }],
            customizeSdp: (jsep) => {
              if (stereo)
                jsep.sdp = jsep.sdp.replace(
                    "useinbandfec=1",
                    "useinbandfec=1;stereo=1"
                );
            },
            success: (jsep) => {
              console.log("Got SDP! (subscriber)");
              const body = {
                request: "start",
                room: parseInt(roomId),
              };
              remoteFeed.send({ message: body, jsep: jsep });
            },
            error: (error) => {
              console.log("|||WebRTC ERROR (Subscriber)|||");
              console.log(error.message);
            },
          });
        }
      },
      onremotetrack: (track, mid, on, metadata) => {
        console.log(
            "Remote feed #" +
            remoteFeed.rfindex +
            ", remote track (mid=" +
            mid +
            ") " +
            (on ? "added" : "removed") +
            (metadata ? " (" + metadata.reason + ") " : "") +
            ":",
            track
        );
        if (!on) {
          setFeedPlaceholders((prevData) => {
            return {
              ...prevData,
              [remoteFeed.rfid]: true,
            };
          });
          delete remoteFeed.remoteTracks[mid];
          return;
        }
        if (track.kind === "audio") {
          console.log("Adding Audio");
          let stream = new MediaStream([track]);
          remoteFeed.remoteTracks[mid] = stream;
          if (audioRefs.current[remoteFeed.rfindex])
            audioRefs.current[remoteFeed.rfindex].srcObject = stream;
        } else {
          console.log("Adding Video");
          setFeedPlaceholders((prevData) => {
            return {
              ...prevData,
              [remoteFeed.rfid]: false,
            };
          });
          let stream = new MediaStream([track]);
          remoteFeed.remoteTracks[mid] = stream;
          if (videoRefs.current[remoteFeed.rfindex])
            videoRefs.current[remoteFeed.rfindex].srcObject = stream;
        }
      },
      oncleanup: () => {
        console.log(`Cleanup for remote feed ${currPublisher.id}`);
        remoteFeed.remoteTracks = {};
      },
    });
  }

  useEffect(() => {
    janusPublish();
  }, []);

  useEffect(() => {
    if (localVideo.current)
      Object.keys(localTracks).forEach(
          (key) => (localVideo.current.srcObject = localTracks[key])
      );
  });
  useEffect(() => {
    console.log("local tracks changed !!!!");
    console.log(localTracks);
  }, [localTracks]);
  useEffect(() => {
    setGridSize(feedsNum);
  }, [feedsNum]);

  useEffect(() => {
    if (!isCam && feedPublished) {
      console.log("SENDING VIDEO MUTE REQUEST");
      camSFU.createOffer({
        media: { removeVideo: true },
        success: (jsep) => {
          camSFU.send({ message: { request: "configure" }, jsep: jsep });
        },
        error: (error) => {
          console.log("ERROR on mute");
          console.log(error);
        },
      });
      setFeedPublished(false);
    } else if (!feedPublished && isCam) {
      console.log("SENDING VIDEO UNMUTE REQUEST");
      camSFU.createOffer({
        media: { replaceVideo: true },
        success: (jsep) => {
          camSFU.send({ message: { request: "configure" }, jsep: jsep });
        },
        error: (error) => {
          console.log("ERROR on unmute");
          console.log(error);
        },
      });
      setFeedPublished(true);
    }
  }, [isCam, camSFU, feedPublished]);

  useEffect(() => {
    if (!isMic && audioPublished) {
      console.log("MUTING AUDIO");
      camSFU.muteAudio();
      setAudioPublished(false);
    } else if (isMic && !audioPublished) {
      console.log("UNMUTING AUDIO");
      camSFU.unmuteAudio();
      setAudioPublished(true);
    }
  }, [isMic, camSFU, audioPublished]);

  return (
      <div className="bg-secondary w-[95vw]  md:w-4/6 h-[80vh] sm:h-[66vh] md:h-[75vh] flex justify-center p-4 rounded-xl">
        {res >= 768 ? (
            <div
                className={`grid overflow-auto`}
                style={{
                  gridTemplateColumns: `repeat(${colNum},minmax(0,1fr))`,
                  gridTemplateRows: `repeat(${rowNum},minmax(0,1fr))`,
                }}
            >
              <div
                  id="videolocal"
                  className={`${
                      gridSize === 1 ? "col-span-2 sm:col-span-1 sm:col-start-2" : ""
                  } my-auto relative`}
              >
                {!isCam && (
                    <div className="w-full h-full flex item-center justify-center rounded-lg bg-black">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-32 h-32 my-auto"
                      >
                        <path
                            fillRule="evenodd"
                            d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                            clipRule="evenodd"
                        />
                      </svg>
                    </div>
                )}
                <video
                    hidden={!isCam}
                    className="rounded-lg w-full"
                    ref={localVideo}
                    autoPlay
                    muted={true}
                />
                <div className="absolute flex space-x-2 items-center bg-black bg-opacity-70 bottom-2 left-2 px-4 py-2 rounded-xl text-md">
                  <p>You</p>
                </div>
              </div>
              {Object.keys(feeds).map((feedKey, index) => (
                  <div
                      key={index}
                      className={`${
                          index + 1 === gridSize - 1 &&
                          gridSize % 2 === 1 &&
                          gridSize < 7 &&
                          gridSize > 3
                              ? "col-span-2 sm:col-span-1 sm:col-start-2"
                              : ""
                      } my-auto relative`}
                  >
                    {feedPlaceholders[feeds[feedKey].rfid] && (
                        <div className="w-full h-full flex item-center justify-center rounded-lg bg-black">
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-32 h-32 my-auto"
                          >
                            <path
                                fillRule="evenodd"
                                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                clipRule="evenodd"
                            />
                          </svg>
                        </div>
                    )}
                    <video
                        hidden={feedPlaceholders[feeds[feedKey].rfid]}
                        className="w-full rounded-lg"
                        key={`video${index}`}
                        ref={addVideoRef(feeds[feedKey].rfindex)}
                        alt={`Participant ${index + 1} Video`}
                        autoPlay
                    />

                    <div className="absolute flex space-x-2 items-center bg-black bg-opacity-70 bottom-2 left-2 px-4 py-2 rounded-xl text-md">
                      <p>{feeds[feedKey].username}</p>
                    </div>
                    <audio
                        hidden
                        key={`audio${index}`}
                        ref={addAudioRef(feeds[feedKey].rfindex)}
                        alt={`Participant ${index + 1} audio`}
                        autoPlay
                    />
                  </div>
              ))}
            </div>
        ) : (
            <div
                className={`grid overflow-auto ${
                    gridSize > 3
                        ? `grid-rows-${Math.ceil(gridSize / 2)} grid-cols-2`
                        : `grid-rows-${gridSize} grid-cols-1`
                }`}
            >
              <div
                  id="videolocal"
                  className={`${
                      gridSize === 1 ? "col-span-2 sm:col-span-1 sm:col-start-2" : ""
                  } my-auto relative`}
              >
                {!isCam && (
                    <div className="w-full h-full flex item-center justify-center rounded-lg bg-black">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-32 h-32 my-auto"
                      >
                        <path
                            fillRule="evenodd"
                            d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                            clipRule="evenodd"
                        />
                      </svg>
                    </div>
                )}
                <video
                    hidden={!isCam}
                    className="rounded-lg w-full"
                    ref={localVideo}
                    autoPlay
                    muted={true}
                />
                <div className="absolute flex space-x-2 items-center bg-black bg-opacity-70 bottom-2 left-2 px-4 py-2 rounded-xl text-md">
                  <p>You</p>
                  {!isMic && (
                      <svg
                          fill="white"
                          className="w-4 h-4"
                          viewBox="0 0 56 56"
                          xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d={svg_mute} />
                      </svg>
                  )}
                </div>
              </div>
              {Object.keys(feeds).map((feedKey, index) => (
                  <div
                      key={index}
                      className={`${
                          index + 1 === gridSize - 1 &&
                          gridSize % 2 === 1 &&
                          gridSize < 7 &&
                          gridSize > 3
                              ? "col-span-2 sm:col-span-1 sm:col-start-2"
                              : ""
                      } my-auto relative`}
                  >
                    {feedPlaceholders[feeds[feedKey].rfid] && (
                        <div className="w-full h-full flex item-center justify-center rounded-lg bg-black">
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-32 h-32 my-auto"
                          >
                            <path
                                fillRule="evenodd"
                                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                clipRule="evenodd"
                            />
                          </svg>
                        </div>
                    )}
                    <video
                        hidden={feedPlaceholders[feeds[feedKey].rfid]}
                        className="w-full rounded-lg"
                        key={`video${index}`}
                        ref={addVideoRef(feeds[feedKey].rfindex)}
                        alt={`Participant ${index + 1} Video`}
                        autoPlay
                    />
                    <div className="absolute flex space-x-2 items-center bg-black bg-opacity-70 bottom-2 left-2 px-4 py-2 rounded-xl text-md">
                      <p>{feeds[feedKey].username}</p>
                      {audioRefs.current[feedKey] &&
                          !audioRefs.current[feedKey].srcObject && (
                              <svg
                                  fill="white"
                                  className="w-4 h-4"
                                  viewBox="0 0 56 56"
                                  xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d={svg_mute} />
                              </svg>
                          )}
                    </div>
                    <audio
                        key={`audio${index}`}
                        ref={addAudioRef(feeds[feedKey].rfindex)}
                        alt={`Participant ${index + 1} audio`}
                        autoPlay
                    />
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}

export default VideoContainer;
