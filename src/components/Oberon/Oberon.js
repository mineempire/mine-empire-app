import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { injected } from "../../connectors";
import { Link } from "react-router-dom";
import {
  OberonAddress,
  mineEmpireDrillAddress,
} from "../../contracts/Addresses";
import {
  Container,
  TitleContainer,
  Section,
  BodyContainer,
  Button,
  Line,
  Space,
  ButtonContainer,
  ButtonGray,
  BasicButton,
  Loading,
} from "../../globalStyles";
import {
  getCosmicCashContract,
  getOberonContract,
  getMineEmpireDrillContract,
  getEnergyContract,
} from "../../Web3Client";
import DrillSelectorMenu from "../Planet/DrillSelectorMenu";
import {
  DescriptionContainer,
  DescriptionRow,
  PlanetBody,
  PlanetTitle,
  PlanetTitleContainer,
  StakeContainer,
  ConverterContainer,
  PlanetBodyContainer,
  ConversionBox,
  SelectDrillModal,
  SelectDrillModalBg,
  PlanetButtonContainer,
  UnlockBodyBg,
  ApproveAndUseContainer,
  EnergyOrCosmicCashContainer,
} from "../Planet/PlanetStyles";
import { OberonCapacity, OberonUpgradeCost } from "../../stats/OberonStats";
import { AsteroidDrillPower } from "../../stats/DrillStats";

