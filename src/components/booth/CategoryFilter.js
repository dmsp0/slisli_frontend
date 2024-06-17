import React from "react";

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { value: "", label: "전체", icon: "📦" },
    { value: "CATEGORY_ONE", label: "CATEGORY_ONE", icon: "🔵" },
    { value: "CATEGORY_TWO", label: "CATEGORY_TWO", icon: "🟢" },
    { value: "CATEGORY_THREE", label: "CATEGORY_THREE", icon: "🟡" },
  ];

  return (
    <div className="flex justify-center mb-4">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`mx-2 px-4 py-2 rounded-lg ${
            selectedCategory === category.value
              ? "bg-blue-500 text-white"
              : "bg-gray-300"
          }`}
        >
          <span role="img" aria-label={category.label} className="mr-2">
            {category.icon}
          </span>
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
    