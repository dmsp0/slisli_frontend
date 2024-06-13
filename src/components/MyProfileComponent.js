import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import profileImg from '../img/profile.png'; // Ensure the correct path to the profile image
import { API_URLS } from "../api/apiConfig";

function MyProfileComponent({ userProfile }) {
  const [data, setData] = useState({
    email:localStorage.getItem('email'),
    password: "",
    passwordCheck: "",
    name: "",
  });
  const [showModal, setShowModal] = useState(false);
  const {logout}=useContext(AuthContext);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // 1-2. 변경 시 처리하는 함수
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({...data,[name]:value});
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


  const navigate = useNavigate();

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

      console.log('응답:', response.data);

      if (response.status === 200) {
          console.log('정보 수정 완료');
          alert('정보가 성공적으로 수정되었습니다.');
          navigate('/mypage');
      } else {
          console.error('에러:', response.data);
          alert(`정보 수정에 실패했습니다. ${response.data.message}`);
      }
  } catch (error) {
      console.error('네트워크 에러:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
  }
};

const handleDelete = async (e) => {
  e.preventDefault();
  try{
    const response = await axios.post('/delete',{
      member_id:localStorage.getItem('member_id')
    },{
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
    });
    console.log('응답:', response.data);

      if (response.status === 200) {
          console.log('탈퇴 완료');
          alert('탈퇴완료');
          logout();
          navigate('/');
      } else {
          console.error('에러:', response.data);
          alert(`탈퇴에 실패했습니다. ${response.data.message}`);
  }
}catch (error) {
  console.error('네트워크 에러:', error);
  alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
}
};

  return (
    <div className="flex flex-col items-center text-center p-20 space-y-10">
<form
        onSubmit={handleModified}
        className="max-w-xl mx-auto p-6 bg-white border border-gray-300 rounded-lg shadow-md"
      >
        {/* 닉네임 수정 */}
      <div className="flex items-center">
        <p className="text-lg text-left mr-4">닉네임 : </p>
        <div className="ml-10"> {/* 왼쪽 마진을 파일 추가 박스와 동일하게 설정 */}
          <input type="text" name="name" value={data.name} onChange={handleInputChange} className="border rounded-md px-2 py-1 mb-4" />
        </div>
      </div>

      {/* 비밀번호 확인 */}
      <div className="flex items-center">
        <p className="text-lg text-left mr-4">새 비밀번호 : </p>
        <div className="ml-10"> {/* 왼쪽 마진을 파일 추가 박스와 동일하게 설정 */}
          <input type="password" name="password" value={data.password} onChange={handleInputChange} className="border rounded-md px-2 py-1" required />
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="flex items-center">
        <p className="text-lg text-left mr-4">새 비밀번호 확인 : </p>
        <div className="ml-10"> {/* 왼쪽 마진을 파일 추가 박스와 동일하게 설정 */}
          <input type="password" name="passwordCheck" value={data.passwordCheck} onChange={handleInputChange} className="border rounded-md px-2 py-1" required />
        </div>
      </div>
      <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            부스 이미지
          </label>
          <input
            type="file"
            name="imgPath"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <span className="text-red-500 text-sm mt-1 block">
            * 프로필 이미지
          </span>
        </div>

        {/* 버튼 2개 - 정보수정, 탈퇴버튼 */}
        <div className="flex justify-center space-x-10 mt-20">
          <button className="py-2 px-4 hover:bg-blue-400 text-black border-2 rounded-lg" onClick={handleModified}>정보 수정</button>
          <button className="py-2 px-4 hover:bg-red-400 text-black border-2 rounded-lg" onClick={openModal}>탈퇴하기</button>
          <button className="py-2 px-4 hover:bg-gray-400 text-black border-2 rounded-lg" onClick={logout}>로그아웃</button>
          {showModal && (
            <div className="w-full fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg">
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
        </div>
        </form>
      </div>
  );
}

export default MyProfileComponent;
