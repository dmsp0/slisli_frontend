import { useParams } from "react-router-dom";
import BoothDetail from "../components/booth/BoothDetail";
import BasicLayout from "../layouts/BasicLayout";

function BoothDetailPage() {
    const { id } = useParams();

    return (
      <BasicLayout>
        <BoothDetail id={id} />
      </BasicLayout>
    );
}

export default BoothDetailPage;