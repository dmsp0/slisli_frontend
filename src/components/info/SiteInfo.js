import Lottie from 'lottie-react';
import React, { useState, useEffect } from 'react';
import infoLottie from '../../lottie/Animation - 1718775184849.json';
import { AnimatePresence, motion } from "framer-motion";
import { wrap } from '@popmotion/popcorn';
import { QnA } from "../main/QnAdata";
import { FaQuestion,FaExclamation } from "react-icons/fa";
import { section1 } from "./Section1"; // Import section1 data
import { section2 } from "./Section2"; // Import section2 data
import { Link } from 'react-router-dom';



function SiteInfo() {

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
                        
                       
                    </div>
                </div>
            </div>
        </div>
         {/* 섹션 */}
         <div className="bg-white mx-auto w-full md:w-3/4 text-center justify-center items-center py-28">
      <h1 className="text-5xl mb-1">부스 개최 안내</h1>
      <p className="text-2xl text-gray-500">누구나 쉽게 박람회 개최를 도와드립니다</p>

      <div className="flex flex-row mt-20 gap-20 text-left">
        {section1.map((section, index) => (
          <Card key={index} index={index} content={
            <div className='basis-1/3 relative group'>
              <div className='bg-blue-800 w-32 h-32 rounded-full absolute right-0 top-2 transform translate-x-1/2 -translate-y-1/2'>
                <FaExclamation 
                className='inline-block transition-transform group-hover:translate-y-[-20%]' 
                size={50} 
                color='white'
                style={{
                  position: 'relative',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  transition: 'top 0.3s'
                }} 
                />
              </div>
              <div className="bg-blue-50 rounded-2xl shadow-lg p-5">
                <p className="text-2xl py-5 pr-8">{section.title}</p>
                <hr className="px-5" />
                <p className="py-5 text-xl">{section.description}</p>
              </div>
            </div>
          } />
        ))}
      </div>
    </div>
        
        {/* 섹션 */}
        <div className='bg-white mx-auto w-full md:w-3/4 text-center justify-center items-center py-28'>
            <h1 className='text-5xl mb-1'>부스 참가 안내</h1>
            <p className='text-2xl text-gray-500'>원하는 박람회를 어디에서나 참여할 수 있습니다</p>
            
            <div className="flex flex-row mt-20 gap-20 text-left">
                {section2.map((section, index) => (
                <Card key={index} index={index} content={
                  <div className='basis-1/3 relative group'>
                    <div className='bg-blue-800 w-32 h-32 rounded-full absolute right-0 top-2 transform translate-x-1/2 -translate-y-1/2'>
                    <FaExclamation 
                className='inline-block transition-transform group-hover:translate-y-[-20%]' 
                size={50} 
                color='white'
                style={{
                  position: 'relative',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  transition: 'top 0.3s'
                }} 
                />
                </div>
                <div className="bg-blue-50 rounded-2xl shadow-lg p-5">
                    <p className="text-2xl py-5">{section.title}</p>
                    <hr className="px-5" />
                    <p className="py-5 text-xl">{section.description}</p>
                    </div>
                    </div>
                } />
                ))}
            </div>
        </div>
        
        
        </>
    );
}

export default SiteInfo;