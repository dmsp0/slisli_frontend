import React from "react";
import MotionTest from './motion';
import './position.css';

function MainView(){
    return(
        <div className="bg-gradient-to-b from-blue-900 to-blue-100 relative pt-32 min-h-screen" >
            <img className="mx-auto w-5/6 -z-10" src='/images/2.svg'/>
                <div className="titleText">
                    <p className="Mulgyeol">
                        방 안에서 펼쳐지는 박람회
                    </p>
                </div>
                <div className="motion">
                    <MotionTest />
                </div>
                <div className="motion2">
                    <MotionTest />
                </div>
        </div>
    )
}

export default MainView;