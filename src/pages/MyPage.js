// MyPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BasicLayout from "../layouts/BasicLayout";
import profileImg from '../img/profile.png';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import FavoriteList from '../components/card/FavoriteList';
import BoothHeldForm from '../components/card/BoothHeldForm';
import MyBoothList from '../components/card/MyBoothList';
import ProfileUpdate from '../components/card/ProfileUpdate';

function MyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState(null);
    const [name, setName] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'favoritelist';
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        const storedEmail = localStorage.getItem('email');
        const storedName = localStorage.getItem('name');

        if (storedToken) {
            setToken(storedToken);
            setEmail(storedEmail);
            setName(storedName);
        } else {
            alert('로그인이 필요합니다.');
            navigate('/login');
        }
    }, [navigate]);

    const userProfile = {
        nickname: name,
        email: email,
        profileImg: profileImg
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'boothheld':
                return <BoothHeldForm />;
            case 'favoritelist':
                return <FavoriteList />;
            case 'historylist':
                return <MyBoothList />;
            default:
                return null;
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        navigate(`?tab=${tab}`);
    };

    const setUserData = (data) => {
        setName(data.name);
        setEmail(data.email);
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/delete', {
                member_id: localStorage.getItem('member_id')
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (response.status === 200) {
                alert('탈퇴완료');
                logout();
                navigate('/');
            } else {
                alert(`탈퇴에 실패했습니다. ${response.data.message}`);
            }
        } catch (error) {
            alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const openDeleteModal = () => {
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
    };
    
    const openLogoutModal = () => {
        setShowLogoutModal(true);
    };

    const closeLogoutModal = () => {
        setShowLogoutModal(false);
    };

    return (
        <BasicLayout>
            <div className="bg-gradient-to-b from-blue-900 to-blue-100 w-full min-h-screen flex flex-col items-center pt-10">
                <div className="bg-white w-full md:w-1/2 p-5 shadow-md rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center w-full h-auto bg-white rounded-md">
                        <div className="flex justify-center md:justify-center md:mr-8">
                            <img src={userProfile.profileImg} alt="프로필 이미지" className="w-40 h-40 rounded-md" />
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <br />
                            <p className="text-lg">닉네임
                                <br />{userProfile.nickname}</p>
                            <br />
                            <p className="text-md">{userProfile.email}</p>
                            {!showEditForm && (
                                <div className="flex justify-center space-x-4 mt-6">
                                    <button className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={() => setShowEditForm(true)}>
                                        정보 수정
                                    </button>
                                    <button className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={openDeleteModal}>
                                        탈퇴하기
                                    </button>
                                    <button className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600" onClick={openLogoutModal}>
                                        로그아웃
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {showEditForm && (
                        <ProfileUpdate
                            userData={{ name, email }}
                            setUserData={setUserData}
                            closeEditForm={() => setShowEditForm(false)}
                            navigate={navigate}
                        />
                    )}
                </div>
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <p>탈퇴하시겠습니까?</p>
                            <div className="mt-4 flex justify-end">
                                <button
                                    className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-black rounded-lg mr-2"
                                    onClick={closeDeleteModal}
                                >
                                    아니오
                                </button>
                                <button
                                    className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                    onClick={handleDelete}
                                >
                                    네
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {showLogoutModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <p>로그아웃 하시겠습니까?</p>
                            <div className="mt-4 flex justify-end">
                                <button
                                    className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-black rounded-lg mr-2"
                                    onClick={closeLogoutModal}
                                >
                                    아니오
                                </button>
                                <button
                                    className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                    onClick={logout}
                                >
                                    네
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="bg-white w-full md:w-1/2 mt-5 shadow-md rounded-md">
                    <div className="flex justify-center w-full p-0">
                        <div className="w-full flex justify-around list-none bg-white rounded-md">
                            <div
                                className={`flex-1 p-2 border-b-2 cursor-pointer transition-colors duration-300 text-center rounded-tl-md ${activeTab === 'favoritelist' ? 'border-blue-900 bg-blue-900 text-white' : 'border-transparent bg-white text-black'}`}
                                onClick={() => handleTabClick('favoritelist')}
                            >
                                좋아요 목록
                            </div>
                            <div
                                className={`flex-1 p-2 border-b-2 cursor-pointer transition-colors duration-300 text-center ${activeTab === 'boothheld' ? 'border-blue-900 bg-blue-900 text-white' : 'border-transparent bg-white text-black'}`}
                                onClick={() => handleTabClick('boothheld')}
                            >
                                부스 등록
                            </div>
                            <div
                                className={`flex-1 p-2 border-b-2 cursor-pointer transition-colors duration-300 text-center rounded-tr-md ${activeTab === 'historylist' ? 'border-blue-900 bg-blue-900 text-white' : 'border-transparent bg-white text-black'}`}
                                onClick={() => handleTabClick('historylist')}
                            >
                                시청 목록
                            </div>
                        </div>
                    </div>
                    <div className="w-full p-5 bg-white rounded-md">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </BasicLayout>
    );
}

export default MyPage;
