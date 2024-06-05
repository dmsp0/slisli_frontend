import React from "react";
import MainView from "../components/menus/MainView";
import CategoryMenu from "../components/menus/CategoryMenu";
import Trendbooth from "../components/menus/Trendbooth";
import Deadlinebooth from "../components/menus/Deadlinebooth";



function MainComponent(){
    return(
        <>
            <div className="w-full flex flex-row justify-center items-center">
                

                <MainView />
                <CategoryMenu />
                <Trendbooth />
                <Deadlinebooth />

                
            </div>
            
        </>
    )
}

export default MainComponent;