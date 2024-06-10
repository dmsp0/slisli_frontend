import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MyPageSide from "./card/MyPageSide";
import MyPageButton from "../components/card/MyPageButton";
import MyProfileInfo from "../components/card/MyProfileInfo";

function MyProfileComponent({ userProfile }) {

  // 1. 상태 변수 선언 (프사, 닉넴, 이멜)
  const [profileImage, setProfileImage] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // 1-1. 프사 파일 선택 시 처리하는 함수
  const handleProfileImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setProfileImage(reader.result);
      };
    }
  };

  // 1-2. 닉넴, 이멜 변경 시 처리하는 함수
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nickname') {
      setNewNickname(value);
    } else if (name === 'email') {
      setNewEmail(value);
    }
  };

  const navigate = useNavigate();
  const handleModified = () => {
    console.log('정보 수정 완료');
    alert('정보가 수정되었습니다~.~');
    navigate('/mypage');
  };

  return (
    <div className="grid grid-cols-12 justify-center p-20">
      {/* 왼쪽 영역 */}
      <div className="col-span-3 p-2 space-y-4">
        <MyPageSide profileImage={userProfile.profileImage} nickname={userProfile.nickname} email={userProfile.email} />
        <MyPageButton />
      </div>

      {/* 세로선 */}
      <div className="col-span-1 justify-center border-l border-blue-400"></div>

      {/* 오른쪽 영역 */}
      <div className="col-start-6 col-span-7 flex flex-col items-center">
        <MyProfileInfo
          profileImage={profileImage}
          newNickname={newNickname}
          newEmail={newEmail}
          handleProfileImgChange={handleProfileImgChange}
          handleInputChange={handleInputChange}
        />

        {/* 버튼 2개 - 정보수정, 탈퇴버튼 */}
        <div className="flex justify-center space-x-10 mt-20">
          <button className="py-2 px-4 hover:bg-blue-400 text-black border-2 rounded-lg" onClick={handleModified}>정보 수정</button>
          <button className="py-2 px-4 hover:bg-red-400 text-black border-2 rounded-lg" onClick={() => alert('탈퇴하기')}>탈퇴하기</button>
        </div>
      </div>
    </div>
  );
}

export default MyProfileComponent;
