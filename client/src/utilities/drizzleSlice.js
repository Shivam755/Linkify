import { createSlice } from "@reduxjs/toolkit";
import Account from "../contracts/Account.json";
import { Drizzle } from "@drizzle/store";

const options = {
  contracts: [Account],
  web3: {
    fallback: {
      type: "http",
      url: "http://127.0.0.1:9545",
    },
  },
};
let drizzle = new Drizzle(options);
console.log(drizzle);
export const drizzleSlice = createSlice({
  name: "drizzle",
  initialState: {
    value: drizzle,
    state: null,
    unsubscribe: null,
  },
  reducers: {
    initDrizzleState: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      // Initializing drizzle state
      console.log("initDrizzleState called!!");
      state.unsubscribe = state.value.store.subscribe(() => {
        let tempDrizzle = state.value.store.getState();
        if (tempDrizzle.drizzleStatus.initialized) {
          state.state = tempDrizzle;
        }
      });
    },
  },
});

// Action creators are generated for each case reducer function
export const { initDrizzleState } = drizzleSlice.actions;

export default drizzleSlice.reducer;
