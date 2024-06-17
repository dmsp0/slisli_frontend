import BasicLayout from "../layouts/BasicLayout";
import MainView from "../components/mainCom/MainView";
import BoothType from "../components/mainCom/BoothType";
import Trendbooth from "../components/mainCom/Trendbooth";
import Deadlinebooth from "../components/mainCom/Deadlinebooth";


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
