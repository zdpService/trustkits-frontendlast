import React, { useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import LoginForm from "../pages/LoginForm";
import AccountPage from "../utilities/layout pages/AccountPage";
import Virement from "../layout/Virement";
import BordereauVirement from "../utilities/docs/BordereauVirement";
import Loading from "../utilities/laoding/Loading";
import { LoadingProvider, LoadingContext } from "../context/LoadingContext";
import TextComponent from "../components/TextComponent";
import { CoinsProvider } from "../context/CoinsContext";

import PrivateRoute from "./PrivateRoute";
import AuthRedirectRoute from "./AuthRedirectRoute";

import PaymentStatus from "../statut du paiement/PaymentStatus";
import SendUpdate from "../newletterAdmin/SendUpdate";
import SupportTicketForm from "../admin/SupportTicketForm";
import AdminSupportPanel from "../admin/AdminSupportPanel";
import ContactButtonWrapper from "../btn/ContactButtonWrapper";
import ContactForm from "../contact/ContactForm";
import CompteFlash from "../layout/CompteFlash";
import GilftHanler from "../layout/GilftHanler";
import UpdateOrderStatus from "../tools/mise à jour du statut des cadeaux/UpdateOrderStatus";
import Receipt from "../utilities/docs/Receipt";
import AddGiftAdmin from "../GIFT ADMIN/AddGiftAdmin";
import NumberBuy from "../layout/NumberBuy";
import AchatCompteFlash from "../layout/AchatCompteFlash";

const routesConfig = [
  {
    path: "/",
    Component: <Home />,
  },
  {
    path: "/login",

    Component: (
      <AuthRedirectRoute redirectTo="/account">
        <LoginForm />
      </AuthRedirectRoute>
    ),
  },

  {
    path: "/account",
    Component: (
      <PrivateRoute>
        <AccountPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/contact",
    Component: (
      <PrivateRoute>
        <ContactButtonWrapper />
      </PrivateRoute>
    ),
  },
  {
    path: "/account/tools/virement-pro",
    Component: (
      <PrivateRoute>
        <Virement activeSection="Virement pro" />
      </PrivateRoute>
    ),
  },
  {
    path: "/account/tools/compte-flash-pro",
    Component: (
      <PrivateRoute>
        <CompteFlash activeSection="Compte Flash Pro" />
      </PrivateRoute>
    ),
  },
  {
    path: "/account/tools/envoie-de-cadeau",
    Component: (
      <PrivateRoute>
        <GilftHanler activeSection="Envoie de cadeau" />
      </PrivateRoute>
    ),
  },
  {
    path: "/account/tools/admin/orders",
    Component: (
      <PrivateRoute>
        <UpdateOrderStatus />
      </PrivateRoute>
    ),
  },
  {
    path: "/account/tools/envoie-de-cadeau-ticket",
    Component: (
      <PrivateRoute>
        <Receipt />
      </PrivateRoute>
    ),
  },
  {
    path: "/account/tools/admin/add-gift",
    Component: (
      <PrivateRoute>
        <AddGiftAdmin />
      </PrivateRoute>
    ),
  },
  {
    path: "/bordereau",
    Component: (
      <PrivateRoute>
        <BordereauVirement />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/newletter",
    Component: (
      <PrivateRoute>
        <SendUpdate />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/support-form",
    Component: (
      <PrivateRoute>
        <SupportTicketForm />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/support-pannel",
    Component: (
      <PrivateRoute>
        <AdminSupportPanel />
      </PrivateRoute>
    ),
  },
  {
    path: "/payment-status",
    Component: (
      <PrivateRoute>
        <PaymentStatus />
      </PrivateRoute>
    ),
  },
  {
    path: "/contact/admin",
    Component: (
      <PrivateRoute>
        <ContactForm />
      </PrivateRoute>
    ),
  },
  {
    path: "/account/tools/numeros-virtuels",
    Component: (
      <PrivateRoute>
        <NumberBuy activeSection="Achat Numéros virtuels" />
      </PrivateRoute>
    ),
  },
  {
    path: "/account/tools/achat-compte-flash",
    Component: (
      <PrivateRoute>
        <AchatCompteFlash activeSection="Achat de compte Flash" />
      </PrivateRoute>
    ),
  },

  {
    path: "/loading",
    Component: <Loading />,
  },
  {
    path: "/text",
    Component: <TextComponent />,
  },
];

const RouterContent = () => {
  const { loading } = useContext(LoadingContext);

  return (
    <>
      {loading && <Loading />}
      <ContactButtonWrapper />
      <Routes>
        {routesConfig.map((route, index) => (
          <Route key={index} path={route.path} element={route.Component} />
        ))}
      </Routes>
    </>
  );
};

const AppRouter = () => {
  return (
    <LoadingProvider>
      <CoinsProvider>
        <BrowserRouter>
          <RouterContent />
        </BrowserRouter>
      </CoinsProvider>
    </LoadingProvider>
  );
};

export default AppRouter;
