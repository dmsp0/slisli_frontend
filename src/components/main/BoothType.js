import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Section from "./sectionMotion"; // Section 컴포넌트를 가져옴
import './boothStyle.css';
import { MdBusinessCenter, MdSchool, MdFastfood, MdHealthAndSafety, MdColorLens } from "react-icons/md";
import './motionOpen.css';
import axios from "axios";
import { API_URLS } from '../../api/apiConfig'; // API_URLS에 /api/booths/top-liked-by-category 추가

// 오늘 시작하는 부스 중 좋아요가 가장많은 부스 하나
function BoothType() {
    const [isOpen1, setIsOpen1] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [isOpen3, setIsOpen3] = useState(false);
    const [isOpen4, setIsOpen4] = useState(false);
    const [isOpen5, setIsOpen5] = useState(false);
    const [booths, setBooths] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopLikedBoothsByCategory = async () => {
            try {
                const response = await axios.get(API_URLS.BOOTH_TOP_LIKED_BY_CATEGORY);
                console.log(response.data); // 응답 데이터를 콘솔에 출력
                setBooths(response.data);
            } catch (error) {
                console.error('Error fetching top liked booths by category:', error);
            }
        };

        fetchTopLikedBoothsByCategory();
    }, []);

    const handleDetailClick = (e, boothId) => {
        e.stopPropagation();
        navigate(`/booth/${boothId}`);
    };

    const renderBooth = (categoryKey, iconComponent, categoryName, isOpen, setIsOpen) => {
        return (
            <motion.div
                layout
                data-isOpen={isOpen}
                initial={{ borderRadius: 50 }}
                className={`parent ${isOpen ? "open" : ""} shadow-lg`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <motion.div layout className="child">
                    {isOpen && booths[categoryKey] ? (
                        <>
                            <img src={booths[categoryKey].imgPath} alt={booths[categoryKey].title} className="w-full h-64 object-cover mb-4 rounded" />
                            <p>{booths[categoryKey].title}</p>
                            <button className="text-white font-bold py-3 px-6 rounded-2xl transition duration-300 bg-blue-500 hover:bg-blue-700" onClick={(e) => handleDetailClick(e, booths[categoryKey].boothId)}>상세보기</button>
                        </>
                    ) : (
                        <>
                            {iconComponent}
                            <p>{categoryName}</p>
                        </>
                    )}
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="w-full h-auto bg-gradient-to-b from-blue-100 to-white">
            <Section>
                <p className="text-6xl font-extrabold text-blue-900 pb-10">
                    TODAY'S POPULAR BOOTH
                </p>
                <div className="flex col-span-5 gap-10 justify-center">
                    {renderBooth("COMPANY_RECRUITMENT", <MdBusinessCenter size={50} color="navy" className="mx-auto" />, "기업/채용", isOpen1, setIsOpen1)}
                    {renderBooth("EDUCATION_TECH", <MdSchool size={50} color="navy" className="mx-auto" />, "교육/기술", isOpen2, setIsOpen2)}
                    {renderBooth("FOOD_BEVERAGE", <MdFastfood size={50} color="navy" className="mx-auto" />, "식/음료", isOpen3, setIsOpen3)}
                    {renderBooth("LIFESTYLE_HEALTH", <MdHealthAndSafety size={50} color="navy" className="mx-auto" />, "생활/건강", isOpen4, setIsOpen4)}
                    {renderBooth("CULTURE_ART", <MdColorLens size={50} color="navy" className="mx-auto" />, "문화/예술", isOpen5, setIsOpen5)}
                </div>
            </Section>
        </div>
    );
}

export default BoothType;
