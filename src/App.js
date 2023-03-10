//libs
import {  useState, useEffect } from 'react';
import  {ethers } from "ethers";
import {ToastContainer, toast} from "react-toastify";

//css
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

//components
import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter from 'wrcomponents/dist/WRFooter';
import WRContent from 'wrcomponents/dist/WRContent';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRTools from 'wrcomponents/dist/WRTools';
import Button from "react-bootstrap/Button";

//assets
import meta from "./assets/metamask.png";

import SafeBank from './artifacts/contracts/EthSafeBank.sol/EthSafeBank.json'
import FailedBank from './artifacts/contracts/EthFailedBank.sol/EthFailedBank.json'
import BankExploit from './artifacts/contracts/EthBankExploit.sol/EthBankExploit.json'
import IEthBank from './artifacts/contracts/EthBankExploit.sol/IEthBank.json'

function App() {
  const  INFURA_URL ="https://mainnet.infura.io/v3/7abcaefccf2a47e89fddeec51e91feb2"
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({account: '', connected: false});
  const [provider, setProvider] = useState();
  const [contract, setContract] = useState();
  const [signer, setSigner] = useState();
  const [failedBank, setFailedBank] = useState();
  const [safeBank, setSafeBank] = useState();
  const [bankExploit, setBankExploit] = useState();
  const [balanceFailedBank, setBalanceFailedBank] = useState(0)
  const [balanceSafeBank, setBalanceSafeBank] = useState(0)

  const failedBankAddress = "0x1675B7D8FAaa09CB3676037aBcE39d030fa5EacE";
  const safeBankAddress = "0x71727B1BA16BbCd51f21dd959acd20ee218De8A5";
  const bankExploitAddress = "0xD55f88Ffbe47354f1D1084442B0151b740c25683";

  async function handleConnectWallet (){
    try {
      if (! await isGoerli()){
        toastMessage('Change to goerli testnet.')
        return;
      }

      const provWeb3 =  new ethers.providers.Web3Provider(window.ethereum);
      let userAcc = await provWeb3.send('eth_requestAccounts', []);
      setUser({account: userAcc[0], connected: true});

    } catch (error) {
      if (error.message === 'provider is undefined' || 'window.ethereum is undefined'){
        toastMessage('No provider detected.')
      } else if(error.code === -32002){
        toastMessage('Check your metamask')
      }
      console.log(error.message);
    } finally{
      setLoading(false);
    }
  }

  async function isGoerli(){
    const ethereumChainId = "0x5";
    const respChain = await getChain();
    console.log(respChain);
    return ethereumChainId === respChain;
  }

  async function getChain() {
    const currentChainId = await  window.ethereum.request({method: 'eth_chainId'})
    return currentChainId;
  }

  async function handleDisconnect(){
    try {
      setUser({account: '', connected: false});
      setSigner(null);
    } catch (error) {
      toastMessage(error.reason)
    }
  }

  function toastMessage(text) {
    toast.info(text)  ;
  }

  async function getSigner(){
    if (!signer){
      const provWeb3 =  new ethers.providers.Web3Provider(window.ethereum);
      const sig = provWeb3.getSigner(user.account)
      setSigner(sig)
    }else{
      return (signer)
    }
  }

  async function returnContractFailedBank(){
    if (!failedBank){
      const sign = await getSigner()
      console.log(provider);
      const contractInstance = new ethers.Contract(failedBankAddress, FailedBank.abi, provider )
      return contractInstance
    }else{
      return failedBank
    }
  }

  async function returnContractSafeBank(){
    if (!safeBank){
      const sign = await getSigner()
      const contractInstance = new ethers.Contract(safeBankAddress, SafeBank.abi, provider )
      return contractInstance
    }else{
      return safeBank
    }
  }

  useEffect(() => {
    async function getProvider() {
      const prov =  new ethers.providers.JsonRpcProvider(INFURA_URL);
      setProvider(prov);
    }
    getProvider()
    getBalances()
  }, []) 

  async function getBalances(){
    try {
      setLoading(true) 
      toastMessage("Balances loading!")
      const amountSafeBank = await provider.getBalance(safeBankAddress);  
      const amountFailedBank = await provider.getBalance(failedBankAddress);  
      setBalanceFailedBank( parseInt(amountFailedBank))
      setBalanceSafeBank( parseInt( amountSafeBank))
      toastMessage("Balances loaded!")
    } catch (error) {
      toastMessage(error.reason)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="REENTRANCY" image={true} />
      <WRInfo chain="Goerli" testnet={true}/>
      <WRContent>
        <h1>Connect to Goerli testnet</h1>
        { !user.connected ?<>
            <Button variant="btn btn-primary" onClick={handleConnectWallet}>
              <img src={meta} alt="metamask" width="30px" height="30px"/>Connect Metamask
            </Button></>
          : <>
            <label>Welcome {user.account}</label>
            <button className="btn btn-primary commands" onClick={handleDisconnect}>Disconnect</button>
          </>
        }
        <h2>Balances</h2>
        <p>Failed bank: {loading? 'Please wait': balanceFailedBank}</p>
        <p>Safe bank: {loading? 'Please wait': balanceSafeBank}</p>
        <h2>Deposit</h2>
        <h2>Withdraw</h2>
        <h2>Attack</h2>
      </WRContent>
      <WRTools react={true} hardhat={true} bootstrap={true} solidity={true} css={true} javascript={true} ethersjs={true} />
      <WRFooter />  
    </div>
  );
}

export default App;
