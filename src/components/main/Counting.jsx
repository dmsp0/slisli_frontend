import React, { useState, useEffect, useRef } from 'react';
import { API_URLS } from '../../api/apiConfig';
import axios from 'axios';
import './Counting.css';

const easeOutExpo = (t) => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

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
  const [isVisible, setIsVisible] = useState(false);
  const countingRef = useRef(null);

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

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5 // Trigger when 50% of the component is visible
    };

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    if (countingRef.current) {
      observer.observe(countingRef.current);
    }

    return () => {
      if (countingRef.current) {
        observer.unobserve(countingRef.current);
      }
    };
  }, []);

  const [boothCount, organizerCount, memberCount] = useCountUp(
    isVisible ? targetNumbers : [0, 0, 0],
    2000
  );

  return (
    <div ref={countingRef}>
    <h1 className='responsive-text text-white navigation-font'>부스 수</h1>
    <div className='flex items-center'>
        <p className='responsive-number pr-1 navigation-font'>{boothCount}</p>
        <p className='ptext'>개</p>
    </div>
    <h1 className='responsive-text text-white navigation-font mt-3'>개최자 수</h1>
    <div className='flex items-center'>
        <p className='responsive-number pr-1 navigation-font'>{organizerCount}</p>
        <p className='ptext'>명</p>
    </div>
    <h1 className='responsive-text text-white navigation-font mt-3'>회원 수</h1>
    <div className='flex items-center'>
        <p className='responsive-number pr-1 navigation-font'>{memberCount}</p>
        <p className='ptext'>명</p>
    </div>
</div>

  );
}

export default Counting;
