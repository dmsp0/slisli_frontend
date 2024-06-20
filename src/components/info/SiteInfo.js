import Lottie from 'lottie-react';
import React, { useState, useEffect } from 'react';
import infoLottie from '../../lottie/Animation - 1718775184849.json';
import { AnimatePresence, motion } from "framer-motion";
import { wrap } from '@popmotion/popcorn';
import { QnA } from "./QnAdata";
import { FaQuestion,FaExclamation } from "react-icons/fa";
import { section1 } from "./Section1"; // Import section1 data
import { section2 } from "./Section2"; // Import section2 data

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

function SiteInfo() {
    const [visible, setVisible] = useState(0);
    const [back, setBack] = useState(false);

    const nextText = () => {
        setBack(false);
        setVisible((prev) => (prev === QnA.length - 1 ? 0 : prev + 1));
      };
    
      const prevText = () => {
        setBack(true);
        setVisible((prev) => (prev === 0 ? QnA.length - 1 : prev - 1));
      };

// Define card variants
const cardVariants = {
  offscreen: {
    y: 100,
    opacity: 0
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: (index) => ({
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
      delay: index * 0.5 // Add delay based on index
    })
  }
};

// Define Card component
function Card({ content, index }) {
  return (
    <motion.div
      className="card-container"
      initial="offscreen"
      whileInView="onscreen"
      custom={index}
      variants={cardVariants}
      viewport={{ once: false, amount: 0.8 }}
    >
      <div className="splash" />
      <motion.div className="card">
        {content}
      </motion.div>
    </motion.div>
  );
}
    
    return (
        <>
        <div className="bg-gradient-to-b from-blue-900 to-blue-100 w-full min-h-full flex flex-col items-center">
            {/* 메인 */}
            <div className='mx-auto w-full md:w-3/4'>
                <div className='flex flex-row w-ful mx-auto items-center justify-between'>
                    <Lottie animationData={infoLottie} className='basis-1/2'/>
                    <div className='basis-1/2'>

                        <h1 className='text-5xl text-white Mulgyeol mb-1'>방 안에서 펼쳐지는 박람회</h1>
                        <p className='text-4xl text-white mb-5'>누구나 온라인 전시를 쉽고 빠르게</p>
                        <button className='border-white border-2 rounded-lg px-4 py-1 text-white hover:bg-white hover:text-blue-800 text-2xl'>부스 개최하러 가기</button>
                       
                    </div>
                </div>
            </div>
        </div>
        {/* 섹션 */}
        <div className="bg-white mx-auto w-full md:w-3/4 text-center justify-center items-center py-28">
      <h1 className="text-5xl mb-1">부스 개최 안내</h1>
      <p className="text-2xl text-gray-500">누구나 쉽게<br />박람회 개최를 도와드립니다</p>

      <div className="flex flex-row mt-10 gap-5">
        {section1.map((section, index) => (
          <Card key={index} index={index} content={
            <div className="basis-1/3 rounded-lg shadow-lg p-5">
              <p className="text-2xl py-5">{section.title}</p>
              <hr className="px-5" />
              <p className="py-5 text-xl">{section.description}</p>
            </div>
          } />
        ))}
      </div>
    </div>
        
        {/* 섹션 */}
        <div className='bg-white mx-auto w-full md:w-3/4 text-center justify-center items-center py-28'>
            <h1 className='text-5xl mb-1'>부스 참가 안내</h1>
            <p className='text-2xl text-gray-500'>원하는 박람회를<br/>어디에서나 참여할 수 있습니다</p>
            
            <div className="flex flex-row mt-10 gap-5">
                {section2.map((section, index) => (
                <Card key={index} index={index} content={
                    <div className="basis-1/3 rounded-lg shadow-lg p-5">
                    <p className="text-2xl py-5">{section.title}</p>
                    <hr className="px-5" />
                    <p className="py-5 text-xl">{section.description}</p>
                    </div>
                } />
                ))}
            </div>
        </div>
        
        {/* 섹션 */}
        <div className='bg-white mx-auto w-full h-full md:w-3/4 text-center justify-center items-center py-28'>
            <h1 className='text-5xl'>자주 묻는 질문</h1>

            <div className="flex flex-col w-full h-full justify-center items-center mt-10">
            <div className="relative w-[50rem] h-64 min-w-[50rem] min-h-64">
                <AnimatePresence custom={back}>
                <motion.div
                    className="absolute flex flex-col justify-center items-center bg-white rounded-2xl shadow-md p-10 overflow-auto"
                    custom={back}
                    variants={boxVariants}
                    initial="entry"
                    animate="center"
                    exit="exit"
                    key={visible}
                >
                    <div className='relative flex items-center w-full'>
                    <FaQuestion className='absolute left-0 top-0' color='gray' size={40}/>
                    <h1 className="text-2xl pl-16">{QnA[visible].title}</h1>
                    </div>
                    <div className='relative flex items-center w-full mt-10'>
                    <FaExclamation className='absolute left-0 top-0' color='gray' size={40}/>
                    <p className="text-xl text-start pl-16">{QnA[visible].description}</p>
                    </div>
                </motion.div>
                </AnimatePresence>
            </div>
              <div className='mt-10 flex gap-10 justify-center'>
                <button onClick={prevText} className="mr-2 p-2 bg-gray-300 rounded">Previous</button>
                <button onClick={nextText} className="ml-2 p-2 bg-gray-300 rounded">Next</button>
              </div>
              </div>
        </div>
        </>
    );
}

export default SiteInfo;