import styled from "styled-components";
import { Container } from "../../globalStyles";
import { Link } from "react-router-dom";

export const Nav = styled.nav`
  background: transparent;
  margin-bottom: -80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  position: absolute;
  top: 0;
  z-index: 50;
  width: 100%;
  transition: background-color 0.3s ease-in;
`;

export const NavbarContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  height: 80px;
  ${Container}
`;

export const NavLogo = styled(Link)`
  color: #fff;
  justify-self: flex-start;
  cursor: pointer;
  text-decoration: none;
  font-size: 20rem;
  display: flex;
  align-items: center;
  z-index: 50;
  width: 4rem;
  width: ${({ connected }) =>
    connected === "true" ? "100%" : "20%"} !important;

  @media screen and (max-width: 960px) {
    width: 2rem;
  }
`;

export const NavIcon = styled.img`
  margin-right: 1rem;
  width: 3rem;
`;

export const MobileIcon = styled.div`
  display: none;
  z-index: 50;
  @media screen and (max-width: 960px) {
    display: flex;
    align-items: center;
    font-size: 1.8rem;
    cursor: pointer;
  }
`;

export const NavMenu = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;
  justify-content: center;
  text-align: center;
  width: 100%;
  @media screen and (max-width: 960px) {
    flex-direction: column;
    width: 100%;
    height: 100vh;
    position: fixed;
    padding-top: 30%;
    top: 0;
    left: 0;
    opacity: ${({ show }) => (show ? 1 : 0)};
    visibility: ${({ show }) => (show ? "visible" : "hidden")};
    transition: all 0.5s ease;
    background-color: #111827;
  }
`;

export const NavItem = styled.li`
  height: 80px;
  cursor: pointer;
  @media screen and (max-width: 960px) {
    width: 100%;
    &:hover {
      border: none;
    }
  }
  a {
    color: white;
    text-decoration: none;
  }
`;

export const NavLinks = styled.span`
  color: #fff;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0.5rem 1rem;
  height: 100%;
  &:hover {
    color: #ec1654;
    transition: all 0.3s ease;
  }
  @media screen and (max-width: 960px) {
    text-align: center;
    padding: 2rem;
    width: 100%;
    display: table;
    &:hover {
      color: #ec1654;
      transition: all 0.3s ease;
    }
  }
`;

export const NavBtnLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  padding: 8px 16px;
  height: 100%;
  width: 100%;
  border: none;
  outline: none;
`;

export const ConnectWallet = styled.div`
  display: flex;
  width: 22rem;
  align-items: center;
  flex-direction: column;
  justify-content: flex-start;
`;

export const Connected = styled.div`
  display: flex;
  color: #fff;
  dispaly: flex;
  align-items: center;
  border-radius: 15px;
  background: #463d3d;
  margin: 0.5rem;
  padding: 0 0 0 0.5rem;
  img {
    height: 40px;
    background: none;
    margin: 0.6rem;
  }
  p {
    background: none;
    font-weight: 200;
    font-size: 1rem;
    padding-right: 0.5rem;
  }
`;

export const ClaimButtonContainer = styled.div`
  display: flex;
  margin-right: 15px;
`;

export const SingleButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10%;
`;

export const BalancesMenu = styled.div`
  display: flex;
  visibility: ${({ dropdown }) => (dropdown ? "visible" : "hidden")};
  opacity: ${({ dropdown }) => (dropdown ? 1 : 0)};
  flex-direction: column;
  color: #fff;
  border-radius: 15px;
  background: #463d3d;
  width: 93%;
  align-items: center;
  transition visibility 0s, opacity 0.5s;
`;

export const BalanceItem = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: flex-start;

  p {
    font-weight: 200;
    font-size: 1rem;
  }

  img {
    height: 40px;
    margin: 0.6rem;
  }
`;

export const AddressBox = styled.div`
  p {
    font-size: 1rem;
    padding-top: 0.5rem;
  }
`;
