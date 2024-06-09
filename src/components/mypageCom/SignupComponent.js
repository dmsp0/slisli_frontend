import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './signStyle.css';

const SignupComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [inputCode, setInputCode] = useState('');

    const [emailValid, setEmailValid] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);
    const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false);
    const [codeValid, setCodeValid] = useState(false);

    const navigate = useNavigate();

    const handleEmail = (e) => {
        setEmail(e.target.value);
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (emailRegex.test(e.target.value)) {
            setEmailValid(true);
            setEmailChecked(false);
            setCodeValid(false);
        } else {
            setEmailValid(false);
        }
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
        const regex = /^[A-Za-z\d@$!%*?&]{8,20}$/;  // 완화된 비밀번호 정규식
        if (regex.test(e.target.value)) {
            setPasswordValid(true);
        } else {
            setPasswordValid(false);
        }

        if (e.target.value === confirmPassword) {
            setConfirmPasswordValid(true);
        } else {
            setConfirmPasswordValid(false);
        }
    };

    const handleConfirmPassword = (e) => {
        setConfirmPassword(e.target.value);
        if (e.target.value === password) {
            setConfirmPasswordValid(true);
        } else {
            setConfirmPasswordValid(false);
        }
    };

    const handleName = (e) => {
        setName(e.target.value);
    };

    const handleEmailVerification = async () => {
        if (!emailValid) {
            alert("유효한 이메일을 입력해주세요.");
            return;
        }
    
        try {
            const response = await axios.post('/auth/send-code', { email });
            if (response.status === 200) {
                alert("이메일을 전송했습니다.");
                setEmailChecked(true);
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                alert("이미 사용 중인 이메일입니다.");
            } else {
                alert("이메일 확인 중 오류가 발생했습니다.");
            }
            console.error('이메일 확인 오류:', error);
        }
    };
    
    const handleCodeVerification = async () => {
        if (!emailChecked || !inputCode) {
            alert("이메일 인증번호를 입력해주세요.");
            return;
        }
    
        try {
            const response = await axios.post('/auth/verify-code', { email, code: inputCode });
            if (response.status === 200) {
                alert("인증번호가 확인되었습니다.");
                setCodeValid(true);
            }
        } catch (error) {
            alert("인증번호가 유효하지 않습니다.");
            console.error('인증번호 확인 오류:', error);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailValid || !passwordValid || !confirmPasswordValid || !emailChecked || !codeValid) {
            alert("유효한 이메일, 비밀번호, 비밀번호 확인을 입력하고, 이메일 인증을 완료해주세요.");
            return;
        }
    
        try {
            const response = await axios.post('/signup', {
                email,
                password,
                passwordCheck: confirmPassword,
                name,
                verificationCode: inputCode
            });
    
            alert("회원가입 성공!");
            navigate("/");
        } catch (error) {
            if (error.response && error.response.status === 401) {
                alert('아이디 혹은 비밀번호가 틀렸습니다.');
            } else {
                alert('서버 오류');
            }
            console.error('회원가입 오류:', error);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                            이름
                        </label>
                    </div>
                    <div className="mt-2">
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="이름을 입력하세요"
                            autoComplete="name"
                            required
                            value={name}
                            onChange={handleName}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 text-sm py-2 px-3"
                        />
                    </div>
                </div>

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
                            className="block w-3/4 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 text-sm py-2 px-3"
                        />
                        <button type="button" onClick={handleEmailVerification} className="w-1/4 bg-blue-400 text-white hover:bg-blue-500 rounded-md text-sm">이메일 인증</button>
                    </div>
                </div>

                <div className='errorMessageWrap'>
                    {!emailValid && email.length > 0 && (
                        <div>올바른 이메일을 입력해주세요.</div>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="verificationCode" className="block text-sm font-medium leading-6 text-gray-900">
                            인증번호
                        </label>
                    </div>
                    <div className="mt-2 flex gap-2">
                        <input
                            id="verificationCode"
                            name="verificationCode"
                            type="text"
                            placeholder="인증번호를 입력하세요"
                            required
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            className="block w-3/4 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 text-sm py-2 px-3"
                        />
                        <button type="button" onClick={handleCodeVerification} className="w-1/4 bg-blue-400 text-white hover:bg-blue-500 rounded-md text-sm">인증번호 확인</button>
                    </div>
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
                            <div>8~20자리로 입력해주세요.</div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                            비밀번호 확인
                        </label>
                    </div>
                    <div className="mt-2">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="비밀번호를 다시 입력하세요"
                            autoComplete="current-password"
                            required
                            value={confirmPassword}
                            onChange={handleConfirmPassword}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 text-sm py-2 px-3"
                        />
                    </div>
                    <div className='errorMessageWrap'>
                        {!confirmPasswordValid && confirmPassword.length > 0 && (
                            <div>비밀번호가 일치하지 않습니다.</div>
                        )}
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        className="mt-6 flex w-full justify-center rounded-md bg-blue-400 px-4 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        회원가입하기
                    </button>
                </div>
            </form>
        </>
    );
};

export default SignupComponent;
