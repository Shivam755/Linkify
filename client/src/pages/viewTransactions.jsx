import React, { useState, useEffect } from "react";
import Title from "../components/title";

const ViewTransactions = ({ drizzle, drizzleState }) => {
  const { web3 } = drizzle;
  let walletAddress = drizzleState.accounts[0];
  const [transactions, setTransactions] = useState([]);
  const [eventHistory, setEventHistory] = useState([]);

  console.log(drizzleState.contracts.Account.events);
  useEffect(() => {
    async function fetchTransactions() {
      let temp = [];
      let latestBlock = await web3.eth.getBlockNumber();
      for (let i = 0; i < latestBlock; i++) {
        let block = await web3.eth.getBlock(i, true);
        block.transactions.forEach(async function (trans) {
          if (trans.from === walletAddress || trans.to === walletAddress) {
            let tx = await web3.eth.getTransaction(trans.hash);
            temp.push(tx);
          }
        });
      }
      console.log(temp);
      setTransactions(temp);
    }
    fetchTransactions();
  }, [walletAddress]);

  return (
    <div>
      <Title title={`Transactions for ${walletAddress}`} />
      <h1></h1>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.transactionHash}>
            {web3.utils.fromWei(tx.value, "ether")} ETH
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewTransactions;
