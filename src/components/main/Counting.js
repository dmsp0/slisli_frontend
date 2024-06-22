import React, { useState, useEffect } from 'react';
import { API_URLS } from '../../api/apiConfig';
import axios from 'axios';

/** 진행률에 따라 count 속도 조절 */
const easeOutExpo = (t) => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** 점차 느려지는 count up 함수 */
const useCountUp = (targetNumbers, duration) => {
  const [counts, setCounts] = useState(targetNumbers.map(() => 0));
  const frameRate = 1000 / 60;
  const totalFrame = Math.round(duration / frameRate);

  useEffect(() => {
    const counters = targetNumbers.map((num, index) => {
      let currentNumber = 0;
      return setInterval(() => {
        const progressRate = easeOutExpo(++currentNumber / totalFrame);
        setCounts(prevCounts => {
          const newCounts = [...prevCounts];
          newCounts[index] = Math.round(num * progressRate);
          return newCounts;
        });

        // 진행 완료시 interval 해제
        if (progressRate === 1) {
          clearInterval(counters[index]);
        }
      }, frameRate);
    });

    return () => {
      counters.forEach(counter => clearInterval(counter));
    };
  }, [targetNumbers, totalFrame]);

  return counts;
}

const Counting = () => {
  const [targetNumbers, setTargetNumbers] = useState([0, 0, 0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(API_URLS.MAIN_COUNTING);
        const { totalBooths, uniqueBoothMembers, totalMembers } = response.data;
        setTargetNumbers([totalBooths, uniqueBoothMembers, totalMembers]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching booth stats:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const [boothCount, organizerCount, memberCount] = useCountUp(targetNumbers, 2000);

  return (
    <div>
      <h1 className='text-white text-2xl md:text-3xl lg:text-4xl navigation-font mb-1'>등록된 부스 수</h1>
      <p className='text-xl md:text-2xl lg:text-3xl'>{boothCount}개</p>
      <h1 className='text-white text-2xl md:text-3xl lg:text-4xl navigation-font mb-1 mt-6'>개최자 수</h1>
      <p className='text-xl md:text-2xl lg:text-3xl'>{organizerCount}명</p>
      <h1 className='text-white text-2xl md:text-3xl lg:text-4xl navigation-font mb-1 mt-6'>회원 수</h1>
      <p className='text-xl md:text-2xl lg:text-3xl'>{memberCount}명</p>
    </div>
  );
}

export default Counting;
