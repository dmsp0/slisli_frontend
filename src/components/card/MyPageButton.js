import React from 'react';
import { useNavigate } from 'react-router-dom';

function MyPageButton() {
    
  const navigate = useNavigate();

  // [ 내 정보 ] 버튼 클릭 시 /mypage 페이지로 이동
  const handleMyPageClick = () => {
    navigate('/mypage');
  };

  // [ 찜한 목록 ] 버튼 클릭 시 /favoriteList 페이지로 이동
  const handleFavoriteClick = () => {
    navigate('/favoritelist');
  };

  // [ 시청 목록 ] 버튼 클릭 시 /historypage 페이지로 이동
  const handleViewHistoryClick = () => {
    navigate('/historylist');
  };

    // [ 부스 개최 ] 버튼 클릭 시 /boothheld 페이지로 이동
    const handleBoothHeldClick = () => {
      navigate('/booth/registration');
    };

  return (
    <div>
      
      {/* 버튼 4개 (내정보, 찜목록, 시청목록, 부스개최) */}
      <div className="flex flex-col space-y-5 items-center mt-2">
        <button className="mt-20 py-2 px-4 hover:bg-blue-400 text-black border-2 rounded-lg" onClick={handleMyPageClick}>내 정보</button>
        <button className="py-2 px-4 hover:bg-blue-400 text-black border-2 rounded-lg" onClick={handleFavoriteClick}>찜한 목록</button>
        <button className="py-2 px-4 hover:bg-blue-400 text-black border-2 rounded-lg" onClick={handleViewHistoryClick}>시청 목록</button>
        <button className="py-2 px-4 hover:bg-blue-400 text-black border-2 rounded-lg" onClick={handleBoothHeldClick}>부스 개최</button>
      </div> 

  </div>
  );
}

export default MyPageButton;
