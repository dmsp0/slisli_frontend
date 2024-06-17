import React, {useContext, useEffect, useState} from "react";
import { useAnimate, stagger, motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook

const staggerMenuItems = stagger(0.1, { startDelay: 0.15 });

function useMenuAnimation(isOpen) {
    const [scope, animate] = useAnimate();

    useEffect(() => {
      animate(".arrow", { rotate: isOpen ? 180 : 0 }, { duration: 0.2 });
  
      animate(
        "ul",
        {
          clipPath: isOpen
            ? "inset(0% 0% 0% 0% round 10px)"
            : "inset(10% 50% 90% 50% round 10px)",
        },
        {
          type: "spring",
          bounce: 0,
          duration: 0.5,
        }
      );
  
      animate(
        "li",
        isOpen
          ? { opacity: 1, scale: 1, filter: "blur(0px)" }
          : { opacity: 0, scale: 0.3, filter: "blur(20px)" },
        {
          duration: 0.2,
          delay: isOpen ? staggerMenuItems : 0,
        }
      );
    }, [isOpen]);
  
    return scope;
  }

const Mypagebutton = () =>{
    const [isOpen, setIsOpen] = useState(false);
    const scope = useMenuAnimation(isOpen);
    const {logout}=useContext(AuthContext);
    const navigate = useNavigate(); // Initialize the useNavigate hook

    return(
        <nav className="menu" ref={scope}  style={{ position: "relative" }}>
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setIsOpen(!isOpen)}
                              className="flex text-white gap-2"
                            >
                                {localStorage.name}님의 마이페이지
                              <div className="arrow" style={{ transformOrigin: "50% 55%" }}>
                                <svg width="15" height="15" viewBox="0 0 20 20" >
                                  <path d="M0 7 L 20 7 L 10 16" fill="white"/>
                                </svg>
                              </div>
                            </motion.button>
                            <ul
                            className="bg-blue-900 text-white hover:cursor-pointer"
                              style={{
                                pointerEvents: isOpen ? "auto" : "none",
                                clipPath: "inset(10% 50% 90% 50% round 10px)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                                position: "absolute",
                                top: "100%",
                                left: "0",
                                visibility: isOpen ? "visible" : "hidden",
                                width: "10rem",
                                padding:"10px 10px"
                              }}
                            >
                              <li onClick={() => navigate('/myPage')}>마이페이지</li>
                              <li onClick={() => navigate('/myPage?tab=favoritelist')}>좋아요 목록</li>
                              <li onClick={() => navigate('/myPage?tab=boothheld')}>시청 목록</li>
                              <li onClick={logout}>로그아웃</li>
                            </ul>{" "}
                          </nav>
    );
};

export default Mypagebutton;