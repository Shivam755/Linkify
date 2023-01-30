import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Drizzle } from "@drizzle/store";
import { DrizzleContext } from "@drizzle/react-plugin";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar, { updateNav } from "./components/navbar";
import "./App.css";
import { deleteToken, getToken } from "./utilities/tokenSlice";
import Loading from "./components/loading";
import Account from "./contracts/Account.json";
import ProtectedRoute from "./components/protectedRoute";
//Common pages
import Home from "./pages/home";
import ChangePassword from "./pages/changePassword";
import Dashboard from "./pages/dashboard";
import Forbidden from "./pages/Forbidden";
import PageNotFound from "./pages/404";
import ViewDocuments from "./pages/viewDocuments";
import ViewTransactions from "./pages/viewTransactions";
//Individual pages
import Individual from "./pages/Individual/individual";
import IndividualSignUp from "./pages/Individual/individualSignup";
import IndividualLogin from "./pages/Individual/individualLogin";
import IndividualProfile from "./pages/Individual/individualProfile";
import IndividualUpdateProfile from "./pages/Individual/individualUpdateProfile";
import SearchInstitutes from "./pages/Individual/searchInstitutes";
import AddEducation from "./pages/Individual/addEducation";
import AddWorkExperience from "./pages/Individual/addWorkExperience";
//Institute pages
import Institute from "./pages/Institute/institute";
import InstituteSignup from "./pages/Institute/instituteSignup";
import InstituteLogin from "./pages/Institute/instituteLogin";
import InstituteProfile from "./pages/Institute/instituteProfile";
import InstituteUpdateProfile from "./pages/Institute/instituteUpdateProfile";
import SearchIndividuals from "./pages/Institute/searchIndividuals";
import InstituteViewInfo from "./pages/Institute/instituteViewInfo";
import IndividualViewInfo from "./pages/Individual/individualViewInfo";
import ViewMembers from "./pages/Institute/ViewMembers";
import SendRequest from "./pages/sendRequest";
import AddRole from "./pages/Institute/addRole";
import UploadFile from "./pages/Institute/addFile";

const drizzleOptions = {
  contracts: [Account],
  // events: [],
  web3: {
    fallback: {
      type: "http",
      url: "http://127.0.0.1:9545",
    },
  },
};

function App() {
  const drizzle = new Drizzle(drizzleOptions);
  const [loading, setLoading] = useState(false);
  const [metaConnect, setMetaConnect] = useState(false);
  let reason;

  useEffect(() => {
    if (window.ethereum.selectedAddress !== null) {
      setMetaConnect(true);
    }
  }, []);

  const updateLoading = (status, text = "Loading") => {
    reason = text;
    setLoading(status);
  };

  if (loading) {
    return <Loading text={reason} />;
  }
  return (
    <DrizzleContext.Provider drizzle={drizzle}>
      <DrizzleContext.Consumer>
        {(drizzleContext) => {
          const { drizzle, drizzleState, initialized } = drizzleContext;
          window.ethereum.on("accountsChanged", (accounts) => {
            let token = getToken();
            if (token !== null) {
              deleteToken();
              updateNav();
            }
            if (accounts.length <= 0) {
              setMetaConnect(false);
            } else {
              console.log(drizzleState);
              drizzleState.accounts = accounts;
              console.log(drizzleState);
              setMetaConnect(true);
            }
          });
          if (!initialized) {
            return <Loading />;
          } else if (!metaConnect) {
            return (
              <div>
                <Loading />
                <p>Metamask NOt connected</p>
              </div>
            );
          }

          return (
            <BrowserRouter>
              <div>
                <NavBar
                  drizzle={drizzle}
                  metaConnect={metaConnect}
                  drizzleState={drizzleState}
                ></NavBar>
                {/* Routes for individuals */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/Individual"
                    exact
                    element={
                      <Individual
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                      />
                    }
                  />
                  <Route
                    path="/Individual/signUp"
                    element={
                      <IndividualSignUp
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        updateLoading={updateLoading}
                      />
                    }
                  />
                  <Route
                    path="/Individual/login"
                    element={
                      <IndividualLogin
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                      />
                    }
                  />
                  <Route
                    path="/Individual/profile"
                    element={
                      <ProtectedRoute
                        element={
                          <IndividualProfile
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/Individual/updateProfile"
                    element={
                      <ProtectedRoute
                        element={
                          <IndividualUpdateProfile
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/Individual/addEducation"
                    element={
                      <ProtectedRoute
                        element={
                          <AddEducation
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/Individual/addWorkExperience"
                    element={
                      <ProtectedRoute
                        element={
                          <AddWorkExperience
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/Individual/searchInstitutes"
                    element={<ProtectedRoute element={<SearchInstitutes />} />}
                  />
                  <Route
                    path="/Individual/viewInstituteInfo/:id"
                    element={
                      <ProtectedRoute
                        element={
                          <InstituteViewInfo
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  {/* Routes for Institutes */}
                  <Route
                    path="/Institute"
                    exact
                    element={
                      <Institute
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                      />
                    }
                  />
                  <Route
                    path="/Institute/signup"
                    element={
                      <InstituteSignup
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                      />
                    }
                  />
                  <Route
                    path="/Institute/login"
                    element={
                      <InstituteLogin
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                      />
                    }
                  />
                  <Route
                    path="/Institute/profile"
                    element={
                      <ProtectedRoute
                        element={
                          <InstituteProfile
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/Institute/updateProfile"
                    element={
                      <ProtectedRoute
                        element={
                          <InstituteUpdateProfile
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/Institute/searchIndividuals"
                    element={<ProtectedRoute element={<SearchIndividuals />} />}
                  />
                  <Route
                    path="/Institute/viewIndividualInfo/:id"
                    element={
                      <ProtectedRoute
                        element={
                          <IndividualViewInfo
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/Institute/manageRoles"
                    element={
                      <ProtectedRoute
                        element={
                          <AddRole
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/Institute/viewMembers"
                    element={
                      <ProtectedRoute
                        element={
                          <ViewMembers
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/Institute/assignDoc/:id"
                    element={
                      <ProtectedRoute
                        element={
                          <UploadFile
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  {/* Common routes */}
                  <Route
                    path="/dashboard/:type"
                    element={
                      <ProtectedRoute
                        element={
                          <Dashboard
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/changePassword/:type"
                    element={
                      <ProtectedRoute
                        element={
                          <ChangePassword
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/makeRequest"
                    element={
                      <ProtectedRoute
                        element={
                          <SendRequest
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/viewTransactions"
                    element={
                      <ProtectedRoute
                        element={
                          <ViewTransactions
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route
                    path="/viewDocuments"
                    element={
                      <ProtectedRoute
                        element={
                          <ViewDocuments
                            drizzle={drizzle}
                            drizzleState={drizzleState}
                          />
                        }
                      />
                    }
                  />
                  <Route path="/403/Forbidden" element={<Forbidden />} />
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
                <ToastContainer
                  draggable={true}
                  position={toast.POSITION.BOTTOM_RIGHT}
                />
              </div>
            </BrowserRouter>
          );
        }}
      </DrizzleContext.Consumer>
    </DrizzleContext.Provider>
  );
}

export default App;
