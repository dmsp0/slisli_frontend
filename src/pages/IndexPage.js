import BasicLayout from "../layouts/BasicLayout";
import MainComponent from "../components/MainComponent";
function IndexPage() {
  return (
    <>
      <BasicLayout>
      <img className="w-4/5 mx-auto flex justify-center mb-5" src="../img/modak_bg_home.png" alt="홈이미지"/>
        <MainComponent />
      </BasicLayout>
    </>
  );
}

export default IndexPage;
