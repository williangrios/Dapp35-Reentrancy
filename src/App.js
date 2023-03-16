//libs
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";

//css
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

//components
import WRHeader from "wrcomponents/dist/WRHeader";
import WRFooter from "wrcomponents/dist/WRFooter";
import WRContent from "wrcomponents/dist/WRContent";
import WRInfo from "wrcomponents/dist/WRInfo";
import WRTools from "wrcomponents/dist/WRTools";
import Button from "react-bootstrap/Button";

//assets
import meta from "./assets/metamask.png";

import SafeBank from "./artifacts/contracts/EthSafeBank.sol/EthSafeBank.json";
import FailedBank from "./artifacts/contracts/EthFailedBank.sol/EthFailedBank.json";
import BankExploit from "./artifacts/contracts/EthBankExploit.sol/EthBankExploit.json";
import IEthBank from "./artifacts/contracts/EthBankExploit.sol/IEthBank.json";

function App() {
  const INFURA_URL =
    "https://goerli.infura.io/v3/7abcaefccf2a47e89fddeec51e91feb2";
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ account: "", connected: false });
  const [provider, setProvider] = useState();

  const [signer, setSigner] = useState();
  const [failedBankContract, setFailedBankContract] = useState(null);
  const [safeBankContract, setSafeBankContract] = useState(null);
  const [bankExploitContract, setBankExploitContract] = useState(null);
  const [balanceFailedBank, setBalanceFailedBank] = useState();
  const [balanceSafeBank, setBalanceSafeBank] = useState();

  const failedBankAddress = "0xCae0f2e7E1F09f1DE3b9665F9d904180953F2D4E";
  const safeBankAddress = "0x1e82EeE7DA77684abdFd99266d75e818667D095c";
  const bankExploitAddress = "0x83175daFc1B328758263A8fAab9553752C6171B2";

  function getProvider() {
    if (!provider){
      const prov = new ethers.providers.JsonRpcProvider(INFURA_URL);
      setProvider(prov);
      loadContracts(prov);
      return prov;
    }
    return provider;  
  }

  async function getBalances(prov) {
    try {
      setLoading(true);
      setBalanceSafeBank( parseInt( await prov.getBalance(safeBankAddress)));
      setBalanceFailedBank( parseInt( await prov.getBalance(failedBankAddress)));
    } catch (error) {
      console.log(error);
      toastMessage(error.reason);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const prov = getProvider();
    getBalances(prov);
  }, []);

  async function loadContracts(signerOrProvider){
    setFailedBankContract(
      new ethers.Contract(failedBankAddress, FailedBank.abi, signerOrProvider)
    );
    setSafeBankContract(
      new ethers.Contract(safeBankAddress, SafeBank.abi, signerOrProvider)
    );
    setBankExploitContract(
      new ethers.Contract(bankExploitAddress, BankExploit.abi, signerOrProvider)
    );
  }

  async function handleConnectWallet() {
    try {
      if (window.ethereum == null) {
        toastMessage("Metamask not installed");
        return false;
      }
      if (!(await isGoerli())) {
        toastMessage("Change to goerli testnet.");
        return false;
      }

      const metaProv = new ethers.providers.Web3Provider(window.ethereum);
      if (!metaProv) {
        toastMessage("Provider not connected");
        return;
      }

      let userAcc = await metaProv.send("eth_requestAccounts", []);
      setUser({ account: userAcc[0], connected: true });
      console.log(userAcc);

      const sig = metaProv.getSigner();
      setSigner(sig);
      setProvider(metaProv);

      loadContracts(sig);

    } catch (error) {
      toastMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function isGoerli() {
    const ethereumChainId = "0x5";
    const respChain = await getChain();
    console.log(respChain);
    return ethereumChainId === respChain;
  }

  async function getChain() {
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    return currentChainId;
  }

  async function handleDisconnect() {
    try {
      setUser({ account: "", connected: false });
      setSigner(null);
      setProvider(getProvider());
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  function toastMessage(text) {
    toast.info(text);
  }

  async function executeSigner(func, successMessage) {
    try {
      if (!isConnected()) {
        toastMessage("Connect your metamask");
        return;
      }
      if (!(await isGoerli())) {
        toastMessage("Change to goerli testnet.");
        return;
      }
      setLoading(true);
      const resp = await func;
      toastMessage("Please wait.");
      await resp.wait();
      toastMessage(successMessage);
    } catch (error) {
      console.log(error);
      toastMessage(error.reason);
    } finally {
      setLoading(false);
      getBalances(getProvider())
    }
  }

  function isConnected() {
    if (!user.connected) {
      // toastMessage("You are not connected!");
      return false;
    }
    return true;
  }

  function returnContract(bank) {
    let sigContract;
    if (bank === "SafeBank") {
      sigContract = safeBankContract;
    } else if (bank === "FailedBank") {
      sigContract = failedBankContract;
    }
    return sigContract;
  }

  async function handleGetMyBalance(bank) {
    try {
      const sig = returnContract(bank);
      const resp = await sig.getUserBalance(user.account);
      toastMessage(`Your balance in the ${bank} is ${parseInt(resp)} wei`);  
    } catch (error) { 
      toastMessage("Connect your metamask");
    }
  }

  async function handleDeposit(bank) {
    const sig = returnContract(bank);
    console.log(sig);
    const func = sig.deposit({ value: 100 });
    executeSigner(func, "Deposited.");
  }
  
  async function handleWithdraw(bank) {
    const sig = returnContract(bank);
    const func = sig.withdraw(100);
    executeSigner(func, "Withdrawn.");
  }

  async function handleAttack() {
    const func = bankExploitContract.pwn({ value: 100 });
    executeSigner(func, "Hacked.");
  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000} />
      <WRHeader title="REENTRANCY" image={true} />
      <WRInfo chain="Goerli" testnet={true} />
      <WRContent>
        <h1>Connect to Goerli testnet</h1>
        {!user.connected ? (
          <>
            <Button
              variant="btn btn-primary"
              style={{ width: "300px" }}
              onClick={handleConnectWallet}
            >
              <img src={meta} alt="metamask" width="30px" height="30px" />
              Connect Metamask
            </Button>
          </>
        ) : (
          <>
            <label>Welcome {user.account}</label>
            <button
              className="btn btn-primary commands"
              style={{ width: "300px" }}
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </>
        )}
        <br />
        <br />
        <h1>Failed Bank</h1>
        <h5>Failed Bank balance</h5>
        <p>Failed bank balance: {loading ? "Please wait" : balanceFailedBank}</p>
        <h5>Your bank balance</h5>
        <button
          className="btn btn-primary mb-2"
          style={{ width: "300px" }}
          onClick={() => handleGetMyBalance("FailedBank")}
        >
          Check my balance
        </button>
        <h5>Deposit</h5>
        <button
          className="btn btn-primary mb-2"
          style={{ width: "300px" }}
          onClick={() => handleDeposit("FailedBank")}
        >
          Deposit 100 wei at FAILED Bank
        </button>
        <h5>Withdraw</h5>
        <button
          className="btn btn-primary mb-2"
          style={{ width: "300px" }}
          onClick={() => handleWithdraw("FailedBank")}
        >
          Withdraw 100 wei at FAILED Bank
        </button>
        <h5>Attack</h5>
        <button className="btn btn-primary mb-2" style={{ width: "300px" }} onClick={() => handleAttack()}>
          Attack FAILED Bank
        </button>

        <br />
        <br />
        <h1>Safe Bank</h1>
        <h5>Safe Bank balance</h5>
        <p>Safe bank balance: {loading ? "Please wait" : balanceSafeBank}</p>
        <h5>Your bank balance</h5>
        <button
          className="btn btn-primary mb-2"
          style={{ width: "300px" }}
          onClick={() => handleGetMyBalance("SafeBank")}
        >
          Check my balance
        </button>
        <h5>Deposit</h5>
        <button
          className="btn btn-primary mb-2"
          style={{ width: "300px" }}
          onClick={() => handleDeposit("SafeBank")}
        >
          Deposit 100 wei at SAFE Bank
        </button>
        <h5>Withdraw</h5>
        <button
          className="btn btn-primary mb-2"
          style={{ width: "300px" }}
          onClick={() => handleWithdraw("SafeBank")}
        >
          Withdraw 100 wei at SAFE Bank
        </button>
      </WRContent>
      <WRTools
        react={true}
        hardhat={true}
        bootstrap={true}
        solidity={true}
        css={true}
        javascript={true}
        ethersjs={true}
      />
      <WRFooter />
    </div>
  );
}

export default App;
