import config from "../config";

const BASE_URL = config.API_BASE_URL;

export const API_URLS = {
    INSTANCEAPI: `${BASE_URL}/api`,
    BOOTH_INSERT: `${BASE_URL}/api/booths/insert`,
    BOOTH_GET_LIST: `${BASE_URL}/api/booths/get`,
    BOOTH_GET_BY_ID: `${BASE_URL}/api/booths/get/{id}`,
    SEND_AUTHENTICATION_EMAIL: `${BASE_URL}/api/auth/send-code`,
    CHECK_AUTHENTICATION_EMAIL: `${BASE_URL}/api/auth/verify-code`,
    TOKEN_REFRECH: `${BASE_URL}/api/auth/refresh`,
    SIGN_UP: `${BASE_URL}/api/member/signup`,
    LOG_IN: `${BASE_URL}/api/member/login`,
    MEMBER_UPDATE: `${BASE_URL}/api/member/update`,
};