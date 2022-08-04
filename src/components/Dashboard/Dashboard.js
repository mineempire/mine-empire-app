import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { injected } from "../../connectors";
import {
  BEETS_VAULT,
  converterAddress,
  cosmicCashAddress,
  FTMScanAPI1,
  FTMScanAPI2,
  FTMScanAPI3,
  gadesAddress,
  GemBeetsVault,
  MineEmpireAddress,
  mineEmpireDrillAddress,
  MineEmpireVestingWallet,
  OberonAddress,
  TreasuryAddress,
} from "../../contracts/Addresses";
import {
  Container,
  Button,
  Line,
  ButtonContainer,
  TitleContainer,
  BasicButton,
} from "../../globalStyles";
import { AsteroidDrillPower } from "../../stats/DrillStats";
import {
  getCybeleContract,
  getGadesContract,
  getOberonContract,
  isConnected,
  sleep,
} from "../../Web3Client";
import {
  DashboardSection,
  TokenInfoCard,
  TokenInfoCardImgContainer,
  TokenInfoTitleContainer,
  CardFeature,
  CardDescription,
  SmallText,
  SmallTextDollar,
  TokenInfoCardStats,
  DashboardContainer,
  TokenInfoCardContainer,
  IncomeContainer,
  IncomeTable,
  IncomeItem,
  DataDiv,
  ResourceItem,
  ResourceIncomeTable,
  IncomeLine,
} from "./DashboardStyles";

