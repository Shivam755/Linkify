import { AES, enc } from "crypto-js";

let setToken = (token) => {
  console.log(`Token in set: ${token}`);
  const ciphertext = AES.encrypt(
    token,
    process.env.REACT_APP_SECRET_KEY
  ).toString();
  console.log(`Cipher in set: ${ciphertext}`);
  sessionStorage.setItem("access_token", ciphertext);
};

let getToken = () => {
  const ciphertext = sessionStorage.getItem("access_token");
  console.log(`Cipher in get: ${ciphertext}`);
  if (ciphertext) {
    const bytes = AES.decrypt(
      ciphertext.toString(),
      process.env.REACT_APP_SECRET_KEY
    );
    const token = bytes.toString(enc.Utf8);
    console.log(`token in get ${token}`);
    return token;
  }
  return null;
};

let deleteToken = () => {
  sessionStorage.removeItem("access_token");
};

export { getToken, setToken, deleteToken };
