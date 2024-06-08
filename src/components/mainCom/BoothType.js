import React, {useState} from "react";
import { motion } from "framer-motion";
import Section from "./sectionMotion"; // Section 컴포넌트를 가져옴
import './boothStyle.css';
import { MdBusinessCenter,MdSchool,MdFastfood,MdHealthAndSafety,MdColorLens } from "react-icons/md";
import './motionOpen.css';

function BoothType(){
    const [isOpen1, setIsOpen1] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [isOpen3, setIsOpen3] = useState(false);
    const [isOpen4, setIsOpen4] = useState(false);
    const [isOpen5, setIsOpen5] = useState(false);

    return(
        <div className="w-full h-auto bg-gradient-to-b from-blue-100 to-white">
            <Section>
                <p className="text-6xl font-extrabold text-blue-900 pb-10">
                TYPE OF BOOTH
                </p>
            <div className="flex col-span-5 gap-10 justify-center">
                <motion.div
                    layout
                    data-isOpen={isOpen1}
                    initial={{ borderRadius: 50 }}
                    className={`parent ${isOpen1 ? "open1" : ""} shadow-lg`}
                    onClick={() => setIsOpen1(!isOpen1)}
                    >
                    <button className="btn bg-blue-400 shadow-md">상세보기</button>
                    <motion.div layout className="child">
                    <MdBusinessCenter size={50} color="navy" className="mx-auto"/>
                    <p>기업/채용</p>
                    </motion.div>
                </motion.div>
                <motion.div
                    layout
                    data-isOpen={isOpen2}
                    initial={{ borderRadius: 50 }}
                    className={`parent ${isOpen2 ? "open2" : ""} shadow-lg`}
                    onClick={() => setIsOpen2(!isOpen2)}
                    >
                    <button className="btn bg-blue-400 shadow-md">상세보기</button>
                    <motion.div layout className="child">
                    <MdSchool size={50} color="navy" className="mx-auto"/>
                    <p>교육/기술</p>
                    </motion.div>
                </motion.div>
                <motion.div
                    layout
                    data-isOpen={isOpen3}
                    initial={{ borderRadius: 50 }}
                    className={`parent ${isOpen3 ? "open3" : ""} shadow-lg`}
                    onClick={() => setIsOpen3(!isOpen3)}
                    >
                    <button className="btn bg-blue-400 shadow-md">상세보기</button>
                    <motion.div layout className="child">
                    <MdFastfood size={50} color="navy" className="mx-auto"/>
                    <p>식/음료</p>
                    </motion.div>
                </motion.div>
                <motion.div
                    layout
                    data-isOpen={isOpen4}
                    initial={{ borderRadius: 50 }}
                    className={`parent ${isOpen4 ? "open4" : ""} shadow-lg`}
                    onClick={() => setIsOpen4(!isOpen4)}
                    >
                    <button className="btn bg-blue-400 shadow-md">상세보기</button>
                    <motion.div layout className="child">
                    <MdHealthAndSafety size={50} color="navy" className="mx-auto"/>
                    <p>생활/건강</p>
                    </motion.div>
                </motion.div>
                <motion.div
                    layout
                    data-isOpen={isOpen5}
                    initial={{ borderRadius: 50 }}
                    className={`parent ${isOpen5 ? "open5" : ""} shadow-lg`}
                    onClick={() => setIsOpen5(!isOpen5)}
                    >
                    <button className="btn bg-blue-400 shadow-md">상세보기</button>
                    <motion.div layout className="child">
                    <MdColorLens size={50} color="navy" className="mx-auto"/>
                    <p>문화/예술</p>
                    </motion.div>
                </motion.div>
            </div>
            </Section>
        </div>
    )
}

export default BoothType;