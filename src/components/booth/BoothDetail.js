import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URLS } from '../../api/apiConfig';

function BoothDetail({ id }) {
    const [booth, setBooth] = useState(null);

    useEffect(() => {
        async function fetchBooth() {
            try {
                const response = await axios.get(API_URLS.BOOTH_GET_BY_ID.replace('{id}', id));
                setBooth(response.data);
            } catch (error) {
                console.error('Error fetching booth', error);
            }
        }
        if (id) {
            fetchBooth();
        }
    }, [id]);

    if (!booth) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img src={`${booth.imgPath}`} alt={booth.title} className="w-full h-128 object-cover" />
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-4">{booth.title}</h1>
                    <p className="text-gray-700 mb-4">{booth.info}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-gray-700"><span className="font-semibold">카테고리:</span> {booth.category}</p>
                            <p className="text-gray-700"><span className="font-semibold">일시:</span> {booth.date}</p>
                            <p className="text-gray-700"><span className="font-semibold">시작 시간:</span> {booth.startTime}</p>
                            <p className="text-gray-700"><span className="font-semibold">종료 시간:</span> {booth.endTime}</p>
                        </div>
                        <div>
                            <p className="text-gray-700"><span className="font-semibold">참가 인원:</span> {booth.maxPeople}</p>
                            <p className="text-gray-700"><span className="font-semibold">주최자:</span> {booth.openerName}</p>
                        </div>
                    </div>
                    <div className="text-center mt-6">
                        <button className="bg-blue-500 text-white font-bold py-8 px-16 text-3xl rounded-full hover:bg-blue-700 transition duration-300">
                            라이브 참여
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BoothDetail;