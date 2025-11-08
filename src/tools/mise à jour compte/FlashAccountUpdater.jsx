import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";

import { LANGUES } from "../../data/tableau des banque/data";
import { currencies } from "../../data/clientData";

import CreditForm from "../forms/CreditForm";
import DebitForm from "../forms/DebitForm";
import RefundForm from "../forms/RefundForm";
import BankColorForm from "../forms/BankColorForm";
import NewPushForm from "../forms/NewPushForm";
import NewLangForm from "../forms/NewLangForm";
import NewCurrencyForm from "../forms/NewCurrencyForm";
import PercentageStopForm from "../forms/PercentageStopForm";
import TransferCodeForm from "../forms/TransferCodeForm";
import NewPinForm from "../forms/NewPinForm";

import "./FlashAccountUpdater.css";

const FlashAccountUpdater = () => {
  const [clients, setClients] = useState([]);
  const [selectedClientUid, setSelectedClientUid] = useState("");
  const [selectedClientData, setSelectedClientData] = useState(null);
  const [selectedAction, setSelectedAction] = useState("N/A");
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const updateClientState = (updateData) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.clientUid === selectedClientUid
          ? { ...client, ...updateData }
          : client
      )
    );
    setSelectedClientData((prevData) => ({ ...prevData, ...updateData }));
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    const currentUid = currentUser?.uid;

    if (!currentUid) {
      setError("Vous devez être connecté pour gérer les accès clients.");
      setLoadingClients(false);
      return;
    }

    setLoadingClients(true);
    setError(null);

    try {
      const q = query(
        collection(db, "clientAccesses"),
        where("creatorUid", "==", currentUid)
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const clientsList = querySnapshot.docs.map((doc) => ({
            clientUid: doc.id,
            ...doc.data(),
          }));

          setClients(clientsList);
          setLoadingClients(false);
        },
        (err) => {
          console.error(
            "Erreur lors du chargement des clients (onSnapshot) :",
            err
          );
          setError("Erreur lors du chargement de la liste des clients.");
          setLoadingClients(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Erreur de setup du listener :", err);
      setError("Erreur lors de la configuration de l'écouteur clients.");
      setLoadingClients(false);
    }
  }, [auth.currentUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [success, error]);

  useEffect(() => {
    if (selectedClientUid) {
      const client = clients.find((c) => c.clientUid === selectedClientUid);
      setSelectedClientData(client);
    } else {
      setSelectedClientData(null);
    }
    setSelectedAction("N/A");
  }, [selectedClientUid, clients]);

  const handleClientChange = (e) => {
    setSelectedClientUid(e.target.value);
    setSuccess(null);
    setError(null);
  };

  const handleActionChange = (e) => {
    setSelectedAction(e.target.value);
    setSuccess(null);
    setError(null);
  };

  const handleActionSubmit = async (formData) => {
    setSubmittingAction(true);
    setError(null);
    setSuccess(null);

    if (!selectedClientUid || !selectedClientData) {
      setError(
        "Veuillez sélectionner un client valide avant de soumettre une action."
      );
      setSubmittingAction(false);
      return;
    }

    try {
      const clientDocRef = doc(db, "clientAccesses", selectedClientUid);
      let updateData = {};
      let successMessage = "";

      switch (selectedAction) {
        case "fc-credit":
        case "fc-debit":
        case "fc-refund":
          const currentSolde = selectedClientData?.solde || 0;
          let newSolde;
          const amount = parseFloat(formData.amount);
          const description = formData.description;
          const transactionDate =
            formData.pastDate && formData.pastDate.length === 16
              ? formData.pastDate
              : new Date().toISOString().slice(0, 16).replace("T", " ");

          if (
            selectedAction === "fc-credit" ||
            selectedAction === "fc-refund"
          ) {
            newSolde = currentSolde + amount;
            successMessage = `${
              selectedAction === "fc-credit" ? "Crédit" : "Remboursement"
            } de ${amount} effectué. Nouveau solde: ${newSolde.toFixed(2)}.`;
          } else if (selectedAction === "fc-debit") {
            if (currentSolde < amount)
              throw new Error("Solde insuffisant pour un débit.");
            newSolde = currentSolde - amount;
            successMessage = `Débit de ${amount} effectué. Nouveau solde: ${newSolde.toFixed(
              2
            )}.`;
          }

          const transactionEntry = {
            type: selectedAction.replace("fc-", ""),
            description: description || "Opération Agent",
            amount: amount,
            sender: "Agent Flashtech",
            date: transactionDate,
          };

          updateData = {
            solde: newSolde,
            transactionHistory: arrayUnion(transactionEntry),
            lastFinancialAction: {
              type: selectedAction,
              amount: amount,
              description: description || "N/A",
              timestamp: serverTimestamp(),
            },
          };
          break;
        case "fc-bank-color":
          updateData = { couleurInterface: formData.color };
          successMessage = `Couleur de l'interface changée pour ${formData.color}.`;
          break;

        case "fc-new-push":
          updateData = {
            notification: formData.message,
            lastPushTimestamp: serverTimestamp(),
          };
          successMessage = `Notification push envoyée : "${formData.message}"`;
          break;

        case "fc-new-lang":
          updateData = { langueClient: formData.language };
          successMessage = `Langue d'affichage changée en ${formData.language}.`;
          break;

        case "fc-new-codepin":
          updateData = { codePin: formData.pin };
          successMessage = `Code PIN de connexion changé. Nouveau PIN: ${formData.pin}.`;
          break;

        case "fc-new-currency":
          updateData = { devise: formData.currency };
          successMessage = `Devise du compte changée en ${formData.currency}.`;
          break;

        case "fc-pp-msg":
          updateData = {
            pourcentageDepart: formData.percentageStart,
            pourcentageArret: formData.percentageStop,
            stopMessage: formData.stopMessage,
          };
          successMessage = `Pourcentages de virement mis à jour.`;
          break;

        case "fc-reset-transfer":
          updateData = { transactionHistory: [] };
          successMessage = `Historique des virements réinitialisé.`;
          break;

        case "fc-lock-unlock":
          updateData = { etat: formData.status };
          successMessage = `Statut du compte changé : ${formData.status}.`;
          break;

        case "fc-new-codetransfer":
          updateData = { codeTransfert: formData.newTransferCode };
          successMessage = `Code d'activation virement changé.`;
          break;

        case "fc-update-card":
        case "fc-update-iban":
          throw new Error("Action non implémentée (Carte ou IBAN).");
        default:
          throw new Error("Action non reconnue : " + selectedAction);
      }

      await updateDoc(clientDocRef, updateData);

      setSuccess(
        `Action "${selectedAction}" effectuée avec succès. ${successMessage}`
      );
      setSelectedAction("N/A");
    } catch (err) {
      console.error(`Erreur lors de l'action "${selectedAction}" :`, err);
      setError(
        `Erreur lors de l'action : ${err.message || "Veuillez réessayer."}`
      );
    } finally {
      setSubmittingAction(false);
    }
  };

  const renderActionForm = () => {
    const commonProps = {
      clientData: selectedClientData,
      onSubmit: handleActionSubmit,
      isSubmitting: submittingAction,
      error: error,
      success: success,
    };

    if (!selectedClientUid) {
      return (
        <div className="alert alert-info" role="alert">
          Veuillez sélectionner un client pour voir les actions disponibles.
        </div>
      );
    }

    switch (selectedAction) {
      case "fc-credit":
        return <CreditForm {...commonProps} />;
      case "fc-debit":
        return <DebitForm {...commonProps} />;
      case "fc-refund":
        return <RefundForm {...commonProps} />;
      case "fc-bank-color":
        return <BankColorForm {...commonProps} />;
      case "fc-new-push":
        return <NewPushForm {...commonProps} />;
      case "fc-new-lang":
        return <NewLangForm {...commonProps} languages={LANGUES} />;
      case "fc-new-currency":
        return <NewCurrencyForm {...commonProps} currencies={currencies} />;
      case "fc-pp-msg":
        return <PercentageStopForm {...commonProps} />;

      case "fc-new-codetransfer":
        return <TransferCodeForm {...commonProps} />;

      case "fc-new-codepin":
        return <NewPinForm {...commonProps} />;

      case "fc-lock-unlock":
        return (
          <form
            className="form-group"
            onSubmit={(e) => {
              e.preventDefault();
              handleActionSubmit({ status: e.target.elements.status.value });
            }}
          >
            <label htmlFor="status" className="form-label">
              Statut du compte
            </label>

            <select
              id="status"
              name="status"
              className="form-select"
              required
              defaultValue={selectedClientData.etat}
            >
              <option value="Flash Compte actif">Actif</option>

              <option value="Compte bloqué (Fraude)">Bloqué (Fraude)</option>

              <option value="Compte bloqué (Temporaire)">
                Bloqué (Temporaire)
              </option>
            </select>

            <button
              type="submit"
              className="btn btn-primary mt-2"
              disabled={submittingAction}
            >
              Mettre à jour le statut
            </button>
          </form>
        );

      case "fc-reset-transfer":
        return (
          <div>
            <p className="alert alert-warning">
              Êtes-vous sûr de vouloir réinitialiser l'historique des virements
              de ce client ? Cette action est irréversible.
            </p>

            <button
              className="btn btn-danger"
              onClick={() => handleActionSubmit({})}
              disabled={submittingAction}
            >
              {submittingAction
                ? "Réinitialisation en cours..."
                : "Confirmer la réinitialisation"}
            </button>
          </div>
        );

      case "fc-update-card":
      case "fc-update-iban":
        return (
          <div className="alert alert-warning">
            L'implémentation du formulaire de l'action **"
            {selectedAction}"** est en attente.
          </div>
        );

      default:
        return (
          <div className="alert alert-info" role="alert">
            Choisissez une action à effectuer sur l'accès client sélectionné.
          </div>
        );
    }
  };

  if (loadingClients) {
    return (
      <div className="form-test" style={{ marginTop: "50px" }}>
        <p>Chargement des clients...</p>
      </div>
    );
  }

  return (
    <div className="form-test" style={{ marginTop: "50px" }} id="form-update">
      <div className="ttb-title">
        <i className="fi fi-rr-magic-wand"></i> Mettre à jour un accès client v2
      </div>
      {error && <p className="flash-message error">{error}</p>}
      {success && <p className="flash-message success">{success}</p>}
      <div className="mb-3">
        <label htmlFor="select-fc" className="form-label">
          Sélectionner l'accès client .
          <span style={{ color: "red" }}>requis</span>
        </label>

        <select
          name="select-fc"
          id="select-fc"
          className="form-select"
          required
          value={selectedClientUid}
          onChange={handleClientChange}
        >
          <option value="" disabled>
            Liste de vos flash compte client(s)
          </option>

          {clients.length > 0 ? (
            clients.map((client) => (
              <option key={client.clientUid} value={client.clientUid}>
                {client.nom} {client.prenom} - {client.email}
                (UID: {client.clientUid.substring(0, 6)}...)
              </option>
            ))
          ) : (
            <option value="" disabled>
              Aucun client trouvé.
            </option>
          )}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="update-fc-action" className="form-label">
          Liste des action(s) possible(s) sur un accès .
          <span style={{ color: "red" }}>requis</span>
        </label>

        <select
          name="update-fc-action"
          id="update-fc-action"
          className="form-select"
          required
          value={selectedAction}
          onChange={handleActionChange}
          disabled={!selectedClientUid}
        >
          <option value="N/A" disabled>
            Choisissez une action
          </option>

          {selectedClientUid && (
            <>
              <option value="fc-credit">Émettre un virement entrant</option>

              <option value="fc-debit">Émettre un virement sortant</option>

              <option value="fc-refund">Émettre un remboursement</option>

              <option value="fc-new-push">
                Nouvelle notification à affichée
              </option>

              <option value="fc-new-lang">Changer la langue d'affichage</option>

              <option value="fc-new-codepin">
                Changer le code PIN de connexion
              </option>

              <option value="fc-new-codetransfer">
                Changer le code d'activation virement
              </option>

              <option value="fc-pp-msg">
                Nouveau pourcentage d'arrêt virement
              </option>

              <option value="fc-lock-unlock">
                Bloquer ou débloquer l'accès client
              </option>
            </>
          )}
        </select>
      </div>
      <div id="all-form-update">{renderActionForm()}</div>
    </div>
  );
};

export default FlashAccountUpdater;
