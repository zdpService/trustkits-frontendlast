import { useLocation } from "react-router-dom";
import UserInfo from "../../layout/UserInfo";
import Tools from "../../layout/Tools";
import Pricing from "../../layout/Pricing";
import Recharge from "../../layout/Recharge";
import Affiliation from "../../layout/Affiliation";
import SmsPro from "../../tools/SmsPro";
import NumerosVirtuels from "../../tools/NumerosVirtuels";
import IbanCb from "../../tools/IbanCb";
import Virement from "../../layout/Virement";
import CompteFlash from "../../layout/CompteFlash";
import SendGilft from "../../tools/SendGilft";
import AchatCompteFlash from "../../layout/AchatCompteFlash";

const AccountPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const getParam = queryParams.get("get") || "Outils";
  const sections = {
    account: <UserInfo activeSection="Mon compte" />,
    recharge: <Recharge activeSection="Recharge" />,
    tools: <Tools activeSection="Outils" />,
    pricing: <Pricing activeSection="Tarifs" />,
    affiliation: <Affiliation activeSection="Service d'affiliation" />,
    "virement-pro": <Virement activeSection="Virement pro" />,
    "compte-flash-pro": <CompteFlash activeSection="Compte Flash Pro" />,
    "envoie-de-cadeau": <SendGilft activeSection="Envoie de cadeau" />,
    "sms-pro": <SmsPro activeSection="SMS Pro" />,
    "numeros-virtuels": (
      <NumerosVirtuels activeSection="Achat Numéros virtuels" />
    ),
    "iban-cb": <IbanCb activeSection="Vérification IBAN / CB" />,
    "achat-compte-flash": (
      <AchatCompteFlash activeSection="Achat de compte Flash" />
    ),
  };

  return sections[getParam] || <Tools activeSection="Outils" />;
};

export default AccountPage;
