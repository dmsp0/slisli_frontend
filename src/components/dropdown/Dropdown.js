import React, {useRef} from "react"
import useDropdown from "../../hooks/useDropdown"
import DropMenu from "./DropMenu";



function Dropdown({menuName, menuIcon, menus}){
    const ref = useRef();
    const [isOpen, setIsOpen] = useDropdown(ref, false)
    


    return(
        <div className="relative" ref={ref} > 
            <label className="flex justify-center" onMouseUp={()=> setIsOpen(!isOpen)}>
                <button className={isOpen ? "bg-black/40 flex flex-col px-1.5" : "flex flex-col px-1.5"} >{menuIcon && menuIcon } {menuName && menuName} </button>
            </label>
            {isOpen && <DropMenu menus={menus}/>}
        </div>
    )
}
export default Dropdown;