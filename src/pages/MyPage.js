import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BasicLayout from "../layouts/BasicLayout";
import BoothHeldComponent from '../components/BoothHeldComponent';
import FavoriteComponent from '../components/FavoriteComponent';
import ViewHistoryComponent from '../components/ViewHistoryComponent';
import profileImg from '../img/profile.png';
import axios from 'axios';
import { API_URLS } from "../api/apiConfig";
import { AuthContext } from '../context/AuthContext';

function MyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState(null);
    const [name, setName] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState({
        email: localStorage.getItem('email'),
        password: "",
        passwordCheck: "",
        name: ""
    });

    // Read the query parameter to set the default active tab
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
        profileImg : profileImg
    };

    const renderContent = () => {
        switch (activeTab) {
          case 'boothheld':
            return <BoothHeldComponent />;
          case 'favoritelist':
            return <FavoriteComponent />;
          case 'historylist':
            return <ViewHistoryComponent />;
          default:
            return null;
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        navigate(`?tab=${tab}`);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData({ ...data, profileImgPath: file });
    };

    const formData = new FormData();
    formData.append(
        "member_profile",
        new Blob(
            [
                JSON.stringify({
                    email: data.email,
                    password: data.password,
                    passwordCheck: data.passwordCheck,
                    name: data.name
                }),
            ],
            { type: "application/json" }
        )
    );
    formData.append("file", data.profileImgPath);

    const handleModified = async (e) => {
        e.preventDefault();

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
                setShowEditForm(false);
                setName(data.name);
                setEmail(data.email);
                navigate('/mypage');
            } else {
                alert(`정보 수정에 실패했습니다. ${response.data.message}`);
            }
        } catch (error) {
            alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        }
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

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
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
                            <br/>
                            <p className="text-lg">닉네임 
                              <br/>{userProfile.nickname}</p>
                            <br/>
                            <p className="text-md">{userProfile.email}</p>
                            {!showEditForm && (
                                <div className="flex justify-center space-x-4 mt-6">
                                    <button className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={() => setShowEditForm(true)}>
                                        정보 수정
                                    </button>
                                    <button className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={openModal}>
                                        탈퇴하기
                                    </button>
                                    <button className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600" onClick={logout}>
                                        로그아웃
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {showEditForm && (
                        <form onSubmit={handleModified} className="mt-4 p-4 bg-white border border-gray-300 rounded-lg shadow-md">
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

                            <div className="mb-4 flex flex-col items-start">
                                <label className="text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                    새 비밀번호
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    value={data.password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            <div className="mb-4 flex flex-col items-start">
                                <label className="text-gray-700 text-sm font-bold mb-2" htmlFor="passwordCheck">
                                    새 비밀번호 확인
                                </label>
                                <input
                                    type="password"
                                    name="passwordCheck"
                                    id="passwordCheck"
                                    value={data.passwordCheck}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
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
                                    type="submit"
                                    className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    정보 수정 완료
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <p>탈퇴하시겠습니까?</p>
                            <div className="mt-4 flex justify-end">
                                <button
                                    className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-black rounded-lg mr-2"
                                    onClick={closeModal}
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
