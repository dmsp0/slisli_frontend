import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URLS } from "../../api/apiConfig";
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css'

const ProfileUpdate = ({ closeEditForm }) => {
    const navigate = useNavigate();

    const [data, setData] = useState({
        email: localStorage.getItem('email'),
        password: "",
        passwordCheck: "",
        name: localStorage.getItem('name'),
        profileImgPath: localStorage.getItem('profileImgPath')
    });

    const [passwordValid, setPasswordValid] = useState(false);
    const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [formValid, setFormValid] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const handlePassword = (e) => {
        const value = e.target.value;
        setData({ ...data, password: value });
        const regex = /^[A-Za-z\d@$!%*?&]{8,20}$/;
        setPasswordValid(regex.test(value));
        setConfirmPasswordValid(value === data.passwordCheck);
    };

    const handleConfirmPassword = (e) => {
        const value = e.target.value;
        setData({ ...data, passwordCheck: value });
        setConfirmPasswordValid(value === data.password);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData({ ...data, profileImgPath: file });
    };

    useEffect(() => {
        const isFormValid = data.name && data.password && data.passwordCheck && passwordValid && confirmPasswordValid;
        setFormValid(isFormValid);
    }, [data, passwordValid, confirmPasswordValid]);

    const handleModified = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        const filteredData = {
            email: data.email,
            password:data.password,
            passwordCheck:data.passwordCheck,
            name:data.name
        };
        formData.append(
            "member_profile",
            new Blob(
                [
                    JSON.stringify(filteredData),
                ],
                { type: "application/json" }
            )
        );
        formData.append("file", data.profileImgPath);

        try {
            const response = await axios.post(API_URLS.MEMBER_UPDATE, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Accept': 'application/json'
                },
                withCredentials: true
            });

            const { profileImgPath } = response.data;

        localStorage.setItem('email', data.email);
        localStorage.setItem('name', data.name);
        localStorage.setItem('profileImgPath', profileImgPath); // 프로필 이미지 경로 저장

        setShowUpdateModal(false);
        closeEditForm();
        navigate('/myPage');

        } catch (error) {
            alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const openUpdateModal = () => {
        setShowUpdateModal(true);
    };

    const closeUpdateModal = () => {
        setShowUpdateModal(false);
    };

    useEffect(() => {
        if (showUpdateModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showUpdateModal]);

    return (
        <form className="mt-4 p-4 bg-white border rounded-lg shadow-md">
            <div className="mb-4 flex flex-col items-start">
                <label className="text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    닉네임
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={data.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                />
            </div>

            <div className="flex flex-col items-start">
                <label className="text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    새 비밀번호
                </label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    value={data.password}
                    onChange={handlePassword}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                />
            </div>
            <div className='mb-4 errorMessageWrap text-sm text-red-400'>
                {!passwordValid && data.password.length > 0 && (
                    <div>8~20자리로 입력해주세요.</div>
                )}
            </div>
            <div className=" flex flex-col items-start">
                <label className="text-gray-700 text-sm font-bold mb-2" htmlFor="passwordCheck">
                    새 비밀번호 확인
                </label>
                <input
                    type="password"
                    name="passwordCheck"
                    id="passwordCheck"
                    value={data.passwordCheck}
                    onChange={handleConfirmPassword}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                />
            </div>
            <div className='mb-4 errorMessageWrap text-sm text-red-400'>
                {!confirmPasswordValid && data.passwordCheck.length > 0 && (
                    <div>비밀번호가 일치하지 않습니다.</div>
                )}
            </div>
            <div className="mb-4 flex flex-col items-start">
                <label className="text-gray-700 text-sm font-bold mb-2" htmlFor="imgPath">
                    프로필 이미지
                </label>
                <input
                    type="file"
                    name="imgPath"
                    id="imgPath"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border rounded-lg"
                />
            </div>

            <div className="flex justify-center space-x-4 mt-6">
            <button
                    data-tooltip-content='필수 입력사항을 입력해주세요' 
                    data-tooltip-id={`${formValid ? '' : 'tooltip'}`}
                    type="button"
                    onClick={openUpdateModal}
                    className={`py-2 px-4 ${formValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300'} text-white rounded-lg`}
                    disabled={!formValid}
                >
                    정보 수정
                </button>
                <button
                    type="button"
                    onClick={closeEditForm}
                    className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                    뒤로가기
                </button>
                <Tooltip
                        id='tooltip'
                        place="top"
                        style={{ backgroundColor: "rgb(051, 102, 204)", color: "#ffffff" , borderRadius: "10px"}}
                        />
            </div>


            {showUpdateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p>수정하시겠습니까?</p>
                        <div className="mt-4 flex justify-end">
                            <button
                            type="button"
                                className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-black rounded-lg mr-2"
                                onClick={closeUpdateModal}
                            >
                                아니오
                            </button>
                            <button
                            type="button"
                                className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                onClick={handleModified}
                            >
                                네
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

export default ProfileUpdate;