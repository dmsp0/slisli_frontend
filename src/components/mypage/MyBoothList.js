import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URLS } from "../../api/apiConfig";
import CategoryFilter from "../booth/CategoryFilter";
import Modal from "../booth/Modal"; // 모달 컴포넌트 임포트
import {motion} from "framer-motion";
import TimeUtils from "../common/TimeUtils";
import BoothCategory from "../booth/Boothcategory";

function MyBoothList() {
  const member_id = localStorage.getItem('member_id');
  const [mybooths, setMyBooths] = useState([]);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(4);
  const [hasMore, setHasMore] = useState(true); // 다음 버튼 활성화를 위한 상태
  const [showModal, setShowModal] = useState(false);
  const [boothToDelete, setBoothToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyBooths = async () => {
      if (!member_id) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URLS.BOOTH_GET_BY_USERID}/${member_id}`, {
          params: {
            page,
            size,
            category,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMyBooths(response.data.content);
        setHasMore(response.data.content.length === size);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMyBooths();
  }, [member_id, page, size, category]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPage(0); // 새로운 카테고리를 선택하면 첫 페이지로 이동
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_URLS.BOOTH_DELETE}/${boothToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMyBooths(mybooths.filter(booth => booth.boothId !== boothToDelete));
      setShowModal(false);
      setBoothToDelete(null);
    } catch (error) {
      console.error("Error deleting booth", error);
    }
  };

  const handleDeleteClick = (boothId) => {
    setBoothToDelete(boothId);
    setShowModal(true);
  };

  const handleEdit = (booth) => {
    navigate(`/booth/edit/${booth.boothId}`, { state: { booth } });
  };

  const handleCancel = () => {
    setShowModal(false);
    setBoothToDelete(null);
  };

  return (
    <div className="container mx-auto p-4">
      <CategoryFilter
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-2  gap-4 pt-4">
        {mybooths.map((booth) => (
          <motion.div 
          key={booth.boothId} 
          className="border p-4 rounded-lg shadow hover:shadow-lg bg-white transition-shadow duration-200"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}>
          <Link to={`/booth/${booth.boothId}`}>
              <img 
                  src={booth.imgPath} 
                  alt={booth.title}
                  className="w-full h-64 object-cover mb-4 rounded"
              />
              <h2 className="text-xl font-bold text-blue-800 mb-2">{booth.title}</h2>
              <p className="text-gray-700">카테고리 : {BoothCategory[booth.category]}</p>
              <p className="text-gray-700">일시: {booth.date}</p>
              <p className="text-gray-700">시간: {TimeUtils(booth.startTime)} ~ {TimeUtils(booth.endTime)}</p>
          </Link>
              <button
                onClick={() => handleEdit(booth)}
                className="bg-blue-800 text-white px-2 py-1 rounded-md mr-2 mt-2 "
                >
                수정
              </button>
              <button
                onClick={() => handleDeleteClick(booth.boothId)}
                className="bg-red-600 text-white px-2 py-1 rounded-md mr-2 mt-2 "
                >
                삭제
              </button>
            </motion.div>
        ))}
      </div>
      <div className="mt-4 mx-auto flex justify-center">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
          className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          이전
        </button>
        <button
          onClick={() => setPage(page + 1)}
          disabled={!hasMore}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          다음
        </button>
      </div>
      <Modal
        showModal={showModal}
        message="정말로 이 부스를 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onCancel={handleCancel}
        showCancel={true}
      />
    </div>
  );
}

export default MyBoothList;
