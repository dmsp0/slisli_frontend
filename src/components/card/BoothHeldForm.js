import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URLS } from "../../api/apiConfig";
import Modal from "../booth/Modal";

function BoothHeldForm() {
  const navigate = useNavigate();
  const [boothData, setBoothData] = useState({
    title: "",
    info: "",
    category: "CATEGORY_ONE",
    type: "COMPANY",
    date: "",
    startTime: "",
    endTime: "",
    imgPath: "",
    maxPeople: "",
    openerName: "",
    member_id: localStorage.getItem('member_id') // member_id 추가
  });

  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoothData({ ...boothData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setBoothData({ ...boothData, imgPath: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error("Token not found");
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append("booth", new Blob([JSON.stringify(boothData)], { type: "application/json" }));
    formData.append("file", boothData.imgPath);

    try {
      const response = await axios.post(API_URLS.BOOTH_INSERT, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}` // JWT 토큰 추가
        },
      });
      console.log(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("There was an error!", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/");
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-5xl p-4">
        <br/>
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-300 rounded-lg shadow-md p-6"
      >
        <h1 className="text-2xl font-bold text-center mb-6">부스 등록</h1>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">부스명</label>
          <input
            type="text"
            name="title"
            value={boothData.title}
            onChange={handleChange}
            placeholder="개최할 부스명을 입력해주세요."
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">주최</label>
          <input
            type="text"
            name="openerName"
            value={boothData.openerName}
            onChange={handleChange}
            placeholder="선택 입력사항입니다."
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">일시</label>
          <input
            type="date"
            name="date"
            value={boothData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <div className="flex space-x-2 mt-2">
            <input
              type="time"
              name="startTime"
              value={boothData.startTime}
              onChange={handleChange}
              className="w-1/2 px-3 py-2 border rounded-lg"
              required
            />
            <span className="self-center">~</span>
            <input
              type="time"
              name="endTime"
              value={boothData.endTime}
              onChange={handleChange}
              className="w-1/2 px-3 py-2 border rounded-lg"
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">카테고리</label>
          <select
            name="category"
            value={boothData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="CATEGORY_ONE">CATEGORY_ONE</option>
            <option value="CATEGORY_TWO">CATEGORY_TWO</option>
            <option value="CATEGORY_THREE">CATEGORY_THREE</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">부스타입</label>
          <select
            name="type"
            value={boothData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="COMPANY">기업</option>
            <option value="INDIVIDUAL">개인</option>
          </select>
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
            required
          />
          <span className="text-red-500 text-sm mt-1 block">
            * 부스 이미지 등록은 필수입니다.
          </span>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">상세정보</label>
          <textarea
            name="info"
            value={boothData.info}
            onChange={handleChange}
            placeholder="부스의 상세정보 또는 내용을 입력해주세요."
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">참가인원</label>
          <input
            type="number"
            name="maxPeople"
            value={boothData.maxPeople}
            onChange={handleChange}
            placeholder="부스 입장 인원을 숫자로 입력해주세요."
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 mt-6 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-700"
        >
          부스 등록
        </button>
      </form>

      <Modal
        showModal={showModal}
        callbackFunction={handleCloseModal}
        message="부스 등록이 완료되었습니다."
      />
    </div>
  </div>
  );
}

export default BoothHeldForm;
