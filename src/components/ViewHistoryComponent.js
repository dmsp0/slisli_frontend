import React from 'react';
import ViewHistoryList from '../components/card/ViewHistoryList';

function ViewHistoryComponent({}) {
  
  // 삭제 필요
  const historyEvents = [
    { eventName: "이벤트_1", host: "주최자_1", date: "2024-06-17" },
    { eventName: "이벤트_2", host: "주최자_2", date: "2024-06-18" },
    { eventName: "이벤트_3", host: "주최자_3", date: "2024-06-19" },
    { eventName: "이벤트_4", host: "주최자_4", date: "2024-06-20" }
  ];

  return (
      <ViewHistoryList historyEvents={historyEvents} />
  );
}

export default ViewHistoryComponent;