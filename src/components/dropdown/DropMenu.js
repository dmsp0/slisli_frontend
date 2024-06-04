import React from "react";
import { Link } from "react-router-dom";
function DropMenu({menus}){
    return(
        <ul className="text-center absolute opacity-95">
            {menus.map(menu=>
            menu.link ? <li><Link className="bg-white block px-4 py-2 border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:text-blue-700 cursor-pointer" 
            to={menu.link}>{menu.title}{menu.icon}</Link></li> : <li>
                <button onClick={()=>{menu.callback()}} className="bg-white block px-4 py-2 border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:text-blue-700 cursor-pointer">
                {menu.title}{menu.icon}</button></li> )} 
        </ul>
    )
}

export default DropMenu;