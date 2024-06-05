import React from "react";
import MotionTest from './motion';
import './position.css';

function MainView(){
    return(
        <div>
            <div className="container">
                <div className="motion">
                    <MotionTest/>
                </div>
                <div className="motion2">
                    <MotionTest/>
                </div>
            </div>
            <div className="back">
                <img className="w-full h-screen -z-10" src='/images/2.svg'/>
            </div>
        </div>
    )
}

export default MainView;