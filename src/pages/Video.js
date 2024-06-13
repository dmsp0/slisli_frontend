import { useParams } from "react-router-dom";

import BasicLayout from "../layouts/BasicLayout";
// import VideoComponent from "../components/video/VideoComponent";video
import MainWindow from "../components/video/MainWindow";
import LoginWindow from "../components/video/LoginWindow";
import VideoApp from "../components/video/VideoApp";

function Video() {
    const { id } = useParams();

    return (
      <BasicLayout>
        <VideoApp />
      </BasicLayout>
    );
}

export default Video;