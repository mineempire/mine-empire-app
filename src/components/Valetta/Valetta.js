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
import { getEnergyContract, getValettaContract } from "../../Web3Client";
import {
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
  const [miningStatus, setMiningStatus] = useState("Idle");
  const [forceDisableButton, setForceDisableButton] = useState(false);
  const [approveEnergyDisable, setApproveEnergyDisable] = useState(false);
  const [unlockEnergyDisable, setUnlockEnergyDisable] = useState(false);
  const [collectDisabled, setCollectDisabled] = useState(false);

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
        if (collect === "60") {
          setMiningStatus("At Capacity");
        } else if (collect !== "0") {
          setMiningStatus("Mining");
        }
      });
  }

  async function updateState() {
    await checkUnlocked();
    await getAccumulatedBeryllium();
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
              <PlanetBody>
                <DescriptionContainer>
                  <PlanetTitleAndLevel>
                    <h1 id="title">Production</h1>
                    <h1 id="title">Lv1</h1>
                  </PlanetTitleAndLevel>
                  <Line width="320px" />
                  <Space height="30px" />
                  <DescriptionRow>
                    <h3 id="description">Resource</h3>
                    <h3 id="value">Beryllium</h3>
                  </DescriptionRow>
                  <DescriptionRow>
                    <h3 id="description">Rate</h3>
                    <h3 id="value">31 / Day</h3>
                  </DescriptionRow>
                  <DescriptionRow>
                    <h3 id="description">Next Level Rate</h3>
                    <h3 id="value">40 / Day</h3>
                  </DescriptionRow>
                  <DescriptionRow>
                    <h3 id="description">Upgrade Cost</h3>
                    <h3 id="value">3 Miner Tickets</h3>
                  </DescriptionRow>
                  <PlanetButtonContainer>
                    <ButtonContainer>
                      <Button disable="true">Approve</Button>
                    </ButtonContainer>
                    <ButtonContainer>
                      <Button disable="true">Upgrade</Button>
                    </ButtonContainer>
                  </PlanetButtonContainer>
                </DescriptionContainer>
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
                  <DescriptionRow miningStatus={miningStatus}>
                    <h3 id="description">Status</h3>
                    <h3 id="value">{miningStatus}</h3>
                  </DescriptionRow>
                  <DescriptionRow>
                    <h3 id="description">Collected</h3>
                    <h3 id="value">{berylliumReadyToCollect} / 60</h3>
                  </DescriptionRow>
                  {unlocked ? (
                    <>
                      <DescriptionRow>
                        <h3 id="description">Your Earning</h3>
                        <h3 id="value">
                          {(Math.ceil((31 / 355) * 100) / 100).toLocaleString(
                            "en-US"
                          )}{" "}
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
                            disable={unlockEnergyDisable || forceDisableButton}
                            onClick={handleUnlockEnergy}
                          >
                            Unlock
                          </Button>
                        </ButtonContainer>
                      </PlanetButtonContainer>
                    </>
                  )}
                </StakeContainer>
                <DescriptionContainer>
                  <PlanetTitleAndLevel>
                    <h1 id="title">Capacity</h1>
                    <h1 id="title">Lv1</h1>
                  </PlanetTitleAndLevel>
                  <Line width="320px" />
                  <Space height="30px" />
                  <DescriptionRow>
                    <h3 id="description">Type</h3>
                    <h3 id="value">Asteroid</h3>
                  </DescriptionRow>
                  <DescriptionRow>
                    <h3 id="description">Capacity</h3>
                    <h3 id="value">60</h3>
                  </DescriptionRow>
                  <DescriptionRow>
                    <h3 id="description">Next Level Capacity</h3>
                    <h3 id="value">90</h3>
                  </DescriptionRow>
                  <DescriptionRow>
                    <h3 id="description">Upgrade Cost</h3>
                    <h3 id="value">1 Miner Ticket</h3>
                  </DescriptionRow>
                  <PlanetButtonContainer>
                    <ButtonContainer>
                      <Button disable="true">Approve</Button>
                    </ButtonContainer>
                    <ButtonContainer>
                      <Button disable="true">Upgrade</Button>
                    </ButtonContainer>
                  </PlanetButtonContainer>
                </DescriptionContainer>
              </PlanetBody>
            </PlanetBodyContainer>
          </BodyContainer>
        </Container>
      </Section>
    </>
  ) : (
    <>Loading...</>
  );
};

export default ValettaBody;
