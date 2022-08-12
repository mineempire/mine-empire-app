import {
  BodyContainer,
  Button,
  ButtonContainer,
  Container,
  Section,
  TitleContainer,
} from "../../globalStyles";
import { AiOutlineArrowDown } from "react-icons/ai";

import {
  SwapContainer,
  Swap,
  ResourceBox,
  TokenImgContainer,
  TokenAmountContainer,
  TokenBalanceContainer,
  TokenMain,
  TokenAmountText,
  Arrow,
  ArrowContainer,
  SwapTitleContainer,
  ConvertButtonContainer,
  SelectResourceModalBg,
  SelectResourceModal,
  SelectResourceMenuTitle,
  SelectResourceMenu,
  SelectResourceMenuBody,
  SelectResourceMenuItem,
  SelectResourceNameImg,
} from "./ConverterStyles";
import { useEffect, useState } from "react";
import {
  getBerylliumContract,
  getCobaltContract,
  getConverterContract,
  getCosmicCashContract,
  getIronContract,
  getSilverContract,
  isConnected,
} from "../../Web3Client";
import { useWeb3React } from "@web3-react/core";
import { injected } from "../../connectors";
import { ethers } from "ethers";
import {
  BerylliumAddress,
  CobaltAddress,
  converterAddress,
  ironAddress,
  SilverAddress,
} from "../../contracts/Addresses";

