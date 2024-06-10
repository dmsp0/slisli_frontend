import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import { useNavigate } from 'react-router-dom';
import './signStyle.css';

const LoginComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [emailValid, setEmailValid] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const customCallback = () => {
        if (message === '로그인 성공!') {
            navigate("/")
        } else {
            setIsOpen(false)
        }
    }

    const handleEmail = (e) => {
        setEmail(e.target.value);
        const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
        if (emailRegex.test(e.target.value)) {
            setEmailValid(true);
        } else {
            setEmailValid(false);
        }
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
        if (e.target.value.length >= 8 && e.target.value.length <= 20) {
            setPasswordValid(true);
        } else {
            setPasswordValid(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailValid || !passwordValid) {
            alert("유효한 아이디와 비밀번호를 입력해주세요.");
            return;
        }

        try {
            const response = await axios.post('/login', {
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            alert("로그인 성공!")
            setIsOpen(true)
            localStorage.setItem('access', response.data.token);
            window.location.href = "/";
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setMessage('이메일 혹은 비밀번호가 틀렸습니다.');
            } else {
                setMessage('서버 오류');
            }
            setIsOpen(true);
            console.error('로그인 오류:', error);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                <div className='errorMessageWrap'>
                    {!emailValid && email.length > 0 && (
                        <div>올바른 이메일을 입력해주세요.</div>
                    )}
                </div>

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
                    <div className='errorMessageWrap'>
                        {!passwordValid && password.length > 0 && (
                            <div>8~20자리의 비밀번호를 입력해주세요.</div>
                        )}
                    </div>
                </div>

                <div>
                    <button
                        onClick={handleSubmit}
                        type="submit"
                        className="mt-6 flex w-full justify-center rounded-md bg-blue-400 px-4 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        로그인하기
                    </button>
                </div>
            </form>

            <hr className="my-8" />
            <p className="mt-4 text-center text-sm text-gray-500">
                SNS 계정으로 회원가입하기
            </p>
            <div className="flex justify-center items-center mt-3">
                <div className='sign-up-content-sign-in-button-box'>
                    <a href='/oauth2/authorization/kakao'> <img className="w-12" src='/images/kakao-icon.png' /> </a>
                    <a href='/oauth2/authorization/naver'> <img className="w-12" src='/images/naver-icon.png' /> </a>
                    <a href='/oauth2/authorization/google'> <img className="w-12" src='/images/google-icon.png' /> </a>
                </div>
            </div>
        </>
    );
}

export default LoginComponent;
