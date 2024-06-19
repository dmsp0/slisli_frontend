import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import { useNavigate } from 'react-router-dom';
import './signStyle.css';
import { API_URLS } from '../../api/apiConfig';

const LoginComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [emailValid, setEmailValid] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);

    const [userName, setUserName] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const handleEmail = (e) => {
        setEmail(e.target.value);
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setEmailValid(emailRegex.test(e.target.value));
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
        setPasswordValid(e.target.value.length >= 8 && e.target.value.length <= 20);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailValid || !passwordValid) {
            alert("유효한 아이디와 비밀번호를 입력해주세요.");
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

        setShowModal(true);
            
            
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setMessage('이메일 혹은 비밀번호가 틀렸습니다.');
                setShowErrorModal(true);
            } else {
                setMessage('서버 오류');
            }
            console.error('로그인 오류:', error);
        }
    };
    
    const closeModal = () => {
        setUserName(userName);
        setShowModal(false);
        navigate('/');
    };

    const closeErrorModal = ()=>{
        setShowErrorModal(false);
    }
    

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

                {/* 로그인 버튼 */}
                <div>
                    <button
                        type="submit"
                        className="mt-6 flex w-full justify-center rounded-md bg-blue-400 px-4 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        로그인하기
                    </button>
                </div>
            </form>

            {/* SNS 로그인 옵션 */}
            <hr className="my-8" />
            <p className="mt-4 text-center text-sm text-gray-500">
                SNS 계정으로 회원가입하기
            </p>
            <div className="flex justify-center items-center mt-3">
                <div className='sign-up-content-sign-in-button-box'>
                    <a href='/api/auth/kakao'> <img className="w-12" src='/images/kakao-icon.png' alt="Kakao" /> </a>
                    <a href='/oauth2/authorization/naver'> <img className="w-12" src='/images/naver-icon.png' alt="Naver" /> </a>
                    <a href='/oauth2/authorization/google'> <img className="w-12" src='/images/google-icon.png' alt="Google" /> </a>
                </div>
            </div>

            {/* 로그인 성공 모달 */}
            {showModal && (
                <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-md mx-auto">
                        <p>로그인 성공!</p>
                        <p>{`${localStorage.getItem('name')}님 환영합니다!`}</p>
                        <div className="mt-4 flex justify-end mx-auto">
                            <button
                                className="py-2 px-4 bg-blue-400 hover:bg-blue-500 text-white rounded-lg mr-2 mx-auto"
                                onClick={closeModal} // 모달 닫기 함수 호출
                            >
                                안녕하세요!
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* 로그인 실패 모달 */}
            {showErrorModal && (
                <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-md mx-auto">
                        <p>이메일 혹은 비밀번호가 틀렸습니다.</p>
                        <div className="mt-4 flex justify-end mx-auto">
                            <button
                                className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-black rounded-lg mr-2 mx-auto"
                                onClick={closeModal} // 모달 닫기 함수 호출
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LoginComponent;
