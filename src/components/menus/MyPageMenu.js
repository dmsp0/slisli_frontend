import React from "react";
import { Link } from "react-router-dom";

function MyPageMenu() {
  return (
    <div className="w-11/12 mx-auto my-5 border-b border-gray-400">
      <ul className="flex justify-start p-3 font-semibold text-lg">
        <li className="text-center px-3 w-1/4 md:w-1/6">
          <Link className="py-1" to="/mypage/modifymyinfo">
            내정보 수정
          </Link>
        </li>
        <li className="text-center px-3 w-1/4 md:w-1/6">
          <Link className="py-1" to="/mypage/likeBooth">
            찜한 목록
          </Link>
        </li>
        <li className="text-center px-3 w-1/4 md:w-1/6">
          <Link className="py-1" to="/mypage/watchBooth">
            시청 목록
          </Link>
        </li>
        <li className="text-center px-3 w-1/4 md:w-1/6">
          <Link className="py-1" to="/booth/registration">
            부스 등록
          </Link>
        </li>
        <li className="text-center px-3 w-1/4 md:w-1/6">
          <Link className="py-1" to="/mypage/myBoothList">
            나의 부스 목록
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default MyPageMenu;
