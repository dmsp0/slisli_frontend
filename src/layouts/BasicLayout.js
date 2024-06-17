import React, { useEffect, useState } from "react";
import Footer from "../components/common/Footer";
import TopNav from "../components/common/TopNav";
import { EventSourcePolyfill } from 'event-source-polyfill';
import './noti.css';
import { API_URLS } from "../api/apiConfig";

function BasicLayout({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [closingNotifications, setClosingNotifications] = useState([]);

    const Access_key = localStorage.getItem("accessToken");
    const Refresh_key = localStorage.getItem("refreshToken");
    const userId = localStorage.getItem('member_id');
    const isLoggedIn = !!userId;

    useEffect(() => {
        if (isLoggedIn) {
            const fetchSse = async () => {
                try {
                    const eventSource = new EventSourcePolyfill(
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

                    eventSource.onmessage = (event) => {
                        const eventData = JSON.parse(event.data);
                        const boothTitle = eventData.boothTitle;
                        const minutesUntilStart = eventData.minutesUntilStart;

                        const notificationMessage = `${boothTitle}가 ${minutesUntilStart}분 후에 시작합니다`;
                        
                        setNotifications((prevList) => [...prevList, notificationMessage]);
                        
                        // Automatically remove notification after 10 seconds
                        setTimeout(() => {
                            setClosingNotifications((prevList) => [...prevList, notificationMessage]);
                        }, 5000);
                    };

                    eventSource.onerror = (error) => {
                        console.error('EventSource failed:', error);
                        eventSource.close();
                    };

                    return () => {
                        eventSource.close();
                    };
                } catch (error) {
                    console.error('Error in fetchSse:', error);
                }
            };
            fetchSse();
        }
    }, [isLoggedIn, Access_key, Refresh_key, userId]);

    useEffect(() => {
        // Cleanup closing notifications after animation duration
        if (closingNotifications.length > 0) {
            setTimeout(() => {
                setNotifications((prevList) => prevList.filter(notification => !closingNotifications.includes(notification)));
                setClosingNotifications([]);
            }, 500); // Assuming animation duration is 0.5s (500ms)
        }
    }, [closingNotifications]);

    return (
        <div>
            <TopNav />
            <div className="w-full mx-auto mt-16">
                {children}
            </div>
            <Footer />
            <div className="notification-container">
                {notifications.map((notification, index) => (
                    <div key={index} className={`notification ${closingNotifications.includes(notification) ? 'slideOutRight' : 'slideInRight'}`}>
                        {notification}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BasicLayout;
