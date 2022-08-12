import React, { useEffect, useState } from "react";
import {
  getBerylliumContract,
  getCobaltContract,
  getCosmicCashContract,
  getDailyEnergyContract,
  getEnergyContract,
  getIronContract,
  getSilverContract,
  isConnected,
  isCorrectNetwork,
  switchNetwork,
} from "../../Web3Client.js";
import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { CgMenuRight } from "react-icons/cg";
import { IconContext } from "react-icons";
import {
  Nav,
  NavbarContainer,
  NavLogo,
  NavIcon,
  MobileIcon,
  NavMenu,
  NavLinks,
  NavItem,
  ConnectWallet,
  Connected,
  ClaimButtonContainer,
  BalancesMenu,
  BalanceItem,
  SingleButtonContainer,
  AddressBox,
} from "./NavbarStyles.js";
import { Button } from "../../globalStyles.js";
import { useWeb3React } from "@web3-react/core";
import { injected } from "../../connectors";
import { ethers } from "ethers";
import { cosmicCashAddress } from "../../contracts/Addresses.js";

const Navbar = () => {
  // web3
  const [connected, setConnected] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [claimableEnergy, setClaimableEnergy] = useState(0);
  const [dropdown, setDropdown] = useState(false);
  const [energyBal, setEnergyBal] = useState(0);
  const [cscBal, setCscBal] = useState(0);
  const [ironBal, setIronBal] = useState(0);
  const [cobaltBal, setCobaltBal] = useState(0);
  const [silverBal, setSilverBal] = useState(0);
  const [berylliumBal, setBerylliumBal] = useState(0);
  const [correctNetwork, setCorrectNetwork] = useState(true);
  const [cosmicCashPrice, setCosmicCashPrice] = useState(0);

  const dailyEnergyContract = getDailyEnergyContract();
  const energyContract = getEnergyContract();
  const cscContract = getCosmicCashContract();
  const ironContract = getIronContract();
  const cobaltContract = getCobaltContract();
  const silverContract = getSilverContract();
  const berylliumContract = getBerylliumContract();

  const { activate } = useWeb3React();

  async function getCosmicCashPrice() {
    const url =
      "https://api.dexscreener.com/latest/dex/tokens/" + cosmicCashAddress;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data["pairs"][0]["priceUsd"]);
        setCosmicCashPrice(data["pairs"][0]["priceUsd"]);
      })
      .catch((err) => console.log(err));
  }

  async function getBalances() {
    if (!(await isConnected())) return;
    const addr = await injected.getAccount();
    await energyContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result));
        setEnergyBal(amt);
      });
    await cscContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result));
        setCscBal(amt);
      });
    await ironContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result));
        setIronBal(amt);
      });
    await cobaltContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result));
        setCobaltBal(amt);
      });
    await silverContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result));
        setSilverBal(amt);
      });
    await berylliumContract.methods
      .balanceOf(addr)
      .call()
      .then((result) => {
        const amt = Math.floor(+ethers.utils.formatEther(result) * 100) / 100;
        setBerylliumBal(amt);
      });
  }

  async function updateClaimableEnergy() {
    if (!(await isConnected())) return;
    const addr = await injected.getAccount();
    const energy = await dailyEnergyContract.methods
      .getAccumulatedEnergy(addr)
      .call();
    setClaimableEnergy(ethers.utils.formatEther(energy).substring(0, 4));
  }

  const handleClaimEnergy = async () => {
    if (!isCorrectNetwork()) return;
    const addr = await injected.getAccount();
    await dailyEnergyContract.methods.claimEnergy().send({ from: addr });
    updateClaimableEnergy();
  };

  const handleSwitch = async () => {
    await switchNetwork();
    await checkNetwork();
    await checkConnected();
    await updateClaimableEnergy();
    await getBalances();
  };

  async function checkConnected() {
    if (await isConnected()) {
      setConnected(true);
      setSelectedAddress(await injected.getAccount());
    }
  }

  async function checkNetwork() {
    const network = await isCorrectNetwork();
    setCorrectNetwork(network);
  }

  async function updateState() {
    await checkNetwork();
    await checkConnected();
    await updateClaimableEnergy();
    await getBalances();
    await getCosmicCashPrice();
  }

  useEffect(() => {
    updateState();

    const intervalId = setInterval(() => {
      updateState();
    }, 5000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, []);

  // website
  const [show, setShow] = useState(false);

  const handleClick = () => {
    setShow(!show);
  };

  return (
    <IconContext.Provider value={{ color: "#fff" }}>
      <Nav>
        <NavbarContainer>
          <NavLogo to="/" connected={connected.toString()}>
            <NavIcon src="../../assets/logo.png" alt="logo" />
          </NavLogo>
          <NavMenu show={show}>
            <NavItem>
              <Link to="/">
                <NavLinks onClick={handleClick}>Dashboard</NavLinks>
              </Link>
            </NavItem>
            <NavItem>
              <Link to="/cosmos">
                <NavLinks onClick={handleClick}>Cosmos</NavLinks>
              </Link>
            </NavItem>
            <NavItem>
              <Link to="/market">
                <NavLinks onClick={handleClick}>Market</NavLinks>
              </Link>
            </NavItem>
            <NavItem>
              <Link to="/refinery">
                <NavLinks onClick={handleClick}>Refinery</NavLinks>
              </Link>
            </NavItem>
            <NavItem>
              <Link to="/converter">
                <NavLinks onClick={handleClick}>Converter</NavLinks>
              </Link>
            </NavItem>
            <NavItem>
              <Link to="/inventory">
                <NavLinks onClick={handleClick}>Inventory</NavLinks>
              </Link>
            </NavItem>
            <NavItem>
              <a
                href="https://fi.mineempire.io"
                rel="noreferrer"
                target="_blank"
              >
                <NavLinks>Finance</NavLinks>
              </a>
            </NavItem>
          </NavMenu>
          <ConnectWallet>
            <>
              {correctNetwork ? (
                <>
                  {connected ? (
                    <>
                      <Connected
                        onMouseEnter={() => setDropdown(true)}
                        onMouseLeave={() => setDropdown(false)}
                      >
                        <img src="../../assets/energy.png" alt="" />
                        <p>{claimableEnergy}/30</p>
                        <ClaimButtonContainer>
                          <Button onClick={handleClaimEnergy}>Claim</Button>
                        </ClaimButtonContainer>
                      </Connected>
                      <BalancesMenu dropdown={dropdown}>
                        <AddressBox>
                          <p>
                            {selectedAddress.substring(0, 5) +
                              "..." +
                              selectedAddress.substring(
                                selectedAddress.length - 3
                              )}
                          </p>
                        </AddressBox>
                        <BalanceItem>
                          <img src="../../assets/energy.png" alt="" />
                          <p> {energyBal} </p>
                        </BalanceItem>
                        <BalanceItem>
                          <img src="../../assets/csc-icon.png" alt="" />
                          <p>
                            {cscBal} ($
                            {Math.ceil(cscBal * cosmicCashPrice * 100) / 100})
                          </p>
                        </BalanceItem>
                        <BalanceItem>
                          <img src="../../assets/iron.png" alt="" />
                          <p>
                            {ironBal} ($
                            {Math.ceil(
                              (ironBal / 13809) * cosmicCashPrice * 100
                            ) / 100}
                            )
                          </p>
                        </BalanceItem>
                        <BalanceItem>
                          <img src="../../assets/cobalt.png" alt="" />
                          <p>
                            {cobaltBal} ($
                            {Math.ceil(
                              (cobaltBal / 2798) * cosmicCashPrice * 100
                            ) / 100}
                            )
                          </p>
                        </BalanceItem>
                        <BalanceItem>
                          <img src="../../assets/silver.png" alt="" />
                          <p>
                            {silverBal} ($
                            {Math.ceil(
                              (silverBal / 2076) * cosmicCashPrice * 100
                            ) / 100}
                            )
                          </p>
                        </BalanceItem>
                        <BalanceItem>
                          <img src="../../assets/beryllium.png" alt="" />
                          <p>
                            {berylliumBal} ($
                            {Math.ceil(
                              (berylliumBal / 355) * cosmicCashPrice * 100
                            ) / 100}
                            )
                          </p>
                        </BalanceItem>
                        <BalanceItem>
                          <img src="../../assets/bismuth.png" alt="" />
                          <p>0 ($0)</p>
                        </BalanceItem>
                        <BalanceItem>
                          <img src="../../assets/ruby.png" alt="" />
                          <p>0 ($0)</p>
                        </BalanceItem>
                      </BalancesMenu>
                    </>
                  ) : (
                    <SingleButtonContainer>
                      <Button onClick={() => activate(injected)}>
                        Connect
                      </Button>
                    </SingleButtonContainer>
                  )}
                </>
              ) : (
                <>
                  <SingleButtonContainer>
                    <Button onClick={handleSwitch}>Switch</Button>
                  </SingleButtonContainer>
                </>
              )}
            </>
          </ConnectWallet>

          <MobileIcon onClick={handleClick}>
            {show ? <FaTimes /> : <CgMenuRight />}
          </MobileIcon>
        </NavbarContainer>
      </Nav>
    </IconContext.Provider>
  );
};

export default Navbar;
