import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './signStyle.css';
import { API_URLS } from '../../api/apiConfig';
import Modal from '../common/Modal';
import { BsChatFill } from "react-icons/bs";

const LoginComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [emailValid, setEmailValid] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);

    const [rememberMe, setRememberMe] = useState(false);

    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [onSuccess, setOnSuccess] = useState(false);

    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
            setEmailValid(true); // 이미 저장된 이메일은 유효한 것으로 간주합니다.
        }
    }, []);

    const handleEmail = (e) => {
        setEmail(e.target.value);
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setEmailValid(emailRegex.test(e.target.value));
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
        setPasswordValid(e.target.value.length >= 8 && e.target.value.length <= 20);
    };

    const handleRememberMe = (e) => {
        setRememberMe(e.target.checked);
        if (!e.target.checked) {
            localStorage.removeItem('rememberedEmail');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailValid || !passwordValid) {
            setMessage("유효한 아이디와 비밀번호를 입력해주세요.");
            setShowErrorModal(true);
            return;
        }
    
        try {
            const response = await axios.post(API_URLS.LOG_IN, {
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
    
            const { token: accessToken, refreshToken, member_id, email: userEmail, name: userName, profileImgPath } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('email', userEmail);
            localStorage.setItem('name', userName);
            localStorage.setItem('member_id', member_id);
            localStorage.setItem('profileImgPath', profileImgPath); // 프로필 이미지 경로 저장

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', userEmail);
            }

            setOnSuccess(true); // 성공 상태 설정
            setMessage(`${userName}님 환영합니다!`);
            setShowModal(true);
            
            
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setMessage('이메일 혹은 비밀번호가 틀렸습니다.');
                setShowErrorModal(true);
            } else {
                setMessage('서버 오류');
                setShowErrorModal(true);
            }
            console.error('로그인 오류:', error);
        }
    };


    const closeModal = () => {
        setShowModal(false);
        if (onSuccess) {
            window.location.href = "/"
        }
    };

    const closeErrorModal = ()=>{
        setShowErrorModal(false);
    }

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal]);

    useEffect(() => {
        if (showErrorModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showErrorModal]);

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* 이메일 입력란 */}
                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            이메일
                        </label>
                    </div>
                    <div className="mt-2 flex gap-2">
                        <input
                            id="email"
                            name="email"
                            type="text"
                            placeholder="이메일을 입력하세요"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={handleEmail}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 text-sm py-2 px-3"
                        />
                    </div>
                </div>
                {/* 이메일 유효성 오류 메시지 */}
                <div className='errorMessageWrap'>
                    {!emailValid && email.length > 0 && (
                        <div>올바른 이메일을 입력해주세요.</div>
                    )}
                </div>

                {/* 비밀번호 입력란 */}
                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                            비밀번호
                        </label>
                    </div>
                    <div className="mt-2">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={handlePassword}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 text-sm py-2 px-3"
                        />
                    </div>
                    {/* 비밀번호 유효성 오류 메시지 */}
                    <div className='errorMessageWrap'>
                        {!passwordValid && password.length > 0 && (
                            <div>8~20자리의 비밀번호를 입력해주세요.</div>
                        )}
                    </div>
                </div>

                {/* 이메일 기억하기 체크박스 */}
                <div className="flex items-center">
                    <input
                        id="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={handleRememberMe}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                        이메일 기억하기
                    </label>
                </div>

                {/* 로그인 버튼 */}
                <div>
                    <button
                        type="submit"
                        className="mt-6 flex w-full justify-center rounded-md bg-blue-400 px-4 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 "
                    >
                        로그인하기
                    </button>
                </div>
            </form>

            {/* SNS 로그인 옵션 */}
            <hr className="my-8" />
                <p className="text-center text-sm text-gray-500">
                    SNS 계정으로 회원가입하기
                </p>
            <div className="justify-centeritems-center mt-2">
                    {/*<a href='/api/auth/kakao'>*/} 
                    <a href='http://localhost:8080/api/auth/kakao'>
                    <button
                        type="button"
                        className="relative flex w-full justify-center rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold leading-6 text-gray-700 shadow-sm hover:bg-yellow-300 text-center items-center"
                    >
                        <BsChatFill className='absolute left-5' size={20}/>
                        <span className='text-center'>카카오 로그인</span>
                    </button> 
                    </a>
            </div>

            {/* 로그인 성공 모달 */}
            {showModal && (
                <Modal message={message} callbackFunction={closeModal} />
            )}
            {/* 로그인 실패 모달 */}
            {showErrorModal && (
                <Modal message={message} callbackFunction={closeErrorModal} />
            )}
        </>
    );
};

export default LoginComponent;