const ConverterBody = () => {
  const [connected, setConnected] = useState(true);
  const [showSelect, setShowSelect] = useState(false);
  const [selectedResource, setSelectedResource] = useState("iron");
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [cosmicCashQuantity, setCosmicCashQuantity] = useState();
  const [inputQuantity, setInputQuantity] = useState();
  const [ouputQuantity, setOutputQuantity] = useState(0);
  const [ironQuantity, setIronQuantity] = useState(0);
  const [cobaltQuantity, setCobaltQuantity] = useState(0);
  const [silverQuantity, setSilverQuantity] = useState(0);
  const [approvedSilver, setApprovedSilver] = useState(false);
  const [berylliumQuantity, setBerylliumQuantity] = useState(0);
  const [approvedBeryllium, setApprovedBeryllium] = useState(false);
  const [conversionRate, setConversionRate] = useState(13809);
  const [bismuthQuantity] = useState(0);
  const [rubyQuantity] = useState(0);
  const [approvedIron, setApprovedIron] = useState(false);
  const [approvedCobalt, setApprovedCobalt] = useState(false);
  const [selectedApproved, setSelectedApproved] = useState(false);
  const { activate } = useWeb3React();
  const [disableButtons, setDisableButtons] = useState(false);

  const ironContract = getIronContract();
  const cobaltContract = getCobaltContract();
  const silverContract = getSilverContract();
  const berylliumContract = getBerylliumContract();
  const cscContract = getCosmicCashContract();
  const converterContract = getConverterContract();

  async function checkConnection() {
    const connected = await isConnected();
    setConnected(connected);
  }

  async function getApprovedIron() {
    const addr = await injected.getAccount();
    await ironContract.methods
      .allowance(addr, converterAddress)
      .call()
      .then((result) => {
        const amount = ethers.utils.formatEther(result);
        if (+amount < 10000000) {
          setApprovedIron(false);
          if (selectedResource === "iron") setSelectedApproved(false);
        } else {
          setApprovedIron(true);
          if (selectedResource === "iron") setSelectedApproved(true);
        }
      });
  }

  async function getApprovedCobalt() {
    const addr = await injected.getAccount();
    await cobaltContract.methods
      .allowance(addr, converterAddress)
      .call()
      .then((result) => {
        const amount = ethers.utils.formatEther(result);
        if (+amount < 10000000) {
          setApprovedCobalt(false);
        } else {
          setApprovedCobalt(true);
        }
      });
  }

  async function getCobaltBalance() {
    const addr = await injected.getAccount();
    await cobaltContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result));
        setCobaltQuantity(amt);
      });
  }

  async function getApprovedSilver() {
    const addr = await injected.getAccount();
    await silverContract.methods
      .allowance(addr, converterAddress)
      .call()
      .then((result) => {
        const amt = ethers.utils.formatEther(result);
        if (+amt < 10000000) {
          setApprovedSilver(false);
        } else {
          setApprovedSilver(true);
        }
      });
  }

  async function getSilverBalance() {
    const addr = await injected.getAccount();
    await silverContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result));
        setSilverQuantity(amt);
      });
  }

  async function getApprovedBeryllium() {
    const addr = await injected.getAccount();
    await berylliumContract.methods
      .allowance(addr, converterAddress)
      .call()
      .then((result) => {
        const amt = ethers.utils.formatEther(result);
        if (+amt < 10000000) {
          setApprovedBeryllium(false);
        } else {
          setApprovedBeryllium(true);
        }
      });
  }

  async function getBerylliumBalance() {
    const addr = await injected.getAccount();
    await berylliumContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result) * 100) / 100;
        setBerylliumQuantity(amt);
      });
  }

  async function getApproves() {
    await getApprovedIron();
    await getApprovedCobalt();
    await getApprovedSilver();
    await getApprovedBeryllium();
  }

  async function getBalances() {
    const addr = await injected.getAccount();
    await ironContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result));
        setIronQuantity(amt);
        if (selectedResource === "iron") {
          setSelectedQuantity(amt);
        } else if (selectedResource === "cobalt") {
          setSelectedQuantity(amt);
        } else if (selectedResource === "silver") {
          setSelectedQuantity(amt);
        }
      });
    await cscContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result) * 100) / 100;
        setCosmicCashQuantity(amt);
      });
    await getCobaltBalance();
    await getSilverBalance();
    await getBerylliumBalance();
  }

  async function updateState() {
    await getApproves();
    await getBalances();
  }

  useEffect(() => {
    checkConnection();
    updateState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectResourceMenu = () => {
    setShowSelect(!showSelect);
  };

  const handleDisableSelect = () => {
    setShowSelect(false);
  };

  async function handleSelectResource(id) {
    if (id === 0) {
      setSelectedResource("iron");
      setSelectedQuantity(ironQuantity);
      setConversionRate(13809);
      setSelectedApproved(approvedIron);
    } else if (id === 1) {
      setSelectedResource("cobalt");
      setSelectedQuantity(cobaltQuantity);
      setConversionRate(2798);
      setSelectedApproved(approvedCobalt);
    } else if (id === 2) {
      setSelectedResource("silver");
      setSelectedQuantity(silverQuantity);
      setConversionRate(2076);
      setSelectedApproved(approvedSilver);
    } else if (id === 3) {
      setSelectedResource("bismuth");
      setSelectedQuantity(bismuthQuantity);
    } else if (id === 4) {
      setSelectedResource("ruby");
      setSelectedQuantity(rubyQuantity);
    } else if (id === 5) {
      setSelectedResource("beryllium");
      setSelectedQuantity(berylliumQuantity);
      setConversionRate(355);
      setSelectedApproved(approvedBeryllium);
    }
  }

  async function handleSetMaxAmount() {
    setInputQuantity(selectedQuantity);
    const outputAmount = selectedQuantity / conversionRate;
    setOutputQuantity(outputAmount);
  }

  async function handleInputOnChange(event) {
    const amt = event.target.value;
    const outputAmount = amt / conversionRate;
    setOutputQuantity(outputAmount);
    setInputQuantity(amt);
  }

  async function handleApprove() {
    if (disableButtons) return;
    setDisableButtons(true);
    const addr = await injected.getAccount();
    if (selectedResource === "iron") {
      await ironContract.methods
        .approve(converterAddress, "1000000000000000000000000000")
        .send({ from: addr })
        .then()
        .catch((err) => console.log(err));
    } else if (selectedResource === "cobalt") {
      await cobaltContract.methods
        .approve(converterAddress, "1000000000000000000000000000")
        .send({ from: addr })
        .then()
        .catch((err) => console.log(err));
    } else if (selectedResource === "silver") {
      await silverContract.methods
        .approve(converterAddress, "1000000000000000000000000000")
        .send({ from: addr })
        .then()
        .catch((err) => console.log(err));
    } else if (selectedResource === "beryllium") {
      await berylliumContract.methods
        .approve(converterAddress, "1000000000000000000000000000")
        .send({ from: addr })
        .then()
        .catch((err) => console.log(err));
    }
    await updateState();
    setDisableButtons(false);
  }

  async function handleConvert() {
    const addr = await injected.getAccount();
    console.log("here");
    if (selectedResource === "iron") {
      await converterContract.methods
        .convert(ironAddress, inputQuantity + "000000000000000000")
        .send({ from: addr })
        .then()
        .catch((err) => console.log(err));
    } else if (selectedResource === "cobalt") {
      await converterContract.methods
        .convert(CobaltAddress, inputQuantity + "000000000000000000")
        .send({ from: addr })
        .then()
        .catch((err) => console.log(err));
    } else if (selectedResource === "silver") {
      await converterContract.methods
        .convert(SilverAddress, inputQuantity + "000000000000000000")
        .send({ from: addr })
        .then()
        .catch((err) => console.log(err));
    } else if (selectedResource === "beryllium") {
      await converterContract.methods
        .convert(BerylliumAddress, String(inputQuantity * 1000000000000000000))
        .send({ from: addr })
        .then()
        .catch((err) => console.log(err));
    }
    await updateState();
    setDisableButtons(false);
  }

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  return (
    <>
      <Section>
        <Container>
          <TitleContainer>
            <h1>Convert to Cosmic Cash</h1>
            <h3>All resources can be converted to Cosmic Cash.</h3>
          </TitleContainer>
        </Container>
        <Container>
          <BodyContainer>
            <SelectResourceModalBg
              showSelect={showSelect}
              onClick={handleDisableSelect}
            >
              <SelectResourceModal>
                <SelectResourceMenu>
                  <SelectResourceMenuTitle>
                    <h3>Select a Resource</h3>
                  </SelectResourceMenuTitle>
                  <SelectResourceMenuBody>
                    <SelectResourceMenuItem
                      onClick={() => handleSelectResource(0)}
                    >
                      <SelectResourceNameImg>
                        <img src="../../assets/iron.png" alt="" />
                        <p id="name">Iron</p>
                      </SelectResourceNameImg>
                      <p id="qt">{ironQuantity}</p>
                    </SelectResourceMenuItem>
                    <SelectResourceMenuItem
                      onClick={() => handleSelectResource(1)}
                    >
                      <SelectResourceNameImg>
                        <img src="../../assets/cobalt.png" alt="" />
                        <p id="name">Cobalt</p>
                      </SelectResourceNameImg>
                      <p id="qt">{cobaltQuantity}</p>
                    </SelectResourceMenuItem>
                    <SelectResourceMenuItem
                      onClick={() => handleSelectResource(2)}
                    >
                      <SelectResourceNameImg>
                        <img src="../../assets/silver.png" alt="" />
                        <p id="name">Silver</p>
                      </SelectResourceNameImg>
                      <p id="qt">{silverQuantity}</p>
                    </SelectResourceMenuItem>
                    <SelectResourceMenuItem
                      onClick={() => handleSelectResource(3)}
                    >
                      <SelectResourceNameImg>
                        <img src="../../assets/bismuth.png" alt="" />
                        <p id="name">Bismuth</p>
                      </SelectResourceNameImg>
                      <p id="qt">{bismuthQuantity}</p>
                    </SelectResourceMenuItem>
                    <SelectResourceMenuItem
                      onClick={() => handleSelectResource(4)}
                    >
                      <SelectResourceNameImg>
                        <img src="../../assets/ruby.png" alt="" />
                        <p id="name">Ruby</p>
                      </SelectResourceNameImg>
                      <p id="qt">{rubyQuantity}</p>
                    </SelectResourceMenuItem>
                    <SelectResourceMenuItem
                      onClick={() => handleSelectResource(5)}
                    >
                      <SelectResourceNameImg>
                        <img src="../../assets/beryllium.png" alt="" />
                        <p id="name">Beryllium</p>
                      </SelectResourceNameImg>
                      <p id="qt">{berylliumQuantity}</p>
                    </SelectResourceMenuItem>
                  </SelectResourceMenuBody>
                </SelectResourceMenu>
              </SelectResourceModal>
            </SelectResourceModalBg>
            <SwapContainer>
              <Swap>
                <SwapTitleContainer>
                  <p>Convert</p>
                </SwapTitleContainer>
                <ResourceBox>
                  <TokenMain>
                    <TokenImgContainer onClick={handleSelectResourceMenu}>
                      <img
                        src={"../../assets/" + selectedResource + ".png"}
                        alt=""
                      />
                    </TokenImgContainer>
                    <TokenAmountContainer>
                      <TokenAmountText>
                        <input
                          type="number"
                          onChange={(val) => handleInputOnChange(val)}
                          value={inputQuantity || 0}
                        />
                      </TokenAmountText>
                    </TokenAmountContainer>
                  </TokenMain>
                  <TokenBalanceContainer onClick={handleSetMaxAmount}>
                    <p>
                      {capitalize(selectedResource)}: {selectedQuantity}
                    </p>
                  </TokenBalanceContainer>
                </ResourceBox>
                <ArrowContainer>
                  <Arrow>
                    <AiOutlineArrowDown />
                  </Arrow>
                </ArrowContainer>
                <ResourceBox>
                  <TokenMain>
                    <TokenImgContainer>
                      <img src="../../assets/csc-icon.png" alt="" />
                    </TokenImgContainer>
                    <TokenAmountContainer>
                      <TokenAmountText>
                        <input type="number" readOnly value={ouputQuantity} />
                      </TokenAmountText>
                    </TokenAmountContainer>
                  </TokenMain>
                  <TokenBalanceContainer>
                    <p>Cosmic Cash: {cosmicCashQuantity}</p>
                  </TokenBalanceContainer>
                </ResourceBox>
                <ConvertButtonContainer>
                  <ButtonContainer>
                    {connected ? (
                      selectedApproved ? (
                        <Button
                          onClick={handleConvert}
                          disable={
                            disableButtons ||
                            inputQuantity <= 0 ||
                            inputQuantity > selectedQuantity ||
                            inputQuantity == null
                          }
                        >
                          Convert {capitalize(selectedResource)}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleApprove}
                          disable={disableButtons}
                        >
                          Approve {capitalize(selectedResource)}
                        </Button>
                      )
                    ) : (
                      <Button
                        onClick={() => activate(injected)}
                        disable={disableButtons}
                      >
                        Connect
                      </Button>
                    )}
                  </ButtonContainer>
                </ConvertButtonContainer>
              </Swap>
            </SwapContainer>
          </BodyContainer>
        </Container>
      </Section>
    </>
  );
};

export default ConverterBody;
