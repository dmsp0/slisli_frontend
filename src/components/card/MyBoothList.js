import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URLS } from "../../api/apiConfig";
import CategoryFilter from "../booth/CategoryFilter";

function MyBoothList() {
  const member_id = localStorage.getItem('member_id');
  const [mybooths, setMyBooths] = useState([]);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

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
        setTotalPages(response.data.totalPages);
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

  return (
    <div className="container mx-auto p-4">
      <CategoryFilter
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mybooths.length > 0 ? (
        mybooths.map((booth) => (
          <div key={booth.boothId} className="border-2 p-4 flex items-center border-gray-300 rounded-lg shadow-md">
            <div className="relative w-96 h-64">
            <img src={booth.imgPath} 
              alt={booth.title}
              className="w-full h-64 object-cover mb-4"
            />
            </div>
            <div className="w-1/2 text-left p-4">
              <h3 className="text-md font-bold mb-2">제목 : {booth.title}</h3>
              <p className="text-sm text-gray-700 mb-1">카테고리 : {booth.category}</p>
              <p className="text-sm text-gray-700 mb-1">일시: {booth.date}, {booth.startTime} ~ {booth.endTime}</p>
              <div className="flex gap-5">
                <Link
                  to={`/booth/${booth.boothId}`}
                  className="text-blue-500 hover:underline"
                >
                  자세히 보기
                </Link>
            </div>
          </div>
          </div>
        ))
        ) : (
          <div className="col-span-12 text-center">
            <p>개최한 부스가 없습니다.</p>
          </div>
        )
      
      }
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

export default MyBoothList;