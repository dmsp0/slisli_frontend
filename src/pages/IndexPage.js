import React from "react";
import BasicLayout from "../layouts/BasicLayout";
import MainView from "../components/main/MainView";
import BoothType from "../components/main/BoothType";
import HeldButton from "../components/main/HeldButton";
import QnACom from "../components/main/QnACom";

function IndexPage() {
  return (
    <BasicLayout>
                <MainView />
                <BoothType />
                <QnACom />
                <HeldButton />
    </BasicLayout>
  );
}

export default IndexPage;