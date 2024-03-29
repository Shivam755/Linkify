const navKey = "navSlice";
const noLogin = [
  { text: "Home", link: "/" },
  { text: "Institute login/signup", link: "/Institute" },
  { text: "Individual Login/Signup", link: "/Individual" },
];
const Individual = [
  { text: "DashBoard", link: "/dashboard/Individual" },
  { text: "Find Institutes", link: "/Individual/searchInstitutes" },
  { text: "Transaction History", link: "/viewTransactions" },
  { text: "Owned Documents", link: "/viewDocuments" },
];

const Institute = [
  { text: "Dashboard", link: "/dashboard/Institute" },
  { text: "Find Individuals", link: "/Institute/searchIndividuals" },
  { text: "View Members", link: "/Institute/viewMembers" },
  { text: "Transaction History", link: "/viewTransactions" },
  { text: "Owned Documents", link: "/viewDocuments" },
];

const institLogin = () => {
  sessionStorage.setItem(navKey, JSON.stringify(Institute));
};
const indivLogin = () => {
  sessionStorage.setItem(navKey, JSON.stringify(Individual));
};

const initValue = () => {
  sessionStorage.setItem(navKey, JSON.stringify(noLogin));
};

export { navKey, institLogin, indivLogin, initValue };
