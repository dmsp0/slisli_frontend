import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URLS } from "../../api/apiConfig";
import BoothLikeButton from "../booth/BoothLikeButton";
import CategoryFilter from "./CategoryFilter";

function BoothList({ type }) {
  const [booths, setBooths] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState(""); // 검색어 상태 추가
  const [page, setPage] = useState(0);
  const [size] = useState(9); // 한 페이지에 9개씩 보여줌

  // 검색 및 필터링된 데이터를 가져오는 함수
  const fetchBooths = async (page, size, category, search, type) => {
    try {
      const token = localStorage.getItem("token"); // 로컬 스토리지에서 JWT 토큰을 가져옴
      const response = await axios.get(API_URLS.BOOTH_GET_LIST, {
        params: {
          page,
          size,
          category,
          search,
          type,
        },
        headers: {
          Authorization: `Bearer ${token}`, // 요청 헤더에 JWT 토큰을 추가
        },
      });
      setBooths(response.data.content); // 페이지네이션 데이터 구조에 맞게 수정
    } catch (error) {
      console.error("Error fetching booths", error);
    }
  };

  useEffect(() => {
    fetchBooths(page, size, category, search, type);
  }, [page, size, category, type]); // 페이지, 사이즈, 카테고리 또는 타입이 변경될 때만 서버 요청

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPage(0); // 새로운 카테고리를 선택하면 첫 페이지로 이동
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value); // 입력 값만 업데이트하고 서버 요청은 하지 않음
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0); // 검색을 누르면 첫 페이지로 이동
    fetchBooths(0, size, category, search, type); // 검색어를 사용하여 서버 요청 발생
  };

  const handleSearchReset = () => {
    setSearch(""); // 검색어 상태 초기화
    setPage(0); // 첫 페이지로 이동
    fetchBooths(0, size, category, "", type); // 검색어 없이 전체 데이터를 다시 로드
  };

  const renderTitle = () => {
    if (type === "COMPANY") {
      return <h1 className="text-3xl font-bold mb-6 mt-6 text-center text-white">기업부스 리스트</h1>;
    } else if (type === "INDIVIDUAL") {
      return <h1 className="text-3xl font-bold mb-6 mt-6 text-center text-white">개인부스 리스트</h1>;
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-b from-blue-900 to-blue-100 w-full min-h-screen flex flex-col items-center">

    <div className="container mx-auto">
      {renderTitle()}
      
      <CategoryFilter
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
      />
      
      <div className="flex justify-center mb-4">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-2/3 flex">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="부스 제목 검색"
            className="mt-4 px-3 py-2 border rounded-lg w-full"
          />
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg ml-2"
          >
            검색
          </button>
          <button
            type="button"
            onClick={handleSearchReset}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg ml-2"
          >
            초기화
          </button>
        </form>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-10">
        {booths.map((booth) => (
          <div key={booth.boothId} className="border p-4 rounded-lg shadow hover:shadow-lg bg-white transition-shadow duration-200">
            <img src={booth.imgPath} 
              alt={booth.title}
              className="w-full h-64 object-cover mb-4 rounded"
            />
            <h2 className="text-xl font-bold mb-2">{booth.title}</h2>
            <p className="text-gray-700 mb-2">{booth.info}</p>
            <p className="text-gray-700 mb-2">카테고리: {booth.category}</p>
            <div className="flex justify-between items-center">
              <Link
                to={`/booth/${booth.boothId}`}
                className="text-blue-500 hover:underline"
              >
                자세히 보기
              </Link>
              <BoothLikeButton boothId={booth.boothId} member_id={localStorage.getItem('member_id')} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
          className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
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
    </div>
  );
}

export default BoothList;
