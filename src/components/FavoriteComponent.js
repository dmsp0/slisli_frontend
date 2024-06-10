import React from 'react';
import MyPageSide from "../components/card/MyPageSide";
import MyPageButton from "./card/MyPageButton";
import FavoriteList from "../components/card/FavoriteList"; 

function FavoriteComponent({}) {

  // 삭제 필요
  const favoriteEvents = [
    { eventName: "이벤트_1", eventHost: "주최자_1", eventDate: "2024-06-17" },
    { eventName: "이벤트_2", eventHost: "주최자_2", eventDate: "2024-06-18" },
    { eventName: "이벤트_3", eventHost: "주최자_3", eventDate: "2024-06-19" },
    { eventName: "이벤트_4", eventHost: "주최자_4", eventDate: "2024-06-20" }
  ];
  
  return (
    <div className="grid grid-cols-12 justify-center p-20">
      
      <div className="col-span-3 p-4 space-y-4 ">
        {/* MyPageSide (기본정보 - 프사, 닉넴, 이멜) */}
        <MyPageSide />

        {/* MyPageButton 컴포넌트 렌더링 (버튼4개-내정보, 찜목록, 시청목록, 부스개최) */}
        <MyPageButton />
      </div>
      
        {/* 세로선 */}
        <div className="col-span-1 justify-self-center border-l border-blue-400"></div>

        {/* 오른쪽 영역 */}
        <div className="col-start-6 col-span-7 flex flex-col items-center">
        
        {/* FavoriteList - 찜목록 렌더링 */}
        <FavoriteList favoriteEvents={favoriteEvents} />
        
      </div>
    </div>
  );
}

export default FavoriteComponent;

