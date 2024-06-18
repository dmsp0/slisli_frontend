import React from "react";
import { MdBusinessCenter, MdSchool, MdFastfood, MdHealthAndSafety, MdColorLens } from "react-icons/md";

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { value: "", label: "전체", icon: <MdBusinessCenter size={40} /> },
    { value: "COMPANY_RECRUITMENT", label: "기업/채용", icon: <MdBusinessCenter size={40} /> },
    { value: "EDUCATION_TECH", label: "교육/기술", icon: <MdSchool size={40} /> },
    { value: "FOOD_BEVERAGE", label: "식/음료", icon: <MdFastfood size={40} /> },
    { value: "LIFESTYLE_HEALTH", label: "생활/건강", icon: <MdHealthAndSafety size={40} /> },
    { value: "CULTURE_ART", label: "문화/예술", icon: <MdColorLens size={40} /> },
  ];

  return (
    <div className="flex justify-center mb-4">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`flex flex-col items-center justify-center w-32 h-32 mx-2 p-4 rounded-lg shadow-lg ${
            selectedCategory === category.value
              ? "bg-blue-500 text-white"
              : "bg-white text-navy"
          }`}
        >
          <span className="mb-2">
            {category.icon}
          </span>
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
