import React from "react";
import MainView from "./MainView";
import Trendbooth from "./Trendbooth";
import Deadlinebooth from "./Deadlinebooth";
import BoothType from "./BoothType";



function MainComponent(){
    return(
        <>                
                <MainView />
                <BoothType />
                <Trendbooth />
                <Deadlinebooth />
            
        </>
    )
}

export default MainComponent;