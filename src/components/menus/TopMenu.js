import React from "react";
import { Link } from "react-router-dom";

function TopMenu() {
  return (
    <div className="w-11/12 mx-auto my-5 border-b border-gray-400">
      <ul className="flex justify-start p-3 font-semibold text-lg">
        <li className="text-center px-3 w-1/4 md:w-1/6">
          <Link className="py-1" to="/booth/corporateBooth">
            기업부스
          </Link>
        </li>
        <li className="text-center px-3 w-1/4 md:w-1/6">
          <Link className="py-1" to="/booth/individuaBooth">
            개인부스
          </Link>
        </li>
        <li className="text-center px-3 w-1/4 md:w-1/6">
          <Link className="py-1" to="/booth/registration">
            부스등록
          </Link>
        </li>
        <li className="text-center px-3 w-1/4 md:w-1/6">
          <Link className="py-1" to="/community">
            커뮤니티
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default TopMenu;
