import React from "react";

import CategoryMenu from "./menus/CategoryMenu";
function MainComponent(){
    return(
        <>
            <div className="w-full flex flex-row justify-center items-center">
                <CategoryMenu/>
            </div>
            
        </>
    )
}

export default MainComponent;