const DashboardBody = () => {
  const [cosmicCashPrice, setCosmicCashPrice] = useState(0);
  const [circulatingSupply, setCirculatingSupply] = useState(0);
  const [totalCosmicCashLiquidity, setTotalCosmicCashLiquidity] = useState(0);
  const [gemPrice, setGemPrice] = useState(0);
  const [gemCirculatingSupply, setGemCirculatingSupply] = useState(0);
  const [totalGemLiquidity, setTotalGemLiquidity] = useState(0);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [gadesProduction, setGadesProduction] = useState(0);
  const [gadesEarnings, setGadesEarnigns] = useState(0);
  const [oberonProduction, setOberonProduction] = useState(0);
  const [oberonEarnings, setOberonEarnings] = useState(0);
  const [cybeleProduction, setCybeleProduction] = useState(0);
  const [cybeleEarnings, setCybeleEarnings] = useState(0);
  const [cscInWallet, setCscInWallet] = useState(0);
  const [gemInWallet, setGemInWallet] = useState(0);

  const gadesContract = getGadesContract();
  const oberonContract = getOberonContract();
  const cybeleContract = getCybeleContract();

  async function handleAddCSCToMM() {
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: cosmicCashAddress,
            symbol: "CSC",
            decimals: 18,
            image: "https://mineempire.io/assets/csc-256x256.png",
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleAddGEMToMM() {
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: MineEmpireAddress,
            symbol: "GEM",
            decimals: 18,
            image: "https://app.mineempire.io/assets/gem-256x256.png",
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function getCosmicCashPrice() {
    let priceUsd = 0;
    let url =
      "https://api.dexscreener.com/latest/dex/tokens/" + cosmicCashAddress;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        priceUsd = data["pairs"][0]["priceUsd"];
        setCosmicCashPrice(priceUsd);
      });
    let lockedCsc = 0;
    url =
      "https://api.ftmscan.com/api?module=account&action=tokenbalance&contractaddress=" +
      cosmicCashAddress +
      "&address=" +
      converterAddress +
      "&tag=latest&apikey=" +
      FTMScanAPI1;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data["result"]) {
          lockedCsc = lockedCsc + +ethers.utils.formatEther(data["result"]);
        }
      });
    url =
      "https://api.ftmscan.com/api?module=account&action=tokenbalance&contractaddress=" +
      cosmicCashAddress +
      "&address=" +
      "0x000000000000000000000000000000000000dEaD" +
      "&tag=latest&apikey=" +
      FTMScanAPI2;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data["result"]) {
          lockedCsc = lockedCsc + +ethers.utils.formatEther(data["result"]);
        }
      });
    setCirculatingSupply(10000000 - lockedCsc);
    url =
      "https://api.ftmscan.com/api?module=account&action=tokenbalance&contractaddress=" +
      cosmicCashAddress +
      "&address=" +
      BEETS_VAULT +
      "&tag=latest&apikey=" +
      FTMScanAPI3;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data["result"]) {
          const cscInPool = +ethers.utils.formatEther(data["result"]);
          setTotalCosmicCashLiquidity(cscInPool * 2 * priceUsd);
        }
      });
  }

  async function getGemPrice() {
    let lockedGem = 0;
    let priceUsd = 0;
    let url =
      "https://api.dexscreener.com/latest/dex/tokens/" + MineEmpireAddress;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        priceUsd = data["pairs"][0]["priceUsd"];
        setGemPrice(priceUsd);
      });
    url =
      "https://api.ftmscan.com/api?module=account&action=tokenbalance&contractaddress=" +
      MineEmpireAddress +
      "&address=" +
      MineEmpireVestingWallet +
      "&tag=latest&apikey=" +
      FTMScanAPI1;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (!isNaN(data["result"])) {
          lockedGem = lockedGem + +ethers.utils.formatEther(data["result"]);
        }
      });
    setGemCirculatingSupply(10000 - lockedGem);
    url =
      "https://api.ftmscan.com/api?module=account&action=tokenbalance&contractaddress=" +
      MineEmpireAddress +
      "&address=" +
      GemBeetsVault +
      "&tag=latest&apikey=" +
      FTMScanAPI2;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data["result"]) {
          const gemInPool = +ethers.utils.formatEther(data["result"]);
          setTotalGemLiquidity(gemInPool * priceUsd * 1.25);
        }
      });
  }

  async function getStakedAmount() {
    let amt = 0;
    let url =
      "https://api.ftmscan.com/api?module=account&action=tokenbalance&contractaddress=" +
      mineEmpireDrillAddress +
      "&address=" +
      gadesAddress +
      "&tag=latest&apikey=" +
      FTMScanAPI3;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (!isNaN(data["result"])) {
          amt = +data["result"];
        }
      });
    url =
      "https://api.ftmscan.com/api?module=account&action=tokenbalance&contractaddress=" +
      mineEmpireDrillAddress +
      "&address=" +
      OberonAddress +
      "&tag=latest&apikey=" +
      FTMScanAPI1;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (!isNaN(data["result"])) {
          amt = amt + +data["result"];
        }
      });
    setStakedAmount(amt);
  }

  async function getTreasuryValue() {
    let cscInWallet = 0;
    let gemInWallet = 0;
    let url =
      "https://api.ftmscan.com/api?module=account&action=tokenbalance&contractaddress=" +
      cosmicCashAddress +
      "&address=" +
      TreasuryAddress +
      "&tag=latest&apikey=" +
      FTMScanAPI2;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (!isNaN(data["result"])) {
          cscInWallet = +ethers.utils.formatEther(data["result"]);
        }
      });
    url =
      "https://api.ftmscan.com/api?module=account&action=tokenbalance&contractaddress=" +
      MineEmpireAddress +
      "&address=" +
      TreasuryAddress +
      "&tag=latest&apikey=" +
      FTMScanAPI3;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (!isNaN(data["result"])) {
          gemInWallet = +ethers.utils.formatEther(data["result"]);
        }
      });
    setCscInWallet(cscInWallet);
    setGemInWallet(gemInWallet);
  }

  async function getGadesProduction() {
    if (!isConnected()) return;
    let baseProduction = 0;
    await gadesContract.methods
      .getBaseProduction()
      .call()
      .then((result) => {
        baseProduction = +ethers.utils.formatEther(result);
      })
      .catch((err) => console.log(err));
    const addr = await injected.getAccount();
    await gadesContract.methods
      .stakes(addr)
      .call()
      .then((stake) => {
        const drillId = stake[0];
        if (drillId === "0") return;
        const level = +stake["drill"]["level"];
        const mult = AsteroidDrillPower[level];
        const prodPerDay = Math.floor(
          (baseProduction * 60 * 60 * 24 * mult) / 100
        );
        const prodPerDayUsd = Math.floor((prodPerDay / 13809) * 1000) / 1000;
        setGadesProduction(prodPerDay);
        setGadesEarnigns(prodPerDayUsd);
      });
  }

  async function getOberonProduction() {
    if (!isConnected()) return;
    let baseProduction = 0;
    await oberonContract.methods
      .getBaseProduction()
      .call()
      .then((result) => {
        baseProduction = +ethers.utils.formatEther(result);
      })
      .catch((err) => console.log(err));
    const addr = await injected.getAccount();
    await oberonContract.methods
      .stakes(addr)
      .call()
      .then((stake) => {
        const drillId = stake[0];
        if (drillId === "0") return;
        const level = +stake["drill"]["level"];
        const mult = AsteroidDrillPower[level];
        const prodPerDay = Math.floor(
          (baseProduction * 60 * 60 * 24 * mult) / 100
        );
        const prodPerDayUsd = Math.floor((prodPerDay / 2798) * 1000) / 1000;
        setOberonProduction(prodPerDay);
        setOberonEarnings(prodPerDayUsd);
      });
  }

  async function getCybeleProduction() {
    if (!isConnected()) return;
    let baseProduction = 0;
    await cybeleContract.methods
      .getBaseProduction()
      .call()
      .then((result) => {
        baseProduction = +ethers.utils.formatEther(result);
      })
      .catch((err) => console.log(err));
    const addr = await injected.getAccount();
    await cybeleContract.methods
      .stakes(addr)
      .call()
      .then((stake) => {
        const drillId = stake[0];
        if (drillId === "0") return;
        const level = +stake["drill"]["level"];
        const mult = AsteroidDrillPower[level];
        const prodPerDay = Math.floor(
          (baseProduction * 60 * 60 * 24 * mult) / 100
        );
        const prodPerDayUsd = Math.floor((prodPerDay / 2076) * 1000) / 1000;
        setCybeleProduction(prodPerDay);
        setCybeleEarnings(prodPerDayUsd);
      });
  }

  async function updateState() {
    await getCosmicCashPrice();
    await sleep(500);
    await getGemPrice();
    await sleep(500);
    await getTreasuryValue();
    await sleep(500);
    await getStakedAmount();
    await sleep(500);
    await getGadesProduction();
    await sleep(500);
    await getOberonProduction();
    await sleep(500);
    await getCybeleProduction();
  }

  useEffect(() => {
    updateState();
    const intervalId = setInterval(() => {
      updateState();
    }, 10000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, []);

  return (
    <DashboardSection>
      <Container>
        <TitleContainer>
          <h1>Mine Empire</h1>
          <h3>The first emissionless, idle game built for passive income.</h3>
        </TitleContainer>
      </Container>
      <DashboardContainer>
        <TokenInfoCardContainer>
          <DataDiv>
            <h1>{stakedAmount}</h1>
            <h3>Daily Active Miners</h3>
          </DataDiv>
          <DataDiv>
            <h1>
              $
              {Math.ceil(
                cscInWallet * cosmicCashPrice +
                  gemInWallet * gemPrice +
                  totalCosmicCashLiquidity +
                  totalGemLiquidity
              ).toLocaleString("en-US")}
            </h1>
            <h3>Total Treasury Value</h3>
          </DataDiv>
        </TokenInfoCardContainer>
        <IncomeContainer>
          <h1>My Total Income</h1>
          <IncomeLine />
          <ResourceIncomeTable>
            <ResourceItem>
              <img src="../../assets/iron.png" alt="" />
              <p>
                {gadesProduction} Iron ≈ $
                {Math.floor(gadesEarnings * cosmicCashPrice * 1000) / 1000}{" "}
                daily
              </p>
              <Link to="cosmos/gades">
                <BasicButton>View</BasicButton>
              </Link>
            </ResourceItem>
            <ResourceItem>
              <img src="../../assets/cobalt.png" alt="" />
              <p>
                {oberonProduction} Cobalt ≈ $
                {Math.floor(oberonEarnings * cosmicCashPrice * 1000) / 1000}{" "}
                daily
              </p>
              <Link to="cosmos/oberon">
                <BasicButton>View</BasicButton>
              </Link>
            </ResourceItem>
            <ResourceItem>
              <img src="../../assets/silver.png" alt="" />
              <p>
                {cybeleProduction} Silver ≈ $
                {Math.floor(cybeleEarnings * cosmicCashPrice * 1000) / 1000}{" "}
                daily
              </p>
              <Link to="cosmos">
                <BasicButton>View</BasicButton>
              </Link>
            </ResourceItem>
          </ResourceIncomeTable>
          <IncomeLine />
          <IncomeTable>
            <IncomeItem>
              <p>
                $
                {Math.floor(
                  (gadesEarnings + oberonEarnings + cybeleEarnings) *
                    cosmicCashPrice *
                    100
                ) / 100}{" "}
                Daily
              </p>
            </IncomeItem>
            <IncomeItem>
              <p>
                $
                {Math.floor(
                  (gadesEarnings + oberonEarnings + cybeleEarnings) *
                    cosmicCashPrice *
                    7 *
                    100
                ) / 100}{" "}
                Weekly
              </p>
            </IncomeItem>
            <IncomeItem>
              <p>
                $
                {Math.floor(
                  (gadesEarnings + oberonEarnings + cybeleEarnings) *
                    cosmicCashPrice *
                    30 *
                    100
                ) / 100}{" "}
                Monthly
              </p>
            </IncomeItem>
            <IncomeItem>
              <p>
                $
                {Math.floor(
                  (gadesEarnings + oberonEarnings + cybeleEarnings) *
                    cosmicCashPrice *
                    365 *
                    100
                ) / 100}{" "}
                Yearly
              </p>
            </IncomeItem>
          </IncomeTable>
        </IncomeContainer>
        <TokenInfoCardContainer>
          <TokenInfoCard>
            <TokenInfoCardImgContainer>
              <img src="../../assets/gem-256x256.png" alt="" />
            </TokenInfoCardImgContainer>
            <TokenInfoTitleContainer>
              <TokenInfoTitleContainer>
                <h1>GEM</h1>
                <h3>Mine Empire</h3>
              </TokenInfoTitleContainer>
              <TokenInfoTitleContainer>
                <img src="../../assets/coinmarketcap-icon.png" alt="" />
                <a
                  href="https://www.coingecko.com/en/coins/mine-empire"
                  rel="noreferrer"
                  target="_blank"
                >
                  <img src="../../assets/coingecko-icon.png" alt="" />
                </a>
                <CardFeature onClick={handleAddGEMToMM}>
                  <img src="../../assets/svg/plus.svg" alt="" />
                  <img src="../../assets/metamask-icon.png" alt="" />
                </CardFeature>
              </TokenInfoTitleContainer>
            </TokenInfoTitleContainer>
            <Line width="360px" />
            <CardDescription>
              <CardFeature>
                <SmallText>Price:</SmallText>
                <SmallTextDollar>${gemPrice}</SmallTextDollar>
              </CardFeature>
              <TokenInfoCardStats>
                <h3 id="description">Circulating Supply</h3>
                <h3 id="stat">
                  {Math.ceil(gemCirculatingSupply).toLocaleString("en-US")}
                </h3>
                <h3 id="description">Market Cap</h3>
                <h3 id="stat">
                  $
                  {Math.floor(gemCirculatingSupply * gemPrice).toLocaleString(
                    "en-US"
                  )}
                </h3>
                <h3 id="description">Total Liquidity</h3>
                <h3 id="stat">
                  ${Math.floor(totalGemLiquidity).toLocaleString("en-US")}
                </h3>
              </TokenInfoCardStats>
            </CardDescription>
            <ButtonContainer>
              <a
                href="https://beets.fi/#/trade?outputCurrency=0x68EFc4716507709691d5e7AD9906a44FaBCdb1CA"
                target="_blank"
                rel="noreferrer"
              >
                <Button>Get GEM</Button>
              </a>
            </ButtonContainer>
          </TokenInfoCard>
          <TokenInfoCard>
            <TokenInfoCardImgContainer>
              <img src="../../assets/csc-icon.png" alt="" />
            </TokenInfoCardImgContainer>
            <TokenInfoTitleContainer>
              <TokenInfoTitleContainer>
                <h1>CSC</h1>
                <h3>Cosmic Cash</h3>
              </TokenInfoTitleContainer>
              <TokenInfoTitleContainer>
                <img src="../../assets/coinmarketcap-icon.png" alt="" />
                <a
                  href="https://www.coingecko.com/en/coins/cosmic-cash"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src="../../assets/coingecko-icon.png" alt="" />
                </a>
                <CardFeature onClick={handleAddCSCToMM}>
                  <img src="../../assets/svg/plus.svg" alt="" />
                  <img src="../../assets/metamask-icon.png" alt="" />
                </CardFeature>
              </TokenInfoTitleContainer>
            </TokenInfoTitleContainer>
            <Line width="360px" />
            <CardDescription>
              <CardFeature>
                <SmallText>Price:</SmallText>
                <SmallTextDollar>${cosmicCashPrice}</SmallTextDollar>
              </CardFeature>
              <TokenInfoCardStats>
                <h3 id="description">Circulating Supply</h3>
                <h3 id="stat">
                  {Math.ceil(circulatingSupply).toLocaleString("en-US")}
                </h3>
                <h3 id="description">Market Cap</h3>
                <h3 id="stat">
                  $
                  {Math.floor(
                    circulatingSupply * cosmicCashPrice
                  ).toLocaleString("en-US")}
                </h3>
                <h3 id="description">Total Liquidity</h3>
                <h3 id="stat">
                  $
                  {Math.floor(totalCosmicCashLiquidity).toLocaleString("en-US")}
                </h3>
              </TokenInfoCardStats>
            </CardDescription>
            <ButtonContainer>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://beets.fi/#/trade?outputCurrency=0x84f8d24231dfbbfae7f39415cd09c8f467729fc8"
              >
                <Button>Get CSC</Button>
              </a>
            </ButtonContainer>
          </TokenInfoCard>
        </TokenInfoCardContainer>
        <a
          href="https://discord.gg/mineempire"
          rel="noreferrer"
          target="_blank"
        >
          <BasicButton>Request OTC Trade</BasicButton>
        </a>
      </DashboardContainer>
    </DashboardSection>
  );
};

export default DashboardBody;
