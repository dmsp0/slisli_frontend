import React from "react";

function FavoriteList({ favoriteEvents }) {

  return (
    <div className="grid grid-cols-12 justify-center p-10">
      
      <div className="col-span-10">
        <h2 className="text-2xl text-center" style={{ marginBottom: "50px" }}>찜한 목록</h2> 
        
        {/* 찜목록 리스트 (이미지, 이벤트제목, 주최, 일시) */}
        <div className="favorite-events-container p-30" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "30px"}}>
          {favoriteEvents.map((favoriteEvent, index) => (
            <div key={index} className="favorite-event border-2" style={{ padding: "10px", marginBottom: "10px", display: "flex", alignItems: "center", borderWidth: "3px", gap: "30px"}}>
              
              <img src="imgURL" alt="Poster" style={{ marginRight: "20px", width: "auto", height: "auto"}} />

              <div>
                <h3 style={{ marginBottom: "5px", whiteSpace: "nowrap" }}>이벤트 제목: {favoriteEvent.eventName}</h3> 
                <p style={{ marginBottom: "5px" }}>주최: {favoriteEvent.eventHost}</p>
                <p style={{ marginBottom: "5px" }}>일시: {favoriteEvent.eventDate}</p>
              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

export default FavoriteList;