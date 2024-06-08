import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { MdLogin, MdLogout } from "react-icons/md";
import { FaUserPlus, FaUser } from "react-icons/fa6";
import { IoIosMenu } from "react-icons/io";
import axios from "axios";

function BasicMenu() {
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        // 로컬 스토리지에서 로그인 상태를 확인하여 설정합니다.
        if (localStorage.getItem('access')) {
            setIsLogin(true);
        }
    }, []);

    const logoutFunction = async () => {
        try {
            // 서버에 로그아웃 요청을 보냅니다.
            const response = await axios.post('http://localhost:7777/logout', {}, {
                withCredentials: true // 쿠키를 포함하여 요청
            });

            if (response.status === 200) {
                // 로그아웃 성공 시, 로컬 스토리지에서 토큰 제거
                localStorage.removeItem('access');

                // 홈으로 이동
                window.location.href = '/';
            } else {
                localStorage.removeItem('access');

                // 홈으로 이동
                window.location.href = '/';
            }
        } catch (error) {
            console.error('로그아웃 오류', error);
            localStorage.removeItem('access');

            // 홈으로 이동
            window.location.href = '/';

        }
    };

    return (
        <nav className="gap-10 fixed px-10 flex w-full items-center justify-between h-16 z-20 bg-white/75">
    <div className="flex justify-between w-1/3">
        <Link to="#">기업부스</Link>
        <Link to="#">개인부스</Link>
        <Link to="/booth/list">부스리스트</Link>
        <Link to="/booth/registration">부스 등록</Link>
    </div>
    <div className="w-1/3 text-center">
        <Link to="#" className="text-center">
            <p className="lotteria-font inline-block text-4xl text-blue">
                슬리슬리
            </p>
        </Link>
    </div>
    <div className="flex justify-end w-1/3">
        {isLogin && (
            <>
                <Link to="/mypage" className="block rounded p-2 mx-5 text-gray-700 hover:bg-blue-500 hover:text-white">
                    마이페이지
                </Link>
                <button onClick={logoutFunction} className="block rounded p-2 mx-5 text-gray-700 hover:bg-blue-500 hover:text-white">
                    로그아웃
                </button>
            </>
        )}
        {!isLogin && (
            <>
                <Link to="/signup" className="block rounded p-2 text-gray-700 hover:bg-blue-500 hover:text-white">
                    회원가입
                </Link>
                <Link to="/login" className="block rounded p-2 text-gray-700 hover:bg-blue-500 hover:text-white">
                    로그인
                </Link>
            </>
        )}
    </div>

</nav>

    );
}

export default BasicMenu;
