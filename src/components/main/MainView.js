import React from "react";
import './position.css';
import LatestBoothsByCategory from "./LatestBoothsByCategory";
import Counting from "./Counting";
import './Counting.css';

function MainView(){
    return(
        <div className="bg-gradient-to-b from-blue-900 to-blue-100 relative pt-32 min-h-screen">
            <div className="content-container">
                <p className="Mulgyeol pt-4 text-4xl text-white titleText">
                    방 안에서 펼쳐지는 박람회
                </p>
                <div>
                <div className="w-3/4 motion">
                    <LatestBoothsByCategory/>
                </div>
                <div className="motion2">
                <Counting />
                </div>
                </div>
            </div>
            <img className="mx-auto w-5/6 -z-10" src='/images/2.svg'/>
        </div>
    )
}

export default MainView;