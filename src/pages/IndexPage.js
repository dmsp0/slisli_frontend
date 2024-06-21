import React from "react";
import BasicLayout from "../layouts/BasicLayout";
import MainView from "../components/main/MainView";
import BoothType from "../components/main/BoothType";
import Trendbooth from "../components/main/Trendbooth";
import Deadlinebooth from "../components/main/Deadlinebooth";

function IndexPage() {
  return (
    <BasicLayout>
                <MainView />
                <BoothType />
                <Trendbooth />
                <Deadlinebooth />
    </BasicLayout>
  );
}

export default IndexPage;