import React from 'react';
import TestPoster from "../../img/poster.png";

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

        {/* 3. 내용  */}
        <div>
          <hr />

        </div>
     </div>

);
}

export default Reservation;


// import React from 'react';
// import TestPoster from "../../img/poster.png";

// function Reservation() {
//   return (
//     <div className="grid grid-rows-7 ">
//       {/* 0. 포스터 & 제목,,,  */}
//       <div className="rows-start-1 row-span-3 grid grid-cols-[4fr,6fr] gap-20 p-0 mt-20 w-auto h-auto mx-auto">
//         {/* <!-- 1. 왼 - 포스터 이미지 --> */}
//         <div className="rows-start-1 row-span-2 border-2 rounded-md flex w-full h-full object-contain">
//           <img src={TestPoster} className="justify-center items-center p-2" alt="포스터 이미지" />
//         </div>
//         {/* 2. 우 - 제목 | 예약시간, 참가예약 */}
//         <div className="w-auto mb-20 mr-10 ">
//           <div className="text-5xl text-center mb-20 ">이벤트 제목</div>
//           <div className="text-3xl border-2 rounded-md space-y-6 p-1 gap-1">
//             <div className="row-start-1 row-span-2 text-3xl border-2 rounded-md space-y-3 p-5 w-100">
//               <p className="text-xl">예약시간 : 2024년 6월 10일 11:00</p>
//               <p className="text-xl">예약 가능 인원 수 : 10 / 30</p>
//               <button className="grid row-start-3 col-start-2 rounded-md text-3lg border-2 bg-sky-100 p-2 ml-auto">참가 예약</button>
//             </div>
//             <div className="grid row-start-4 w-full ml-10 mr-0 mt-20">
//               <button className="text-3xl border-2 bg-sky-100 rounded ml-auto p-5 mr-6">부스 참여</button>
//               <button className="text-3xl border-2 bg-sky-100 ml-2 mr-auto p-5 w-70">찜하기</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Reservation;
