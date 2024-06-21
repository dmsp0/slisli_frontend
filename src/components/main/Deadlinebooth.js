import React from "react";
import Section from "./sectionMotion"; // Section 컴포넌트를 가져옴
import './boothStyle.css';
import { Link } from "react-router-dom";

function Deadlinebooth(){
    return(
        <div className="bg-indigo-500 h-full py-20 text-center items-center">
            <p className="text-6xl font-extrabold text-white mb-10">
            누구나 온라인 전시를 쉽고 빠르게
            </p>
            <Link to="/boothheld"> <button className='border-white border-2 rounded-lg px-4 py-1 text-white hover:bg-white hover:text-blue-800 text-2xl'>부스 개최하러 가기</button></Link>
    </div>
    )
}

export default Deadlinebooth;