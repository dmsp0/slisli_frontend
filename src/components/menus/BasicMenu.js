import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Dropdown from "../dropdown/Dropdown";
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
        <nav className="flex w-full items-center mb-10">
            <div className="mt-6 ms-12">
                <Link to={"/"}>
                    <img className="w-1/4" src="/images/slisli_blue_logo.png" alt="실리실리 로고 이미지"/>
                </Link>
            </div>

            <div className="hidden w-3/4 justify-end p-2 text-base sm:block me-5 font-bold">
                <ul className="flex flex-row justify-end space-x-8">
                    {isLogin && (
                        <li>
                            <Link to="/mypage" className="block rounded p-2 text-gray-700 hover:bg-blue-500 hover:text-white">
                                마이페이지
                            </Link>
                        </li>
                    )}
                    {!isLogin && (
                        <>
                            <li>
                                <Link to="/signup" className="block rounded p-2 text-gray-700 hover:bg-blue-500 hover:text-white">
                                    회원가입
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="block rounded p-2 text-gray-700 hover:bg-blue-500 hover:text-white">
                                    로그인
                                </Link>
                            </li>
                        </>
                    )}
                    {isLogin && (
                        <li>
                            <button onClick={logoutFunction} className="block rounded p-2 text-gray-700 hover:bg-blue-500 hover:text-white">
                                로그아웃
                            </button>
                        </li>
                    )}
                </ul>
            </div>

            <div className="flex sm:hidden w-3/4 justify-end p-4 text-sm">
                {isLogin ? (
                    <Dropdown menuIcon={<IoIosMenu size="40" />} menus={[
                        { icon: <FaUser size="20" />, link: "/myPage" },
                        { icon: <MdLogout size="20" />, callback: logoutFunction }
                    ]} />
                ) : (
                    <Dropdown menuIcon={<IoIosMenu size="40" />} menus={[
                        { icon: <FaUserPlus size="20" />, link: "/signup" },
                        { icon: <MdLogin size="20" />, link: "/login" }
                    ]} />
                )}
            </div>
        </nav>
    );
}

export default BasicMenu;
