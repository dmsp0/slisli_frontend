import React from "react";
import TopMenu from "../components/menus/TopMenu";
import BasicMenu from "../components/menus/BasicMenu";
import Footer from "../components/footer/Footer";

function BasicLayout({children}){
    return(
        <div>
            <BasicMenu/>
            <TopMenu/>
                <div className="min-h-[960px] w-full md:w-5/6 mx-auto">
                    {children}
                </div>
            <Footer/>
        </div>
    )
}

export default BasicLayout;