const OberonBody = () => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [disableButtons, setDisableButtons] = useState(false);
  const [cosmicCashBalance, setCosmicCashBalance] = useState(0);
  const [cosmicCashApproved, setCosmicCashApproved] = useState(false);
  const [energyBalance, setEnergyBalance] = useState(0);
  const [energyApproved, setEnergyApproved] = useState(false);
  const [showSelect, setShowSelect] = useState(false);
  const [capacity, setCapacity] = useState(0);
  const [miningStatus, setMiningStatus] = useState("Idle");
  const [collected, setCollected] = useState(0);
  const [drillStaked, setDrillStaked] = useState(0);
  const [drillId, setDrillId] = useState(0);
  const [drillLevel, setDrillLevel] = useState(0);
  const [ownedDrills, setOwnedDrills] = useState([]);
  const [drillsLoaded, setDrillsLoaded] = useState(false);
  const [capacityLevel, setCapacityLevel] = useState(0);
  const [drillSelected, setDrillSelected] = useState(0);
  const [baseProduction, setBaseProduction] = useState(0);
  const [nextLevelCapacity, setNextLevelCapacity] = useState(0);
  const [upgradeCost, setUpgradeCost] = useState(0);
  const [drillsApproved, setDrillsApproved] = useState(false);
  const [drillPower, setDrillPower] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [disableApproveCSC, setDisableApproveCSC] = useState(false);
  const [disableApproveEnergy, setDisableApproveEnergy] = useState(false);
  const [disableUnlockWithCSC, setDisableUnlockWithCSC] = useState(false);
  const [disableUnlockWithEnergy, setDisableUnlockWithEnergy] = useState(false);

  const oberonContract = getOberonContract();
  const mineEmpireDrillContract = getMineEmpireDrillContract();
  const cosmicCashContract = getCosmicCashContract();
  const energyContract = getEnergyContract();

  async function selectDrill(drillId) {
    setDrillSelected(drillId);
  }

  async function checkUnlocked() {
    const addr = await injected.getAccount();
    await oberonContract.methods
      .unlocked(addr)
      .call()
      .then((result) => {
        setUnlocked(result);
      })
      .catch((err) => console.log(err));
  }

  async function getCollectedCobalt() {
    const addr = await injected.getAccount();
    await oberonContract.methods
      .getAccumulatedCobalt(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result));
        if (amt > 0 && amt === capacity) {
          setMiningStatus("At Capacity");
        }
        setCollected(amt);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function getStakeInfo() {
    const addr = await injected.getAccount();
    await oberonContract.methods
      .stakes(addr)
      .call()
      .then((stake) => {
        const drillId = stake[0];
        if (drillId === "0") {
          setDrillStaked(false);
          setDrillId(0);
          setDrillLevel(0);
          setDrillPower(AsteroidDrillPower[0]);
          setMiningStatus("Idle");
        } else {
          setDrillSelected(true);
          setDrillStaked(true);
          setDrillId(stake["drill"]["drillId"]);
          setDrillLevel(+stake["drill"]["level"] + 1);
          setDrillPower(AsteroidDrillPower[+stake["drill"]["level"]]);
          setMiningStatus("Mining");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function getOwnedDrills() {
    const addr = await injected.getAccount();
    let fetchedDrills = [];
    let ids = new Set();
    let url =
      "https://api.ftmscan.com/api?module=account&action=tokennfttx&contractaddress=" +
      mineEmpireDrillAddress +
      "&address=" +
      addr +
      "&startblock=0&endblock=99999999&page=1&offset=100&sort=asc&apikey=SJDG322KQRHG7MHWPVY9T4EMWEW4361ZGT";
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const result = data["result"];
        for (let i = 0; i < result.length; i++) {
          if (result[i]["to"] === addr) {
            ids.add(result[i]["tokenID"]);
          } else if (result[i]["from"] === addr) {
            ids.delete(result[i]["tokenID"]);
          }
        }
      });
    const itr = ids.keys();
    for (const key of itr) {
      await mineEmpireDrillContract.methods
        .getDrill(key)
        .call()
        .then((drill) => {
          fetchedDrills.push({
            drillId: key,
            drillType: drill["drillType"],
            level: drill["level"],
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
    setOwnedDrills(fetchedDrills);
    setDrillsLoaded(true);
  }

  async function getCosmicCashBalance() {
    const addr = await injected.getAccount();
    await cosmicCashContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        setCosmicCashBalance(+ethers.utils.formatEther(result));
      });
  }

  async function getCosmicCashApproved() {
    const addr = await injected.getAccount();
    await cosmicCashContract.methods
      .allowance(addr, OberonAddress)
      .call()
      .then((result) => {
        const amt = ethers.utils.formatEther(result).substring(0, 7);
        if (+amt < 25) {
          setCosmicCashApproved(false);
        } else {
          setCosmicCashApproved(true);
        }
      });
  }

  async function getEnergyBalance() {
    const addr = await injected.getAccount();
    await energyContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = ethers.utils.formatEther(result).substring(0, 7);
        setEnergyBalance(amt);
      });
  }

  async function getEnergyApproved() {
    const addr = await injected.getAccount();
    await energyContract.methods
      .allowance(addr, OberonAddress)
      .call()
      .then((result) => {
        const amt = ethers.utils.formatEther(result).substring(0, 7);
        if (+amt < 25) {
          setEnergyApproved(false);
        } else {
          setEnergyApproved(true);
        }
      });
  }

  async function getOberonMetadata() {
    const addr = await injected.getAccount();
    let lv = 0;
    await oberonContract.methods
      .userLevel(addr)
      .call()
      .then((result) => {
        lv = +result + 1;
        setCapacityLevel(lv);
      })
      .catch((err) => console.log(err));
    await oberonContract.methods
      .getBaseProduction()
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result) * 86400);
        setBaseProduction(amt);
      })
      .catch((err) => console.log(err));

    setCapacity(OberonCapacity[lv - 1]);
    setNextLevelCapacity(OberonCapacity[lv]);
    setUpgradeCost(OberonUpgradeCost[lv]);
    await mineEmpireDrillContract.methods
      .isApprovedForAll(addr, OberonAddress)
      .call()
      .then((result) => {
        setDrillsApproved(result);
      })
      .catch((err) => console.log(err));
  }

  async function updateState() {
    await checkUnlocked();
    await getCollectedCobalt();
    await getStakeInfo();
    await getOwnedDrills();
    await getCosmicCashBalance();
    await getCosmicCashApproved();
    await getEnergyBalance();
    await getEnergyApproved();
    await getOberonMetadata();
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

  async function handleStake() {
    if (disableButtons) return;
    setDisableButtons(true);
    const addr = await injected.getAccount();
    await oberonContract.methods
      .stake(drillSelected)
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    await updateState();
    setDisableButtons(false);
  }
  async function handleCollectCobalt() {
    if (disableButtons) return;
    setDisableButtons(true);
    const addr = await injected.getAccount();
    await oberonContract.methods
      .collectCobalt()
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    await updateState();
    setDisableButtons(false);
  }
  async function handleUnstakeDrill() {
    if (disableButtons) return;
    setDisableButtons(true);
    const addr = await injected.getAccount();
    await oberonContract.methods
      .unstake()
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    await updateState();
    setDisableButtons(false);
  }
  async function handleUpgrade() {
    if (disableButtons) return;
    setDisableButtons(true);
    const addr = await injected.getAccount();
    await oberonContract.methods
      .upgrade()
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    await updateState();
    setDisableButtons(false);
  }
  async function handleApproveCosmicCash() {
    if (disableButtons) return;
    setDisableButtons(true);
    setDisableApproveCSC(true);
    const addr = await injected.getAccount();
    await cosmicCashContract.methods
      .approve(OberonAddress, "1000000000000000000000")
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    await updateState();
    setDisableButtons(false);
    setDisableApproveCSC(false);
  }

  async function handleApproveDrills() {
    if (disableButtons) return;
    setDisableButtons(true);
    const addr = await injected.getAccount();
    await mineEmpireDrillContract.methods
      .setApprovalForAll(OberonAddress, "true")
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    await updateState();
    setDisableButtons(false);
  }

  async function handleApproveEnergy() {
    if (disableApproveEnergy || energyApproved) return;
    setDisableApproveEnergy(true);
    const addr = await injected.getAccount();
    await energyContract.methods
      .approve(OberonAddress, "1000000000000000000000")
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    await updateState();
    setDisableApproveEnergy(false);
  }

  async function handleUnlockWithEnergy() {
    if (disableUnlockWithEnergy || !energyApproved) return;
    setDisableUnlockWithEnergy(true);
    setDisableUnlockWithCSC(true);
    const addr = await injected.getAccount();
    await oberonContract.methods
      .unlock(false)
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    setDisableUnlockWithEnergy(false);
    setDisableUnlockWithCSC(false);
    await updateState();
  }
  async function handleUnlockWithCSC() {
    if (disableUnlockWithCSC || !cosmicCashApproved) return;
    setDisableUnlockWithEnergy(true);
    setDisableUnlockWithCSC(true);
    const addr = await injected.getAccount();
    await oberonContract.methods
      .unlock(true)
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    setDisableUnlockWithEnergy(false);
    setDisableUnlockWithCSC(false);
    await updateState();
  }

  // website
  const handleSelectDrill = () => {
    if (disableButtons) return;
    setShowSelect(!showSelect);
  };

  const handleDisableSelect = () => {
    setShowSelect(false);
  };

  return pageLoaded ? (
    <>
      <Section>
        <Container>
          <TitleContainer>
            <h1>Oberon</h1>
            <h3>
              Oberon is a cobalt rich asteroid. Cobalt has a better conversion
              rate compared to iron.
            </h3>
            <h3>
              Pay a one time unlock fee of 250 Energy OR 25 Cosmic Cash and
              start collecting cobalt!
            </h3>
          </TitleContainer>
        </Container>
        <Container>
          <BodyContainer>
            <SelectDrillModalBg
              showSelect={showSelect}
              onClick={handleDisableSelect}
            >
              <SelectDrillModal>
                <DrillSelectorMenu
                  selectDrill={selectDrill}
                  ownedDrills={ownedDrills}
                  drillsLoaded={drillsLoaded}
                ></DrillSelectorMenu>
              </SelectDrillModal>
            </SelectDrillModalBg>
            <PlanetBodyContainer>
              <UnlockBodyBg unlocked={unlocked}>
                <h3>Unlock Oberon with 250 Energy or 25 Cosmic Cash</h3>
                <EnergyOrCosmicCashContainer>
                  <ApproveAndUseContainer>
                    <ButtonContainer>
                      <Button
                        disable={energyApproved || disableApproveEnergy}
                        onClick={handleApproveEnergy}
                      >
                        Approve Energy
                      </Button>
                    </ButtonContainer>
                    <ButtonContainer>
                      <Button
                        disable={
                          !energyApproved ||
                          disableUnlockWithEnergy ||
                          energyBalance < 250
                        }
                        onClick={handleUnlockWithEnergy}
                      >
                        Unlock with 250 Energy
                      </Button>
                    </ButtonContainer>
                  </ApproveAndUseContainer>
                  <ApproveAndUseContainer>
                    <ButtonContainer>
                      <Button
                        disable={cosmicCashApproved || disableApproveCSC}
                        onClick={handleApproveCosmicCash}
                      >
                        Approve CSC
                      </Button>
                    </ButtonContainer>
                    <ButtonContainer>
                      <Button
                        disable={
                          !cosmicCashApproved ||
                          disableUnlockWithCSC ||
                          cosmicCashBalance < 25
                        }
                        onClick={handleUnlockWithCSC}
                      >
                        Unlock with 25 CSC
                      </Button>
                    </ButtonContainer>
                  </ApproveAndUseContainer>
                </EnergyOrCosmicCashContainer>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://beets.fi/#/trade?outputCurrency=0x84f8d24231dfbbfae7f39415cd09c8f467729fc8"
                >
                  <ButtonContainer>
                    <BasicButton>Get Cosmic Cash</BasicButton>
                  </ButtonContainer>
                </a>
              </UnlockBodyBg>
              <PlanetBody>
                <StakeContainer>
                  <PlanetTitleContainer>
                    <img src="../../assets/oberon.png" alt="" />
                    <PlanetTitle>
                      <h1 id="title">Oberon</h1>
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
                    <h3 id="description">Staked Drill</h3>
                    <h3 id="value">#{drillId}</h3>
                  </DescriptionRow>
                  <DescriptionRow>
                    <h3 id="description">Drill Level</h3>
                    <h3 id="value">{drillLevel}</h3>
                  </DescriptionRow>
                  <DescriptionRow>
                    <h3 id="description">Drill Multiplier</h3>
                    <h3 id="value">x{drillPower / 100}</h3>
                  </DescriptionRow>
                  <DescriptionRow>
                    <h3 id="description">Collected</h3>
                    <h3 id="value">
                      {collected}/{capacity}
                    </h3>
                  </DescriptionRow>
                  <PlanetButtonContainer>
                    {drillStaked ? (
                      <>
                        <ButtonContainer>
                          <Button
                            onClick={handleCollectCobalt}
                            disable={disableButtons}
                          >
                            Collect
                          </Button>
                        </ButtonContainer>
                        <ButtonContainer>
                          <Button
                            onClick={handleUnstakeDrill}
                            disable={disableButtons}
                          >
                            Unstake
                          </Button>
                        </ButtonContainer>
                      </>
                    ) : (
                      <>
                        {drillsApproved ? (
                          <>
                            {drillSelected !== 0 ? (
                              <>
                                <ButtonContainer>
                                  <Button
                                    onClick={handleSelectDrill}
                                    disable={disableButtons}
                                  >
                                    Select Drill
                                  </Button>
                                </ButtonContainer>
                                <ButtonContainer>
                                  <Button
                                    onClick={handleStake}
                                    disable={disableButtons}
                                  >
                                    Stake #{drillSelected}
                                  </Button>
                                </ButtonContainer>
                              </>
                            ) : (
                              <>
                                <ButtonContainer>
                                  <Button
                                    onClick={handleSelectDrill}
                                    disable={disableButtons}
                                  >
                                    Select Drill
                                  </Button>
                                </ButtonContainer>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <ButtonContainer>
                              <Button
                                onClick={handleApproveDrills}
                                disable={disableButtons}
                              >
                                Approve Drill
                              </Button>
                            </ButtonContainer>
                          </>
                        )}
                      </>
                    )}
                  </PlanetButtonContainer>
                </StakeContainer>
              </PlanetBody>
              <DescriptionContainer>
                <PlanetTitle>
                  <h1 id="title">Oberon Stats</h1>
                </PlanetTitle>
                <Line width="320px" />
                <DescriptionRow>
                  <h3 id="description">Type</h3>
                  <h3 id="value">Asteroid</h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Production Resource</h3>
                  <h3 id="value">Cobalt</h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Base Production</h3>
                  <h3 id="value">{baseProduction} / Day</h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Your Production</h3>
                  <h3 id="value">
                    {Math.floor((baseProduction * drillPower) / 100)} / Day
                  </h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Capacity Level</h3>
                  <h3 id="value">{capacityLevel} / 10</h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Capacity</h3>
                  <h3 id="value">{capacity}</h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Next Level Capacity</h3>
                  <h3 id="value">{nextLevelCapacity}</h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Upgrade Cost</h3>
                  <h3 id="value">{upgradeCost} CSC</h3>
                </DescriptionRow>
                <PlanetButtonContainer>
                  {cosmicCashApproved ? (
                    <>
                      {capacityLevel === 10 ? (
                        <ButtonContainer>
                          <ButtonGray>MAX</ButtonGray>
                        </ButtonContainer>
                      ) : (
                        <>
                          {cosmicCashBalance >= upgradeCost ? (
                            <>
                              <ButtonContainer>
                                <Button
                                  onClick={handleUpgrade}
                                  disable={disableButtons}
                                >
                                  Upgrade Capacity
                                </Button>
                              </ButtonContainer>
                            </>
                          ) : (
                            <>
                              <ButtonContainer>
                                <Link to="/rewards">
                                  <Button>Get CSC</Button>
                                </Link>
                              </ButtonContainer>
                              <ButtonContainer>
                                <Button disable={true}>Upgrade</Button>
                              </ButtonContainer>
                            </>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <ButtonContainer>
                      <Button
                        onClick={handleApproveCosmicCash}
                        disable={disableButtons}
                      >
                        Approve CSC
                      </Button>
                    </ButtonContainer>
                  )}
                </PlanetButtonContainer>
              </DescriptionContainer>
            </PlanetBodyContainer>
            <ConverterContainer>
              <ConversionBox>
                <img src="../../assets/cobalt.png" alt="" />
                <p>1 = 0.0003573981415</p>
                <img src="../../assets/csc-icon.png" alt="" />
              </ConversionBox>
              <ConversionBox>
                <img src="../../assets/csc-icon.png" alt="" />
                <p>1 = 2798</p>
                <img src="../../assets/cobalt.png" alt="" />
              </ConversionBox>
            </ConverterContainer>
          </BodyContainer>
        </Container>
      </Section>
    </>
  ) : (
    <>
      <Section>
        <Loading>
          <h1>Loading...</h1>
        </Loading>
      </Section>
    </>
  );
};

export default OberonBody;
