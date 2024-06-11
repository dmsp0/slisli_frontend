import React from 'react';
import MyPageSide from "../components/card/MyPageSide";
import MyPageButton from "../components/card/MyPageButton";
import BoothHeldForm from "../components/card/BoothHeldForm";

function BoothHeldComponent({ userProfile }) {
  
    return (
        <div className="grid grid-cols-12 justify-center p-20">
          {/* 1. 왼쪽 영역 */}
          <div className="col-span-3 p-2 space-y-4 ">
    
            {/* MyPageSide 컴포넌트 렌더링 (내정보-프사, 닉넴, 이멜) */}
            <MyPageSide />

            {/* MyPageButton 컴포넌트 렌더링 (버튼4개-내정보, 찜목록, 시청목록, 부스개최) */}
            <MyPageButton />
    
          </div>
    
          {/* 세로선 */}
          <div className="col-span-1 justify-self-center border-l border-blue-400"></div>
    
          {/* 2. 오른쪽 영역 */}
          <div className="col-start-6 col-span-7 flex flex-col items-center">
    
            {/* BoothHeldList 컴포넌트 렌더링 () */}
            <BoothHeldForm />
            
          </div>
    
        </div>
      );
    }
    
    export default BoothHeldComponent;