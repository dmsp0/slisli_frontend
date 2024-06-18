import React from "react";
import { MdBusinessCenter, MdSchool, MdFastfood, MdHealthAndSafety, MdColorLens } from "react-icons/md";
import { FaSortAlphaDown } from "react-icons/fa";

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { value: "", label: "전체", icon: <FaSortAlphaDown size={30} /> },
    { value: "COMPANY_RECRUITMENT", label: "기업/채용", icon: <MdBusinessCenter size={30} /> },
    { value: "EDUCATION_TECH", label: "교육/기술", icon: <MdSchool size={30} /> },
    { value: "FOOD_BEVERAGE", label: "식/음료", icon: <MdFastfood size={30} /> },
    { value: "LIFESTYLE_HEALTH", label: "생활/건강", icon: <MdHealthAndSafety size={30} /> },
    { value: "CULTURE_ART", label: "문화/예술", icon: <MdColorLens size={30} /> },
  ];

  return (
    <div className="flex justify-center flex-wrap mb-4 gap-2">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`flex flex-col items-center justify-center w-32 h-16 p-2 rounded-lg shadow-lg text-sm ${
            selectedCategory === category.value
              ? "bg-blue-500 text-white"
              : "bg-white text-navy"
          }`}
        >
          <span className="flex justify-center items-center">
            {category.icon}
            <span className="ml-3">{category.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
