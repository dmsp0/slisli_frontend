import React, { useState } from 'react';
import axios from 'axios';
import { API_URLS } from "../../api/apiConfig";

const ProfileUpdate = ({ userData, setUserData, closeEditForm, navigate }) => {
    const [data, setData] = useState({
        email: userData.email,
        password: "",
        passwordCheck: "",
        name: userData.name,
        profileImgPath: null
    });

    const [passwordValid, setPasswordValid] = useState(false);
    const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

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

    const handleModified = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const filteredData = {
            email: data.email,
            ...(data.password && { password: data.password }),
            ...(data.passwordCheck && { passwordCheck: data.passwordCheck }),
            ...(data.name && { name: data.name })
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

            if (response.status === 200) {
                alert('정보가 성공적으로 수정되었습니다.');
                setUserData({ ...userData, name: data.name, email: data.email });
                closeEditForm();
                navigate('/mypage');
            } else {
                alert(`정보 수정에 실패했습니다. ${response.data.message}`);
            }
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

    return (
        <form className="mt-4 p-4 bg-white border border-gray-300 rounded-lg shadow-md">
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
                    onClick={openUpdateModal}
                    className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
            </div>
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p>수정하시겠습니까?</p>
                        <div className="mt-4 flex justify-end">
                            <button
                                className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-black rounded-lg mr-2"
                                onClick={closeUpdateModal}
                            >
                                아니오
                            </button>
                            <button
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