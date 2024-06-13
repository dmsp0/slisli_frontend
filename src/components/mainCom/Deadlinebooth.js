import React from "react";
import Section from "./sectionMotion"; // Section 컴포넌트를 가져옴
import './boothStyle.css';

function Deadlinebooth(){
    return(
        <div className="bg-indigo-500 h-screen">
    <Section>
        <p className="text-6xl font-extrabold text-white">
        DEADLINE BOOTH
        </p>
    </Section>
    </div>
    )
}

export default Deadlinebooth;
