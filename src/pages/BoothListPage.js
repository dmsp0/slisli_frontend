import React from "react";
import BoothList from "../components/booth/BoothList";
import BasicLayout from "../layouts/BasicLayout";

function BoothListPage({ type }) {
    return (
        <BasicLayout>
            <BoothList type={type} />
        </BasicLayout>
    );
}

export default BoothListPage;
