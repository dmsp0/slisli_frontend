import React, { useEffect, useState, useRef } from "react";
import Footer from "../components/common/Footer";
import TopNav from "../components/common/TopNav";
import { EventSourcePolyfill } from 'event-source-polyfill';
import './noti.css';
import { API_URLS } from "../api/apiConfig";

function BasicLayout({ children }) {
    const [notifications, setNotifications] = useState([]);
    const eventSourceRef = useRef(null);
    const Access_key = localStorage.getItem("accessToken");
    const Refresh_key = localStorage.getItem("refreshToken");
    const userId = localStorage.getItem('member_id');
    const isLoggedIn = !!userId;

    useEffect(() => {
        if (isLoggedIn && !eventSourceRef.current) {
            eventSourceRef.current = new EventSourcePolyfill(
                `${API_URLS.NOTIFICATION}/${userId}`,
                {
                    headers: {
                        "Content-Type": "text/event-stream",
                        "ACCESS_KEY": `${Access_key}`,
                        "REFRESH_KEY": `${Refresh_key}`,
                    },
                    withCredentials: true,
                    heartbeatTimeout: 86400000,
                }
            );

            eventSourceRef.current.onmessage = (event) => {
                const eventData = JSON.parse(event.data);
                const boothTitle = eventData.boothTitle;
                const minutesUntilStart = eventData.minutesUntilStart;

                const notificationMessage = `${boothTitle}가 ${minutesUntilStart}분 후에 시작합니다`;

                setNotifications((prevList) => [...prevList, notificationMessage]);

                // Automatically remove notification after 5 seconds
                setTimeout(() => {
                    setNotifications((prevList) => prevList.filter(notification => notification !== notificationMessage));
                }, 5000);
            };

            eventSourceRef.current.onerror = (error) => {
                console.error('EventSource failed:', error);
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            };
        }

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [isLoggedIn, Access_key, Refresh_key, userId]);

    return (
        <div>
            <TopNav />
            <div className="w-full mx-auto mt-16">
                {children}
            </div>
            <Footer />
            <div className="notification-container">
                {notifications.map((notification, index) => (
                    <div key={index} className="notification slideInRight">
                        {notification}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BasicLayout;