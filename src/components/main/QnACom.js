import React,{useState} from "react";
import Section from "./sectionMotion"; // Section 컴포넌트를 가져옴
import './SectionStyle.css';
import { AnimatePresence, motion } from "framer-motion";
import { FaQuestion,FaExclamation } from "react-icons/fa";
import {QnA} from "./QnAdata";


function QnACom(){
    const [visible, setVisible] = useState(0);
    const [back, setBack] = useState(false);

    // animation
const boxVariants = {
    entry: (back) => ({
      x: back ? -500 : 500,
      opacity: 0,
      scale: 0
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.5 }
    },
    exit: (back) => ({
      x: back ? 500 : -500,
      opacity: 0,
      scale: 0,
      transition: { duration: 0.5 }
    })
  };

    const nextText = () => {
        setBack(false);
        setVisible((prev) => (prev === QnA.length - 1 ? 0 : prev + 1));
      };
    
      const prevText = () => {
        setBack(true);
        setVisible((prev) => (prev === 0 ? QnA.length - 1 : prev - 1));
      };


    return(
    <Section>
        {/* 섹션 */}
        <div className='bg-white mx-auto w-full h-full md:w-3/4 text-center justify-center items-center py-32'>
            <h1 className='text-5xl font-bold text-blue-900'>자주 묻는 질문</h1>

            <div className="flex flex-col w-full h-full justify-center items-center mt-6">
            <div className="relative w-[50rem] h-64 min-w-[50rem] min-h-64">
                <AnimatePresence custom={back}>
                <motion.div
                    className="absolute flex flex-col justify-center items-center bg-white rounded-2xl shadow-md p-10 overflow-auto w-full"
                    custom={back}
                    variants={boxVariants}
                    initial="entry"
                    animate="center"
                    exit="exit"
                    key={visible}
                >
                    <div className='relative flex items-center w-full'>
                    <FaQuestion className='absolute left-0 top-0' color='navy' size={40}/>
                    <h1 className="text-2xl pl-16">{QnA[visible].title}</h1>
                    </div>
                    <div className='relative flex items-center w-full mt-10'>
                    <FaExclamation className='absolute left-0 top-0' color='navy' size={40}/>
                    <p className="text-xl text-start pl-16">{QnA[visible].description}</p>
                    </div>
                </motion.div>
                </AnimatePresence>
            </div>

              <div className='mt-3 flex gap-10 justify-center'>
            <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                <button onClick={prevText} className="mr-2 p-2 px-5 bg-blue-200 rounded-lg text-gray-700">이전</button>
              </motion.div>
            <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                <button onClick={nextText} className="ml-2 p-2 px-5 bg-blue-200 rounded-lg text-gray-700">다음</button>
                  </motion.div>
              </div>
              </div>
        </div>
    </Section>
    )
}

export default QnACom;