import React, { useState } from 'react';
import axios from 'axios';
import Modal from './common/Modal';
import { useNavigate } from 'react-router-dom';
import '../../src/style/signStyle.css';

const SignUpComponent = () => {
    const [nickname, setNickname] = useState('');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const [idValid, setIdValid] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);
    const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
    const [emailValid, setEmailValid] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    const [nicknameAvailable, setNicknameAvailable] = useState(null);
    const [idAvailable, setIdAvailable] = useState(null);
    const [emailAvailable, setEmailAvailable] = useState(null);

    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const customCallback = () => {
        if (message === '회원가입 성공!') {
            navigate("/login");
        } else {
            setIsOpen(false);
        }
    }

    const handleId = (e) => {
        setId(e.target.value);
        const regex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,13}$/;
        setIdValid(regex.test(e.target.value));
        setIdAvailable(null);  // Reset availability check on change
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
        const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        setPasswordValid(regex.test(e.target.value));
        setConfirmPasswordValid(e.target.value === confirmPassword);
    };

    const handleConfirmPassword = (e) => {
        setConfirmPassword(e.target.value);
        setConfirmPasswordValid(e.target.value === password);
    };

    const handleEmail = (e) => {
        setEmail(e.target.value);
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailValid(regex.test(e.target.value));
        setEmailAvailable(null);  // Reset availability check on change
    };

    const checkNicknameAvailability = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/member/check-nickname', { nickname });
            setNicknameAvailable(response.data.available);
        } catch (error) {
            console.error('닉네임 중복 확인 오류:', error);
        }
    };

    const checkIdAvailability = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/member/check-id', { id });
            setIdAvailable(response.data.available);
        } catch (error) {
            console.error('아이디 중복 확인 오류:', error);
        }
    };

    const sendVerificationCode = async () => {
        if (!emailValid) {
            alert("유효한 이메일을 입력해주세요.");
            return;
        }
    
        try {
            // 이메일 중복 확인
            const emailCheckResponse = await axios.post('http://localhost:8080/api/member/check-email', { email });
            if (!emailCheckResponse.data.available) {
                alert("이미 존재하는 이메일입니다.");
                return;
            }
    
            // 이메일이 중복되지 않았을 때 인증번호 전송
            setVerificationSent(true); // 전송중 표시
            const verificationResponse = await axios.post('http://localhost:8080/api/member/send-verification-code', { email });
            if (verificationResponse.status === 200) {
                alert("인증번호를 전송했습니다.");
            }
        } catch (error) {
            console.error('인증 코드 발송 오류:', error);
            alert("인증번호 발송 중 오류가 발생했습니다.");
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idValid || !passwordValid || !confirmPasswordValid || !emailValid || !nicknameAvailable || !idAvailable || !emailAvailable) {
            alert("유효한 정보를 입력해주세요.");
            return;
        }
        try {
            let formData = new FormData();
            formData.append('nickname', nickname);
            formData.append('username', id);
            formData.append('password', password);
            formData.append('email', email);
            formData.append('verificationCode', verificationCode);

            const response = await axios.post('http://localhost:8080/api/member/signup', formData, {
                withCredentials: true
            });
            setMessage("회원가입 성공!");
            setIsOpen(true);
        } catch (error) {
            if (error.response.status === 400) setMessage('입력 정보를 확인해주세요.');
            else setMessage('서버 오류');
            setIsOpen(true);
            console.error('회원가입 오류:', error);
        }
    };

    return (
        <>
            {isOpen && <Modal message={message} callbackFunction={customCallback} />}
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
                        회원가입
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium leading-6 text-gray-900">
                                닉네임
                            </label>
                            <div className="mt-2 flex">
                                <input
                                    id="nickname"
                                    name="nickname"
                                    type="text"
                                    placeholder="닉네임을 입력해주세요."
                                    required
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 text-sm py-2 px-3"
                                />
                                <button
                                    type="button"
                                    onClick={checkNicknameAvailability}
                                    className="ml-2 px-4 py-2 text-sm font-semibold leading-6 text-white bg-blue-500 rounded-md hover:bg-blue-700"
                                >
                                    중복 확인
                                </button>
                            </div>
                            <div className='errorMessageWrap'>
                                {nicknameAvailable === false && <div>이미 사용 중인 닉네임입니다.</div>}
                                {nicknameAvailable === true && <div>사용 가능한 닉네임입니다.</div>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="id" className="block text-sm font-medium leading-6 text-gray-900">
                                아이디
                            </label>
                            <div className="mt-2 flex">
                                <input
                                    id="id"
                                    name="id"
                                    type="text"
                                    placeholder="아이디를 입력해주세요."
                                    required
                                    value={id}
                                    onChange={handleId}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 text-sm py-2 px-3"
                                />
                                <button
                                    type="button"
                                    onClick={checkIdAvailability}
                                    className="ml-2 px-4 py-2 text-sm font-semibold leading-6 text-white bg-blue-500 rounded-md hover:bg-blue-700"
                                >
                                    중복 확인
                                </button>
                            </div>
                            <div className='errorMessageWrap'>
                                {!idValid && id.length > 0 && <div>올바른 아이디를 입력해주세요.</div>}
                                {idAvailable === false && <div>이미 사용 중인 아이디입니다.</div>}
                                {idAvailable === true && <div>사용 가능한 아이디입니다.</div>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                비밀번호
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="비밀번호를 입력해주세요."
                                    required
                                    value={password}
                                    onChange={handlePassword}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 text-sm py-2 px-3"
                                />
                            </div>
                            <div className='errorMessageWrap'>
                                {!passwordValid && password.length > 0 && <div>특수문자/문자/숫자 포함 형태의 8~20자리로 입력해주세요.</div>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                                비밀번호 확인
                            </label>
                            <div className="mt-2">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="비밀번호를 다시 입력해주세요."
                                    required
                                    value={confirmPassword}
                                    onChange={handleConfirmPassword}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 text-sm py-2 px-3"
                                />
                            </div>
                            <div className='errorMessageWrap'>
                                {!confirmPasswordValid && confirmPassword.length > 0 && <div>비밀번호가 일치하지 않습니다.</div>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                이메일
                            </label>
                            <div className="mt-2 flex">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="ex) abc123@abc.com"
                                    required
                                    value={email}
                                    onChange={handleEmail}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 text-sm py-2 px-3"
                                />
                                <button
                                    type="button"
                                    onClick={sendVerificationCode}
                                    className="ml-2 px-4 py-2 text-sm font-semibold leading-6 text-white bg-blue-500 rounded-md hover:bg-blue-700"
                                    disabled={!emailValid || !emailAvailable} // 이메일 유효성 및 중복 확인
                                >
                                    {verificationSent ? "인증번호 전송중..." : "인증 요청"}
                                </button>
                            </div>
                            <div className='errorMessageWrap'>
                                {!emailValid && email.length > 0 && <div>유효한 이메일을 입력해주세요.</div>}
                                {emailAvailable === false && <div>이미 사용 중인 이메일입니다.</div>}
                                {emailAvailable === true && <div>사용 가능한 이메일입니다.</div>}
                            </div>
                        </div>

                        {verificationSent && (
                            <div>
                                <label htmlFor="verificationCode" className="block text-sm font-medium leading-6 text-gray-900">
                                    인증번호
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="verificationCode"
                                        name="verificationCode"
                                        type="text"
                                        placeholder="인증번호를 입력해주세요."
                                        required
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50 placeholder-gray-400 text-sm py-2 px-3"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-blue-400 px-4 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                회원가입
                            </button>
                        </div>
                    </form>

                    <p className="mt-4 text-center text-sm text-gray-500">
                        이미 실리실리 회원이신가요? <br />
                        <a href="/login" className="font-semibold leading-6 text-blue-300 hover:text-blue-600">
                            로그인하러 가기
                        </a>
                    </p>
                    <hr className="my-8" />
                    <p className="mt-4 text-center text-sm text-gray-500">
                        SNS로 간편 가입하기
                    </p>
                    <div className="flex justify-center items-center mt-3">
                        <div className='sign-up-content-sign-in-button-box'>
                            <a href='http://localhost:7777/oauth2/authorization/kakao'> <img className="w-12" src='/images/kakao-icon.png' alt="kakao" /> </a>
                            <a href='http://localhost:7777/oauth2/authorization/naver'> <img className="w-12" src='/images/naver-icon.png' alt="naver" /> </a>
                            <a href='http://localhost:7777/oauth2/authorization/google'> <img className="w-12" src='/images/google-icon.png' alt="google" /> </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SignUpComponent;
