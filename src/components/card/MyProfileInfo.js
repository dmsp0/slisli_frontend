import React from 'react';

function ProfileInfo({ profileImage, newNickname, newEmail, handleProfileImgChange, handleInputChange }) {
  return (
    <div className="flex flex-col items-start space-y-3">
      <h2 className="text-2xl mb-10" style={{ marginBottom: "50px", marginLeft: "180px" }}>내 정보</h2>

      {/* 프로필 사진 수정 */}
      <div className="flex items-center">
        <p className="text-lg text-left mr-4">프로필사진 : </p>
        <div className="col ml-1">
          <img src={profileImage} alt="프로필 이미지" className="w-32 h-32 rounded-md items-center mr-2" />
          <input type="file" onChange={handleProfileImgChange} className="border rounded-md px-2 py-1 mb-4" />
        </div>
      </div>

      {/* 닉네임 수정 */}
      <div className="flex items-center">
        <p className="text-lg text-left mr-4">닉네임 : </p>
        <div className="ml-10"> {/* 왼쪽 마진을 파일 추가 박스와 동일하게 설정 */}
          <input type="text" name="nickname" value={newNickname} onChange={handleInputChange} className="border rounded-md px-2 py-1 mb-4" />
        </div>
      </div>

      {/* 이메일 수정 */}
      <div className="flex items-center">
        <p className="text-lg text-left mr-4">이메일 : </p>
        <div className="ml-10"> {/* 왼쪽 마진을 파일 추가 박스와 동일하게 설정 */}
          <input type="text" name="email" value={newEmail} onChange={handleInputChange} className="border rounded-md px-2 py-1" />
        </div>
      </div>
    </div>
  );
}

export default ProfileInfo;
