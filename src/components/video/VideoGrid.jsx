import { useRef, useEffect, useState } from "react";

function ParticipantGrid({ participants, gridSize }) {
  const [res, setRes] = useState(window.innerWidth);
  const colNum = Math.ceil(Math.sqrt(gridSize));
  const rowNum = Math.ceil(gridSize / colNum);

  function handleResize() {
    setRes(window.innerWidth);
  }
  window.addEventListener("resize", handleResize);

  return (
      <>
        {res >= 768 ? (
            <div
                className={`grid overflow-auto grid-cols-${colNum} grid-rows-${rowNum}`}
            >
              {participants.map((participant, index) => (
                  <div
                      key={index}
                      className={`${
                          index === gridSize - 1 &&
                          gridSize % 2 === 1 &&
                          gridSize < 7 &&
                          gridSize > 3
                              ? "col-span-2 sm:col-span-1 sm:col-start-2"
                              : ""
                      } my-auto`}
                  >
                    <video
                        className=""
                        key={index}
                        ref={participant.faceCam}
                        alt={`Participant ${index + 1}`}
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
              {participants.map((participant, index) => (
                  <div
                      key={index}
                      className={`${
                          index === gridSize - 1 &&
                          gridSize % 2 === 1 &&
                          gridSize < 7 &&
                          gridSize > 3
                              ? "col-span-2 sm:col-span-1 sm:col-start-2"
                              : ""
                      } my-auto`}
                  >
                    <video
                        className=""
                        key={index}
                        ref={participant.faceCam}
                        alt={`Participant ${index + 1}`}
                        autoPlay
                    />
                  </div>
              ))}
            </div>
        )}
      </>
  );
}

export default ParticipantGrid;
