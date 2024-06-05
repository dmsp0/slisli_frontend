import React from 'react';
import TestPoster from "../../img/poster.png";
import Reservation from './Reservation';

function Reservation() {
  return (
    <div className = " grid grid-cols-[4fr,6fr] gap-10 p-1 mt-20 w-full h-full mx-auto">
      
      {/* <!-- 1. 왼 - 포스터 이미지 --> */}
        <div className="border-2 rounded-md flex w-full h-full object-contain" >
            <img src={TestPoster} className="justify-center items-center p-5" alt="포스터 이미지" />
        </div>

      {/* 2. 우 - 제목 | 예약시간, 참가예약 */}
        <div className="space-y-6 w-auto">
            <div className="text-5xl text-center mb-20 ">이벤트 제목</div>
            <div className="grid grid-cols-2 text-3xl border-2 rounded-md space-y-6 p-5 m-50 ">
              <div className="grid grid-rows-2 text-3xl border-2 rounded-md space-y-3 p-5 w-100 ">  
                <p className="text-xl ">예약시간 : 2024년 6월 10일 11:00 </p>
                <p className="text-xl ">예약 가능 인원 수 : 10 / 30 </p>
              </div> 

              <div className="ml-20">
              <button className="justify-center items-center rounded-md align-middle text-3lg border-2 bg-sky-100 p-5 ">참가 예약</button>
              </div>
            </div>

            <div className="grid grid-cols-2 text-3xl border-2 space-y-5 p-5 m-50">
              <div className="grid grid-rows-2 text-3xl border-2 space-y-2 p-5 w-100 ">  
                <p className="text-xl ">예약시간 : 2024년 6월 15일 14:00 </p>
                <p className="text-xl ">예약 가능 인원 수 : 27 / 30 </p>
              </div> 

              <div className="ml-20">
              <button className="justify-center items-center align-middle text-3lg border-2 bg-sky-100 rounded p-5">참가 예약</button>
              </div>
            </div>

            <div className="grid grid-cols-8 w-full ml-10 mr-0 mt-20">
              <button className="col-start-1 col-span-3 text-3xl border-2 bg-sky-100 rounded ml-auto p-5 mr-6">부스 참여</button>
              <button className="col-start-4 col-span-2 text-3xl border-2 bg-sky-100 ml-2 mr-auto p-5 w-70">찜하기</button>
            </div>

        </div>
     </div>

);
}

export default Reservation;

//     <div className="container grid grid-cols-2 mx-auto p-1 mt-20" style={{ width: 'calc(100% - 3px)', height: 'calc(100% - 3px)' }}>
//   {/* 1. 왼 - 포스터 이미지 */}
//   <div className="border-2 rounded-md" >
//     <img src={TestPoster} className="w-full h-full" alt="포스터 이미지" />
//   </div>
//   {/* 2. 우 - 제목 | 예약시간, 참가예약 */}
//   <div className="space-y-6 w-full ml-10" >
//     <div className="text-5xl text-center mb-20">이벤트 제목</div>

//     <div className="grid grid-cols-2 text-3xl border-2 rounded-md space-y-6 p-5 m-50">
//       <div className="grid grid-rows-2 text-3xl border-2 rounded-md space-y-3 p-5 w-100">
//         <p className="text-xl">예약시간 : 2024년 6월 10일 11:00</p>
//         <p className="text-xl">예약 가능 인원 수 : 10 / 30</p>
//       </div>

//       <div className="ml-20">
//         <button className="justify-center items-center rounded-md align-middle text-3lg border-2  bg-sky-100-80">참가 예약</button>
//       </div>
//     </div>

//     <div className="grid grid-cols-2 text-3xl border-2 space-y-5 p-5 m-50">
//       <div className="grid grid-rows-2 text-3xl border-2 space-y-2 p-5 w-100">
//         <p className="text-xl">예약시간 : 2024년 6월 15일 14:00</p>
//         <p className="text-xl">예약 가능 인원 수 : 27 / 30</p>
//       </div>

//       <div className="ml-20">
//         <button className="justify-center items-center align-middle text-3lg border-2  bg-sky-100 rounded">참가 예약</button>
//       </div>
//     </div>

//   </div>
// </div>






// 기본
// import React from 'react';

// function InfoPage() {
//   return (
//     <div className="info-page">
//       <div className="left-box">
//         {/* 포스터 이미지 */}
//         <img src="poster.jpg" alt="포스터 이미지" />
//       </div>
//       <div className="right-box">
//         <div className="box1">
//           <h2>이벤트 제목</h2>
//           <p>예약시간: 2024년 6월 10일 14:00</p>
//           <button>참가 예약</button>
//         </div>
//         <div className="box2">
//           <h2>이벤트 제목</h2>
//           <p>예약시간: 2024년 6월 15일 16:30</p>
//           <button>참가 예약</button>
//         </div>
        
//       </div>
//     </div>
//   );
// }

// export default InfoPage;



// import React, { useState, useEffect } from 'react';

// const Reservation = () => {
//   const [data, setData] = useState([]);

//   const fetchData = async () => {
//     try {
//       // DB에서 전체 데이터를 불러오는 API 호출
//       const response = await fetch('db경로');
//       const jsonData = await response.json();
//       setData(jsonData); // 전체 데이터를 state에 저장
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <div>
//       {data.map((item, index) => (
//         <div key={index} className="reservation-item">
//           <div className="imgContent">
//             <img src={item.imgContent} alt="Event" />
//           </div>
//           <div className="title">
//             <h2>{item.title}</h2>
//             <p>{item.time1}</p>
//             <p>{item.time2}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Reservation;


// import React, { useState, useEffect } from 'react';

// const Reservation = () => {
//   const [image, setImage] = useState('');
//   const [title, setTitle] = useState('');
//   const [time1, setTime1] = useState('');
//   const [time2, setTime2] = useState('');

//   // 예시로 DB에서 데이터를 불러오는 함수
//   const fetchData = async () => {
//     try {
//       // 이미지 데이터를 불러오는 API 호출
//       const imageResponse = await fetch('your-image-api-url');
//       const imageJson = await imageResponse.json();
//       setImage(imageJson.url);

//       // 제목 데이터를 불러오는 API 호출
//       const titleResponse = await fetch('your-title-api-url');
//       const titleJson = await titleResponse.json();
//       setTitle(titleJson.title);

//       // 시간 데이터를 불러오는 API 호출
//       const time1Response = await fetch('your-time1-api-url');
//       const time1Json = await time1Response.json();
//       setTime1(time1Json.time1);

//       const time2Response = await fetch('your-time2-api-url');
//       const time2Json = await time2Response.json();
//       setTime2(time2Json.time2);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <div>
//       <div className="imgContent">
//         <img src={image} alt="Event" />
//       </div>
//       <div className="title">
//         <h2>{title}</h2>
//         <p>{time1}</p>
//         <button>참가 예약 하기 버튼_1</button>
//         <p>{time2}</p>
//         <button>참가 예약 하기 버튼_2</button>
//       </div>
//     </div>
//   );
// };

// export default Reservation;






