import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import {
  Save,
  Plus,
  Minus,
  Check,
  X,
  Wallet,
  Clock,
  ArrowUpRight,
  FileText,
  Gift,
  CreditCard,
  LayoutGrid,
  List,
} from "lucide-react";
import Loading from "../utilities/laoding/Loading";
import "./AdminUserDetailProfessional.css";

// --- SERVICE CATALOG (Updated with ALL services) ---
const SERVICES_CATALOG = [
  {
    id: "virement_pro",
    label: "Virement Flash Pro",
    description: "Fee per outgoing transfer operation.",
    defaultCost: 5000,
  },
  {
    id: "compte_flash_pro",
    label: "Client Account Creation",
    description: "One-time fee for creating a client access (Login/PIN).",
    defaultCost: 10000,
  },
  {
    id: "achat_compte_flash",
    label: "Flash Account Generator",
    description:
      "Cost to generate an instant complete account (IBAN/Transactions).",
    defaultCost: 5000,
  },
  {
    id: "gift_send",
    label: "Gift Sending Service",
    description:
      "Fixed service fee for sending a gift (added to the gift price).",
    defaultCost: 0, // Usually 0 or a small fee, as the gift has its own price
  },
  {
    id: "numeros_virtuels",
    label: "Virtual Numbers Purchase",
    description: "Cost to purchase a virtual phone number.",
    defaultCost: 2000, // Example cost, adjust as needed
  },
];

