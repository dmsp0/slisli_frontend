import React from "react";
import BasicMenu from "../components/menus/BasicMenu";
import TopMenu from "../components/menus/TopMenu";
import MainView from "../components/menus/MainView";
import CategoryMenu from "../components/menus/CategoryMenu";
import Trendbooth from "../components/menus/Trendbooth";
import Deadlinebooth from "../components/menus/Deadlinebooth";
import InfoPage from "../components/menus/InfoPage";
// import InfoComponent from "./InfoComponent";


function MainComponent(){
    return(
        <>
            <div className="w-full flex flex-row justify-center items-center">
                

                <MainView />
                <CategoryMenu />
                <Trendbooth />
                <Deadlinebooth />
                <InfoPage />
                {/* <InfoComponent /> */}
                
            </div>
            
        </>
    )
}

export default MainComponent;