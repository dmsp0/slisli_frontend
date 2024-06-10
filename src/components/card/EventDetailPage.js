import React from 'react';
import Poster from "../../Slisli_img/1.png"; 
import EventSchedulePage from "./EventSchedulePage";

function EventDetailPage() {
// 삭제
const eventDetails = {
  eventName: '이벤트 제목',
  eventDate: '2024-06-17',
  eventStartTime: '10:00 AM',
  eventAbailableSeats: '50명'
};

  return (
    <div className="flex justify-center items-center mt-20">
      <div className="flex flex-col gap-8 items-center">
        {/* 1. 포스터와 이벤트 일시 */}
        <div className="flex gap-20">
          {/* 1-1. 왼쪽 포스터 */}
          <div className="flex-shrink-0">
            <img
              src={Poster}
              alt="Poster"
              className="object-cover"
              style={{ width: '600px', height: '750px' }} // 포스터 4:6 비율 
            />
          </div>

          {/* 1-2. 오른쪽 이벤트 일시 */}
          <div className="flex flex-col">
          <h2 className="text-2xl mb-15" style={{ marginBottom: "50px", marginLeft: "150px" }}>이벤트 제목</h2>
            
            <EventSchedulePage eventDetails={eventDetails} />                       

            {/* 세 번째 줄: 부스 참여와 찜하기 버튼 */}
            <div className="flex mt-8 gap-10 ">
              <button className="flex-grow mt-10 ml-10 py-2 px-4 hover:bg-blue-400 text-black border-2 rounded-lg">부스 참여</button>
              <button className="flex-grow mt-10 py-2 px-4 hover:bg-red-400 text-black border-2 rounded-lg">찜하기</button>
            </div>
          </div>
        </div>

        <hr className=" justify-center border-gray-400 w-full mt-10 mb-10" />

            {/* 2. 두 번째 줄: 이벤트 상세 내용 */}
            <div className="text-left w-full">
              <p className="mb-10">
                한국사회적기업진흥원에서 오는 10월 13일, 14일 양일간 '연대와 협력으로 세상을 바꾸다 
                - 전환의 시대와 사회적경제의 미래'를 주제로 공공, 민간기업, 시민사회 등 
                다양한 영역과 사회적경제의 파트너십을 통한 사회문제의 해결 사례들과, 
                사회적경제의 역할을 강화하기 위한 방안들에 대해 논의하고자 합니다.
              
                이번 포럼은 온•오프라인으로 진행되며, 
                포럼 홈페이지를 통해 사전등록과 실시간으로 시청 하실 수 있습니다.
            
                참가자 분들을 위한 다양한 이벤트도 준비했으니, 많은 관심과 참여 부탁드립니다.
              </p>
            </div>
        
      </div>
    </div>
  );
}

export default EventDetailPage;