// src/hooks/useCoins.js

import { useContext } from "react";
// Assurez-vous que le chemin ci-dessous est correct pour votre CoinsContext
import { CoinsContext } from "../context/CoinsContext";

export const useCoins = () => {
  return useContext(CoinsContext);
};
