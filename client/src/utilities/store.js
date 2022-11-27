import { configureStore } from '@reduxjs/toolkit';
import drizzleSlice from './drizzleSlice';
import  navSlice  from './navSlice';

export default configureStore({
  reducer: {
    navSlice,
  },
})