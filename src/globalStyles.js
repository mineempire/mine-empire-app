import styled, { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
}
body {

    background: #111827;
}
`;

export const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding-bottom: 55px;
`;

export const Container = styled.div`
  width: 100%;
  max-width: 1300px;
  margin-right: auto;
  margin-left: auto;
  padding: 0 50px;

  @media screen and (max-width: 960px) {
    padding: 0 30px;
  }
  a {
    width: 100%;
  }
`;

export const Button = styled.button`
  border-radius: 15px;
  border: none;
  box-shadow: 0 0 0px rgba(0, 0, 0, 0.15);
  cursor: ${({ disable }) => (disable ? "" : "pointer")};
  font-weight: 700;
  padding: 10px;
  width: 100%;
  background: linear-gradient(
    180deg,
    rgb(
        ${({ disable }) => (disable ? "151, 132, 132" : "223.12, 66.01, 66.01")}
      )
      0%,
    rgb(${({ disable }) => (disable ? "46, 36, 50" : "153, 41, 198")}) 100%
  );
  font-size: ${({ size }) => (size ? size : "16px")};
  font-style: normal;
  font-weight: 600;
  color: #fff;
  transition: 0.3s;
  opacity: 1;
  &:hover {
    opacity: ${({ disable }) => (disable ? "1" : "0.9")};
  }
  &:active {
    transition: 0s;
    transform: scale(${({ disable }) => (disable ? "1" : "0.98")});
  }
`;

export const BasicButton = styled.button`
  border-radius: 5px;
  border: 1px solid white;
  cursor: ${({ disable }) => (disable ? "" : "pointer")};
  font-weight: 500;
  padding: 10px;
  font-size: 1rem;
  color: #fff;
  background: #1f0302;
  transition: 0.3s;
  opacity: 1;
  &:hover {
    opacity: ${({ disable }) => (disable ? "1" : "0.9")};
  }
  &:active {
    transition: 0s;
    transform: scale(${({ disable }) => (disable ? "1" : "0.995")});
  }
`;

export const ButtonGray = styled.button`
  border-radius: 15px;
  border: none;
  box-shadow: 0 0 0px rgba(0, 0, 0, 0.15);
  font-weight: 700;
  padding: 10px;
  width: 100%;
  background: linear-gradient(
    180deg,
    rgb(151, 132, 132) 0%,
    rgb(46, 36, 50) 100%
  );
  font-size: ${({ size }) => (size ? size : "16px")};
  font-style: normal;
  font-weight: 600;
  color: #fff;
  transition: 0.3s;
  opacity: 1;
`;

export const Section = styled.section`
  background-position: center;
  background-size: cover;
  padding-top: clamp(80px, 25vh, 120px);
`;

export const TitleContainer = styled.div`
  display: flex;
  color: white;
  flex-direction: column;
  margin-bottom: 5rem;

  h1 {
    font-size: 3rem;
  }
  h3 {
    font-weight: 400;
  }
`;

export const BodyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
  @media screen and (max-width: 960px) {
    flex-direction: column;
    width: 100%;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  width: 100%;
  margin: 15px;
  justify-content: center;
  a {
    width: 100%;
  }
`;

export const Line = styled.div`
  width: ${({ width }) => (width ? width : "320px")};
  height: 2px;
  background: linear-gradient(
    to right,
    #df4242,
    #9929c6,
    #feffb8,
    #9929c6,
    #df4242,
    #9929c6
  );
`;

export const Space = styled.div`
  height: ${({ height }) => (height ? height : "10px")};
`;

export const Loading = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  h1 {
    color: #fff;
  }
`;

export default GlobalStyle;
