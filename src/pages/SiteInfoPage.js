import SiteInfo from "../components/info/SiteInfo";
import Deadlinebooth from "../components/main/HeldButton";
import BasicLayout from "../layouts/BasicLayout";


function SiteInfoPage() {
  return (
    <BasicLayout>
        <SiteInfo/>
        <Deadlinebooth />
    </BasicLayout>
  );
}

export default SiteInfoPage;