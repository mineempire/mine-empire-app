import { ethers } from "ethers";
import { useEffect } from "react";
import { useState } from "react";
import { injected } from "../../connectors";
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
  getCybeleContract,
  getMineEmpireDrillContract,
  getCosmicCashContract,
} from "../../Web3Client";
import { AsteroidDrillPower } from "../../stats/DrillStats";
import { CybeleCapacity, CybeleUpgradeCost } from "../../stats/CybeleStats";
import {
  CybeleAddress,
  mineEmpireDrillAddress,
} from "../../contracts/Addresses";

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
} from "../Planet/PlanetStyles";
import DrillSelectorMenu from "../Planet/DrillSelectorMenu";
import { RightFlexDiv } from "../Market/MarketStyles";

const CybeleBody = () => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [disableButtons, setDisableButtons] = useState(false);
  const [capacity, setCapacity] = useState(0);
  const [miningStatus, setMiningStatus] = useState("Idle");
  const [collected, setCollected] = useState(0);
  const [drillStaked, setDrillStaked] = useState(0);
  const [drillId, setDrillId] = useState(0);
  const [drillLevel, setDrillLevel] = useState(0);
  const [drillPower, setDrillPower] = useState(0);
  const [drillSelected, setDrillSelected] = useState(0);
  const [ownedDrills, setOwnedDrills] = useState([]);
  const [drillsLoaded, setDrillsLoaded] = useState(false);
  const [cosmicCashBalance, setCosmicCashBalance] = useState(0);
  const [cosmicCashApproved, setCosmicCashApproved] = useState(false);
  const [capacityLevel, setCapacityLevel] = useState(0);
  const [baseProduction, setBaseProduction] = useState(0);
  const [nextLevelCapacity, setNextLevelCapacity] = useState(0);
  const [upgradeCost, setUpgradeCost] = useState(0);
  const [drillsApproved, setDrillsApproved] = useState(false);
  const [showSelect, setShowSelect] = useState(false);

  const cybeleContract = getCybeleContract();
  const mineEmpireDrillContract = getMineEmpireDrillContract();
  const cosmicCashContract = getCosmicCashContract();

  async function getCollectedSilver() {
    const addr = await injected.getAccount();
    await cybeleContract.methods
      .getAccumulatedSilver(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result));
        if (amt > 0 && amt === capacity) {
          setMiningStatus("At Capacity");
        }
        setCollected(amt);
      })
      .catch((err) => console.log(err));
  }

  async function getStakeInfo() {
    const addr = await injected.getAccount();
    await cybeleContract.methods
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
          if (drill["level"] >= 2) {
            fetchedDrills.push({
              drillId: key,
              drillType: drill["drillType"],
              level: drill["level"],
            });
          }
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
      .allowance(addr, CybeleAddress)
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

  async function getCybeleMetadata() {
    const addr = await injected.getAccount();
    let lv = 0;
    await cybeleContract.methods
      .userLevel(addr)
      .call()
      .then((result) => {
        lv = +result + 1;
        setCapacityLevel(lv);
      })
      .catch((err) => console.log(err));
    await cybeleContract.methods
      .getBaseProduction()
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result) * 86400);
        setBaseProduction(amt);
      })
      .catch((err) => console.log(err));

    setCapacity(CybeleCapacity[lv - 1]);
    setNextLevelCapacity(CybeleCapacity[lv]);
    setUpgradeCost(CybeleUpgradeCost[lv]);
    await mineEmpireDrillContract.methods
      .isApprovedForAll(addr, CybeleAddress)
      .call()
      .then((result) => {
        setDrillsApproved(result);
      })
      .catch((err) => console.log(err));
  }

  async function updateState() {
    await getCollectedSilver();
    await getStakeInfo();
    await getOwnedDrills();
    await getCosmicCashBalance();
    await getCosmicCashApproved();
    await getCybeleMetadata();
    setPageLoaded(true);
  }

  useEffect(() => {
    updateState();
    const intervalId = setInterval(() => {
      updateState();
    }, 1000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApproveDrills() {
    if (disableButtons) return;
    setDisableButtons(true);
    const addr = await injected.getAccount();
    await mineEmpireDrillContract.methods
      .setApprovalForAll(CybeleAddress, "true")
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    await updateState();
    setDisableButtons(false);
  }
  async function handleStake() {
    if (disableButtons) return;
    setDisableButtons(true);
    const addr = await injected.getAccount();
    await cybeleContract.methods
      .stake(drillSelected)
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    setDisableButtons(false);
  }
  async function handleUnstake() {
    if (disableButtons) return;
    setDisableButtons(true);
    const addr = await injected.getAccount();
    await cybeleContract.methods
      .unstake()
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    await updateState();
    setDrillSelected(0);
    setDisableButtons(false);
  }
  async function handleCollectSilver() {
    if (disableButtons) return;
    setDisableButtons(true);
    const addr = await injected.getAccount();
    await cybeleContract.methods
      .collectSilver()
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    setDisableButtons(false);
  }

  async function handleApproveCosmicCash() {
    if (disableButtons) return;
    setDisableButtons(true);
    const addr = await injected.getAccount();
    await cosmicCashContract.methods
      .approve(CybeleAddress, "1000000000000000000000")
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
    await cybeleContract.methods
      .upgrade()
      .send({ from: addr })
      .then()
      .catch((err) => console.log(err));
    setDisableButtons(false);
  }

  // website
  const handleSelectDrill = () => {
    if (disableButtons) return;
    setShowSelect(!showSelect);
  };

  const handleDisableSelect = () => {
    setShowSelect(false);
  };

  function selectDrill(drillId) {
    setDrillSelected(drillId);
  }

  return pageLoaded ? (
    <>
      <Section>
        <Container>
          <TitleContainer>
            <h1>Cybele</h1>
            <h3>
              Stake an asteroid drill and earn silver. The hard surface of
              Cybele requires you to deploy drills level 3 or higher.
            </h3>
            <h3>
              Buy drills in the Market to start earning. Upgrade them in your
              Inventory to increase your production!
            </h3>
            <RightFlexDiv>
              <a
                href="https://mine-empire.gitbook.io/mine-empire/game/cosmos/cybele"
                rel="noreferrer"
                target="_blank"
              >
                <BasicButton>Cybele Docs</BasicButton>
              </a>
            </RightFlexDiv>
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
              <PlanetBody>
                <StakeContainer>
                  <PlanetTitleContainer>
                    <img src="../../assets/cybele.png" alt="" />
                    <PlanetTitle>
                      <h1 id="title">Cybele</h1>
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
                            onClick={handleCollectSilver}
                            disable={disableButtons}
                          >
                            Collect
                          </Button>
                        </ButtonContainer>
                        <ButtonContainer>
                          <Button
                            onClick={handleUnstake}
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
                  <h1 id="title">Cybele Stats</h1>
                </PlanetTitle>
                <Line width="320px" />
                <DescriptionRow>
                  <h3 id="description">Type</h3>
                  <h3 id="value">Asteroid</h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Production Resource</h3>
                  <h3 id="value">Silver</h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Base Production</h3>
                  <h3 id="value">{baseProduction} / Day</h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Your Production</h3>
                  <h3 id="value">
                    {drillStaked
                      ? Math.floor((baseProduction * drillPower) / 100)
                      : 0}{" "}
                    / Day
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
                                <a
                                  target="_blank"
                                  rel="noreferrer"
                                  href="https://beets.fi/#/trade?outputCurrency=0x84f8d24231dfbbfae7f39415cd09c8f467729fc8"
                                >
                                  <Button>Get CSC</Button>
                                </a>
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
                <img src="../../assets/silver.png" alt="" />
                <p>1 = 0.000481696</p>
                <img src="../../assets/csc-icon.png" alt="" />
              </ConversionBox>
              <ConversionBox>
                <img src="../../assets/csc-icon.png" alt="" />
                <p>1 = 2076</p>
                <img src="../../assets/silver.png" alt="" />
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

export default CybeleBody;
