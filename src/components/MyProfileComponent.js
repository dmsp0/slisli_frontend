import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MyPageSide from "./card/MyPageSide";
import MyPageButton from "../components/card/MyPageButton";
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function MyProfileComponent({ userProfile }) {
  const [data, setData] = useState({
    email:localStorage.getItem('email'),
    password: "",
    passwordCheck: "",
    name: ""
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

  const navigate = useNavigate();

  const handleModified = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/update', {
          email:data.email,
          password: data.password,
          passwordCheck: data.passwordCheck,
          name: data.name
      }, {
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
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
          <input type="password" name="password" value={data.password} onChange={handleInputChange} className="border rounded-md px-2 py-1" />
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="flex items-center">
        <p className="text-lg text-left mr-4">새 비밀번호 확인 : </p>
        <div className="ml-10"> {/* 왼쪽 마진을 파일 추가 박스와 동일하게 설정 */}
          <input type="password" name="passwordCheck" value={data.passwordCheck} onChange={handleInputChange} className="border rounded-md px-2 py-1" />
        </div>
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
      </div>
    </div>
  );
}

export default MyProfileComponent;
