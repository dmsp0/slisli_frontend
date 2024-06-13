import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicLayout from "../layouts/BasicLayout";
import BoothHeldComponent from '../components/BoothHeldComponent';
import MyProfileComponent from '../components/MyProfileComponent';
import FavoriteComponent from '../components/FavoriteComponent';
import ViewHistoryComponent from '../components/ViewHistoryComponent';
import profileImg from '../img/profile.png';

function MyPage() {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState(null);
    const [name, setName] = useState(null);
    const [activeTab, setActiveTab] = useState('boothheld');


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
    };

    const renderContent = () => {
        switch (activeTab) {
          case 'boothheld':
            return <BoothHeldComponent />;
          case 'mypage':
            return <MyProfileComponent userProfile={userProfile} />;
          case 'favoritelist':
            return <FavoriteComponent />;
          case 'historylist':
            return <ViewHistoryComponent />;
          default:
            return <BoothHeldComponent />;
        }
    };

    const tabStyle = (isActive) => ({
      padding: '10px 20px',
      borderBottom: isActive ? '2px solid ##1E3A8A' : '2px solid transparent',
      backgroundColor: isActive ? '#1E3A8A' : 'white',
      color: isActive ? 'white' : 'black',
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, border-bottom 0.3s ease',
      flex: 1,
      textAlign: 'center',
      margin: '0 8px',
    });

    return (
        <BasicLayout>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100vh' }}>
                <img src={profileImg} alt="프로필 이미지" className="w-32 h-32 rounded-md items-center" />
                <p className="text-lg">{userProfile.nickname}</p>
                <p className="text-lg">{userProfile.email}</p>
                <p>Logged in with token: {token}</p>



                  <div style={{ display: 'flex', width: '100%', justifyContent: 'center', listStyle: 'none', padding: 0 }}>
                  <div style={tabStyle(activeTab === 'boothheld')} onClick={() => setActiveTab('boothheld')}>부스 개최</div>
                  <div style={tabStyle(activeTab === 'mypage')} onClick={() => setActiveTab('mypage')}>내 정보</div>
                  <div style={tabStyle(activeTab === 'favoritelist')} onClick={() => setActiveTab('favoritelist')}>찜한 목록</div>
                  <div style={tabStyle(activeTab === 'historylist')} onClick={() => setActiveTab('historylist')}>시청 목록</div>
                </div>
                <div style={{ width: '100%', padding: '20px' }}>
                    {renderContent()}
                </div>
            </div>
        </BasicLayout>
    );
}

export default MyPage;