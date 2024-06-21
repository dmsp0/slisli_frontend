import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URLS } from '../../api/apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import "./motionStyle.css";

// 최근등록
// 카테고리 영어 키와 한글 라벨 매핑
const categoryMap = {
    "COMPANY_RECRUITMENT": "기업/채용",
    "CULTURE_ART": "문화/예술",
    "EDUCATION_TECH": "교육/기술",
    "FOOD_BEVERAGE": "식/음료",
    "LIFESTYLE_HEALTH": "생활/건강"
};

const categories = Object.keys(categoryMap); // 카테고리 목록

const LatestBoothsByCategory = () => {
    const [booths, setBooths] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLatestBoothsByCategory = async () => {
            try {
                const response = await axios.get(API_URLS.BOOTH_LATEST_BY_CATEGORY);
                console.log(response.data); // 응답 데이터를 콘솔에 출력
                setBooths(response.data);
            } catch (error) {
                console.error('Error fetching latest booths by category:', error);
            }
        };

        fetchLatestBoothsByCategory();
    }, []);

    const handleDetailClick = (boothId) => {
        navigate(`/booth/${boothId}`);
    };

    return (
        <div className="window h-full w-full">
            <nav className="tab-nav">
                <ul className="tab-list">
                    {categories.map((category) => (
                        <li
                            key={category}
                            className={category === selectedCategory ? "selected" : ""}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {categoryMap[category]}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="tab-content">
                <AnimatePresence mode="wait">
                    {booths[selectedCategory] ? (
                        <motion.div
                            key={selectedCategory}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className='grid grid-cols-2 gap-3 p-5'
                        >
                                <img 
                                    src={booths[selectedCategory].imgPath} 
                                    alt={booths[selectedCategory].title} 
                                    className="object-cover rounded"
                                />
                                <div className='basis-1/2'>
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-2xl font-bold text-blue-800">{booths[selectedCategory].title}</h2>
                                    </div>
                                    <p className="text-gray-700 mb-2">{booths[selectedCategory].info}</p>
                                    <p className="text-gray-700 mb-2">일시: {booths[selectedCategory].date}, {booths[selectedCategory].startTime} ~ {booths[selectedCategory].endTime}</p>
                                    <button 
                                        className="btn bg-blue-400 shadow-md mt-2"
                                        onClick={() => handleDetailClick(booths[selectedCategory].boothId)}
                                    >
                                        상세보기
                                    </button>
                                </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={selectedCategory}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <p className="text-center text-gray-700">해당 카테고리에 대한 부스가 없습니다.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LatestBoothsByCategory;
