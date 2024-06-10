import React from 'react';

function EventSchedulePage() {


// function EventSchedulePage({ eventDate, eventStartTime, eventAbailableSeats }) {
// 주석
// const eventDetails = {
//   eventName: '이벤트 제목',
//   eventDate: '2024-06-17',
//   eventStartTime: '10:00 AM',
//   eventAbailableSeats: '50명'
// };


  return (
    <>
      {/* 이벤트 일시 & 참가하기 버튼_1 */}
      <div className="flex flex-col border rounded p-3 mb-4 " style={{ marginLeft: "50px" }}>
        {/* <p>일시 : {eventDate} {eventStartTime} <button className="py-1 px-3 bg-blue-500 text-white rounded ml-10">참가예약</button> </p> */}
        {/* <p>참가 신청 가능 인원 : 10 / {eventAbailableSeats}</p> */}
        <p>일시 : 2024-06-17 <button className="py-1 px-3 bg-blue-500 text-white rounded" style={{ marginLeft: "100px" }}>참가예약</button> </p>
        <p>참가 신청 가능 인원 : 5 / 30</p>
      </div>

      {/* 이벤트 일시 & 참가하기 버튼_2 */}
      <div className="flex flex-col border rounded p-3 mb-4 " style={{ marginLeft: "50px" }}>
        <p>일시 : 2024-06-18 <button className="py-1 px-3 bg-blue-500 text-white rounded" style={{ marginLeft: "100px" }}>참가예약</button> </p>
        <p>참가 신청 가능 인원 : 15 / 30</p>
      </div>

      {/* 이벤트 일시 & 참가하기 버튼_3 */}
      <div className="flex flex-col border rounded p-3 mb-4 " style={{ marginLeft: "50px" }}>
      <p>일시 : 2024-06-19 <button className="py-1 px-3 bg-blue-500 text-white rounded " style={{ marginLeft: "100px" }}>참가예약</button> </p>
        <p>참가 신청 가능 인원 : 25 / 30</p>
      </div>      
      
    </>
  );
}

export default EventSchedulePage;
