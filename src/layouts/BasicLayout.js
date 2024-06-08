import React from "react";
import Footer from "../components/common/Footer";
import TopNav from "../components/common/TopNav";
function BasicLayout({children}){
    return(
        <div>
            <TopNav/>
                <div className="w-full mx-auto ">
                    {children}
                </div>
            <Footer/>
        </div>
    )
}

export default BasicLayout;