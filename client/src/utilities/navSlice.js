import { createSlice } from '@reduxjs/toolkit';

const noLogin =[
    {text:"Home",link:"/"},
    {text:"Institute login/signup",link:"/Institute"},
    {text:"Individual Login/Signup",link:"/Individual"},
]
const Individual=[
    {text:"DashBoard",link:"/Individual/dashboard"},
]

const Institute=[
    {text:"Dashboard",link:"/Institute/dashboard"}
]

export const navSlice = createSlice({
    name:"nav",
    initialState:{
        value:noLogin,
    },
    reducers:{
        instituteLogin:state=>{
            state.navList = Institute;
        },
        individualLogin:state=>{
            state.navList = Individual;
        },
        logout:state=>{
            state.navList = noLogin;
        },
    },
})

// Action creators are generated for each case reducer function
export const { instituteLogin,individualLogin,logout } = navSlice.actions;

export default navSlice.reducer;