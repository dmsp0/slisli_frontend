import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import profileImg from '../img/profile.png'; // Ensure the correct path to the profile image
import { API_URLS } from "../api/apiConfig";

function MyProfileComponent({ userProfile }) {
  const [data, setData] = useState({
    email: localStorage.getItem('email'),
    password: "",
    passwordCheck: "",
    name: "",
  });
  const [showModal, setShowModal] = useState(false);
  const { logout } = useContext(AuthContext);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
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
    try {
      const response = await axios.post('/delete', {
        member_id: localStorage.getItem('member_id')
      }, {
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
    } catch (error) {
      console.error('네트워크 에러:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col items-center text-center p-10 space-y-10">
      <form
        onSubmit={handleModified}
        className="max-w-xl mx-auto p-6 bg-white border border-gray-300 rounded-lg shadow-md"
      >
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
            정보 수정
          </button>
          <button
            type="button"
            className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={openModal}
          >
            탈퇴하기
          </button>
          <button
            type="button"
            className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            onClick={logout}
          >
            로그아웃
          </button>
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
      </form>
    </div>
  );
}

export default MyProfileComponent;
