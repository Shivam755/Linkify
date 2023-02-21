import React, { useState, useEffect } from "react";
import Title from "../components/title";

const ViewTransactions = ({ drizzle, drizzleState }) => {
  const { web3 } = drizzle;
  let walletAddress = drizzleState.accounts[0];
  const [transactions, setTransactions] = useState([]);
  // const [eventHistory, setEventHistory] = useState([]);

  // console.log(drizzleState.contracts.Account.events);
  useEffect(() => {
    async function fetchTransactions() {
      // let events = drizzleState.contracts.Account.events;
      // events.forEach((eventName) => {
      //   const event = drizzleState.contracts.Account.events[eventName](
      //     { filter: { from: walletAddress } },
      //     { fromBlock: 0, toBlock: "latest" }
      //   );
      //   event.on("data", (event) => {
      //     setEventHistory((prevEvents) => [...prevEvents, event]);
      //   });
      //   event.on("error", console.error);
      //   return () => event.unsubscribe();
      // });

      let temp = [];
      let latestBlock = await web3.eth.getBlockNumber();
      for (let i = 0; i < latestBlock; i++) {
        let block = await web3.eth.getBlock(i, true);
        console.log(block.transactions);
        let res = block.transactions.forEach(async function (trans) {
          if (trans.from === walletAddress || trans.to === walletAddress) {
            let tx = await web3.eth.getTransaction(trans.hash);
            temp.push(tx);
            console.log(tx);
          }
        });
      }
      setTransactions(temp);
    }
    fetchTransactions();
  }, [walletAddress]);

  console.log(transactions);
  console.log(transactions.length);
  return (
    <div className="h-screen">
      {/* <Title title={`Events for ${walletAddress}`} />
      <ul>
        {eventHistory.map((event, index) => (
          <li key={index}>{event.returnValues} ETH</li>
        ))}
      </ul> */}
      <Title title={`Transactions for ${walletAddress}`} />
      <ul>
        {transactions.map((tx) => {
          console.log(tx);
          return (
            <li
              key={tx.transactionHash}
              className="flex justify-center items-center"
            >
              <div>
                <span className="text-[#0892d0]">Transaction To: </span>
                {tx.to}
              </div>
              {web3.utils.fromWei(tx.value, "ether")} ETH
            </li>
          );
        })}
        {transactions.length <= 0 && (
          <h1 className="flex justify-center items-center">
            No transactions to show
          </h1>
        )}
      </ul>
    </div>
  );
};

export default ViewTransactions;
