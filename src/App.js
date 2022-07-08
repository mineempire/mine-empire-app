import GlobalStyle, { PageContainer } from "./globalStyles";
import Navbar from "./components/Navbar/Navbar";
import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer/Footer";

// Pages
import Dashboard from "./pages/Dashboard";
import Cosmos from "./pages/Cosmos";
import Market from "./pages/Market";
import Refinery from "./pages/Refinery";
import Converter from "./pages/Converter";
import Inventory from "./pages/Inventory";
import Gades from "./pages/Gades";
import Oberon from "./pages/Oberon";
import CanopsysPrime from "./pages/CanopsysPrime";
import { useEffect } from "react";
import Rewards from "./pages/Rewards";

function App() {
  const switchNetwork = async () => {
    if (window.ethereum.networkVersion !== 4002) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xfa2" }],
        });
      } catch (err) {
        if (err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainName: "Fantom Testnet",
                chainId: "0xfa2",
                nativeCurrency: { name: "Fantom", decimals: 18, symbol: "FTM" },
                rpcUrls: ["https://rpc.testnet.fantom.network/"],
                blockExplorerUrls: ["https://testnet.ftmscan.com/"],
              },
            ],
          });
        }
      }
    }
  };

  useEffect(() => {
    switchNetwork();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <GlobalStyle />
      <Navbar />
      <PageContainer>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cosmos" element={<Cosmos />} />
          <Route path="/cosmos/gades" element={<Gades />} />
          <Route path="/cosmos/oberon" element={<Oberon />} />
          <Route path="/cosmos/canopsysprime" element={<CanopsysPrime />} />
          <Route path="/market" element={<Market />} />
          <Route path="/refinery" element={<Refinery />} />
          <Route path="/converter" element={<Converter />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/rewards" element={<Rewards />} />
        </Routes>
      </PageContainer>
      <Footer />
    </>
  );
}

export default App;