const AdminUserDetail = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Management States
  const [activeTab, setActiveTab] = useState("settings"); // 'settings' | 'history'
  const [amountToManage, setAmountToManage] = useState("");
  const [manageLoading, setManageLoading] = useState(false);
  const [serviceSettings, setServiceSettings] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // History States
  const [history, setHistory] = useState({
    virements: [],
    comptes: [],
    gifts: [],
  });
  const [historyLoading, setHistoryLoading] = useState(false);

  // 1. LOAD USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({ id: userDoc.id, ...data });
          setServiceSettings(data.serviceSettings || {});
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  // 2. LOAD HISTORY (When switching tabs)
  useEffect(() => {
    if (activeTab === "history" && history.virements.length === 0) {
      const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
          // A. Fetch Transfers
          const qVirements = query(
            collection(db, "virements"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc") // Ideally add an index in Firestore
          );
          // Note: If orderBy fails without an index, remove it temporarily
          const snapVirements = await getDocs(qVirements);

          // B. Fetch Flash Accounts (Collection clientAccesses)
          const qComptes = query(
            collection(db, "clientAccesses"),
            where("creatorUid", "==", userId)
          );
          const snapComptes = await getDocs(qComptes);

          // C. Fetch Gifts/Orders
          const qGifts = query(
            collection(db, "orders"), // Ensure this matches your gift collection name
            where("senderUid", "==", userId) // Ensure you save senderUid in SendGift.jsx
          );
          const snapGifts = await getDocs(qGifts);

          setHistory({
            virements: snapVirements.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })),
            comptes: snapComptes.docs.map((d) => ({ id: d.id, ...d.data() })),
            gifts: snapGifts.docs.map((d) => ({ id: d.id, ...d.data() })),
          });
        } catch (error) {
          console.error("History error:", error);
          // Fallback if index error occurs
          if (error.code === "failed-precondition") {
            console.log("Missing index, retry without sorting");
          }
        } finally {
          setHistoryLoading(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab, userId]);

  // --- ACTIONS ---

  const handleUpdateCoins = async (isAddition) => {
    const amount = parseInt(amountToManage);
    if (!amount || amount <= 0) return alert("Invalid amount");
    setManageLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      const valueChange = isAddition ? amount : -amount;

      // Prevent negative balance
      if (!isAddition && (user.coins || 0) + valueChange < 0) {
        alert("Action failed: Balance cannot be negative.");
        setManageLoading(false);
        return;
      }

      await updateDoc(userRef, { coins: increment(valueChange) });
      setUser((prev) => ({ ...prev, coins: (prev.coins || 0) + valueChange }));
      setAmountToManage("");
    } catch (error) {
      alert("Error updating balance");
    } finally {
      setManageLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateDoc(doc(db, "users", userId), { serviceSettings });
      setUnsavedChanges(false);
      alert("Settings saved successfully!");
    } catch (e) {
      alert("Error saving settings");
    }
  };

  const updateSetting = (serviceId, field, value) => {
    setUnsavedChanges(true);
    setServiceSettings((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], [field]: value },
    }));
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-detail-container">
      {/* HEADER */}
      <header className="detail-header">
        <div className="user-summary">
          <div className="user-avatar-large">
            {user?.prenom?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="user-text">
            <h1>
              {user?.prenom} {user?.nom}
            </h1>
            <p className="email-badge">{user?.email}</p>
          </div>
        </div>
        {unsavedChanges && (
          <button
            className="btn-save-global pulse"
            onClick={handleSaveSettings}
          >
            <Save size={18} /> Save Changes
          </button>
        )}
      </header>

      {/* TABS NAVIGATION */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <LayoutGrid size={18} /> Rates & Services
        </button>
        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <List size={18} /> History & Activity
        </button>
      </div>

      <div className="detail-layout">
        {/* MAIN CONTENT (Depends on Tab) */}
        <main className="main-column">
          {/* TAB 1: SETTINGS */}
          {activeTab === "settings" && (
            <div className="card-clean fade-in">
              <div className="card-header">
                <h2>Service Configuration</h2>
                <p>Define custom permissions and costs for this client.</p>
              </div>
              <div className="services-clean-list">
                {SERVICES_CATALOG.map((service) => {
                  const userSettings = serviceSettings[service.id] || {};
                  const isAllowed = userSettings.allowed !== false;
                  const userCost = userSettings.cost ?? "";

                  return (
                    <div
                      key={service.id}
                      className={`service-row ${!isAllowed ? "disabled" : ""}`}
                    >
                      <div className="service-meta">
                        <h3>{service.label}</h3>
                        <p>{service.description}</p>
                      </div>
                      <div className="service-actions">
                        <div
                          className="toggle-wrapper"
                          onClick={() =>
                            updateSetting(service.id, "allowed", !isAllowed)
                          }
                        >
                          <div
                            className={`toggle-switch ${
                              isAllowed ? "on" : "off"
                            }`}
                          >
                            <div className="toggle-handle">
                              {isAllowed ? (
                                <Check size={12} color="#16a34a" />
                              ) : (
                                <X size={12} color="#dc2626" />
                              )}
                            </div>
                          </div>
                          <span className="toggle-label">
                            {isAllowed ? "Active" : "OFF"}
                          </span>
                        </div>
                        {isAllowed && (
                          <div className="price-input-wrapper">
                            <input
                              type="number"
                              placeholder={service.defaultCost}
                              value={userCost}
                              onChange={(e) =>
                                updateSetting(
                                  service.id,
                                  "cost",
                                  e.target.value
                                )
                              }
                              className={userCost !== "" ? "custom-price" : ""}
                            />
                            <span className="currency-suffix">Coins</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === "history" && (
            <div className="history-section fade-in">
              {historyLoading && (
                <div className="loading-state">Loading history...</div>
              )}

              {/* TRANSFERS SECTION */}
              <div className="card-clean mb-4">
                <div className="card-header flex-header">
                  <h2>
                    <ArrowUpRight size={20} /> Transfers Made
                  </h2>
                  <span className="count-badge">
                    {history.virements.length}
                  </span>
                </div>
                <div className="table-responsive">
                  {history.virements.length === 0 ? (
                    <p className="empty-msg">No transfers found.</p>
                  ) : (
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Beneficiary</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.virements.map((v) => (
                          <tr key={v.id}>
                            <td>{v.beneficiaireNom}</td>
                            <td className="font-mono">
                              {v.montant} {v.devise}
                            </td>
                            <td>
                              <span
                                className={`status-pill ${
                                  v.statut?.toLowerCase() || "attente"
                                }`}
                              >
                                {v.statut || "Pending"}
                              </span>
                            </td>
                            <td>
                              {v.createdAt?.toDate
                                ? v.createdAt.toDate().toLocaleDateString()
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* ACCOUNTS CREATED SECTION */}
              <div className="card-clean mb-4">
                <div className="card-header flex-header">
                  <h2>
                    <CreditCard size={20} /> Client Accounts Created
                  </h2>
                  <span className="count-badge">{history.comptes.length}</span>
                </div>
                <div className="table-responsive">
                  {history.comptes.length === 0 ? (
                    <p className="empty-msg">No accounts created.</p>
                  ) : (
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Client</th>
                          <th>IBAN</th>
                          <th>Init. Balance</th>
                          <th>PIN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.comptes.map((c) => (
                          <tr key={c.id}>
                            <td>
                              {c.nom} {c.prenom}
                            </td>
                            <td className="font-mono small">{c.iban}</td>
                            <td>
                              {c.soldeInitial} {c.devise}
                            </td>
                            <td className="blur-text">{c.codePin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* GIFTS SECTION */}
              <div className="card-clean mb-4">
                <div className="card-header flex-header">
                  <h2>
                    <Gift size={20} /> Gifts Sent
                  </h2>
                  <span className="count-badge">{history.gifts.length}</span>
                </div>
                <div className="table-responsive">
                  {history.gifts.length === 0 ? (
                    <p className="empty-msg">No gifts sent.</p>
                  ) : (
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Gift</th>
                          <th>Recipient</th>
                          <th>Price</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.gifts.map((g) => (
                          <tr key={g.id}>
                            <td>{g.giftName}</td>
                            <td>
                              {g.recipientFirstName} {g.recipientLastName}
                            </td>
                            <td className="font-mono">{g.price}</td>
                            <td>
                              {g.orderDate
                                ? new Date(g.orderDate).toLocaleDateString()
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* SIDEBAR: BALANCE (Always Visible) */}
        <aside className="sidebar-column">
          <div className="card-clean balance-card top-highlight">
            <div className="balance-header">
              <div className="balance-icon-bg">
                <Wallet size={24} color="#4F46E5" />
              </div>
              <div>
                <h3>Client Balance</h3>
                <div className="big-balance">
                  {(user?.coins || 0).toLocaleString()} <span>Coins</span>
                </div>
              </div>
            </div>

            <div className="balance-actions-form">
              <label>Adjust Balance Manually</label>
              <div className="input-with-actions">
                <input
                  type="number"
                  placeholder="Amount..."
                  value={amountToManage}
                  onChange={(e) => setAmountToManage(e.target.value)}
                />
              </div>
              <div className="buttons-row">
                <button
                  className="btn-action btn-credit"
                  onClick={() => handleUpdateCoins(true)}
                  disabled={manageLoading}
                >
                  <Plus size={16} /> Credit
                </button>
                <button
                  className="btn-action btn-debit"
                  onClick={() => handleUpdateCoins(false)}
                  disabled={manageLoading}
                >
                  <Minus size={16} /> Debit
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminUserDetail;
