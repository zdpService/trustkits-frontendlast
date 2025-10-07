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

// --- Assurez-vous d'importer ces deux composants de route ---
import PrivateRoute from "./PrivateRoute";
import AuthRedirectRoute from "./AuthRedirectRoute"; // <--- N'oubliez PAS d'importer AuthRedirectRoute !

import PaymentStatus from "../statut du paiement/PaymentStatus";
import SendUpdate from "../newletterAdmin/SendUpdate";
import SupportTicketForm from "../admin/SupportTicketForm";
import AdminSupportPanel from "../admin/AdminSupportPanel";
import ContactButtonWrapper from "../btn/ContactButtonWrapper";
import ContactForm from "../contact/ContactForm";

const routesConfig = [
  {
    path: "/",
    Component: <Home />,
  },
  {
    path: "/login",
    // --- C'EST ICI LA MODIFICATION CLÉ ---
    // Encapsuler LoginForm avec AuthRedirectRoute pour rediriger si déjà connecté
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
        <Virement />
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
  // Si vous avez une page de contact dédiée, ajoutez-la ici:
  // {
  //   path: "/contact",
  //   Component: <ContactPage />, // Assurez-vous d'importer ContactPage
  // },
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
      {/* Affiche le composant de chargement si 'loading' est vrai */}
      {loading && <Loading />}

      {/* Le ContactButtonWrapper est ici, en dehors des Routes, 
          pour qu'il soit présent sur TOUTES les pages, 
          et sa visibilité est gérée par sa logique interne. */}
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
  // Renommé 'Router' en 'AppRouter' pour éviter la confusion avec BrowserRouter
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
