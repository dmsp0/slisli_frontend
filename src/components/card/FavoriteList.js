import axios from "axios";
import React, { useState, useEffect } from "react";
import { API_URLS } from "../../api/apiConfig";
import { Link } from "react-router-dom";


function FavoriteList() {
  const member_id = localStorage.getItem('member_id');
  const [likedBooths, setLikedBooths] = useState([]);

  useEffect(() => {
    const fetchLikedBooths = async () => {
      if (!member_id) return; // member_id가 없으면 호출하지 않음

      try {
        const response = await axios.get(`${API_URLS.BOOTH_LIKED_LIST}/${member_id}`);
        setLikedBooths(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLikedBooths();
  }, [member_id]);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        <h3 className="pl-4">목록</h3>
        <br/>
        {/* 찜목록 리스트 (이미지, 이벤트제목, 주최, 일시) */}
        <div className="flex flex-col gap-6">
          {likedBooths.map((booth) => (
            <div key={booth.id} className="favorite-event border-2 p-4 flex flex-col items-center border-gray-300 rounded-lg shadow-md">
              <img src={booth.imgPath} alt={booth.title} className="w-full h-48 object-cover rounded-md mb-4" />
              <div className="w-full text-left p-2">
                <h3 className="text-lg font-bold mb-2">{booth.title}</h3>
                <p className="text-sm text-gray-700 mb-1">주최: {booth.openerName}</p>
                <p className="text-sm text-gray-700">일시: {booth.date}, {booth.startTime} ~ {booth.endTime}</p>
              
              <Link
              to={`/booth/${booth.boothId}`}
              className="text-blue-500 hover:underline"
              >
              자세히 보기
            </Link>
            </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FavoriteList;
