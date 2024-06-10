import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URLS } from "../../api/apiConfig";

function BoothList() {
  const [booths, setBooths] = useState([]);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10); // 한 페이지에 10개씩 보여줌

  useEffect(() => {
    async function fetchBooths() {
      try {
        const response = await axios.get(API_URLS.BOOTH_GET_ALL, {
          params: {
            page,
            size,
            category,
          },
        });
        setBooths(response.data.content); // 페이지네이션 데이터 구조에 맞게 수정
      } catch (error) {
        console.error("Error fetching booths", error);
      }
    }
    fetchBooths();
  }, [page, category]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(0); // 새로운 카테고리를 선택하면 첫 페이지로 이동
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          카테고리 필터
        </label>
        <select
          value={category}
          onChange={handleCategoryChange}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">전체</option>
          <option value="CATEGORY_ONE">CATEGORY_ONE</option>
          <option value="CATEGORY_TWO">CATEGORY_TWO</option>
          <option value="CATEGORY_THREE">CATEGORY_THREE</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {booths.map((booth) => (
          <div key={booth.id} className="border p-4 rounded-lg shadow">
            <img
              src={`${booth.imgPath}`}
              alt={booth.title}
              className="w-full h-48 object-cover mb-4"
            />
            <h2 className="text-xl font-bold">부스 제목 : {booth.title}</h2>
            <p className="text-gray-700">부스 소개 : {booth.info}</p>
            <p className="text-gray-700">부스 카테고리 : {booth.category}</p>

            <Link
              to={`/booth/${booth.boothId}`}
              className="text-blue-500 hover:underline"
            >
              자세히 보기
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
          className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          이전
        </button>
        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default BoothList;