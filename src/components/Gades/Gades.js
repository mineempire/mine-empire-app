import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { injected } from "../../connectors";
import { Link } from "react-router-dom";
import {
  drillMetadataIPFSUrl,
  gadesAddress,
  gadesMetadataIPFSUrl,
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
  Loading,
} from "../../globalStyles";
import {
  getCosmicCashContract,
  getGadesContract,
  getMineEmpireDrillContract,
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
} from "../Planet/PlanetStyles";

const GadesBody = () => {
  let selectedAddress = "";
  const [pageLoaded, setPageLoaded] = useState(false);
  const [cosmicCashBalance, setCosmicCashBalance] = useState(0);
  const [cosmicCashApproved, setCosmicCashApproved] = useState(false);
  const [upgradeCost, setUpgradeCost] = useState(0);
  const [drillPower, setDrillPower] = useState(0);
  const [capacityLevel, setCapacityLevel] = useState(0);
  const [capacity, setCapacity] = useState(0);
  const [baseProduction, setBaseProduction] = useState(0);
  const [nextLevelCapacity, setNextLevelCapacity] = useState(0);
  const [miningStatus, setMiningStatus] = useState("Idle");
  const [ownedDrills, setOwnedDrills] = useState([]);
  const [drillsLoaded, setDrillsLoaded] = useState(false);
  const [drillStaked, setDrillStaked] = useState(0);
  const [drillSelected, setDrillSelected] = useState(0);
  const [showSelect, setShowSelect] = useState(false);
  const [drillsApproved, setDrillsApproved] = useState(false);
  const [disableGadesButtons, setDisableGadesButtons] = useState(false);

  const [drillId, setDrillId] = useState(0);
  const [drillLevel, setDrillLevel] = useState(0);
  const [collected, setCollected] = useState(0);

  const gadesContract = getGadesContract();
  const mineEmpireDrillContract = getMineEmpireDrillContract();
  const cosmicCashContract = getCosmicCashContract();

  async function selectDrill(drillId) {
    setDrillSelected(drillId);
  }

  async function getCollectedIron() {
    selectedAddress = await injected.getAccount();
    await gadesContract.methods
      .getAccumulatedIron(selectedAddress)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result));
        if (amt === capacity && amt > 0) {
          setMiningStatus("At Capacity");
        }
        setCollected(amt);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function getStakeInfo() {
    await gadesContract.methods
      .getStake(selectedAddress)
      .call()
      .then((stake) => {
        const drillId = stake[0];
        if (drillId === "0") {
          setDrillStaked(false);
          setDrillId(0);
          setDrillLevel(0);
          setMiningStatus("Idle");
        } else {
          setDrillSelected(true);
          setDrillStaked(true);
          setDrillId(stake["drill"]["drillId"]);
          setDrillLevel(+stake["drill"]["level"] + 1);
          setMiningStatus("Mining");
          getCollectedIron();
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

  // TODO
  async function getGadesMetadata() {
    selectedAddress = await injected.getAccount();
    let lv = 0;
    await gadesContract.methods
      .userLevel(selectedAddress)
      .call()
      .then((result) => {
        lv = +result + 1;
        setCapacityLevel(lv);
      })
      .catch((err) => console.log(err));
    await gadesContract.methods
      .getBaseProduction()
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result) * 86400);
        setBaseProduction(amt);
      })
      .catch((err) => console.log(err));
    await cosmicCashContract.methods
      .allowance(selectedAddress, gadesAddress)
      .call()
      .then((result) => {
        const amount = ethers.utils.formatEther(result).substring(0, 7);
        if (+amount < 25) {
          setCosmicCashApproved(false);
        } else {
          setCosmicCashApproved(true);
        }
      });
    fetch(gadesMetadataIPFSUrl)
      .then((response) => response.json())
      .then((data) => {
        const levels = data["capacity"];
        setCapacity(levels[lv - 1]);
        setNextLevelCapacity(levels[lv]);
        const upgrades = data["upgrade"];
        setUpgradeCost(upgrades[lv]);
      });
    await mineEmpireDrillContract.methods
      .isApprovedForAll(selectedAddress, gadesAddress)
      .call()
      .then((result) => {
        setDrillsApproved(result);
      })
      .catch((err) => console.log(err));
  }

  // TODO
  async function getDrillMetadata() {
    fetch(drillMetadataIPFSUrl)
      .then((response) => response.json())
      .then((data) => {
        if (drillLevel === 0) return;
        const power = data["power"];
        setDrillPower(power[drillLevel - 1]);
      });
  }

  useEffect(() => {
    getDrillMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drillLevel]);

  async function updateState() {
    selectedAddress = await injected.getAccount();
    await getStakeInfo();
    await getOwnedDrills();
    await getGadesMetadata();
    await getCosmicCashBalance();
    setPageLoaded(true);
  }

  async function handleStake() {
    if (disableGadesButtons) return;
    setDisableGadesButtons(true);
    selectedAddress = await injected.getAccount();
    await gadesContract.methods
      .stake(drillSelected)
      .send({ from: selectedAddress })
      .then()
      .catch((err) => console.log(err));
    await getStakeInfo();
    await getGadesMetadata();
    setDisableGadesButtons(false);
  }

  async function handleCollectIron() {
    if (disableGadesButtons) return;
    setDisableGadesButtons(true);
    selectedAddress = await injected.getAccount();
    await gadesContract.methods
      .collectIron()
      .send({
        from: selectedAddress,
      })
      .then((result) => {})
      .catch((err) => console.log(err));
    await getCollectedIron();
    await getGadesMetadata();
    setDisableGadesButtons(false);
  }

  async function handleUnstakeDrill() {
    if (disableGadesButtons) return;
    setDisableGadesButtons(true);
    selectedAddress = await injected.getAccount();
    await gadesContract.methods
      .unstake()
      .send({ from: selectedAddress })
      .then((result) => {})
      .catch((err) => console.log(err));
    await getStakeInfo();
    setDrillSelected(0);
    await getOwnedDrills();
    await getGadesMetadata();
    setDisableGadesButtons(false);
  }

  async function handleUpgrade() {
    if (disableGadesButtons) return;
    setDisableGadesButtons(true);
    selectedAddress = await injected.getAccount();
    await gadesContract.methods
      .upgrade()
      .send({
        from: selectedAddress,
      })
      .then((result) => {
        getGadesMetadata();
      })
      .catch((err) => console.log(err));
    await getGadesContract();
    await getCosmicCashBalance();
    setDisableGadesButtons(false);
  }

  async function handleApproveCosmicCash() {
    if (disableGadesButtons) return;
    setDisableGadesButtons(true);
    selectedAddress = await injected.getAccount();
    await cosmicCashContract.methods
      .approve(gadesAddress, "1000000000000000000000")
      .send({ from: selectedAddress })
      .then()
      .catch((err) => console.log(err));
    await getGadesMetadata();
    setDisableGadesButtons(false);
  }

  async function handleApproveDrills() {
    if (disableGadesButtons) return;
    setDisableGadesButtons(true);
    selectedAddress = await injected.getAccount();
    await mineEmpireDrillContract.methods
      .setApprovalForAll(gadesAddress, "true")
      .send({ from: selectedAddress })
      .then()
      .catch((err) => console.log(err));
    await getGadesMetadata();
    setDisableGadesButtons(false);
  }

  useEffect(() => {
    updateState();
    const intervalId = setInterval(() => {
      if (!disableGadesButtons) updateState();
    }, 5000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // website
  const handleSelectDrill = () => {
    if (disableGadesButtons) return;
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
            <h1>Gades</h1>
            <h3>
              Gades is an iron rich asteroid. Stake an asteroid drill to start
              earning iron.
            </h3>
            <h3>
              Buy a drill from the Market. Upgrading the drill allows you to
              multiply your production!
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
              <PlanetBody>
                <StakeContainer>
                  <PlanetTitleContainer>
                    <img src="../../assets/gades.png" alt="" />
                    <PlanetTitle>
                      <h1 id="title">Gades</h1>
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
                            onClick={handleCollectIron}
                            disable={disableGadesButtons}
                          >
                            Collect
                          </Button>
                        </ButtonContainer>
                        <ButtonContainer>
                          <Button
                            onClick={handleUnstakeDrill}
                            disable={disableGadesButtons}
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
                                    disable={disableGadesButtons}
                                  >
                                    Select Drill
                                  </Button>
                                </ButtonContainer>
                                <ButtonContainer>
                                  <Button
                                    onClick={handleStake}
                                    disable={disableGadesButtons}
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
                                    disable={disableGadesButtons}
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
                                disable={disableGadesButtons}
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
                  <h1 id="title">Gades Stats</h1>
                </PlanetTitle>
                <Line width="320px" />
                <DescriptionRow>
                  <h3 id="description">Type</h3>
                  <h3 id="value">Asteroid</h3>
                </DescriptionRow>
                <DescriptionRow>
                  <h3 id="description">Production Resource</h3>
                  <h3 id="value">Iron</h3>
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
                                  disable={disableGadesButtons}
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
                        disable={disableGadesButtons}
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
                <img src="../../assets/iron60px.png" alt="" />
                <p>1 = 0.000072416</p>
                <img src="../../assets/csc-icon.png" alt="" />
              </ConversionBox>
              <ConversionBox>
                <img src="../../assets/csc-icon.png" alt="" />
                <p>1 = 13809</p>
                <img src="../../assets/iron60px.png" alt="" />
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

export default GadesBody;
