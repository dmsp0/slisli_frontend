import React from "react";
import { Link } from "react-router-dom";

function HeldButton(){
    return(
        <div className="bg-indigo-500 h-full py-20 text-center items-center">
            <p className="text-5xl font-extrabold text-white mb-10">
            누구나 온라인 전시를 쉽고 빠르게
            </p>
            <Link to="/boothheld"> <button className='border-white border-2 rounded-lg px-4 py-1 text-white hover:bg-white hover:text-blue-800 text-2xl'>부스 개최하러 가기</button></Link>
    </div>
    )
}

export default HeldButton;