import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  DollarSign,
  Trash2,
} from "lucide-react";
import "./AdminTransfers.css";

import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import emailjs from "@emailjs/browser";

const AdminTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [rejectedTransfers, setRejectedTransfers] = useState([]);
  const [completedTransfers, setCompletedTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [refundOption, setRefundOption] = useState("immediate");

  const SERVICE_ID = "service_csghyj7";
  const TEMPLATE_ID = "template_37xb6yj";
  const PUBLIC_KEY = "fzwU8-p8-20lNC6Mr";

  // --- 1. NOTIFICATION SYSTEM (UPDATED FOR I18N) ---
  const createClientNotification = async (clientId, notificationData) => {
    try {
      // ✅ CORRECTION : Ne pas forcer de devise par défaut
      const cleanMetadata = notificationData.metadata
        ? {
            ...notificationData.metadata,
            // Ne pas ajouter de devise par défaut - utiliser celle fournie
            beneficiaire: notificationData.metadata.beneficiaire || "Inconnu",
            montant: notificationData.metadata.montant || 0,
            forceMessage: false,
          }
        : {};

      await addDoc(collection(db, "notifications"), {
        clientUid: clientId,
        time: Timestamp.now(),
        read: false,
        ...notificationData,
        metadata: cleanMetadata,
      });
      console.log("🔔 Notification envoyée au client (Format I18n)");
    } catch (error) {
      console.error("Erreur notification:", error);
    }
  };

  // --- 2. CHARGEMENT ---
  const loadTransfers = async () => {
    console.log("🔄 Chargement des transactions Firebase...");
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "clients"));

      let allPending = [];
      let allRejected = [];
      let allCompleted = [];

      querySnapshot.forEach((docSnapshot) => {
        const clientData = docSnapshot.data();
        const clientId = docSnapshot.id;
        const history = clientData.transactionHistory || [];

        history.forEach((transaction, index) => {
          const enhancedTx = {
            ...transaction,
            id: transaction.id || `${clientId}-${index}`,
            clientId: clientId,
            originalIndex: index,
            clientName: `${clientData.prenom || "Client"} ${
              clientData.nom || ""
            }`,
            clientEmail: clientData.email,
            currency: transaction.currency || "€",
            displayDate: transaction.date
              ? typeof transaction.date === "string"
                ? transaction.date
                : new Date(transaction.date.seconds * 1000).toLocaleString()
              : "Date inconnue",
          };

          const status = enhancedTx.status
            ? enhancedTx.status.toLowerCase()
            : "unknown";

          if (status === "pending" || status === "en cours") {
            allPending.push(enhancedTx);
          } else if (
            (status === "failed" || status === "rejeté") &&
            !enhancedTx.refunded
          ) {
            allRejected.push(enhancedTx);
          } else if (
            status === "completed" ||
            status === "réussi" ||
            status === "effectué" ||
            enhancedTx.refunded
          ) {
            allCompleted.push(enhancedTx);
          }
        });
      });

      const sortByDate = (a, b) => new Date(b.date) - new Date(a.date);

      setTransfers(allPending.sort(sortByDate));
      setRejectedTransfers(allRejected.sort(sortByDate));
      setCompletedTransfers(allCompleted.sort(sortByDate));

      if (statusFilter === "pending") setFilteredTransfers(allPending);
      else if (statusFilter === "rejected") setFilteredTransfers(allRejected);
      else setFilteredTransfers(allCompleted);
    } catch (error) {
      console.error("❌ Erreur chargement :", error);
      alert("Erreur lors du chargement des transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  // --- FILTRES ---
  useEffect(() => {
    let filtered =
      statusFilter === "rejected"
        ? rejectedTransfers
        : statusFilter === "completed"
        ? completedTransfers
        : transfers;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.clientName.toLowerCase().includes(lowerTerm) ||
          t.beneficiaryName?.toLowerCase().includes(lowerTerm) ||
          t.iban?.toLowerCase().includes(lowerTerm) ||
          t.clientEmail?.toLowerCase().includes(lowerTerm)
      );
    }
    setFilteredTransfers(filtered);
  }, [
    searchTerm,
    statusFilter,
    transfers,
    rejectedTransfers,
    completedTransfers,
  ]);

  // --- 3. EMAIL (RESTE EN FRANÇAIS CAR ADMIN -> CLIENT) ---
  const sendProfessionalEmail = async (data, type) => {
    try {
      const templateParams = {
        to_email: data.clientEmail,
        to_name: data.clientName,
        transaction_amount: `${Math.abs(data.amount)} ${data.currency || "€"}`,
        transaction_date: data.displayDate,
        transaction_type: type,
        motif: data.rejectionReason || "N/A",
      };

      console.log("📧 Envoi email via EmailJS...", templateParams);
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      console.log("✅ Email envoyé avec succès !");
      return true;
    } catch (error) {
      console.error("❌ Erreur envoi email:", error);
      return false;
    }
  };

  // --- 4. UPDATE FIREBASE ---
  const updateTransactionInFirebase = async (
    transfer,
    newStatus,
    extraFields = {},
    refundAmount = 0
  ) => {
    const clientRef = doc(db, "clients", transfer.clientId);

    try {
      const clientSnap = await getDoc(clientRef);
      if (!clientSnap.exists()) throw new Error("Client introuvable");

      const clientData = clientSnap.data();
      let history = clientData.transactionHistory || [];
      let currentBalance = parseFloat(clientData.solde || 0);

      const txIndex = history.findIndex(
        (t) =>
          t.date === transfer.date &&
          t.amount === transfer.amount &&
          t.beneficiaryName === transfer.beneficiaryName
      );

      if (txIndex === -1)
        throw new Error("Transaction introuvable dans la base");

      history[txIndex] = {
        ...history[txIndex],
        status: newStatus,
        ...extraFields,
      };

      let newBalance = currentBalance;
      if (refundAmount > 0) {
        newBalance = currentBalance + Math.abs(refundAmount);
      }

      await updateDoc(clientRef, {
        transactionHistory: history,
        solde: newBalance,
      });

      console.log("✅ Firestore mis à jour avec succès");
      return true;
    } catch (error) {
      console.error("❌ Erreur Update Firebase:", error);
      alert("Erreur technique lors de la mise à jour : " + error.message);
      return false;
    }
  };

  // --- ACTIONS ---

  const handleApproveTransfer = async (transfer) => {
    if (
      !window.confirm(
        `Confirmer l'approbation de ${Math.abs(transfer.amount)} ${
          transfer.currency || "€"
        } ?`
      )
    )
      return;

    setProcessing(true);

    const success = await updateTransactionInFirebase(transfer, "completed", {
      approvedAt: new Date().toISOString(),
    });

    if (success) {
      // ✅ CORRECTION : Utiliser la devise réelle de la transaction
      const safeCurrency = transfer.currency || "$"; // Fallback vers $ si pas de devise
      const safeBeneficiary = transfer.beneficiaryName || "Inconnu";

      await createClientNotification(transfer.clientId, {
        type: "success",
        title: "notifications.title_sent",
        message: "notifications.msg_sent_success",
        metadata: {
          montant: Math.abs(transfer.amount),
          devise: safeCurrency, // ✅ Devise réelle
          beneficiaire: safeBeneficiary,
          statut: "completed",
        },
      });

      await sendProfessionalEmail(transfer, "APPROUVÉ");
      alert("✅ Virement approuvé et client notifié.");
      await loadTransfers();
      setSelectedTransfer(null);
    }
    setProcessing(false);
  };

  const handleRejectTransfer = (transfer) => {
    setShowRejectModal(transfer);
    setRefundOption("immediate");
    setRejectionReason("");
  };

  // --- REJET AVEC TRADUCTION ---
  const confirmRejectTransfer = async () => {
    if (!rejectionReason.trim()) {
      alert("⚠️ Motif requis");
      return;
    }

    setProcessing(true);
    const transfer = showRejectModal;
    const isRefund = refundOption === "immediate";
    const amountToRefund = isRefund ? Math.abs(transfer.amount) : 0;

    const newStatus = "failed";
    const extraFields = {
      rejectedAt: new Date().toISOString(),
      rejectionReason: rejectionReason,
      refunded: isRefund,
      refundedAt: isRefund ? new Date().toISOString() : null,
    };

    const success = await updateTransactionInFirebase(
      transfer,
      newStatus,
      extraFields,
      amountToRefund
    );

    if (success) {
      // ✅ CORRECTION : Utiliser la devise réelle de la transaction
      const safeCurrency = transfer.currency || "$";
      const safeBeneficiary = transfer.beneficiaryName || "Inconnu";

      if (isRefund) {
        // CAS 1: Remboursé
        await createClientNotification(transfer.clientId, {
          type: "credit",
          title: "notifications.title_refunded",
          message: "notifications.msg_refunded",
          metadata: {
            montant: Math.abs(transfer.amount),
            devise: safeCurrency, // ✅ Devise réelle
            beneficiaire: safeBeneficiary,
            statut: "remboursé",
            motif: rejectionReason,
          },
        });
      } else {
        // CAS 2: Rejeté sans remboursement
        await createClientNotification(transfer.clientId, {
          type: "error",
          title: "notifications.title_rejected",
          message: "notifications.msg_sent_failed",
          metadata: {
            montant: Math.abs(transfer.amount),
            devise: safeCurrency, // ✅ Devise réelle
            beneficiaire: safeBeneficiary,
            statut: "rejeté",
            motif: rejectionReason,
          },
        });
      }

      await sendProfessionalEmail({ ...transfer, rejectionReason }, "REJETÉ");
      alert(`✅ Virement rejeté ${isRefund ? "et remboursé" : ""}.`);
      await loadTransfers();
      setShowRejectModal(null);
      setSelectedTransfer(null);
    }
    setProcessing(false);
  };

  // --- REMBOURSEMENT MANUEL AVEC TRADUCTION ---
  const handleRefundTransfer = async (transfer) => {
    if (!window.confirm(`Rembourser ${Math.abs(transfer.amount)} au client ?`))
      return;

    setProcessing(true);

    const success = await updateTransactionInFirebase(
      transfer,
      "failed",
      { refunded: true, refundedAt: new Date().toISOString() },
      Math.abs(transfer.amount)
    );

    if (success) {
      // ✅ CORRECTION : Utiliser la devise réelle de la transaction
      const safeCurrency = transfer.currency || "$";
      const safeBeneficiary = transfer.beneficiaryName || "Inconnu";

      await createClientNotification(transfer.clientId, {
        type: "credit",
        title: "notifications.title_refunded",
        message: "notifications.msg_refunded",
        metadata: {
          montant: Math.abs(transfer.amount),
          devise: safeCurrency, // ✅ Devise réelle
          beneficiaire: safeBeneficiary,
          statut: "remboursé",
        },
      });

      await sendProfessionalEmail(transfer, "REMBOURSÉ");
      alert("✅ Remboursement effectué.");
      await loadTransfers();
      setSelectedTransfer(null);
    }
    setProcessing(false);
  };

  const handleDeleteTransfer = async (transfer) => {
    if (
      !window.confirm(
        "⚠️ Supprimer définitivement cette trace ? Cela ne modifie pas le solde."
      )
    )
      return;

    setProcessing(true);
    const clientRef = doc(db, "clients", transfer.clientId);
    try {
      const clientSnap = await getDoc(clientRef);
      const clientData = clientSnap.data();
      let history = clientData.transactionHistory || [];

      const newHistory = history.filter(
        (t) =>
          !(
            t.date === transfer.date &&
            t.amount === transfer.amount &&
            t.beneficiaryName === transfer.beneficiaryName
          )
        );

      await updateDoc(clientRef, { transactionHistory: newHistory });
      alert("✅ Transaction supprimée.");
      await loadTransfers();
      setSelectedTransfer(null);
    } catch (e) {
      console.error(e);
      alert("Erreur suppression");
    }
    setProcessing(false);
  };

  const cancelRejectTransfer = () => {
    setShowRejectModal(null);
    setRejectionReason("");
    setRefundOption("immediate");
  };

  if (loading) {
    return (
      <div className="admin-transfers-container">
        <div className="loading-state">
          <RefreshCw className="spin" size={40} />
          <p>Synchronisation avec la Blockchain Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-transfers-container">
      <div className="transfers-header">
        <h1>Gestion des virements</h1>
        <div className="transfers-stats">
          <div className="stat-card">
            <Clock size={20} />
            <div>
              <span className="stat-value">{transfers.length}</span>
              <span className="stat-label">En attente</span>
            </div>
          </div>
          <div className="stat-card">
            <DollarSign size={20} />
            <div>
              <span className="stat-value">{rejectedTransfers.length}</span>
              <span className="stat-label">Rejetés/Litige</span>
            </div>
          </div>
          <div className="stat-card">
            <CheckCircle size={20} />
            <div>
              <span className="stat-value">{completedTransfers.length}</span>
              <span className="stat-label">Traités</span>
            </div>
          </div>
        </div>
      </div>

      <div className="transfers-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher (Nom, IBAN, Email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <Filter size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="pending">En attente de validation</option>
            <option value="rejected">Rejetés / À rembourser</option>
            <option value="completed">Historique terminé</option>
          </select>
        </div>
      </div>

      <div className="transfers-list">
        {filteredTransfers.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <p>Aucune transaction trouvée pour ce filtre.</p>
          </div>
        ) : (
          filteredTransfers.map((transfer) => (
            <div
              key={transfer.id}
              className={`transfer-card ${
                statusFilter === "rejected"
                  ? "rejected-card"
                  : statusFilter === "completed"
                  ? "completed-card"
                  : ""
              }`}
              onClick={() => setSelectedTransfer(transfer)}
            >
              <div className="transfer-info">
                <div className="transfer-client">
                  <strong>{transfer.clientName}</strong>
                  <span className="transfer-email">{transfer.clientEmail}</span>
                </div>
                <div className="transfer-details">
                  <span>
                    Vers: <strong>{transfer.beneficiaryName}</strong>
                  </span>
                  <span className="transfer-iban">{transfer.iban}</span>
                  {statusFilter === "completed" && (
                    <span className="transfer-processed">
                      {transfer.status === "completed"
                        ? `✓ Validé le ${
                            transfer.approvedAt
                              ? new Date(
                                  transfer.approvedAt
                                ).toLocaleDateString()
                              : "N/A"
                          }`
                        : transfer.refunded
                        ? `✓ Remboursé le ${
                            transfer.refundedAt
                              ? new Date(
                                  transfer.refundedAt
                                ).toLocaleDateString()
                              : "N/A"
                          }`
                        : "Terminé"}
                    </span>
                  )}
                </div>
              </div>

              <div className="transfer-amount">
                <span className="amount-value">
                  {Math.abs(transfer.amount).toFixed(2)}{" "}
                  {transfer.currency || "€"}
                </span>
                <span className="transfer-date">{transfer.displayDate}</span>
              </div>

              <div className="transfer-actions">
                {statusFilter === "pending" ? (
                  <>
                    <button
                      className="btn-approve"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveTransfer(transfer);
                      }}
                      disabled={processing}
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      className="btn-reject"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectTransfer(transfer);
                      }}
                      disabled={processing}
                    >
                      <XCircle size={18} />
                    </button>
                  </>
                ) : statusFilter === "rejected" ? (
                  !transfer.refunded && (
                    <button
                      className="btn-refund"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRefundTransfer(transfer);
                      }}
                      disabled={processing}
                    >
                      <DollarSign size={18} /> Rembourser
                    </button>
                  )
                ) : null}
                <button
                  className="btn-delete-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTransfer(transfer);
                  }}
                  disabled={processing}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTransfer && (
        <div
          className="transfer-modal-overlay"
          onClick={() => setSelectedTransfer(null)}
        >
          <div className="transfer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails Transaction</h2>
              <button onClick={() => setSelectedTransfer(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-group">
                <label>Client</label>
                <p>
                  {selectedTransfer.clientName} <br />
                  <small>{selectedTransfer.clientEmail}</small>
                </p>
              </div>
              <div className="detail-group">
                <label>Bénéficiaire</label>
                <p>{selectedTransfer.beneficiaryName}</p>
              </div>
              <div className="detail-group">
                <label>IBAN</label>
                <p>{selectedTransfer.iban}</p>
              </div>
              <div className="detail-group">
                <label>Montant</label>
                <p className="amount-highlight">
                  {Math.abs(selectedTransfer.amount).toFixed(2)}{" "}
                  {selectedTransfer.currency || "€"}
                </p>
              </div>
              {selectedTransfer.rejectionReason && (
                <div className="detail-group">
                  <label style={{ color: "red" }}>Motif du Rejet</label>
                  <p>{selectedTransfer.rejectionReason}</p>
                </div>
              )}

              <div className="modal-actions">
                {statusFilter === "pending" && (
                  <>
                    <button
                      className="btn-approve-modal"
                      onClick={() => handleApproveTransfer(selectedTransfer)}
                      disabled={processing}
                    >
                      {processing ? "..." : "Valider le virement"}
                    </button>
                    <button
                      className="btn-reject-modal"
                      onClick={() => handleRejectTransfer(selectedTransfer)}
                      disabled={processing}
                    >
                      {processing ? "..." : "Rejeter"}
                    </button>
                  </>
                )}
                {statusFilter === "rejected" && !selectedTransfer.refunded && (
                  <button
                    className="btn-refund-modal"
                    onClick={() => handleRefundTransfer(selectedTransfer)}
                    disabled={processing}
                  >
                    {processing ? "..." : "Rembourser le client"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="reject-modal-overlay" onClick={cancelRejectTransfer}>
          <div className="reject-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reject-modal-header">
              <h2>Rejeter le virement</h2>
              <button onClick={cancelRejectTransfer}>×</button>
            </div>

            <div className="reject-modal-body">
              <div className="reject-transfer-info">
                <p>
                  <strong>Client :</strong> {showRejectModal.clientName}
                </p>
                <p>
                  <strong>Montant :</strong> {Math.abs(showRejectModal.amount)}{" "}
                  {showRejectModal.currency}
                </p>
              </div>

              <div className="reject-form-group">
                <label>Raison du rejet (envoyée par email) *</label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: Fonds insuffisants, IBAN invalide..."
                  className="reject-input"
                />
              </div>

              <div className="reject-form-group">
                <label>Action financière</label>
                <div className="refund-options">
                  <label className="refund-option">
                    <input
                      type="radio"
                      name="refundOption"
                      value="immediate"
                      checked={refundOption === "immediate"}
                      onChange={(e) => setRefundOption(e.target.value)}
                    />
                    <div className="refund-option-content">
                      <strong>Remboursement immédiat</strong>
                      <span>Le solde du client sera recrédité.</span>
                    </div>
                  </label>
                  <label className="refund-option">
                    <input
                      type="radio"
                      name="refundOption"
                      value="later"
                      checked={refundOption === "later"}
                      onChange={(e) => setRefundOption(e.target.value)}
                    />
                    <div className="refund-option-content">
                      <strong>Rejet sec (Pas de remboursement)</strong>
                      <span>Le solde reste débité (ex: Fraude avérée).</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="reject-modal-footer">
              <button
                className="btn-cancel-reject"
                onClick={cancelRejectTransfer}
              >
                Annuler
              </button>
              <button
                className="btn-confirm-reject"
                onClick={confirmRejectTransfer}
                disabled={processing || !rejectionReason.trim()}
              >
                {refundOption === "immediate"
                  ? "Rejeter et Rembourser"
                  : "Rejeter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransfers;