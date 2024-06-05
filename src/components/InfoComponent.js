import React from "react";
import Poster from "../img/poster.png";

function InfoComponent(){
    return (
        <div className="grid grid-cols-[4fr,6fr] gap-10 p-1 mt-20 w-full h-full mx-auto">
    
          {/* <!-- 1. 왼 - 포스터 이미지 --> */}
             <div className="border-2 rounded-md flex w-full h-full object-contain" >
                <img src={Poster} className="fill items-center p-5" alt="포스터 이미지" />
             </div>
    
    {/* 2. 우 - 제목 | 예약시간, 참가예약 */}
             <div className="space-y-6 w-auto">
                 <div className="text-5xl text-center mb-15 ">이벤트 제목</div>
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
    
              {/* <div className="grid grid-cols-8 w-full ml-10 mr-0 mt-20">
                 <button className="col-start-1 col-span-3 text-3xl border-2 bg-sky-100 rounded ml-auto p-5 mr-6">부스 참여</button>
                 <button className="col-start-4 col-span-2 text-3xl border-2 bg-sky-100 ml-2 mr-auto p-5 w-70">찜하기</button>
               </div> */}
    
    <div className="flex justify-between items-center w-full ml-0 mr-0 mt-25 mb-50">
      <button className="flex-grow text-3xl border-2 bg-sky-100 rounded-full p-5 mr-6">부스 참여</button>
      <button className="text-3xl border-2 bg-sky-100 rounded-full p-5">찜하기</button>
    </div>
    
    
    
              </div>
    
               
    <br />
    <hr className="border-gray-400 mt-50 w-full col-span-2" />
    
              
              <div className="flex text-left"> 
    
    {/* 행사내용 */}
    <h1>
    ■ 행사명: 2021년 사회적기업 국제포럼\n■ 주최: 고용노동부 <br />
    ■ 주관: 한국사회적기업진흥원 <br />
    ■ 후원: 행복나래 <br />
    ■ 일시: 2021년 10월 13일(수) ~ 14일(목)</h1>
    <br />
    <h3>
    한국사회적기업진흥원에서 오는 10월 13일, 14일 양일간 '연대와 협력으로 세상을 바꾸다 <br />
    - 전환의 시대와 사회적경제의 미래'를 주제로 공공, 민간기업, 시민사회 등 <br />
    다양한 영역과 사회적경제의 파트너십을 통한 사회문제의 해결 사례들과, <br />
    사회적경제의 역할을 강화하기 위한 방안들에 대해 논의하고자 합니다. <br />
    <br />
    이번 포럼은 온•오프라인으로 진행되며, <br />
    포럼 홈페이지를 통해 사전등록과 실시간으로 시청 하실 수 있습니다. <br />
    
    참가자 분들을 위한 다양한 이벤트도 준비했으니, 많은 관심과 참여 부탁드립니다. <br />
     <br />
    홈페이지 바로가기: http://www.seleadersforum.kr <br />
    </h3>
    <br />
    <h5>
    사회적기업 국제포럼 사무국 <br />
    070-4152-6170 <br />
    selforum2021@gmail.com <br />
    </h5>
    </div>
    </div>            
      );
    }
    

export default InfoComponent;