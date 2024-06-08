import React from "react";


function MyPageLayout({children}){
    return(
        <div>
            <MyPageLayout/>
            <div className="min-h-[960px] w-full md:w-5/6 mx-auto">
                {children}
            </div>
        </div>
    )
}

export default MyPageLayout;