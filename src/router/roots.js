import { Suspense, lazy } from "react";
import Loading from "../components/common/Loading";
import BoothInsertPage from "../pages/BoothInsertPage";
import AuthKakao from "../components/mypageCom/AuthKakao";
import { AuthProvider } from "../context/AuthContext";
const { createBrowserRouter } = require("react-router-dom");

const Home = lazy(() => import("../pages/IndexPage"));
const DetailForum = lazy(() => import("../pages/DetailForum"));
const MyPage = lazy(() => import("../pages/MyPage"));
const MyFavorite = lazy(() => import("../pages/MyFavorite"));
const ViewHistory = lazy(() => import("../pages/ViewHistory"));
const BoothHeld = lazy(() => import("../pages/BoothHeld"));
const ChattingRoom = lazy(() => import("../pages/ChattingRoom"));
const VideoRoom = lazy(() => import("../components/booth/VideoRoom"))
const Login = lazy(() => import("../pages/Login"));
const BoothListPage = lazy(() => import("../pages/BoothListPage"));
const BoothDetailPage = lazy(() => import("../pages/BoothDetailPage"));

const root = createBrowserRouter([

  {
    path: "",
    element: (
      <AuthProvider>
    <Suspense fallback={<Loading />}>
        <Home/>
        </Suspense>
        </AuthProvider>
    ),
},
{
  path: "/detailForum",
  element: (
    <AuthProvider>
    <Suspense fallback={<Loading />}>
      <DetailForum />
    </Suspense>
    </AuthProvider>
  ),
},
{
  path: "/myPage",
  element: (
    <AuthProvider>
    <Suspense fallback={<Loading />}>
      <MyPage />
    </Suspense>
    </AuthProvider>
  ),
},
{
path: "/boothheld",
element: (
  <AuthProvider>
  <Suspense fallback={<Loading />}>
    <BoothHeld />
  </Suspense>
  </AuthProvider>
),
},
{
  path: "/boothheld",
  element: (
    <AuthProvider>
    <Suspense fallback={<Loading />}>
      <BoothHeld />
    </Suspense>
    </AuthProvider>
  ),
},
{
  path: "/chat",
  element: (
    <AuthProvider>
    <Suspense fallback={<Loading />}>
      <ChattingRoom />
    </Suspense>
    </AuthProvider>
  ),
},
  {
    path: "/login",
    element: (
      <AuthProvider>
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
      </AuthProvider>
    ),
  },
  {
    path: "/api/auth/kakao",
    element: (
      <AuthProvider>
    <Suspense fallback={<Loading />}>
        <AuthKakao />
    </Suspense>
    </AuthProvider>
    ),
},  
  {
    path: "/booth/list",
    element: (
      <AuthProvider>
      <Suspense fallback={<Loading />}>
        <BoothListPage />
      </Suspense>
      </AuthProvider>
    ),
  },
  {
    path: "/booth/:id",
    element: (
      <AuthProvider>
      <Suspense fallback={<Loading />}>
        <BoothDetailPage />
      </Suspense>
      </AuthProvider>
    ),
  },
  {
    path: "/booths/company",
    element: (
      <AuthProvider>
      <Suspense fallback={<Loading />}>
        <BoothListPage type="COMPANY" />
      </Suspense>
      </AuthProvider>
    ),
  },
  {
    path: "/booths/individual",
    element: (
      <AuthProvider>
      <Suspense fallback={<Loading />}>
        <BoothListPage type="INDIVIDUAL" />
      </Suspense>
      </AuthProvider>
    ),
  },
  {
    path: "/booth/VideoRoom/:videoRoomId",
    element: (
      <AuthProvider>
      <Suspense fallback={<Loading />}>
        <VideoRoom/>
      </Suspense>
      </AuthProvider>
    ),
  },
  {
    path: "/booth/registration",
    element: (
      <AuthProvider>
      <Suspense fallback={<Loading />}>
        <BoothInsertPage />
      </Suspense>
      </AuthProvider>
    ),
  },


]);

export default root;
