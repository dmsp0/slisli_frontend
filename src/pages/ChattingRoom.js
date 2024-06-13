import BasicLayout from "../layouts/BasicLayout";
import MainComponent from "../components/mainCom/MainComponent";
import Chat from "../components/chat/Chat";


function IndexPage() {
  return (
    <BasicLayout>
        <Chat/>
    </BasicLayout>
  );
}

export default IndexPage;
