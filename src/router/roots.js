import { Suspense, lazy } from "react";
import Loading from "../components/common/Loading";
import BoothInsertPage from "../pages/BoothInsertPage";
import AuthKakao from "../components/mypageCom/AuthKakao";
import Video from "../pages/Video";
const { createBrowserRouter } = require("react-router-dom");

const Home = lazy(() => import("../pages/IndexPage"));
const DetailForum = lazy(() => import("../pages/DetailForum"));
const MyPage = lazy(() => import("../pages/MyPage"));
const MyFavorite = lazy(() => import("../pages/MyFavorite"));
const ViewHistory = lazy(() => import("../pages/ViewHistory"));
const BoothHeld = lazy(() => import("../pages/BoothHeld"));
const ChattingRoom = lazy(() => import("../pages/ChattingRoom"));
const VideoRoom = lazy(() => import("../components/booth/VideoRoom"))
// const FindPwd = lazy(() => import("../pages/find/FindPwdPage"));
const Login = lazy(() => import("../pages/Login"));
const BoothListPage = lazy(() => import("../pages/BoothListPage"));
const BoothDetailPage = lazy(() => import("../pages/BoothDetailPage"));

// const AccessToken = lazy(() => import("../pages/social/getAccessPage"));

const root = createBrowserRouter([

    {
        path: "",
        element: (
        <Suspense fallback={<Loading />}>
            <Home/>
            </Suspense>
        ),
    },
    {
      path: "/detailForum",
      element: (
        <Suspense fallback={<Loading />}>
          <DetailForum />
        </Suspense>
      ),
    },
    {
      path: "/myPage",
      element: (
        <Suspense fallback={<Loading />}>
          <MyPage />
        </Suspense>
      ),
    },
  {
    path: "/favoritelist",
    element: (
      <Suspense fallback={<Loading />}>
        <MyFavorite />
      </Suspense>
    ),
  },
  {
    path: "/historylist",
    element: (
      <Suspense fallback={<Loading />}>
        <ViewHistory />
      </Suspense>
    ),
  },
  {
    path: "/boothheld",
    element: (
      <Suspense fallback={<Loading />}>
        <BoothHeld />
      </Suspense>
    ),
  },
  {
    path: "/chat",
    element: (
      <Suspense fallback={<Loading />}>
        <ChattingRoom />
      </Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/auth/kakao",
    element: (
    <Suspense fallback={<Loading />}>
        <AuthKakao />
    </Suspense>
    ),
},  
  {
    path: "/booth/list",
    element: (
      <Suspense fallback={<Loading />}>
        <BoothListPage />
      </Suspense>
    ),
  },
  {
    path: "/booth/:id",
    element: (
      <Suspense fallback={<Loading />}>
        <BoothDetailPage />
      </Suspense>
    ),
  },
  {
    path: "/booths/company",
    element: (
      <Suspense fallback={<Loading />}>
        <BoothListPage type="COMPANY" />
      </Suspense>
    ),
  },
  {
    path: "/booths/individual",
    element: (
      <Suspense fallback={<Loading />}>
        <BoothListPage type="INDIVIDUAL" />
      </Suspense>
    ),
  },
  {
    path: "/booth/VideoRoom/:videoRoomId",
    element: (
      <Suspense fallback={<Loading />}>
        <VideoRoom/>
      </Suspense>
    ),
  },
  {
    path: "/booth/registration",
    element: (
      <Suspense fallback={<Loading />}>
        <BoothInsertPage />
      </Suspense>
    ),
  },
    {
        path: "/video/video",
        element: (
            <Suspense fallback={<Loading />}>
            <Video />
            </Suspense>
        ),
    },

]);

export default root;
