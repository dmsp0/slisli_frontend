import config from "../config";

const BASE_URL = config.API_BASE_URL;

export const API_URLS = {
    INSTANCEAPI: `${BASE_URL}/api`,

    // 부스
    BOOTH_INSERT: `${BASE_URL}/api/booths/insert`,
    BOOTH_GET_LIST: `${BASE_URL}/api/booths/get`,
    BOOTH_GET_BY_ID: `${BASE_URL}/api/booths/get/{id}`,
    BOOTH_HOSTINSERT:  `${BASE_URL}/api/booths/set`,
    BOOTH_HOSTSELECT:  `${BASE_URL}/api/booths/gget`,

    // 인증
    SEND_AUTHENTICATION_EMAIL: `${BASE_URL}/api/auth/send-code`,
    CHECK_AUTHENTICATION_EMAIL: `${BASE_URL}/api/auth/verify-code`,
    TOKEN_REFRECH: `${BASE_URL}/api/auth/refresh`,
    SEND_CODE: `${BASE_URL}/api/mail/send-code`,
    VERIFIY_CODE: `${BASE_URL}/api/mail/verify-code`,

    // 멤버
    SIGN_UP: `${BASE_URL}/api/member/signup`,
    LOG_IN: `${BASE_URL}/api/member/login`,
    MEMBER_UPDATE: `${BASE_URL}/api/member/update`,
    MEMBER_DELETE:`${BASE_URL}/api/member/delete`,

    // 좋아요
    BOOTH_LIKED:`${BASE_URL}/api/booths/liked`,
    BOOTH_LIKE:`${BASE_URL}/api/booths/like`,
    BOOTH_UNLIKE:`${BASE_URL}/api/booths/unlike`,
    BOOTH_LIKED_LIST:`${BASE_URL}/api/booths/likedList`,

    //알림
    NOTIFICATION : `${BASE_URL}/sse/subscribe`,
    
    //마이페이지 마이부스
    BOOTH_GET_BY_USERID: `${BASE_URL}/api/booths/get_my`,
    BOOTH_DELETE: `${BASE_URL}/api/booths/delete`,
    BOOTH_UPDATE: `${BASE_URL}/api/booths/update`,

    KAKAO: `${BASE_URL}/api/auth/kakao`,

    BOOTH_TOP_LIKED_BY_CATEGORY: `${BASE_URL}/api/booths/top-liked-by-category`,
    BOOTH_LATEST_BY_CATEGORY: `${BASE_URL}/api/booths/latest-by-category`,
    MAIN_COUNTING: `${BASE_URL}/api/booths/counting`,

    //채팅
    SAVE_CHAT_MESSAGE: `${BASE_URL}/api/chat/save`
};