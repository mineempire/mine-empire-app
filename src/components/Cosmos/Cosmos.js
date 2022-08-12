import {
  BodyContainer,
  Container,
  TitleContainer,
  Section,
  Line,
} from "../../globalStyles";
import { Link } from "react-router-dom";

import {
  PlanetCard,
  PlanetCardImgContainer,
  PlanetCardTitleContainer,
  PlanetCardProductionInfo,
  CardStats,
} from "./CosmosStyles";

import { Button, ButtonContainer } from "../../globalStyles";
import { useEffect, useState } from "react";
import {
  getCybeleContract,
  getGadesContract,
  getOberonContract,
  getValettaContract,
  isConnected,
} from "../../Web3Client";
import { injected } from "../../connectors";
import { useWeb3React } from "@web3-react/core";
import { AsteroidDrillPower } from "../../stats/DrillStats";
import { ethers } from "ethers";
import { GadesCapacity } from "../../stats/GadesStats";
import { cosmicCashAddress } from "../../contracts/Addresses";
import { OberonCapacity } from "../../stats/OberonStats";
import { CybeleCapacity } from "../../stats/CybeleStats";
import { ValettaCapacity, ValettaProduction } from "../../stats/ValettaStats";

const CosmosBody = () => {
  const [connected, setConnected] = useState(false);
  const [ironProduction, setIronProduction] = useState(0);
  const [ironBaseProduction, setIronBaseProduction] = useState(0);
  const [cscProduction, setCscProduction] = useState(0);
  const [ironReadyToCollect, setIronReadyToCollect] = useState(0);
  const [gadesLevel, setGadesLevel] = useState(1);
  const [gadesCapacity, setGadesCapacity] = useState(0);
  const [cosmicCashPrice, setCosmicCashPrice] = useState(0);
  const [launchTime, setLaunchTime] = useState(0);
  const [cobaltProduction, setCobaltProduction] = useState(0);
  const [cobaltBaseProduction, setCobaltBaseProduction] = useState(0);
  const [cscProductionOberon, setCscProductionOberon] = useState(0);
  const [oberonLevel, setOberonLevel] = useState(0);
  const [oberonCapacity, setOberonCapacity] = useState(0);
  const [CobaltReadyToCollect, setCobaltReadyToCollect] = useState(0);
  const [cybeleLevel, setCybeleLevel] = useState(0);
  const [cybeleCapacity, setCybeleCapacity] = useState(0);
  const [silverReadyToCollect, setSilverReadyToCollect] = useState(0);
  const [silverProduction, setSilverProduction] = useState(0);
  const [silverBaseProduction, setSilverBaseProduction] = useState(0);
  const [cscProductionCybele, setCscProductionCybele] = useState(0);
  const [valettaCapacityLevel, setValettaCapacityLevel] = useState(0);
  const [valettaProductionLevel, setValettaProductionLevel] = useState(0);
  const [berylliumProduction, setBerylliumProduction] = useState(0);
  const [valettaCapacity, setValettaCapacity] = useState(0);
  const [berylliumReadyToCollect, setBerylliumReadyToCllect] = useState(0);
  const [cscProductionValetta, setCscProductionValetta] = useState(0);

  const { activate } = useWeb3React();

  const gadesContract = getGadesContract();
  const oberonContract = getOberonContract();
  const cybeleContract = getCybeleContract();
  const valettaContract = getValettaContract();

  async function getStakedStats() {
    const addr = await injected.getAccount();
    await gadesContract.methods
      .getAccumulatedIron(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(ethers.utils.formatEther(result));
        setIronReadyToCollect(amt);
      })
      .catch((err) => console.log(err));
  }

  async function getOberonStakedStats() {
    const addr = await injected.getAccount();
    await oberonContract.methods
      .getAccumulatedCobalt(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(ethers.utils.formatEther(result));
        setCobaltReadyToCollect(amt);
      })
      .catch((err) => console.log(err));
  }

  async function getCybeleStakedStats() {
    const addr = await injected.getAccount();
    await cybeleContract.methods
      .getAccumulatedSilver(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(ethers.utils.formatEther(result));
        setSilverReadyToCollect(amt);
      })
      .catch((err) => console.log(err));
  }

  async function getCosmicCashPrice() {
    let url =
      "https://api.dexscreener.com/latest/dex/tokens/" + cosmicCashAddress;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const priceUsd = data["pairs"][0]["priceUsd"];
        setCosmicCashPrice(priceUsd);
      });
  }

  async function getGadesStats() {
    const addr = await injected.getAccount();
    let baseProduction = 0;
    let checkStaked = true;
    await gadesContract.methods
      .getBaseProduction()
      .call()
      .then((result) => {
        baseProduction = +ethers.utils.formatEther(result);
        setIronBaseProduction(Math.ceil(baseProduction * 60 * 60 * 24));
      });
    await gadesContract.methods
      .getStake(addr)
      .call()
      .then((stake) => {
        const drillId = stake[0];
        if (drillId === "0") {
          checkStaked = false;
        } else {
          const level = +stake["drill"]["level"];
          const mult = AsteroidDrillPower[level];
          const prodPerDay = Math.floor(
            (baseProduction * 60 * 60 * 24 * mult) / 100
          );
          setIronProduction(prodPerDay);
          setCscProduction(
            Math.floor((ironProduction / 13809) * 1000000) / 1000000
          );
        }
      });
    await gadesContract.methods
      .getUserLevel(addr)
      .call()
      .then((result) => {
        setGadesLevel(+result + 1);
        setGadesCapacity(GadesCapacity[+result]);
      });
    if (checkStaked) await getStakedStats();
  }

  async function getOberonStats() {
    const addr = await injected.getAccount();
    let baseProduction = 0;
    let checkStaked = true;
    await oberonContract.methods
      .getBaseProduction()
      .call()
      .then((result) => {
        baseProduction = +ethers.utils.formatEther(result);
        setCobaltBaseProduction(baseProduction * 60 * 60 * 24);
      });
    await oberonContract.methods
      .stakes(addr)
      .call()
      .then((stake) => {
        const drillId = stake[0];
        if (drillId === "0") {
          checkStaked = false;
        } else {
          const level = +stake["drill"]["level"];
          const mult = AsteroidDrillPower[level];
          const prodPerDay = Math.floor(
            (baseProduction * 60 * 60 * 24 * mult) / 100
          );
          setCobaltProduction(prodPerDay);
          setCscProductionOberon(
            Math.floor((cobaltProduction / 2798) * 1000000) / 1000000
          );
        }
      });
    await oberonContract.methods
      .userLevel(addr)
      .call()
      .then((result) => {
        setOberonLevel(+result + 1);
        setOberonCapacity(OberonCapacity[+result]);
      });
    if (checkStaked) await getOberonStakedStats();
  }

  async function getCybeleStats() {
    const addr = await injected.getAccount();
    let baseProduction = 0;
    let checkStaked = true;
    await cybeleContract.methods
      .getBaseProduction()
      .call()
      .then((result) => {
        baseProduction = +ethers.utils.formatEther(result);
        setSilverBaseProduction(baseProduction * 60 * 60 * 24);
      });
    await cybeleContract.methods
      .stakes(addr)
      .call()
      .then((stake) => {
        const drillId = stake[0];
        if (drillId === "0") {
          checkStaked = false;
        } else {
          const level = +stake["drill"]["level"];
          const mult = AsteroidDrillPower[level];
          const prodPerDay = Math.floor(
            (baseProduction * 60 * 60 * 24 * mult) / 100
          );
          setSilverProduction(prodPerDay);
          setCscProductionCybele(
            Math.floor((silverProduction / 2076) * 1000000) / 1000000
          );
        }
      });
    await cybeleContract.methods
      .userLevel(addr)
      .call()
      .then((result) => {
        setCybeleLevel(+result + 1);
        setCybeleCapacity(CybeleCapacity[+result]);
      });
    if (checkStaked) await getCybeleStakedStats();
  }

  async function getValettaStats() {
    const addr = await injected.getAccount();
    let unlocked = false;
    let caplevel = 0;
    let prodlevel = 0;
    await valettaContract.methods
      .unlocked(addr)
      .call()
      .then((result) => {
        unlocked = result;
      });
    if (unlocked) {
      await valettaContract.methods
        .userCapacityLevel(addr)
        .call()
        .then((result) => {
          caplevel = +result;
          setValettaCapacityLevel(caplevel + 1);
          setValettaCapacity(ValettaCapacity[caplevel]);
        });
      await valettaContract.methods
        .userProductionLevel(addr)
        .call()
        .then((result) => {
          prodlevel = +result;
          setValettaProductionLevel(prodlevel + 1);
          setBerylliumProduction(ValettaProduction[prodlevel]);
          setCscProductionValetta(
            Math.ceil((ValettaProduction[prodlevel] / 355) * 100) / 100
          );
        });
    }
    await valettaContract.methods
      .getAccumulatedBeryllium()
      .call({ from: addr })
      .then((result) => {
        const collect = +ethers.utils.formatEther(result);
        setBerylliumReadyToCllect(collect);
      });
  }

  async function updateState() {
    if (await isConnected()) {
      setConnected(true);
      await getGadesStats();
      await getOberonStats();
      await getCybeleStats();
      await getValettaStats();
    }
    getCosmicCashPrice();
  }

  useEffect(() => {
    updateState();
  });

  useEffect(() => {
    const timeDiff = 1659139200 - Math.floor(Date.now() / 1000);
    setLaunchTime(timeDiff);
    const intervalId = setInterval(() => {
      if (launchTime >= 0) {
        const timeDiff = 1659139200 - Math.floor(Date.now() / 1000);
        setLaunchTime(timeDiff);
      }
    }, 1000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function secondsToHms(d) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);
    const hDisplay = h > 0 ? h + "h " : "";
    const mDisplay = m > 0 ? m + "m " : "";
    const sDisplay = s > 0 ? s + "s " : "";
    return hDisplay + mDisplay + sDisplay;
  }

  return (
    <>
      <Section>
        <Container>
          <TitleContainer>
            <h1>Explore the Cosmos</h1>
            <h3>
              Each planet produces a unique resource. Stake up to one drill per
              planet to start earning!
            </h3>
            <h3>
              Convert resources to Cosmic Cash using the Converter or refine
              them into more valueable resources.
            </h3>
          </TitleContainer>
        </Container>
        <Container>
          <BodyContainer>
            <PlanetCard>
              <PlanetCardImgContainer>
                <img src="../../assets/valetta.png" alt="" />
              </PlanetCardImgContainer>
              <PlanetCardTitleContainer>
                <h1>Valetta</h1>
                <h3>Asteroid</h3>
                <h3>Produces Beryllium</h3>
              </PlanetCardTitleContainer>
              <Line width="360px" />
              <PlanetCardProductionInfo>
                <img src="../../assets/beryllium.png" alt="" />
                <h3 id="production">Production:</h3>
                <h3 id="amount">31 / Day</h3>
              </PlanetCardProductionInfo>
              <CardStats>
                <h3 id="description">Your Production</h3>
                <h3 id="stat">{berylliumProduction} Beryllium / Day</h3>
                <h3 id="description">Max Production</h3>
                <h3 id="stat">55 Beryllium / Day</h3>
                <h3 id="description">Your USD Equiv</h3>
                <h3 id="stat">
                  $
                  {Math.floor(cscProductionValetta * cosmicCashPrice * 100) /
                    100}{" "}
                  / Day
                </h3>
                <h3 id="description">Production Level</h3>
                <h3 id="stat">{valettaProductionLevel}</h3>
                <h3 id="description">Capacity Level</h3>
                <h3 id="stat">{valettaCapacityLevel}</h3>
                <h3 id="description">Ready to Collect</h3>
                <h3 id="stat">
                  {berylliumReadyToCollect} / {valettaCapacity}
                </h3>
              </CardStats>
              <ButtonContainer>
                {connected ? (
                  <Link to="gades">
                    <Button>View</Button>
                  </Link>
                ) : (
                  <Button onClick={() => activate(injected)}>Connect</Button>
                )}
              </ButtonContainer>
            </PlanetCard>
            <PlanetCard>
              <PlanetCardImgContainer>
                <img src="../../assets/gades.png" alt="" />
              </PlanetCardImgContainer>
              <PlanetCardTitleContainer>
                <h1>Gades</h1>
                <h3>Asteroid</h3>
                <h3>Produces Iron</h3>
              </PlanetCardTitleContainer>
              <Line width="360px" />
              <PlanetCardProductionInfo>
                <img src="../../assets/iron60px.png" alt="" />
                <h3 id="production">Production:</h3>
                <h3 id="amount">{ironBaseProduction} / Day</h3>
              </PlanetCardProductionInfo>
              <CardStats>
                <h3 id="description">Your Production</h3>
                <h3 id="stat">{ironProduction} Iron / Day</h3>
                <h3 id="description">Max Production</h3>
                <h3 id="stat">
                  {Math.ceil(ironBaseProduction * 35.7)} Iron / Day
                </h3>
                <h3 id="description">Your USD Equiv</h3>
                <h3 id="stat">
                  ${Math.floor(cscProduction * cosmicCashPrice * 100) / 100} /
                  Day
                </h3>
                <h3 id="description">Max USD Equiv</h3>
                <h3 id="stat">
                  ${Math.floor(8.8 * cosmicCashPrice * 100) / 100} / Day
                </h3>
                <h3 id="description">Capacity Level</h3>
                <h3 id="stat">{gadesLevel}</h3>
                <h3 id="description">Ready to Collect</h3>
                <h3 id="stat">
                  {ironReadyToCollect} / {gadesCapacity}
                </h3>
              </CardStats>
              <ButtonContainer>
                {connected ? (
                  <Link to="gades">
                    <Button>View</Button>
                  </Link>
                ) : (
                  <Button onClick={() => activate(injected)}>Connect</Button>
                )}
              </ButtonContainer>
            </PlanetCard>
            <PlanetCard>
              <PlanetCardImgContainer>
                <img src="../../assets/oberon.png" alt="" />
              </PlanetCardImgContainer>
              <PlanetCardTitleContainer>
                <h1>Oberon</h1>
                <h3>Asteroid</h3>
                <h3>Produces Cobalt</h3>
              </PlanetCardTitleContainer>
              <Line width="360px" />
              <PlanetCardProductionInfo>
                <img src="../../assets/cobalt.png" alt="" />
                <h3 id="production">Production:</h3>
                <h3 id="amount">{Math.ceil(cobaltBaseProduction)} / Day</h3>
              </PlanetCardProductionInfo>
              <CardStats>
                <h3 id="description">Your Production</h3>
                <h3 id="stat">{cobaltProduction} Cobalt / Day</h3>
                <h3 id="description">Max Production</h3>
                <h3 id="stat">
                  {Math.ceil(cobaltBaseProduction * 35.7)} Cobalt / Day
                </h3>
                <h3 id="description">Your USD Equiv</h3>
                <h3 id="stat">
                  $
                  {Math.floor(cscProductionOberon * cosmicCashPrice * 100) /
                    100}{" "}
                  / Day
                </h3>
                <h3 id="description">Max USD Equiv</h3>
                <h3 id="stat">
                  ${Math.floor(10.648 * cosmicCashPrice * 100) / 100} / Day
                </h3>
                <h3 id="description">Capacity Level</h3>
                <h3 id="stat">{oberonLevel}</h3>
                <h3 id="description">Ready to Collect</h3>
                <h3 id="stat">
                  {CobaltReadyToCollect} / {oberonCapacity}
                </h3>
              </CardStats>
              <ButtonContainer>
                {connected ? (
                  <Link to="oberon">
                    <Button>View</Button>
                  </Link>
                ) : (
                  <Button onClick={() => activate(injected)}>Connect</Button>
                )}
              </ButtonContainer>
            </PlanetCard>
            <PlanetCard>
              <PlanetCardImgContainer>
                <img src="../../assets/cybele.png" alt="" />
              </PlanetCardImgContainer>
              <PlanetCardTitleContainer>
                <h1>Cybele</h1>
                <h3>Asteroid</h3>
                <h3>Produces Silver</h3>
              </PlanetCardTitleContainer>
              <Line width="360px" />
              <PlanetCardProductionInfo>
                <img src="../../assets/silver.png" alt="" />
                <h3 id="production">Production:</h3>
                <h3 id="amount">{Math.floor(silverBaseProduction)} / Day</h3>
              </PlanetCardProductionInfo>
              <CardStats>
                <h3 id="description">Your Production</h3>
                <h3 id="stat">{silverProduction} Silver / Day</h3>
                <h3 id="description">Max Production</h3>
                <h3 id="stat">
                  {Math.ceil(silverBaseProduction * 35.7)} Silver / Day
                </h3>
                <h3 id="description">Your USD Equiv</h3>
                <h3 id="stat">
                  $
                  {Math.floor(cscProductionCybele * cosmicCashPrice * 100) /
                    100}{" "}
                  / Day
                </h3>
                <h3 id="description">Max USD Equiv</h3>
                <h3 id="stat">
                  ${Math.floor(12.038 * cosmicCashPrice * 100) / 100} / Day
                </h3>
                <h3 id="description">Capacity Level</h3>
                <h3 id="stat">{cybeleLevel}</h3>
                <h3 id="description">Ready to Collect</h3>
                <h3 id="stat">
                  {silverReadyToCollect} / {cybeleCapacity}
                </h3>
              </CardStats>
              <ButtonContainer>
                {connected ? (
                  <>
                    {launchTime > 0 ? (
                      <>
                        <Button disable={true}>
                          {secondsToHms(launchTime)}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link to="cybele">
                          <Button>View</Button>
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <Button onClick={() => activate(injected)}>Connect</Button>
                )}
              </ButtonContainer>
            </PlanetCard>
            <PlanetCard>
              <PlanetCardImgContainer>
                <img src="../../assets/canopsys.png" alt="" />
              </PlanetCardImgContainer>
              <PlanetCardTitleContainer>
                <h1>Canopsys Prime</h1>
                <h3>Planet</h3>
                <h3>Produces Bismuth</h3>
              </PlanetCardTitleContainer>
              <Line width="360px" />
              <PlanetCardProductionInfo>
                <img src="../../assets/bismuth.png" alt="" />
                <h3 id="production">Production:</h3>
                <h3 id="amount">--- / Day</h3>
              </PlanetCardProductionInfo>
              <CardStats>
                <h3 id="description">Your Production</h3>
                <h3 id="stat">- Bismuth / Day</h3>
                <h3 id="description">Max Production</h3>
                <h3 id="stat">- Bismuth / Day</h3>
                <h3 id="description">Your USD Equiv</h3>
                <h3 id="stat">- / Day</h3>
                <h3 id="description">Max USD Equiv</h3>
                <h3 id="stat">- / Day</h3>
                <h3 id="description">Capacity Level</h3>
                <h3 id="stat">1</h3>
                <h3 id="description">Ready to Collect</h3>
                <h3 id="stat">0 / ---</h3>
              </CardStats>
              <ButtonContainer>
                {connected ? (
                  // <Link to="canopsysprime">
                  <Button>Coming Soon</Button>
                ) : (
                  <Button onClick={() => activate(injected)}>Connect</Button>
                )}
              </ButtonContainer>
            </PlanetCard>
          </BodyContainer>
        </Container>
      </Section>
    </>
  );
};

export default CosmosBody;
