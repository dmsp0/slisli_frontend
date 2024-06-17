import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URLS } from "../../api/apiConfig";
import Modal from "./Modal";

function BoothForm() {
  const navigate = useNavigate(); // 라우터에서 사용하는 네비게이션 함수
  const [boothData, setBoothData] = useState({ // 부스 데이터 상태 및 설정 함수
    title: "", // 부스 제목
    info: "", // 부스 정보
    category: "CATEGORY_ONE", // 부스 카테고리 (기본값: CATEGORY_ONE)
    type: "COMPANY", // 기본 부스타입 설정
    date: "", // 부스 날짜
    startTime: "", // 시작 시간
    endTime: "", // 종료 시간
    imgPath: "", // 이미지 파일 경로
    maxPeople: "", // 최대 참여 인원
    openerName: "", // 부스 개설자 이름
  });

  const [showModal, setShowModal] = useState(false); // 모달 표시 상태 및 설정 함수

  const handleChange = (e) => { // 입력 값 변경 시 호출되는 함수
    const { name, value } = e.target; // 이벤트에서 이름과 값 추출
    setBoothData({ ...boothData, [name]: value }); // 해당 이름의 값을 변경하고 상태 업데이트
  };

  const handleFileChange = (e) => { // 파일 입력 변경 시 호출되는 함수
    const file = e.target.files[0]; // 파일 가져오기
    setBoothData({ ...boothData, imgPath: file }); // 이미지 파일 경로 업데이트
  };

  const handleSubmit = async (e) => { // 폼 제출 시 호출되는 함수
    e.preventDefault(); // 기본 제출 행동 방지

    // 로컬스토리지에서 member_id 가져오기
    const memberId = localStorage.getItem('member_id');

    const formData = new FormData(); // 새 FormData 생성
    formData.append( // 부스 데이터 및 이미지 파일을 FormData에 추가
      "booth",
      new Blob(
        [
          JSON.stringify({ // 부스 데이터를 JSON 형식으로 문자열화하여 Blob으로 변환 후 추가
            title: boothData.title,
            info: boothData.info,
            category: boothData.category,
            type: boothData.type, // 부스타입 추가
            date: boothData.date,
            startTime: boothData.startTime,
            endTime: boothData.endTime,
            maxPeople: boothData.maxPeople,
            openerName: boothData.openerName,
            member_id: memberId // member_id 추가
          }),
        ],
        { type: "application/json" }
      )
    );
    formData.append("file", boothData.imgPath); // 이미지 파일 추가

    try { // 요청 보내기
      const response = await axios.post(API_URLS.BOOTH_INSERT, formData, { // Axios를 사용하여 POST 요청
        headers: {
          "Content-Type": "multipart/form-data", // 헤더 설정
        },
      });
      console.log(response.data); // 응답 데이터 로깅
      setShowModal(true); // 모달 표시
    } catch (error) { // 에러 처리
      console.error("There was an error!", error); // 에러 로깅
    }
  };

  const handleCloseModal = () => { // 모달 닫기 함수
    setShowModal(false); // 모달 숨기기
    navigate("/"); // 메인 페이지로 이동
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto p-6 bg-white border border-gray-300 rounded-lg shadow-md"
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
  );
}

export default BoothForm;
