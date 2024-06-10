import React from 'react';
import profileImg from "../../img/profile.png";

// 삭제 필요_1
const userProfile = {
  // profileImage: '프사',
  nickname: '갱갱갱',
  email: 'gang@gang.com'
};

function MyPageSide() {
 
  // 삭제 필요_2
  const { profileImage, nickname, email } = userProfile;

  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <img src={profileImg} alt="프로필 이미지" className="w-32 h-32 rounded-md items-center" />
      <p className="text-lg">{nickname}</p>
      <p className="text-lg">{email}</p>
    </div>
  );
}

export default MyPageSide;
