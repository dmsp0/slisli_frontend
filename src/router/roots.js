import { Suspense, lazy } from "react";
import Loading from "../components/common/Loading";
import BoothInsertPage from "../pages/BoothInsertPage";
import AuthKakao from "../components/signInUp/AuthKakao";
import { AuthProvider } from "../context/AuthContext";
import SiteInfoPage from "../pages/SiteInfoPage";
const { createBrowserRouter } = require("react-router-dom");

const Home = lazy(() => import("../pages/IndexPage"));
const MyPage = lazy(() => import("../pages/MyPage"));
const BoothHeld = lazy(() => import("../pages/BoothHeld"));
const ChattingRoom = lazy(() => import("../pages/ChattingRoom"));
const VideoRoom = lazy(() => import("../components/booth/VideoRoom"))
const Login = lazy(() => import("../pages/Login"));
const BoothListPage = lazy(() => import("../pages/BoothListPage"));
const BoothDetailPage = lazy(() => import("../pages/BoothDetailPage"));
const BoothForm = lazy(() => import("../components/booth/BoothForm"));

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
  {

    path: "/booth/edit/:boothId",
    element: (
      <AuthProvider>
      <Suspense fallback={<Loading />}>
        <BoothForm />
      </Suspense>
      </AuthProvider>
    ),
  },
  {

    path: "/siteInfo",
    element: (
      <AuthProvider>
      <Suspense fallback={<Loading />}>
        <SiteInfoPage />
      </Suspense>
      </AuthProvider>
    ),
  },

]);

export default root;