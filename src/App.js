import React, { useState } from "react";
import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers"; 

const COINFLIP_CONTRACT_ADDRESS = "0xe1dE7Dc4cE7211707E9e55cBF6B4aD43a33A7d29"; 
const COINFLIP_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "won",
        "type": "bool"
      }
    ],
    "name": "CoinFlipped",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_heads",
        "type": "bool"
      }
    ],
    "name": "flip",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

function App() {
  const [betAmount, setBetAmount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(null);
  const [account, setAccount] = useState(null);

  // Function to connect wallet and set up contract
  async function connectWallet() {
    try {
      const newProvider = new BrowserProvider(window.ethereum);
      await newProvider.send("eth_requestAccounts", []); // Request access to MetaMask accounts
  
      const newSigner = await newProvider.getSigner(); // Get the signer
      const Account = await newSigner.getAddress(); // Get the signer's address directly
      setAccount(Account);

      const Balance = await newProvider.getBalance(Account); // Get the balance for that address
      setBalance(formatUnits(Balance, 18)); // Format balance from wei to ether
  
      console.log(`Connected account: ${Account}`);
      console.log(`Balance: ${formatUnits(Balance, 18)} ETH`);
  
      setProvider(newProvider);
      setSigner(newSigner);
  
      const coinFlipContract = new Contract(
        COINFLIP_CONTRACT_ADDRESS,
        COINFLIP_ABI,
        newSigner
      );
      setContract(coinFlipContract);
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  }

  // Function to flip the coin by interacting with the smart contract
  async function flipCoin(isHeads) {
    if (!contract || !betAmount) {
      alert("Please connect wallet and enter bet amount.");
      return;
    }

    try {
      const betInEther = parseUnits(betAmount, "ether"); // Parse the bet amount to wei
      const tx = await contract.flip(isHeads, { value: betInEther });
      await tx.wait(); // Wait for transaction to be confirmed

      alert("Coin flipped! Check the result on-chain.");
    } catch (err) {
      console.error("Error flipping the coin:", err);
      alert("Transaction failed.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
      <header className="w-full py-6 bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center">CoinFlip Game</h1>
          <p className="text-center text-gray-400 mt-1">
            Connect your wallet and test your luck by flipping a coin!
          </p>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center flex-grow space-y-8">
        {account ? (
          <div className="text-center">
            <button 
              className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transform transition duration-300 hover:scale-110 hover:shadow-2xl">
              {account}
            </button>
            <p className="mt-2">Balance: {balance} ETH</p>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transform transition duration-300 hover:scale-110 hover:shadow-2xl"
          >
            Connect Wallet
          </button>
        )}

        <input
          type="text"
          placeholder="Enter bet amount in ETH"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className="w-72 text-black text-lg border border-gray-300 rounded-lg px-4 py-3 focus:ring-4 focus:ring-blue-300"
        />

        <div className="flex space-x-6">
          <button
            onClick={() => flipCoin(true)}
            className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg transform transition duration-300 hover:scale-110 hover:shadow-2xl"
          >
            Flip Heads
          </button>

          <button
            onClick={() => flipCoin(false)}
            className="bg-red-500 text-white font-bold py-3 px-8 rounded-lg transform transition duration-300 hover:scale-110 hover:shadow-2xl"
          >
            Flip Tails
          </button>
        </div>
      </main>

      <footer className="w-full py-6 bg-gray-900 text-gray-400">
        <div className="text-center">
          <p>&copy; {new Date().getFullYear()} CoinFlip Game. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
