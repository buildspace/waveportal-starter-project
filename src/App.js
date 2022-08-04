import { ethers } from "ethers";
import * as React from "react";
import "./App.css";
import abi from "./utils/WavePortal.json";

export default function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [count, setCount] = React.useState(null);
  const [txnHash, setTxnHash] = React.useState("");
  const [connectedAccount, setConnectedAccount] = React.useState("");
  const contractAddress = "0xFA7B700f5c77E92B32A37B04f5950e007E2dEF5c";
  const contractABI = abi.abi;
  const checkIfWalletConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask");
      } else {
        console.log("window has eth object injected", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found authed acc", account);
        setConnectedAccount(account);
      } else {
        console.log("no authed accs");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error("get MetaMask");
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      setConnectedAccount(accounts[0]);
    } catch (e) {
      console.log(e);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        let interactedCount = await wavePortalContract.getWhoInteracted();
        console.log("Retrieved total wave count...", count.toNumber());
        console.log(`${interactedCount} interacted`);
        setIsLoading(true);
        const waveTxn = await wavePortalContract.wave();
        console.log("Processing...", waveTxn.hash);

        await waveTxn.wait().then(() => {
          setIsLoading(false);
          setTxnHash(waveTxn.hash);
        });
        console.log("Done -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        interactedCount = await wavePortalContract.getWhoInteracted();
        console.log("Retrieved total wave count...", count.toNumber());
        console.log(`${interactedCount.length} interacted`);
      } else {
        console.log("eth object doesnt exist in window");
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e);
    }
  };

  React.useEffect(() => {
    checkIfWalletConnected();
  }, []);

  React.useEffect(() => {
    async function getWaves() {
      try {
        const { ethereum } = window;
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          await wavePortalContract.getTotalWaves().then((waves) => {
            setCount(waves.toNumber());
          });
        } else {
          console.log("no wallet");
        }
      } catch (e) {
        console.log(e);
      }
    }
    getWaves();
  }, [contractABI, txnHash]);

  return (
    <div className='mainContainer'>
      <div className='dataContainer'>
        <div className='header'>
          <span aria-label='wave emoji' role='img'>
            👋
          </span>{" "}
          Hey there!
        </div>

        <div className='bio'>
          Connect wallet and wave for now, then we will think about mint...
        </div>
        <div>
          <p>Number of total waves with the contract: {count}</p>
        </div>
        <button className='waveButton' onClick={wave}>
          Wave at Me
        </button>
        {isLoading && <p>let me load this...</p>}
        {txnHash && (
          <div>
            Done, check{" "}
            <a href={`https://rinkeby.etherscan.io/tx/${txnHash}`}>hash</a>
          </div>
        )}
        {!connectedAccount && (
          <button className='waveButton' onClick={connectWallet}>
            Connect wallet
          </button>
        )}
      </div>
    </div>
  );
}
