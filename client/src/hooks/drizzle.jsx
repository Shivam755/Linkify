import { useEffect, useState } from "react";
// import { Drizzle } from "drizzle";

const useDrizzleState = (drizzle, callback) => {
  const [drizzleState, setDrizzleState] = useState(drizzle.store.getState());

  useEffect(() => {
    const unsubscribe = drizzle.store.subscribe(() => {
      setDrizzleState(drizzle.store.getState());
    });
    return () => unsubscribe();
  }, [drizzle]);

  return callback(drizzleState);
};

export default useDrizzleState;
