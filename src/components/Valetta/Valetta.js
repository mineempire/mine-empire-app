import { ethers } from "ethers";
import { useEffect } from "react";
import { useState } from "react";
import { injected } from "../../connectors";
import { ValettaAddress } from "../../contracts/Addresses";
import {
  BodyContainer,
  Button,
  ButtonContainer,
  Container,
  Line,
  Section,
  Space,
  TitleContainer,
} from "../../globalStyles";
import {
  ValettaCapacity,
  ValettaCapacityUpgrade,
  ValettaProduction,
  ValettaProductionUpgrade,
} from "../../stats/ValettaStats";
import { getEnergyContract, getValettaContract } from "../../Web3Client";
import {
  ConversionBox,
  ConverterContainer,
  DescriptionContainer,
  DescriptionRow,
  PlanetBody,
  PlanetBodyContainer,
  PlanetButtonContainer,
  PlanetTitle,
  PlanetTitleAndLevel,
  PlanetTitleContainer,
  StakeContainer,
} from "../Planet/PlanetStyles";

const ValettaBody = () => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [berylliumReadyToCollect, setBerylliumReadyToCllect] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [forceDisableButton, setForceDisableButton] = useState(false);
  const [approveEnergyDisable, setApproveEnergyDisable] = useState(false);
  const [unlockEnergyDisable, setUnlockEnergyDisable] = useState(false);
  const [collectDisabled, setCollectDisabled] = useState(false);
  const [unlockedQuantity, setUnlockedQuantity] = useState(0);
  const [productionLevel, setProductionLevel] = useState(0);
  const [capacityLevel, setCapacityLevel] = useState(0);
  const [disableProductionUpgrade, setDisableProductionUpgrade] =
    useState(false);
  const [disableCapacityUpgrade, setDisableCapacityUpgrade] = useState(false);
  const [energyBal, setEnergyBal] = useState(0);

  const valettaContract = getValettaContract();
  const energyContract = getEnergyContract();

  async function checkUnlocked() {
    const addr = await injected.getAccount();
    await valettaContract.methods
      .unlocked(addr)
      .call()
      .then((result) => {
        setUnlocked(result);
      });
    if (!unlocked) {
      await energyContract.methods
        .allowance(addr, ValettaAddress)
        .call()
        .then((result) => {
          const amount = ethers.utils.formatEther(result).substring(0, 7);
          if (+amount < 150) {
            setApproveEnergyDisable(false);
            setUnlockEnergyDisable(true);
          } else {
            setApproveEnergyDisable(true);
            setUnlockEnergyDisable(false);
          }
        });
    }
  }

  async function getAccumulatedBeryllium() {
    const addr = await injected.getAccount();
    await valettaContract.methods
      .getAccumulatedBeryllium()
      .call({ from: addr })
      .then((result) => {
        const collect = +ethers.utils.formatEther(result);
        setBerylliumReadyToCllect(collect);
      });
  }

  async function checkUnlockedQuantity() {
    await valettaContract.methods
      .unlockedQuantity()
      .call()
      .then((result) => {
        setUnlockedQuantity(result);
      });
  }

  async function getLevels() {
    const addr = await injected.getAccount();
    await valettaContract.methods
      .userCapacityLevel(addr)
      .call()
      .then((result) => {
        setCapacityLevel(+result);
      });
    await valettaContract.methods
      .userProductionLevel(addr)
      .call()
      .then((result) => {
        setProductionLevel(+result);
      });
  }

  async function getEnergyBal() {
    const addr = await injected.getAccount();
    await energyContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result));
        setEnergyBal(amt);
      });
  }

  async function updateState() {
    await checkUnlocked();
    await getAccumulatedBeryllium();
    await checkUnlockedQuantity();
    await getLevels();
    await getEnergyBal();
    setPageLoaded(true);
  }

  useEffect(() => {
    updateState();
    const intervalId = setInterval(() => {
      updateState();
    }, 5000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApproveEnergy = async () => {
    if (approveEnergyDisable || forceDisableButton) return;
    setApproveEnergyDisable(true);
    setForceDisableButton(true);
    const addr = await injected.getAccount();
    await energyContract.methods
      .approve(ValettaAddress, "1000000000000000000000000")
      .send({ from: addr });
    await checkUnlocked();
    setApproveEnergyDisable(false);
    setForceDisableButton(false);
  };

  const handleUnlockEnergy = async () => {
    if (unlockEnergyDisable || forceDisableButton) return;
    setUnlockEnergyDisable(true);
    setForceDisableButton(true);
    const addr = await injected.getAccount();
    await valettaContract.methods
      .unlockWithEnergy()
      .send({ from: addr })
      .catch((err) => console.log(err));
    await checkUnlocked();
    setUnlockEnergyDisable(false);
    setForceDisableButton(false);
  };

  const handleCollectBeryllium = async () => {
    if (collectDisabled) return;
    setCollectDisabled(true);
    const addr = await injected.getAccount();
    await valettaContract.methods
      .collectBeryllium()
      .send({ from: addr })
      .catch((err) => console.log(err));
    setCollectDisabled(false);
  };

  const handleUpgradeCapacity = async () => {
    if (
      !unlocked ||
      disableCapacityUpgrade ||
      capacityLevel === 2 ||
      energyBal < ValettaCapacityUpgrade[capacityLevel]
    )
      return;
    setDisableCapacityUpgrade(true);
    const addr = await injected.getAccount();
    await valettaContract.methods
      .upgradeCapacity()
      .send({ from: addr })
      .catch((err) => console.log(err));
    await updateState();
    setDisableCapacityUpgrade(false);
  };

  const handleUpgradeProduction = async () => {
    if (
      !unlocked ||
      disableProductionUpgrade ||
      productionLevel === 2 ||
      energyBal < ValettaProductionUpgrade[productionLevel]
    )
      return;
    setDisableProductionUpgrade(true);
    const addr = await injected.getAccount();
    await valettaContract.methods
      .upgradeProduction()
      .send({ from: addr })
      .catch((err) => console.log(err));
    await updateState();
    setDisableProductionUpgrade(false);
  };

  return pageLoaded ? (
    <>
      <Section>
        <Container>
          <TitleContainer>
            <h1>Valetta</h1>
            <h3>
              Valetta is rich in Beryllium. Unlock the asteroid with 120 energy
              and start earning instantly.
            </h3>
          </TitleContainer>
        </Container>
        <Container>
          <BodyContainer>
            <PlanetBodyContainer>
              <DescriptionContainer>
                <PlanetTitleAndLevel>
                  <h1 id="title">Production</h1>
                  <h1 id="title">Lv{unlocked ? productionLevel + 1 : 0}</h1>
                </PlanetTitleAndLevel>
                <Line width="320px" />
                <Space height="30px" />
                <DescriptionRow>
                  <h3 id="description">Resource</h3>
                  <h3 id="value">Beryllium</h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Rate</h3>
                  <h3 id="value">
                    {unlocked ? ValettaProduction[productionLevel] : 0} / Day
                  </h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Next Level Rate</h3>
                  <h3 id="value">
                    {unlocked
                      ? ValettaProduction[productionLevel + 1]
                      : ValettaProduction[productionLevel]}{" "}
                    / Day
                  </h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Upgrade Cost</h3>
                  <h3 id="value">
                    {unlocked ? ValettaProductionUpgrade[productionLevel] : 0}{" "}
                    ENERGY
                  </h3>
                </DescriptionRow>
                <PlanetButtonContainer>
                  <ButtonContainer>
                    <Button
                      onClick={handleUpgradeProduction}
                      disable={
                        !unlocked ||
                        disableProductionUpgrade ||
                        productionLevel === 2 ||
                        energyBal < ValettaProductionUpgrade[productionLevel]
                      }
                    >
                      {productionLevel < 2 ? "Upgrade" : "MAX"}
                    </Button>
                  </ButtonContainer>
                </PlanetButtonContainer>
              </DescriptionContainer>
              <PlanetBody>
                <StakeContainer>
                  <PlanetTitleContainer>
                    <img src="../../assets/valetta.png" alt="" />
                    <PlanetTitle>
                      <h1 id="title">Valetta</h1>
                      <h1 id="description">Asteroid</h1>
                    </PlanetTitle>
                  </PlanetTitleContainer>
                  <Line width="320px" />
                  <Space height="25px" />
                  <DescriptionRow>
                    <h3 id="description">Total Unlocked</h3>
                    <h3 id="value">{unlockedQuantity} / 700</h3>
                  </DescriptionRow>
                  <DescriptionRow>
                    <h3 id="description">Collected</h3>
                    <h3 id="value">
                      {berylliumReadyToCollect} /{" "}
                      {ValettaCapacity[capacityLevel]}
                    </h3>
                  </DescriptionRow>
                  {unlocked ? (
                    <>
                      <DescriptionRow>
                        <h3 id="description">Your Earning</h3>
                        <h3 id="value">
                          {(
                            Math.ceil(
                              (ValettaProduction[productionLevel] / 355) * 100
                            ) / 100
                          ).toLocaleString("en-US")}{" "}
                          CSC / Day
                        </h3>
                      </DescriptionRow>
                      <PlanetButtonContainer>
                        <ButtonContainer>
                          <Button
                            disable={collectDisabled}
                            onClick={handleCollectBeryllium}
                          >
                            Collect
                          </Button>
                        </ButtonContainer>
                      </PlanetButtonContainer>
                    </>
                  ) : (
                    <>
                      <DescriptionRow>
                        <h3 id="description">Unlock Cost</h3>
                        <h3 id="value">120 ENERGY</h3>
                      </DescriptionRow>
                      <PlanetButtonContainer>
                        <ButtonContainer>
                          <Button
                            disable={approveEnergyDisable || forceDisableButton}
                            onClick={handleApproveEnergy}
                          >
                            Approve
                          </Button>
                        </ButtonContainer>
                        <ButtonContainer>
                          <Button
                            disable={
                              unlockEnergyDisable ||
                              forceDisableButton ||
                              unlockedQuantity === "500"
                            }
                            onClick={handleUnlockEnergy}
                          >
                            Unlock
                          </Button>
                        </ButtonContainer>
                      </PlanetButtonContainer>
                    </>
                  )}
                </StakeContainer>
              </PlanetBody>
              <DescriptionContainer>
                <PlanetTitleAndLevel>
                  <h1 id="title">Capacity</h1>
                  <h1 id="title">Lv{unlocked ? capacityLevel + 1 : 0}</h1>
                </PlanetTitleAndLevel>
                <Line width="320px" />
                <Space height="30px" />
                <DescriptionRow>
                  <h3 id="description">Type</h3>
                  <h3 id="value">Asteroid</h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Capacity</h3>
                  <h3 id="value">
                    {unlocked ? ValettaCapacity[capacityLevel] : 0}
                  </h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Next Level Capacity</h3>
                  <h3 id="value">
                    {unlocked
                      ? ValettaCapacity[capacityLevel + 1]
                      : ValettaCapacity[capacityLevel]}
                  </h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Upgrade Cost</h3>
                  <h3 id="value">
                    {unlocked ? ValettaCapacityUpgrade[capacityLevel] : 0}{" "}
                    ENERGY
                  </h3>
                </DescriptionRow>
                <PlanetButtonContainer>
                  <ButtonContainer>
                    <Button
                      onClick={handleUpgradeCapacity}
                      disable={
                        !unlocked ||
                        disableCapacityUpgrade ||
                        capacityLevel === 2 ||
                        energyBal < ValettaCapacityUpgrade[capacityLevel]
                      }
                    >
                      {capacityLevel < 2 ? "Upgrade" : "MAX"}
                    </Button>
                  </ButtonContainer>
                </PlanetButtonContainer>
              </DescriptionContainer>
            </PlanetBodyContainer>
            <ConverterContainer>
              <ConversionBox>
                <img src="../../assets/beryllium.png" alt="" />
                <p>1 = 0.002816901</p>
                <img src="../../assets/csc-icon.png" alt="" />
              </ConversionBox>
              <ConversionBox>
                <img src="../../assets/csc-icon.png" alt="" />
                <p>1 = 335</p>
                <img src="../../assets/beryllium.png" alt="" />
              </ConversionBox>
            </ConverterContainer>
          </BodyContainer>
        </Container>
      </Section>
    </>
  ) : (
    <>Loading...</>
  );
};

export default ValettaBody;
