import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { API_URLS } from "../../api/apiConfig";
import Modal from "../booth/Modal";

function BoothForm() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { boothId } = useParams();
  const [boothData, setBoothData] = useState({
    title: "",
    info: "",
    category: "COMPANY_RECRUITMENT",
    type: "COMPANY",
    date: "",
    startTime: "",
    endTime: "",
    imgPath: "",
    maxPeople: "",
    openerName: "",
    memberId: localStorage.getItem('member_id')
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (state && state.booth) {
      setBoothData(state.booth);
    } else if (boothId) {
      fetchBoothData(boothId);
    }
  }, [state, boothId]);

  const fetchBoothData = async (boothId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URLS.BOOTH_GET_BY_ID}/${boothId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBoothData(response.data);
    } catch (error) {
      console.error("Error fetching booth data", error);
    }
  };

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
    console.log(localStorage.getItem('member_id'));
    console.log(boothData.memberId);
    const formData = new FormData();
    formData.append(
      "booth",
      new Blob(
        [
          JSON.stringify({
            title: boothData.title,
            info: boothData.info,
            category: boothData.category,
            type: boothData.type,
            date: boothData.date,
            startTime: boothData.startTime,
            endTime: boothData.endTime,
            maxPeople: boothData.maxPeople,
            openerName: boothData.openerName,
            memberId: boothData.memberId
          }),
        ],
        { type: "application/json" }
      )
    );
    formData.append("file", boothData.imgPath);

    try {
      const token = localStorage.getItem("token");
      if (state && state.booth) {
        // 부스 수정
        await axios.post(`${API_URLS.BOOTH_UPDATE}/${boothId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // 부스 등록
        await axios.post(API_URLS.BOOTH_INSERT, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      }
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
    <>
    <div className="bg-gradient-to-b from-blue-900 to-blue-100">
    <br/>
    <br/>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto p-6 bg-white border rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          {state && state.booth ? "부스 수정" : "부스 등록"}
        </h1>
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
            <option value="COMPANY_RECRUITMENT">기업/채용</option>
            <option value="EDUCATION_TECH">교육/기술</option>
            <option value="FOOD_BEVERAGE">식/음료</option>
            <option value="LIFESTYLE_HEALTH">생활/건강</option>
            <option value="CULTURE_ART">문화/예술</option>
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
            required={!boothData.imgPath}
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
          {state && state.booth ? "부스 수정" : "부스 등록"}
        </button>
      </form>

      <Modal
        showModal={showModal}
        onConfirm={handleCloseModal} // 이 부분 수정
        message={state && state.booth ? "부스 수정이 완료되었습니다." : "부스 등록이 완료되었습니다."}
        showCancel={false}
      />
    <br/>
    <br/>
    <br/>
      </div>

</>
  );
}

export default BoothForm;