import React, { useState, useEffect } from "react";
import { auth } from "../firebase/config";
import axios from "axios";
import toast from "react-hot-toast";
import "./NumerosVirtuels.css";

const API_URL =
  process.env.REACT_APP_TWILIO_API_URL || "http://localhost:8080/api";

const NumerosVirtuels = () => {
  useEffect(() => {
    console.log("🔐 Auth Check:", {
      currentUser: auth.currentUser,
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    });
  }, []);
  const [myNumbers, setMyNumbers] = useState([]);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("myNumbers");
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [smsForm, setSmsForm] = useState({ from: "", to: "", body: "" });
  const [smsHistory, setSmsHistory] = useState([]);

  const getAuthToken = async () => {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const apiCall = async (endpoint, method = "GET", data = null) => {
    try {
      const token = await getAuthToken();
      const config = {
        method,
        url: `${API_URL}${endpoint}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadMyNumbers();
  }, []);

  const loadMyNumbers = async () => {
    setLoading(true);
    try {
      const response = await apiCall("/numbers/my-numbers");
      if (response.success) {
        setMyNumbers(response.numbers);
        if (response.numbers.length > 0 && !smsForm.from) {
          setSmsForm((prev) => ({
            ...prev,
            from: response.numbers[0].phoneNumber,
          }));
        }
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des numéros");
    } finally {
      setLoading(false);
    }
  };

  const searchNumbers = async () => {
    setSearchLoading(true);
    try {
      const response = await apiCall(
        `/numbers/search?country=${selectedCountry}`
      );
      if (response.success) {
        setAvailableNumbers(response.numbers);
        toast.success(`${response.numbers.length} numéros trouvés`);
      }
    } catch (error) {
      toast.error("Erreur lors de la recherche");
    } finally {
      setSearchLoading(false);
    }
  };

  const purchaseNumber = async (phoneNumber) => {
    if (!window.confirm(`Acheter le numéro ${phoneNumber}?`)) return;

    try {
      const response = await apiCall("/numbers/purchase", "POST", {
        phoneNumber,
      });
      if (response.success) {
        toast.success("Numéro acheté avec succès!");
        loadMyNumbers();
        setSelectedTab("myNumbers");
      }
    } catch (error) {
      toast.error("Erreur lors de l'achat");
    }
  };

  const releaseNumber = async (sid, phoneNumber) => {
    if (!window.confirm(`Supprimer le numéro ${phoneNumber}?`)) return;

    try {
      const response = await apiCall(`/numbers/${sid}`, "DELETE");
      if (response.success) {
        toast.success("Numéro supprimé");
        loadMyNumbers();
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const sendSMS = async (e) => {
    e.preventDefault();
    if (!smsForm.from || !smsForm.to || !smsForm.body) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await apiCall("/sms/send", "POST", smsForm);
      if (response.success) {
        toast.success("SMS envoyé!");
        setSmsForm({ ...smsForm, to: "", body: "" });
        loadSMSHistory();
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi du SMS");
    }
  };

  const loadSMSHistory = async () => {
    try {
      const response = await apiCall("/sms/history");
      if (response.success) {
        setSmsHistory(response.messages);
      }
    } catch (error) {
      console.error("Error loading SMS history:", error);
    }
  };

  useEffect(() => {
    if (selectedTab === "sms") {
      loadSMSHistory();
    }
  }, [selectedTab]);

  const countries = [
    { code: "US", name: "🇺🇸 États-Unis" },
    { code: "GB", name: "🇬🇧 Royaume-Uni" },
    { code: "CA", name: "🇨🇦 Canada" },
    { code: "FR", name: "🇫🇷 France" },
    { code: "DE", name: "🇩🇪 Allemagne" },
    { code: "ES", name: "🇪🇸 Espagne" },
    { code: "IT", name: "🇮🇹 Italie" },
  ];

  return (
    <div className="numeros-virtuels-container">
      <div className="page-header">
        <h1>📱 Numéros Virtuels</h1>
        <p>Gérez vos numéros virtuels internationaux</p>
      </div>

      <div className="card">
        <div className="tabs-header">
          <button
            onClick={() => setSelectedTab("myNumbers")}
            className={`tab-button ${
              selectedTab === "myNumbers" ? "active" : ""
            }`}
          >
            Mes numéros ({myNumbers.length})
          </button>
          <button
            onClick={() => setSelectedTab("search")}
            className={`tab-button ${selectedTab === "search" ? "active" : ""}`}
          >
            Acheter un numéro
          </button>
          <button
            onClick={() => setSelectedTab("sms")}
            className={`tab-button ${selectedTab === "sms" ? "active" : ""}`}
          >
            Envoyer SMS
          </button>
        </div>

        <div className="tab-content">
          {selectedTab === "myNumbers" && (
            <div>
              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Chargement...</p>
                </div>
              ) : myNumbers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📱</div>
                  <p>Vous n'avez pas encore de numéros virtuels</p>
                  <button
                    onClick={() => setSelectedTab("search")}
                    className="btn btn-primary"
                  >
                    Acheter votre premier numéro
                  </button>
                </div>
              ) : (
                <div className="numbers-grid">
                  {myNumbers.map((number) => (
                    <div key={number.sid} className="number-card">
                      <div className="number-header">
                        <div>
                          <div className="number-phone">
                            {number.phoneNumber}
                          </div>
                          <div className="number-name">
                            {number.friendlyName}
                          </div>
                        </div>
                      </div>
                      <div className="number-capabilities">
                        {number.capabilities?.voice && (
                          <span className="badge badge-green">📞 Voix</span>
                        )}
                        {number.capabilities?.SMS && (
                          <span className="badge badge-blue">💬 SMS</span>
                        )}
                        {number.capabilities?.MMS && (
                          <span className="badge badge-purple">📱 MMS</span>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          releaseNumber(number.sid, number.phoneNumber)
                        }
                        className="btn btn-danger btn-block"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === "search" && (
            <div>
              <div className="search-section">
                <label>Sélectionnez un pays</label>
                <div className="search-controls">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="select-input"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={searchNumbers}
                    disabled={searchLoading}
                    className="btn btn-primary"
                  >
                    {searchLoading ? "Recherche..." : "Rechercher"}
                  </button>
                </div>
                <p className="hint-text">
                  💡 Conseil: Les numéros US sont les plus faciles à obtenir
                </p>
              </div>

              {availableNumbers.length > 0 && (
                <div>
                  <h3 className="section-title">
                    Numéros disponibles ({availableNumbers.length})
                  </h3>
                  <div className="numbers-grid">
                    {availableNumbers.map((number, index) => (
                      <div key={index} className="number-card">
                        <div className="number-phone">{number.phoneNumber}</div>
                        <div className="number-location">
                          {number.locality}, {number.region}
                        </div>
                        <div className="number-features">
                          {number.capabilities?.voice && <span>✓ Voix</span>}
                          {number.capabilities?.SMS && <span>✓ SMS</span>}
                          {number.capabilities?.MMS && <span>✓ MMS</span>}
                        </div>
                        <button
                          onClick={() => purchaseNumber(number.phoneNumber)}
                          className="btn btn-primary btn-block"
                        >
                          Acheter (~1$/mois)
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === "sms" && (
            <div className="sms-container">
              <div className="sms-form-section">
                <h3>Envoyer un SMS</h3>
                <form onSubmit={sendSMS} className="sms-form">
                  <div className="form-group">
                    <label>De (votre numéro)</label>
                    <select
                      value={smsForm.from}
                      onChange={(e) =>
                        setSmsForm({ ...smsForm, from: e.target.value })
                      }
                      className="form-input"
                      required
                    >
                      <option value="">Sélectionner un numéro</option>
                      {myNumbers.map((number) => (
                        <option key={number.sid} value={number.phoneNumber}>
                          {number.phoneNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>À (destinataire)</label>
                    <input
                      type="tel"
                      value={smsForm.to}
                      onChange={(e) =>
                        setSmsForm({ ...smsForm, to: e.target.value })
                      }
                      placeholder="+1234567890 ou +225XXXXXXXXX"
                      className="form-input"
                      required
                    />
                    <small>
                      Format international (ex: +1 pour US, +225 pour CI, +33
                      pour FR)
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      value={smsForm.body}
                      onChange={(e) =>
                        setSmsForm({ ...smsForm, body: e.target.value })
                      }
                      rows="4"
                      placeholder="Votre message..."
                      className="form-textarea"
                      required
                    ></textarea>
                    <div className="sms-counter">
                      <span>{smsForm.body.length} caractères</span>
                      <span>{Math.ceil(smsForm.body.length / 160)} SMS</span>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block">
                    📤 Envoyer SMS
                  </button>
                </form>
              </div>

              <div className="sms-history-section">
                <div className="history-header">
                  <h3>Historique des SMS</h3>
                  <button onClick={loadSMSHistory} className="btn-refresh">
                    🔄 Actualiser
                  </button>
                </div>
                <div className="history-list">
                  {smsHistory.length === 0 ? (
                    <div className="empty-history">
                      <p>Aucun SMS pour le moment</p>
                    </div>
                  ) : (
                    smsHistory.map((msg) => (
                      <div key={msg.sid} className="message-card">
                        <div className="message-header">
                          <div className="message-info">
                            <div className="message-direction">
                              {msg.direction === "outbound" ? (
                                <span>📤 Vers {msg.to}</span>
                              ) : (
                                <span>📥 De {msg.from}</span>
                              )}
                            </div>
                            <div className="message-date">
                              {new Date(msg.dateCreated).toLocaleString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                          <span className={`status-badge status-${msg.status}`}>
                            {msg.status === "delivered"
                              ? "✓ Délivré"
                              : msg.status === "sent"
                              ? "↗ Envoyé"
                              : msg.status === "failed"
                              ? "✗ Échoué"
                              : msg.status}
                          </span>
                        </div>
                        <div className="message-body">{msg.body}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="info-card">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <h4>À propos des numéros virtuels</h4>
          <ul>
            <li>Recevez et envoyez des SMS depuis n'importe quel pays</li>
            <li>Coût approximatif: 1$/mois par numéro + 0.0075$/SMS</li>
            <li>Les numéros US sont recommandés pour débuter</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NumerosVirtuels;
