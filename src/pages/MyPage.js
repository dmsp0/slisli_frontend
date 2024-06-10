import React from 'react';
import { useNavigate } from 'react-router-dom';
import BasicLayout from "../layouts/BasicLayout";
import MyProfileComponent from "../components/MyProfileComponent";

function MyPage() {
  
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('로그아웃되었습니다;');
    alert('로그아웃되었습니다.\n메인페이지로 이동~.~');
    navigate('/');
  };

  // 삭제 필요
  const userProfile = {
    profileImage: '프사',
    nickname: '갱갱갱',
    email: 'gang@gang.com'
  };
  
  return (
    <>
      <BasicLayout>
        <MyProfileComponent userProfile={userProfile} handleLogout={handleLogout} />
      </BasicLayout>
    </>
  );
}

export default MyPage;
