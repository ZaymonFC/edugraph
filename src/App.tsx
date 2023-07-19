import { CaptureApiKey } from "./components/Configuration";
import { styled } from "./Stitches";

const Page = styled("div", {
  padding: 0,
  margin: 0,
  backgroundColor: "$background",

  minHeight: "100vh",
});

function App() {
  return (
    <Page>
      <h2>Edugraph</h2>
      <CaptureApiKey />

      <br />

      <p>What do you want to learn?</p>
    </Page>
  );
}

export default App;
