import React, { useState, useEffect, useContext } from "react";
import "./VirementForm.css";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/config";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import Loading from "../utilities/laoding/VirementLoading";
import emailjs from "@emailjs/browser";
import {
  BANQUES,
  MOTIFS,
  DEVISES,
  PAYS,
} from "../data/tableau des banque/data";
import { CoinsContext } from "../context/CoinsContext";
import ModalVideo from "../video Modal/ModalVideo";
import MdifiClientAccess from "./MdifiClientAccess";
import { Lock } from "lucide-react"; // Import de l'icône cadenas

const VirementForm = () => {
  const navigate = useNavigate();
  const {
    coins,
    updateCoins,
    loading: coinsLoading,
  } = useContext(CoinsContext);

  // Prix par défaut
  const DEFAULT_VIREMENT_COST = 5000;

  // --- NOUVEAUX ÉTATS POUR LA PERSONNALISATION ---
  const [actualCost, setActualCost] = useState(DEFAULT_VIREMENT_COST);
  const [isAllowed, setIsAllowed] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [isModalVideoOpen, setIsModalVideoOpen] = useState(false);

  const [formData, setFormData] = useState({
    debiteurNom: "",
    beneficiaireNom: "",
    devise: "EUR",
    montant: "",
    paysDestination: "France",
    beneficiaireBanqueAdresse: "",
    beneficiaireIban: "",
    beneficiaireCleRib: "",
    beneficiaireBic: "",
    motif: MOTIFS[0] || "",
    beneficiaireBanqueNom: BANQUES[0] || "",
    emailBeneficiaire: "",
    dateExecution: new Date().toISOString().split("T")[0],
    langue: "Français",
    statut: "En attente",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const TEST_VIDEO_URL = "https://www.youtube.com/embed/m9EoDflW49c";

  // 1. Charger le nom de l'utilisateur ET ses paramètres Admin
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) {
        setSettingsLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          // A. Pré-remplir le nom du débiteur
          setFormData((prev) => ({
            ...prev,
            debiteurNom:
              data.name || auth.currentUser.displayName || "Nom Utilisateur",
          }));

          // B. Vérifier les réglages Admin (virement_pro)
          const serviceConfig = data.serviceSettings?.virement_pro;
          if (serviceConfig) {
            // Vérifier autorisation
            if (serviceConfig.allowed === false) {
              setIsAllowed(false);
            }
            // Vérifier coût personnalisé
            if (serviceConfig.cost !== undefined && serviceConfig.cost !== "") {
              setActualCost(Number(serviceConfig.cost));
            }
          }
        } else {
          // Fallback si pas de profil complet
          setFormData((prev) => ({
            ...prev,
            debiteurNom: auth.currentUser.displayName || "Nom Utilisateur",
          }));
        }
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.beneficiaireNom.trim()) {
      setError("Veuillez entrer le nom du bénéficiaire.");
      return false;
    }
    if (!formData.montant || Number(formData.montant) <= 0) {
      setError("Veuillez entrer un montant valide.");
      return false;
    }
    if (!formData.beneficiaireIban.trim()) {
      setError("Veuillez entrer l'IBAN du bénéficiaire.");
      return false;
    }
    if (!formData.emailBeneficiaire.trim()) {
      setError("Veuillez entrer un email bénéficiaire valide.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification blocage
    if (!isAllowed) {
      alert("Ce service n'est pas disponible pour votre compte.");
      return;
    }

    if (!auth.currentUser) {
      alert("Vous devez être connecté pour effectuer un virement.");
      return;
    }

    if (!validateForm()) return;

    // Vérification coût dynamique
    if (coins < actualCost) {
      setError(
        `Solde insuffisant. Un virement coûte ${actualCost.toLocaleString()} coins.`
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Mise à jour du nom utilisateur si besoin
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userDocRef, { name: formData.debiteurNom }, { merge: true });

      // Enregistrement Virement
      const virementRef = await addDoc(collection(db, "virements"), {
        ...formData,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        cout: actualCost, // On enregistre combien ça a coûté
      });

      console.log("✅ Virement ajouté :", virementRef.id);

      await emailjs.send(
        "service_i82rcbf",
        "template_3y2d76s",
        {
          to_email: formData.emailBeneficiaire,
          from_name: formData.beneficiaireBanqueNom,
          debiteurNom: formData.debiteurNom,
          beneficiaireNom: formData.beneficiaireNom,
          montant: formData.montant,
          devise: formData.devise,
          from_email: "noreply@ordredevirement.com",
          iban: formData.beneficiaireIban,
          cleRib: formData.beneficiaireCleRib,
          bic: formData.beneficiaireBic,
          beneficiaireBanqueNom: formData.beneficiaireBanqueNom,
          beneficiaireBanqueAdresse: formData.beneficiaireBanqueAdresse,
          motif: formData.motif,
          dateExecution: formData.dateExecution,
          statutVirement: formData.statutVirement || "En cours",
        },
        "Ee9o_4dmL2P00GZXZ"
      );

      console.log("📧 Email envoyé avec succès");

      // 💰 Déduction des coins (Prix Dynamique)
      await updateCoins(auth.currentUser.uid, coins - actualCost);

      setLoading(false);

      navigate("/bordereau", {
        state: { virementId: virementRef.id, virementData: formData },
      });
    } catch (error) {
      console.error("❌ Erreur lors du virement :", error);
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  if (loading || coinsLoading || settingsLoading) return <Loading />;

  // --- UI SI BLOQUÉ ---
  if (!isAllowed) {
    return (
      <div
        className="virement-form"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Lock size={48} color="#dc2626" style={{ marginBottom: "16px" }} />
          <h2 style={{ color: "#1f2937", marginBottom: "8px" }}>
            Service Non Disponible
          </h2>
          <p style={{ color: "#6b7280" }}>
            L'accès aux virements flash a été restreint pour votre compte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="virement-form">
      <div className="virement-info">
        <h2 className="header-title">Virement Flash Pro</h2>
        <p>
          coin(s) disponible : <strong>{coins}</strong> &nbsp;
          <span style={{ color: "blue", cursor: "pointer" }}>à savoir</span>
        </p>
        <div className="virement-info-box">
          Cet outil vous permet d’effectuer des{" "}
          <strong>virements flash sécurisés</strong> vers vos bénéficiaires.
        </div>
        <button onClick={() => setIsModalVideoOpen(true)}>Vidéo test →</button>
      </div>

      <div className="virement-form-section">
        <h3>Effectuer un Virement</h3>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="virement-form-item">
            <label>Nom du donneur d’ordre</label>
            <input
              className="input"
              type="text"
              name="debiteurNom"
              value={formData.debiteurNom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="virement-form-item">
            <label>Nom du bénéficiaire</label>
            <input
              className="input"
              type="text"
              name="beneficiaireNom"
              value={formData.beneficiaireNom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="virement-form-group">
            <div className="virement-form-item">
              <label>Devise</label>
              <select
                name="devise"
                value={formData.devise}
                onChange={handleChange}
              >
                {DEVISES.map((devise, idx) => (
                  <option key={idx} value={devise}>
                    {devise}
                  </option>
                ))}
              </select>
            </div>
            <div className="virement-form-item">
              <label>Montant</label>
              <input
                type="number"
                step="0.01"
                name="montant"
                value={formData.montant}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="virement-form-group">
            <div className="virement-form-item">
              <label>Pays de résidence</label>
              <select
                name="paysDestination"
                value={formData.paysDestination}
                onChange={handleChange}
              >
                {PAYS.map((pays, idx) => (
                  <option key={idx} value={pays}>
                    {pays}
                  </option>
                ))}
              </select>
            </div>
            <div className="virement-form-item">
              <label>Adresse de la banque</label>
              <input
                name="beneficiaireBanqueAdresse"
                value={formData.beneficiaireBanqueAdresse}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="virement-form-group">
            <div className="virement-form-item">
              <label>IBAN</label>
              <input
                name="beneficiaireIban"
                value={formData.beneficiaireIban}
                onChange={handleChange}
                required
              />
            </div>
            <div className="virement-form-item">
              <label>Clé RIB</label>
              <input
                name="beneficiaireCleRib"
                value={formData.beneficiaireCleRib}
                onChange={handleChange}
              />
            </div>
            <div className="virement-form-item">
              <label>BIC</label>
              <input
                name="beneficiaireBic"
                value={formData.beneficiaireBic}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="virement-form-group">
            <div className="virement-form-item">
              <label>Motif du virement</label>
              <select
                name="motif"
                value={formData.motif}
                onChange={handleChange}
              >
                {MOTIFS.map((motif, idx) => (
                  <option key={idx} value={motif}>
                    {motif}
                  </option>
                ))}
              </select>
            </div>
            <div className="virement-form-item">
              <label>Banque</label>
              <select
                name="beneficiaireBanqueNom"
                value={formData.beneficiaireBanqueNom}
                onChange={handleChange}
              >
                {BANQUES.map((banque, idx) => (
                  <option key={idx} value={banque}>
                    {banque}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="virement-form-group">
            <div className="virement-form-item">
              <label>Email du bénéficiaire</label>
              <input
                type="email"
                name="emailBeneficiaire"
                value={formData.emailBeneficiaire}
                onChange={handleChange}
              />
            </div>
            <div className="virement-form-item">
              <label>Date d’exécution</label>
              <input
                type="date"
                name="dateExecution"
                value={formData.dateExecution}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "1.2rem" }}>
            <div className="virement-form-item">
              <label>Langue</label>
              <select
                name="langue"
                value={formData.langue}
                onChange={handleChange}
              >
                <option>Français</option>
                <option>Anglais</option>
                <option>Espagnol</option>
              </select>
            </div>
            <div className="virement-form-item">
              <label>Statut du virement</label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
              >
                <option>En attente</option>
                <option>En cours</option>
                <option>Effectué</option>
                <option>Rejeté</option>
              </select>
            </div>
          </div>

          <button type="submit" className="virement-btn-create">
            {/* Affichage du coût dynamique */}
            Effectuer le virement → {actualCost.toLocaleString()} coins
          </button>
        </form>
      </div>
      <MdifiClientAccess />

      <ModalVideo
        isOpen={isModalVideoOpen}
        onClose={() => setIsModalVideoOpen(false)}
        videoSource={TEST_VIDEO_URL}
        title="Démonstration Virement Flash"
        isLocal={false}
      />
    </div>
  );
};

export default VirementForm;
