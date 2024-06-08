import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import { useNavigate } from 'react-router-dom';
import './signStyle.css';


const LoginComponent = () => {
    // 아이디와 비밀번호를 상태로 관리합니다
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [emailValid, setEmailValid] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const customCallback = ()=>{
        if(message === '로그인 성공!'){
            navigate("/")
        } else{
            setIsOpen(false)
        }
    }
    
  // 아이디 입력 시 상태 업데이트 핸들러
  const handleEmail = (e) => {
    setEmail(e.target.value);
    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(e.target.value)) {
      setEmailValid(true);
    } else {
      setEmailValid(false);
    }
  };

  // 비밀번호 입력 시 상태 업데이트 핸들러
  const handlePassword = (e) => {
    setPassword(e.target.value);
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/; // 비밀번호 정규식 : 특수문자/문자/숫자 포함 형태의 8~20자리
    if (regex.test(e.target.value)) {
      setPasswordValid(true);
    } else {
      setPasswordValid(false);
    }
  };

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailValid || !passwordValid) {
            alert("유효한 아이디와 비밀번호를 입력해주세요.");
            return;
        }

        try {
            let formData= new FormData();
            formData.append('email', email);
            formData.append('password',password);
            const response = await axios.post('http://localhost:8080/member/login', formData,{
                withCredentials: true // 자격 증명을 포함하여 요청
              });
            // 로그인 성공 처리
            setMessage("로그인 성공!")
            setIsOpen(true)
            // 사용자 정보를 로컬 스토리지에 저장하거나 상태로 관리합니다.
            localStorage.setItem('access', response.headers.get('access'));

            
        } catch (error) {
            if (error.response.status === 401) setMessage('이메일 혹은 비밀번호가 틀렸습니다.');
            else setMessage('서버 오류')
            setIsOpen(true)
            console.error('로그인 오류:', error);

        }
    };

    return (
        <>
        <form onSubmit={handleSubmit} className="space-y-5">

        {/* 이메일 */}
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
            {
                !emailValid && email.length > 0 &&(
                    <div>올바른 이메일을 입력해주세요.</div>
                )
            }
        </div>

        {/* 비밀번호 */}
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
            {
                !passwordValid && password.length > 0 &&(
                    <div>특수문자와 숫자 포함 형태의 8~20자리로 입력해주세요.</div>
                )
            }
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
        <a href='http://localhost:8080/oauth2/authorization/kakao'> <img className="w-12" src='/images/kakao-icon.png'/> </a>
        <a href='http://localhost:8080/oauth2/authorization/naver'> <img className="w-12" src='/images/naver-icon.png'/> </a>
        <a href='http://localhost:8080/oauth2/authorization/google'> <img className="w-12" src='/images/google-icon.png'/> </a>
    </div>
    </div>
    </>
    );
}

export default LoginComponent;