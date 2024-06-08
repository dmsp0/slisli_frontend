import React,{useState} from "react";
import Section from "./sectionMotion"; // Section 컴포넌트를 가져옴
import './boothStyle.css';


function Trendbooth(){
    return(
        <div className="bg-indigo-300 h-screen">
    <Section>
        <p className="text-6xl font-extrabold text-white pb-10">
        TREND BOOTH
        </p>
    </Section>
    </div>
    )
}

export default Trendbooth;
