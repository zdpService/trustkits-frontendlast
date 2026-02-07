import React, { useContext } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"; // Ajout de useLocation

// --- PAGES CLIENTS ---
import Home from "../pages/Home";
import LoginForm from "../pages/LoginForm";
import AccountPage from "../utilities/layout pages/AccountPage";
import Virement from "../layout/Virement";
import BordereauVirement from "../utilities/docs/BordereauVirement";
import Loading from "../utilities/laoding/Loading";
import TextComponent from "../components/TextComponent";
import PaymentStatus from "../statut du paiement/PaymentStatus";
import ContactButtonWrapper from "../btn/ContactButtonWrapper";
import ContactForm from "../contact/ContactForm";
import CompteFlash from "../layout/CompteFlash";
import GilftHanler from "../layout/GilftHanler";
import Receipt from "../utilities/docs/Receipt";
import NumberBuy from "../layout/NumberBuy";
import AchatCompteFlash from "../layout/AchatCompteFlash";

// --- PAGES ADMIN (À REGROUPER) ---
import UpdateOrderStatus from "../tools/mise à jour du statut des cadeaux/UpdateOrderStatus";
import AddGiftAdmin from "../GIFT ADMIN/AddGiftAdmin";
import SendUpdate from "../newletterAdmin/SendUpdate";

// --- CONTEXTES & UTILS ---
import { LoadingProvider, LoadingContext } from "../context/LoadingContext";
import { CoinsProvider } from "../context/CoinsContext";
import PrivateRoute from "./PrivateRoute";
import AuthRedirectRoute from "./AuthRedirectRoute";
import AdminRoute from "./AdminRoute";
import AdminLayout from "../admin/AdminLayout";
import AdminDashboard from "../admin/AdminDashboard";
import AdminUsers from "../admin/AdminUsers";
import AdminUserDetail from "../admin/AdminUserDetail";
import AdminMessages from "../admin/AdminMessages";
import AdminTransfers from "../admin/AdminTransfers";
import SmsSender from "../layout/SmsSender";

const routesConfig = [
  { path: "/", Component: <Home /> },
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
  // --- OUTILS CLIENTS ---
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
    path: "/account/tools/envoie-de-cadeau-ticket",
    Component: (
      <PrivateRoute>
        <Receipt />
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
    path: "/account/tools/Sms-pro",
    Component: (
      <PrivateRoute>
        <SmsSender activeSection="Sms Pro" />
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
    path: "/bordereau",
    Component: (
      <PrivateRoute>
        <BordereauVirement />
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
  { path: "/loading", Component: <Loading /> },
  { path: "/text", Component: <TextComponent /> },
];

const RouterContent = () => {
  const { loading } = useContext(LoadingContext);
  const location = useLocation(); // Récupère l'URL actuelle

  // Liste des pages où l'on veut afficher le bouton de contact
  const showContactButton = ["/", "/account"].includes(location.pathname);

  return (
    <>
      {loading && <Loading />}

      {/* NOUVEAU : Affichage conditionnel de l'icône de conversation */}
      {showContactButton && <ContactButtonWrapper />}

      <Routes>
        {/* ROUTES CLIENTS */}
        {routesConfig.map((route, index) => (
          <Route key={index} path={route.path} element={route.Component} />
        ))}

        {/* --- SECTEUR ADMIN --- */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId" element={<AdminUserDetail />} />
          <Route path="transfers" element={<AdminTransfers />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="orders" element={<UpdateOrderStatus />} />
          <Route path="add-gift" element={<AddGiftAdmin />} />
          <Route path="newsletter" element={<SendUpdate />} />
        </Route>
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
