import React, { useState } from 'react';
import './button.css';
import LoginComponent from './LoginComponent';
import SignupComponent from './SignupComponent';
import { motion, Variants } from "framer-motion";
import { GoX,GoSquare,GoDash } from "react-icons/go";

const SignInUp = () => {
    const [showLogin, setShowLogin] = useState(true); // 현재 표시할 컴포넌트 상태
    const [activeButton, setActiveButton] = useState(true); // 현재 선택된 버튼 상태

    // 로그인과 회원가입 버튼 클릭 핸들러
    const handleButtonClick = (isLogin) => {
        setShowLogin(isLogin); // 현재 표시할 컴포넌트 설정
        setActiveButton(isLogin); // 현재 선택된 버튼 설정
    };

    const cardVariants = {
      offscreen: {
        y: 300
      },
      onscreen: {
        y: 0,
        transition: {
          type: "spring",
          bounce: 0.4,
          duration: 0.8
        }
      }
    };

    function Card({ content }) {
      return (
        <motion.div
          className="card-container"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.8 }}
        >
          <div className="splash" />
          <motion.div className="card" variants={cardVariants}>
            {content}
          </motion.div>
        </motion.div>
      );
    }

    return (
        <div className='bg-gradient-to-br from-blue-900 to-blue-200 h-auto'>
            <div className="monitor flex justify-center items-center" style={{ backgroundImage: `url('/images/monitor.svg')` }} >
                <div className='w-full sm:max-w-sm md:max-w-md -mt-48'>
                    
                    <Card content={
                      <>
                    <div className='flex flex-col justify-between mt-14 -mb-5'>
                        <div className='flex -mb-7 z-10'>
                            {/* 버튼 클릭 상태에 따라 스타일 변경 */}
                            <button className={`rounded-t-lg py-3 px-5 shadow-inner justify-center items-center ${activeButton ? 'bg-white hover:' : 'bg-blue-400 hover:bg-blue-500 text-white'}`} onClick={() => handleButtonClick(true)}>로그인</button>
                            <button className={`rounded-t-lg py-3 px-5 shadow-inner justify-center items-center ${!activeButton ? 'bg-white' : 'bg-blue-400 hover:bg-blue-500 text-white'}`} onClick={() => handleButtonClick(false)}>회원가입</button>
                        </div>
                        <div className='pr-2 flex justify-end items-center bg-blue-400 align-bottom h-7 w-full rounded-tr-lg'>
                          <GoDash color='white'/>
                          <GoSquare color='white' />
                          <GoX color='white' />
                        </div>
                    </div>
                      <div className="bg-white shadow-md rounded-lg px-8 pb-8 pt-12">
                        {/* 상태에 따라 표시할 컴포넌트 변경 */}
                        {showLogin ? <LoginComponent /> : <SignupComponent />}
                    </div>
                    </>
                  } />
                </div>
            </div>
        </div>
    );
}

export default SignInUp;
