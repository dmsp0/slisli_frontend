import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function BoothHeldList() {

    const navigate = useNavigate();

    const [eventName, setEventName] = useState('');
    const [eventHost, setEventHost] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventStartTime, setEventStartTime] = useState('');
    const [eventEndTime, setEventEndTime] = useState('');
    const [eventImage, setEventImage] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventAvailableSeats, setEventAvailableSeats] = useState('');

    const boothHeldButton = () => {
      if (!eventName || !eventDate || !eventStartTime || !eventEndTime || !eventImage || !eventDescription || !eventAvailableSeats) {
        alert('모든 필드를 입력해주세요.');
      } else {
        console.log('부스 등록 완료');
        alert('부스가 등록되었습니다.\n메인페이지로 이동~.~');
        navigate('/');
      }
    };

  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="col-span-10">
        <h2 className="text-2xl text-center mb-20">부스 개최</h2>

        {/* 입력할 내용들 */}
        <div className="container mx-auto max-w-screen-6xl" style={{ display: "grid", gap: "30px" }}>
          <div className="border-2 p-10 flex align-items-center border-3" style={{ display: "grid", gap: "20px" }}>

            {/* 1. 이벤트 제목 */}
            <div className="flex items-center mb-4">
                <p className="w-24 text-left" style={{ marginRight: "20px", whiteSpace: "nowrap" }}>행사명 :</p>
                <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="개최할 부스명을 입력해주세요." className="flex-grow border rounded py-1 px-2" />
                <span className="ml-5 text-red-400">*</span> 
            </div>

            {/* 2. 주최 */}
            <div className="flex items-center mb-4">
                <p className="w-24 text-left" style={{ marginRight: "20px", whiteSpace: "nowrap" }}>주 최 :</p>
                <input type="text" value={eventHost} onChange={(e) => setEventHost(e.target.value)} placeholder="선택 입력사항입니다." className="flex-grow border rounded py-1 px-2 mr-8" />
            </div>


            {/* 3. 개최일&시간 */}
            <div className="flex items-center mb-4">
                <p className="w-24 text-left" style={{ marginRight: "20px", whiteSpace: "nowrap" }}>일 시 :</p>
                
                {/* 드롭박스 캘린더 부분 */}
                <div className="flex">
                    <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="border rounded py-1 px-2 w-80 mr-5" />
                    <input type="time" value={eventStartTime} onChange={(e) => setEventStartTime(e.target.value)} className="border rounded py-1 w-50 text-center" />
                    <span className="mx-2"> ~ </span>
                    <input type="time" value={eventEndTime} onChange={(e) => setEventEndTime(e.target.value)} className="border rounded py-1 w-50 text-center" />
                </div>
                <span className="ml-5 text-red-400">*</span> 
            </div>          

            {/* 4. 포스터 업로드 */}
            <div className="flex flex-col items-start mb-4 w-full">
                <div className="flex">
                    <p className="w-24 text-left" style={{ marginRight: "20px", whiteSpace: "nowrap" }}>이미지 :</p>
                    <input type="file" value={eventImage} onChange={(e) => setEventImage(e.target.value)} accept="image/*" className="flex-grow border rounded py-1 px-2" />
                </div>
                <p className="text-red-400 text-sm text-left ml-28 mt-2">* 부스이미지 등록은 필수입니다.</p>
                {/* <span className="ml-5 text-red-400">*</span>  */}
            </div>

            {/* 5. 상세정보 */}
            <div className="flex items-center mb-4">
                <p className="w-24 text-left" style={{ marginRight: "20px", whiteSpace: "nowrap" }}>상세정보 :</p>
                <textarea 
                    value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} 
                    placeholder="행사의 상세정보 또는 내용을 입력해주세요.&#10;(최대 1000자)" 
                    className="flex-grow border rounded px-2 resize-vertical" 
                    style={{ minHeight: '100px', maxHeight: '200px', resize: 'vertical' }} />
                <span className="ml-5 text-red-400">*</span> 
            </div>

            {/* 6. 참가인원 */}
            <div className="flex items-center">
                <p className="w-24 text-left" style={{ marginRight: "20px", whiteSpace: "nowrap" }}>참가인원 :</p>
                <input type="number" value={eventAvailableSeats} onChange={(e) => setEventAvailableSeats(e.target.value)} placeholder="참가인원을 숫자형태로 입력해주세요." className="flex-grow border rounded py-1 px-2" />
                <span className="ml-5 text-red-400">*</span> 
            </div>

          </div>
        </div>
      </div>

      {/* 부스 등록 버튼 */}
      <div className="flex justify-center space-x-10">
          <button className=" mt-10 py-2 px-4 hover:bg-blue-400 text-black border-2 rounded-lg" onClick={boothHeldButton}>부스 등록 완료</button>
      </div>
      
    </div>
  );
}

export default BoothHeldList;
