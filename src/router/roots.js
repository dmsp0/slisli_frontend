import { Suspense, lazy } from "react";
import Loading from "../components/common/Loading";
const { createBrowserRouter } = require("react-router-dom");

const Home = lazy(() => import("../pages/IndexPage"));
const DetailForum = lazy(() => import("../pages/DetailForum"));
const MyPage = lazy(() => import("../pages/MyPage"));
const MyFavorite = lazy(() => import("../pages/MyFavorite"));
const ViewHistory = lazy(() => import("../pages/ViewHistory"));
const BoothHeld = lazy(() => import("../pages/BoothHeld"));
const ChattingRoom = lazy(() => import("../pages/ChattingRoom"));
// const FindPwd = lazy(() => import("../pages/find/FindPwdPage"));
const Login = lazy(() => import("../pages/Login"));
const BoothListPage = lazy(() => import("../pages/BoothListPage"));
const BoothDetailPage = lazy(() => import("../pages/BoothDetailPage"));
// const ListByWeather = lazy(() => import("../pages/CampingListByWeatherPage"));
// const Detail = lazy(() => import("../pages/CampingDetailPage.js"));
// const CampReview = lazy(() => import("../pages/CampReview"));
// const CampReviewDetail = lazy(() => import("../pages/CampReviewDetail"));
// const WriteReviewPage = lazy(() => import("../pages/WriteReviewPage")); // 변경
// const NoticePage = lazy(() => import("../pages/noticepage/NoticePage"));
// const FAQPage = lazy(() => import("../pages/noticepage/FAQPage"));
// const CampingFoodPage = lazy(() => import("../pages/CampingFoodPage"));

// const CampingInfo = lazy(() =>
//   import("../pages/campingInformation/CampingInfo")
// );


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
//   {
//     path: "/camp/list",
//     element: (
//       <Suspense fallback={<Loading />}>
//         <List />
//       </Suspense>
//     ),
//   },
//   {
//     path: "/camp/listByWeather",
//     element: (
//       <Suspense fallback={<Loading />}>
//         <ListByWeather />
//       </Suspense>
//     ),
//   },
//   {
//     path: "/notice",
//     element: (
//       <Suspense fallback={<Loading />}>
//         <NoticePage />{" "}
//       </Suspense>
//     ),
//   },
//   {
//     path: "/camp/:campNo",
//     element: (
//       <Suspense fallback={<Loading />}>
//         <Detail />
//       </Suspense>
//     ),
//   },
//   {
//     path: "/faq",
//     element: (
//       <Suspense fallback={<Loading />}>
//         <FAQPage />
//       </Suspense>
//     ),
//   },
//   {
//     path: "/notice",
//     element: (
//       <Suspense fallback={<Loading />}>
//         <NoticePage />
//       </Suspense>
//     ),
//   },
//   {
//     path: "/campreview/:id",
//     element: (
//       <Suspense fallback={<Loading />}>
//         <CampReviewDetail />
//       </Suspense>
//     ),
//   },
//   {
//     path: "/write-review",
//     element: (
//       <Suspense fallback={<Loading />}>
//         <WriteReviewPage />
//       </Suspense>
//     ),
//   },
//   {
//     path: "/campreview",
//     element: (
//       <Suspense fallback={<Loading />}>
//         <CampReview />
//       </Suspense>
//     ),
//   },
//   {

//     path: "/campFood",
//     element: (
//       <Suspense fallback={<Loading />}>
//         <CampingFoodPage />
//       </Suspense>
//     ),
//   },
//   {

//     path: "/campinfo",
//     element: (
//       <Suspense fallback={<Loading />}>
//         <CampingInfo />
//       </Suspense>
//     ),
//   },
//   {
//     path: "/getAccess",
//     element: (
//       <Suspense fallback={<Loading />}>
//         <AccessToken />

//       </Suspense>
//     ),
//   }

]);

export default root;
