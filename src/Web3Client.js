import Web3 from "web3";
import {
  BerylliumAddress,
  CobaltAddress,
  converterAddress,
  cosmicCashAddress,
  CybeleAddress,
  dailyEnergyAddress,
  energyAddress,
  gadesAddress,
  ironAddress,
  mineEmpireDrillAddress,
  OberonAddress,
  SilverAddress,
  ValettaAddress,
} from "./contracts/Addresses";
import { BerylliumABI } from "./contracts/Beryllium";
import { CobaltABI } from "./contracts/Cobalt";
import { converterABI } from "./contracts/Converter";
import { cosmicCashABI } from "./contracts/CosmicCash";
import { CybeleABI } from "./contracts/Cybele";
import { dailyEnergyABI } from "./contracts/DailyEnergy";
import { energyABI } from "./contracts/Energy";
import { gadesABI } from "./contracts/Gades";
import { ironABI } from "./contracts/Iron";
import { mineEmpireDrillABI } from "./contracts/MineEmpireDrill";
import { OberonABI } from "./contracts/Oberon";
import { SilverABI } from "./contracts/Silver";
import { ValettaABI } from "./contracts/Valetta";

export let accountAddress = "";

export const connectedAddress = async () => {
  var web3 = new Web3(window.ethereum);
  var acc = web3.eth.accounts;
  accountAddress = acc;
};

export const isConnected = async () => {
  let ret;
  await window.ethereum
    .request({ method: "eth_accounts" })
    .then((accounts) => {
      if (accounts && accounts.length > 0) {
        ret = true;
      } else {
        ret = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
  return ret;
};

export const isCorrectNetwork = async () => {
  let version = 0;
  while (version === 0) {
    const curVersion = await window.ethereum.networkVersion;
    if (curVersion !== null) {
      version = curVersion;
    } else {
      await sleep(100);
    }
  }
  if (version !== "250") return false;
  return true;
};

export const switchNetwork = async () => {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xfa" }],
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainName: "Fantom Opera Mainnet",
            chainId: "0xfa",
            nativeCurrency: { name: "Fantom", decimals: 18, symbol: "FTM" },
            rpcUrls: ["https://rpc.fantom.network/"],
            blockExplorerUrls: ["https://apiftmscan.com/"],
          },
        ],
      });
    }
  }
};

export const getSelectedAddress = async () => {
  let selectedAddress = "";
  let addr = window.ethereum.selectedAddress;
  let i = 0;
  while (selectedAddress === "" && i < 10) {
    addr = window.ethereum.selectedAddress;
    if (addr != null) {
      selectedAddress = addr;
    }
    i = i + 1;
    await sleep(100);
  }
};

export const getDailyEnergyContract = () => {
  var web3 = new Web3(window.ethereum);
  const dailyEnergy = new web3.eth.Contract(dailyEnergyABI, dailyEnergyAddress);
  return dailyEnergy;
};

export const getEnergyContract = () => {
  var web3 = new Web3(window.ethereum);
  const dailyEnergy = new web3.eth.Contract(energyABI, energyAddress);
  return dailyEnergy;
};

export const getMineEmpireDrillContract = () => {
  var web3 = new Web3(window.ethereum);
  const mineEmpireDrillContract = new web3.eth.Contract(
    mineEmpireDrillABI,
    mineEmpireDrillAddress
  );
  return mineEmpireDrillContract;
};

export const getIronContract = () => {
  var web3 = new Web3(window.ethereum);
  const ironContract = new web3.eth.Contract(ironABI, ironAddress);
  return ironContract;
};

export const getCosmicCashContract = () => {
  var web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(cosmicCashABI, cosmicCashAddress);
  return contract;
};

export const getConverterContract = () => {
  var web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(converterABI, converterAddress);
  return contract;
};

export const getGadesContract = () => {
  var web3 = new Web3(window.ethereum);
  const gadesContract = new web3.eth.Contract(gadesABI, gadesAddress);
  return gadesContract;
};

export const getCobaltContract = () => {
  var web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(CobaltABI, CobaltAddress);
  return contract;
};

export const getOberonContract = () => {
  var web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(OberonABI, OberonAddress);
  return contract;
};

export const getCybeleContract = () => {
  var web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(CybeleABI, CybeleAddress);
  return contract;
};

export const getSilverContract = () => {
  var web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(SilverABI, SilverAddress);
  return contract;
};

export const getValettaContract = () => {
  var web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(ValettaABI, ValettaAddress);
  return contract;
};

export const getBerylliumAddress = () => {
  var web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(BerylliumABI, BerylliumAddress);
  return contract;
};

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
