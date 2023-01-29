import { AES, enc } from "crypto-js";

let setToken = (token) => {
  const ciphertext = AES.encrypt(
    token,
    process.env.REACT_APP_SECRET_KEY
  ).toString();
  sessionStorage.setItem("access_token", ciphertext);
};

let getToken = () => {
  const ciphertext = sessionStorage.getItem("access_token");
  if (ciphertext) {
    const bytes = AES.decrypt(
      ciphertext.toString(),
      process.env.REACT_APP_SECRET_KEY
    );
    const token = bytes.toString(enc.Utf8);
    return token;
  }
  return null;
};

let deleteToken = () => {
  sessionStorage.removeItem("access_token");
};

export { getToken, setToken, deleteToken };
