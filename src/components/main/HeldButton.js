import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios'; // axios import 추가

function HeldButton(){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleButtonClick = () => {
        if (!isLoggedIn) {
            // 로그인이 되어 있지 않으면 로그인 페이지로 리다이렉트
            navigate("/login");
        }
    };

    return(
        <div className="bg-indigo-500 h-full py-20 text-center items-center">
            <p className="text-5xl font-extrabold text-white mb-10">
            누구나 온라인 전시를 쉽고 빠르게
            </p>
            <Link to={isLoggedIn ? "/boothheld" : "#"}> 
                <button 
                    onClick={handleButtonClick} 
                    className='border-white border-2 rounded-lg px-4 py-1 text-white hover:bg-white hover:text-blue-800 text-2xl'
                >
                    부스 개최하러 가기
                </button>
            </Link>
        </div>
    )
}

export default HeldButton;
