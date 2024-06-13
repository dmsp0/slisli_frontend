import React from 'react';
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', width: '100%' }}>
      {/* FavoriteList - 찜목록 렌더링 */}
      <FavoriteList favoriteEvents={favoriteEvents} />
    </div>
  );
}

export default FavoriteComponent;