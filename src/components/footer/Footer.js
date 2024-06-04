import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaGithubAlt, FaYoutube } from "react-icons/fa6";
import { RiNotionFill } from "react-icons/ri";
import { FaGoogleDrive } from "react-icons/fa";

function Footer(){
    return(
        <footer className="w-full bg-slate-100">
            <ul className="w-4/5 flex flex-row text-sm mx-auto py-3 font-semibold border-b border-gray-300">
                <li className="pe-4">회사 소개</li>
                <li className="px-4">업체 등록</li>
                <li className="px-4">이용 약관</li>
                <li className="px-4">개인정보처리방침</li>
            </ul>
            <div className="w-4/5 mx-auto text-gray-800 flex flex-wrap flex-col py-2">
                    <span className="text-xs  text-gray-400 font-medium my-1">사이트명 : SliSli (실리실리) | 주소 : 서울 강남구 테헤란로 7길 7(역삼동 에스코빌딩 6층) | 조 이름 : 장작 </span>
                    <span className="text-xs text-gray-400 font-medium my-1">조원 : 박민경 박지혜 백은혜 서유진 이인왕 조현진 홍승연</span> 
                    <span className="text-xs text-gray-400 font-medium my-1">github : <Link target='_blank' to="https://github.com/dmsp0/slisli_frontend">https://github.com/dmsp0/slisli_frontend (frontend)</Link></span> 
                    <span className="text-xs text-gray-400 font-medium my-1">github : <Link target='_blank' to="https://github.com/dmsp0/slisli_backend">https://github.com/dmsp0/slisli_backend (backend)</Link></span> 
            </div>
            <div className="w-4/5 mx-auto flex flex-col pb-5 px-3 pt-5 border-t border-gray-300 text-gray-400 text-sm">
                <div className="flex justify-end mb-1">
                    <Link target='_blank' className="px-1" to="#"><FaYoutube size="20"/></Link>
                    <Link target='_blank' className="px-1" to="#"><FaGoogleDrive size="20"/></Link>
                    <Link target='_blank' className="px-1" to="https://www.notion.so/76c78b7aa3234160a180065abdfd214a?v=8d6dba810d9e458c9dc09f8299e27f84&pvs=4"><RiNotionFill size="20"/></Link>
                    <Link target='_blank' className="px-1" to="https://github.com/dmsp0/slisli_frontend"><FaGithub size="20"/></Link>
                    <Link target='_blank' className="px-1" to="https://github.com/dmsp0/slisli_backend"><FaGithubAlt size="20"/></Link>
                </div>
               <div className="flex justify-end">© 2024 SliSli Corp.</div>
            </div>
      </footer>
  
    )
}

export default Footer;