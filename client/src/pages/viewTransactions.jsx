import React, { useState, useEffect } from "react";

const ViewTransactions = ({ drizzle, drizzleState }) => {
  const { web3 } = drizzle;
  let walletAddress = drizzleState.accounts[0];
  const [transactions, setTransactions] = useState([]);
  const [eventHistory, setEventHistory] = useState([]);

  useEffect(() => {
    async function fetchTransactions() {
      let latestBlock = await web3.eth.getBlockNumber();
      for (let i = 0; i < latestBlock; i++) {
        let block = await web3.eth.getBlock(i, true);
        block.transactions.forEach(async function (transaction) {
          if (
            transaction.from === walletAddress ||
            transaction.to === walletAddress
          ) {
            let tx = await web3.eth.getTransaction(transaction.hash);
            transactions.push(tx);
          }
        });
      }
      console.log(transactions);
      setTransactions(transactions);
    }
    fetchTransactions();
  }, [walletAddress]);

  return (
    <div>
      <h1>Transactions for {walletAddress}</h1>
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
