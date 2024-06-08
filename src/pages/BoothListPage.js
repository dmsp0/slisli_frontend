import BoothList from "../components/booth/BoothList";
import BasicLayout from "../layouts/BasicLayout";
function BoothListPage() {
  return (
    <>
      <BasicLayout>
        <div className="h-14 bg-blue-400"/>
        <BoothList />
      </BasicLayout>
    </>
  );
}

export default BoothListPage;