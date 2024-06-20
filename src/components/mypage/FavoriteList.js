import axios from "axios";
import React, { useState, useEffect } from "react";
import { API_URLS } from "../../api/apiConfig";
import { Link } from "react-router-dom";
import CategoryFilter from "../booth/CategoryFilter";
import BoothLikeButton from "../booth/BoothLikeButton";
import {motion} from "framer-motion";

function FavoriteList() {
  const member_id = localStorage.getItem('member_id');
  const [likedBooths, setLikedBooths] = useState([]);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchLikedBooths = async () => {
      if (!member_id) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URLS.BOOTH_LIKED_LIST}/${member_id}`, {
          params: {
            page,
            size,
            category,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.content !== undefined) {
          setLikedBooths(response.data.content);
          setTotalPages(response.data.totalPages);
        } else if (Array.isArray(response.data)) {
          setLikedBooths(response.data);
          setTotalPages(1);
        } else {
          setLikedBooths([]);
          setTotalPages(0);
        }
      } catch (error) {
        console.error(error);
        setLikedBooths([]);
        setTotalPages(0);
      }
    };

    fetchLikedBooths();
  }, [member_id, page, size, category]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPage(0); // 새로운 카테고리를 선택하면 첫 페이지로 이동
  };

  return (
    <div className="container mx-auto p-4">
      <CategoryFilter
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {likedBooths.length > 0 ? (
          likedBooths.map((booth) => (
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
            </Link>
            <div className="flex justify-between items-start mb-4">
                <Link to={`/booth/${booth.boothId}`} >
                    <h2 className="text-xl font-bold text-blue-800">{booth.title}</h2>
                </Link>
                <BoothLikeButton boothId={booth.boothId} member_id={localStorage.getItem('member_id')} />
            </div>
            <Link to={`/booth/${booth.boothId}`} className="block">
                <p className="text-gray-700 mb-2">{booth.info}</p>
                <p className="text-gray-700 mb-2">카테고리: {booth.category}</p>
                <p className="text-gray-700 mb-2">일시: {booth.date}, {booth.startTime} ~ {booth.endTime}</p>
            </Link>
        </motion.div>
          ))
        ) : (
          <div className="col-span-12 text-center">
            <p>찜한 부스가 없습니다.</p>
          </div>
        )}
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
          disabled={page >= totalPages - 1}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default FavoriteList;