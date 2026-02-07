import React, { useState, useEffect, useContext, useRef } from "react";
import "./VirementForm.css";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/config";
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where 
} from "firebase/firestore";
import Loading from "../utilities/laoding/VirementLoading";
import emailjs from "@emailjs/browser";
import {
  BANQUES,
  MOTIFS,
  DEVISES,
  PAYS,
} from "../data/tableau des banque/data";
import { TRANSLATIONS } from "../translate/translations"; 
import { CoinsContext } from "../context/CoinsContext";
import ModalVideo from "../video Modal/ModalVideo";
import MdifiClientAccess from "./MdifiClientAccess";
import { Lock, Globe } from "lucide-react";

// --- UTILITAIRES ---
const BANK_LOGOS = {
  "Defaut": "https://cdn-icons-png.flaticon.com/128/3936/3936759.png"
};

const DATE_LOCALES = {
  "Français": "fr-FR", "Anglais": "en-GB", "Allemand": "de-DE", "Espagnol": "es-ES",
  "Italien": "it-IT", "Portugais": "pt-PT", "Néerlandais": "nl-NL", "Polonais": "pl-PL",
  "Suédois": "sv-SE", "Danois": "da-DK", "Norvégien": "nb-NO", "Finlandais": "fi-FI",
  "Tchèque": "cs-CZ", "Roumain": "ro-RO", "Grec": "el-GR"
};

// MAPPAGE DES STATUTS
const STATUS_MAPPING = {
  "En attente": "status_pending",
  "En cours": "status_processing",
  "Effectué": "status_completed",
  "Rejeté": "status_rejected"
};

const normalizeKey = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s'-]/g, "_");
};

const VirementForm = () => {
  const navigate = useNavigate();
  const {
    coins,
    updateCoins,
    loading: coinsLoading,
  } = useContext(CoinsContext);

  const EMAILJS_SERVICE_ID = "service_7514rk8"; 
  const EMAILJS_TEMPLATE_ID = "template_8k25h7j";
  const EMAILJS_PUBLIC_KEY = "UWYvET8eDModmPseE";
  const EMAIL_EXPEDITEUR = "contact@noreplytransferorders.org";

  const WEBHOOK_URL = "https://hook.eu1.make.com/cuwiz9924ms451u5n7eegtmj2is21lwh";

  const DEFAULT_VIREMENT_COST = 5000;
  const EMAIL_DELAY_MS = 1 * 60 * 1000; 

  const [actualCost, setActualCost] = useState(DEFAULT_VIREMENT_COST);
  const [isAllowed, setIsAllowed] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isModalVideoOpen, setIsModalVideoOpen] = useState(false);
  const [isCustomBank, setIsCustomBank] = useState(false);
  const processedRef = useRef(new Set());

  const generateRandomIban = () => {
    return "FR76 " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000);
  };

  const generateRandomKey = () => Math.floor(10 + Math.random() * 89).toString();
  const generateAutoReference = () => `REF-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  const [formData, setFormData] = useState({
    debiteurNom: "",
    debiteurBanque: BANQUES[0] || "",
    debiteurCompte: generateRandomIban(),
    debiteurCleRib: generateRandomKey(),
    beneficiaireNom: "",
    devise: "EUR",
    montant: "",
    paysDestination: "France",
    beneficiaireBanqueAdresse: "",
    beneficiaireIban: "",
    beneficiaireCleRib: "",
    beneficiaireBic: "",
    reference: generateAutoReference(),
    motif: MOTIFS[0] || "",
    beneficiaireBanqueNom: "", 
    emailBeneficiaire: "",
    dateExecution: new Date().toISOString().split("T")[0],
    langue: "Français",           
    langueBordereau: "Français",
    statutVirement: "Effectué",       
    statutMessage: "En attente",     
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
          setFormData((prev) => ({
            ...prev,
            debiteurNom: data.name || auth.currentUser.displayName || "Nom Utilisateur",
            debiteurCompte: data.numeroCompte || prev.debiteurCompte,
            debiteurCleRib: data.cleRIB || prev.debiteurCleRib,
            debiteurBanque: data.banque || prev.debiteurBanque,
          }));
          const serviceConfig = data.serviceSettings?.virement_pro;
          if (serviceConfig) {
            if (serviceConfig.allowed === false) setIsAllowed(false);
            if (serviceConfig.cost !== undefined && serviceConfig.cost !== "") setActualCost(Number(serviceConfig.cost));
          }
        } else {
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

  // 🛡️ PROTECTION FERMETURE
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Un virement est en cours de traitement.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // --- 🔄 SYSTÈME DE GESTION REALTIME ---
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "virements"),
      where("userId", "==", auth.currentUser.uid),
      where("statutMessage", "==", "En attente")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const virement = { id: change.doc.id, ...change.doc.data() };
          if (processedRef.current.has(virement.id)) return;
          const now = Date.now();
          const sendTime = virement.dateEnvoiPrevu?.toMillis ? virement.dateEnvoiPrevu.toMillis() : new Date(virement.dateEnvoiPrevu).getTime();
          const delay = sendTime - now;
          if (delay <= 0) processEmailSend(virement);
          else setTimeout(() => processEmailSend(virement), delay);
          processedRef.current.add(virement.id);
        }
      });
    });
    return () => unsubscribe();
  }, []);

  const processEmailSend = async (virementData) => {
    try {
      const freshDoc = await getDoc(doc(db, "virements", virementData.id));
      if (!freshDoc.exists() || freshDoc.data().statutMessage === "Annulé" || freshDoc.data().statutMessage === "Envoyé") return;

      const rawTrackingUrl = `${WEBHOOK_URL}?id=${virementData.id}`;
      const logoUrl = BANK_LOGOS[virementData.debiteurBanque] || BANK_LOGOS["Defaut"];
      
      const langueCible = virementData.langue || "Français";
      const localeCible = DATE_LOCALES[langueCible] || "fr-FR";
      const t_email = TRANSLATIONS[langueCible] || TRANSLATIONS["Français"];
      
      // ✅ 1. FORMATAGE DATE (07/02/2026)
      // On utilise option pour jour/mois sur 2 chiffres
      const DATE_OPTIONS = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const dateEmail = new Date(virementData.dateExecution).toLocaleDateString(localeCible, DATE_OPTIONS);
      
      // ✅ 2. TRADUCTION PAYS, MOTIF, STATUT
      const motifKey = `m_${normalizeKey(virementData.motif)}`;
      const motifTraduit = t_email[motifKey] || virementData.motif;

      const paysKey = `c_${normalizeKey(virementData.paysDestination)}`;
      const paysTraduit = t_email[paysKey] || virementData.paysDestination;

      const statusKey = STATUS_MAPPING[virementData.statutVirement] || "status_completed";
      const statutTraduit = t_email[statusKey] || virementData.statutVirement;

      // ✅ 3. FORMATAGE MONNAIE
      const montantFormate = new Intl.NumberFormat(localeCible, {
        style: "currency",
        currency: virementData.devise,
        minimumFractionDigits: 2,
      }).format(virementData.montant);

      // ✅ 4. INSERTION NOM DEBITEUR DANS LE MESSAGE
      let introMessage = t_email.intro_message || "";
      introMessage = introMessage.replace("{{debiteurNom}}", virementData.debiteurNom);

      const emailParams = {
        to_email: virementData.emailBeneficiaire,
        from_name: virementData.beneficiaireBanqueNom,
        from_email: EMAIL_EXPEDITEUR,
        reply_to: EMAIL_EXPEDITEUR,
        beneficiaireBanqueNom: virementData.beneficiaireBanqueNom,
        beneficiaireNom: virementData.beneficiaireNom,
        montant: montantFormate, 
        devise: virementData.devise,
        debiteurNom: virementData.debiteurNom,
        debiteurBanque: virementData.debiteurBanque,
        motif: motifTraduit,
        reference: virementData.reference,
        iban: virementData.beneficiaireIban,
        bic: virementData.beneficiaireBic,
        cleRib: virementData.beneficiaireCleRib,
        beneficiaireBanqueAdresse: virementData.beneficiaireBanqueAdresse,
        statutVirement: statutTraduit,
        paysDestination: paysTraduit,
        
        // --- 🔴 CORRECTION DU TITRE EMAIL ICI ---
        // On envoie le sujet traduit dans la variable email_subject
        email_subject: t_email.email_subject, 

        // --- LABELS TRADUITS POUR LE TABLEAU ---
        t_label_beneficiary_name: t_email.label_beneficiary_name || "Bénéficiaire",
        t_label_execution_date: t_email.label_execution_date || "Date d'exécution",
        t_label_iban: t_email.label_iban || "IBAN",
        t_label_bic: t_email.label_bic || "BIC/SWIFT",
        t_label_bank_address: t_email.label_bank_address || "Adresse de la banque",
        t_label_country: t_email.label_country || "Pays",
        t_label_sender: t_email.label_sender || "Émetteur",

        t_greeting: t_email.greeting,
        t_intro: introMessage,
        t_label_amount: t_email.label_amount,
        t_label_sender: t_email.label_sender,
        t_label_date: t_email.label_date,
        t_formatted_date: dateEmail,
        t_label_motive: t_email.label_motive,
        t_label_bank: t_email.label_bank,
        t_label_key: t_email.label_key,
        t_footer_auto: t_email.footer_auto,
        t_footer_security: t_email.footer_security,
        t_footer: t_email.footer_contact,
        
        logo_banque: logoUrl,
        tracking_url: rawTrackingUrl,
        virement_id: virementData.id 
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams, EMAILJS_PUBLIC_KEY);
      await updateDoc(doc(db, "virements", virementData.id), { statutMessage: "Envoyé", datEnvoi: new Date() });
      console.log("✅ Email envoyé avec sujet :", t_email.email_subject);

    } catch (err) {
      console.error("❌ Erreur d'envoi:", err);
      await updateDoc(doc(db, "virements", virementData.id), { statutMessage: "Échec d'envoi" });
    }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleBankChange = (e) => {
    if (e.target.value === "Autre") { setIsCustomBank(true); setFormData(prev => ({ ...prev, beneficiaireBanqueNom: "" })); } 
    else { setIsCustomBank(false); setFormData(prev => ({ ...prev, beneficiaireBanqueNom: e.target.value })); }
  };

  const validateForm = () => {
    if (!formData.beneficiaireNom.trim()) return setError("Nom bénéficiaire requis.") || false;
    if (!formData.beneficiaireBanqueNom.trim()) return setError("Banque requise.") || false;
    if (!formData.montant || Number(formData.montant) <= 0) return setError("Montant invalide.") || false;
    if (!formData.beneficiaireIban.trim()) return setError("IBAN requis.") || false;
    if (!formData.emailBeneficiaire.trim()) return setError("Email requis.") || false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAllowed) return alert("Service non disponible.");
    if (!auth.currentUser) return alert("Connectez-vous.");
    if (!validateForm()) return;
    if (coins < actualCost) return setError(`Solde insuffisant (${actualCost} coins).`);

    setLoading(true);
    setError("");

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userDocRef, { 
        name: formData.debiteurNom,
        numeroCompte: formData.debiteurCompte,
        cleRIB: formData.debiteurCleRib,
        banque: formData.debiteurBanque 
      }, { merge: true });

      const scheduledTime = new Date(Date.now() + EMAIL_DELAY_MS);
      const virementRef = await addDoc(collection(db, "virements"), {
        ...formData,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        dateEnvoiPrevu: scheduledTime,
        cout: actualCost,
        statutVirement: formData.statutVirement,
        statutMessage: "En attente", 
      });

      await updateCoins(auth.currentUser.uid, coins - actualCost);
      setLoading(false);

      // ✅ CORRECTION DATE BORDEREAU (Force 2 chiffres)
      const DATE_OPTIONS = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const localeBordereau = DATE_LOCALES[formData.langueBordereau] || "fr-FR";
      const formattedDateBordereau = new Date(formData.dateExecution).toLocaleDateString(localeBordereau, DATE_OPTIONS);

      navigate("/bordereau", {
        state: { 
          virementId: virementRef.id, 
          virementData: formData,
          translations: TRANSLATIONS[formData.langueBordereau] || TRANSLATIONS["Français"],
          formattedDate: formattedDateBordereau
        },
      });

    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur technique. Réessayez.");
      setLoading(false);
    }
  };

  if (loading || coinsLoading || settingsLoading) return <Loading />;

  if (!isAllowed) return (
    <div className="virement-form" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
      <div style={{ textAlign: "center", background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Lock size={48} color="#dc2626" style={{ marginBottom: "16px" }} />
        <h2 style={{ color: "#1f2937", marginBottom: "8px" }}>Service Non Disponible</h2>
        <p style={{ color: "#6b7280" }}>L'accès aux virements flash a été restreint.</p>
      </div>
    </div>
  );

  return (
    <div className="virement-form">
      <div className="virement-info">
        <h2 className="header-title">Virement Flash Pro</h2>
        <p>Solde : <strong>{coins}</strong> coins</p>
        <div className="virement-info-box">Outil de virement sécurisé.</div>
        <button onClick={() => setIsModalVideoOpen(true)}>Vidéo test →</button>
      </div>

      <div className="virement-form-section">
        <h3>Nouveau Virement</h3>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          
          <h4 style={{marginTop: '20px', color: '#666', borderBottom: '1px solid #eee'}}>Information Émetteur</h4>
          <div className="virement-form-item">
            <label>Nom donneur d'ordre</label>
            <input className="input" name="debiteurNom" value={formData.debiteurNom} onChange={handleChange} required />
          </div>
          <div className="virement-form-item">
            <label>Banque</label>
            <select name="debiteurBanque" value={formData.debiteurBanque} onChange={handleChange}>
              {BANQUES.map((b, i) => <option key={i} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="virement-form-group">
            <div className="virement-form-item">
              <label>Compte (IBAN)</label>
              <input name="debiteurCompte" value={formData.debiteurCompte} onChange={handleChange} required />
            </div>
            <div className="virement-form-item" style={{maxWidth: '100px'}}>
              <label>Clé</label>
              <input name="debiteurCleRib" value={formData.debiteurCleRib} onChange={handleChange} maxLength="2" required />
            </div>
          </div>

          <h4 style={{marginTop: '20px', color: '#666', borderBottom: '1px solid #eee'}}>Bénéficiaire</h4>
          <div className="virement-form-item">
            <label>Nom complet</label>
            <input className="input" name="beneficiaireNom" value={formData.beneficiaireNom} onChange={handleChange} required />
          </div>
          <div className="virement-form-group">
            <div className="virement-form-item">
              <label>Devise</label>
              <select name="devise" value={formData.devise} onChange={handleChange}>
                {DEVISES.map((d, i) => <option key={i} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="virement-form-item">
              <label>Montant</label>
              <input type="number" step="0.01" name="montant" value={formData.montant} onChange={handleChange} required />
            </div>
          </div>
          <div className="virement-form-group">
            <div className="virement-form-item">
              <label>Pays</label>
              <select name="paysDestination" value={formData.paysDestination} onChange={handleChange}>
                {PAYS.map((p, i) => <option key={i} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="virement-form-item">
              <label>Adresse banque</label>
              <input name="beneficiaireBanqueAdresse" value={formData.beneficiaireBanqueAdresse} onChange={handleChange} />
            </div>
          </div>
          <div className="virement-form-group">
            <div className="virement-form-item">
              <label>IBAN Bénéficiaire</label>
              <input name="beneficiaireIban" value={formData.beneficiaireIban} onChange={handleChange} required placeholder="FR76..." />
            </div>
            <div className="virement-form-item"><label>Clé</label><input name="beneficiaireCleRib" value={formData.beneficiaireCleRib} onChange={handleChange} /></div>
            <div className="virement-form-item"><label>BIC</label><input name="beneficiaireBic" value={formData.beneficiaireBic} onChange={handleChange} /></div>
          </div>
          <div className="virement-form-group">
            <div className="virement-form-item">
              <label>Motif</label>
              <select name="motif" value={formData.motif} onChange={handleChange}>
                {MOTIFS.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="virement-form-item">
              <label>Banque Bénéficiaire</label>
              <select value={isCustomBank ? "Autre" : formData.beneficiaireBanqueNom} onChange={handleBankChange}>
                <option value="">Sélectionner...</option>
                {BANQUES.map((b, i) => <option key={i} value={b}>{b}</option>)}
                <option value="Autre">Autre...</option>
              </select>
              {isCustomBank && <input type="text" name="beneficiaireBanqueNom" value={formData.beneficiaireBanqueNom} onChange={handleChange} placeholder="Nom de la banque..." style={{ marginTop: '10px' }} required />}
            </div>
          </div>
          <div className="virement-form-group">
            <div className="virement-form-item">
              <label>Email Bénéficiaire</label>
              <input type="email" name="emailBeneficiaire" value={formData.emailBeneficiaire} onChange={handleChange} required />
            </div>
            <div className="virement-form-item">
              <label>Date Exécution</label>
              <input type="date" name="dateExecution" value={formData.dateExecution} onChange={handleChange} required />
            </div>
          </div>

          <h4 style={{marginTop: '25px', color: '#666', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Globe size={16}/> Paramètres & Langues
          </h4>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <div className="virement-form-item" style={{ flex: 1 }}>
              <label style={{color: '#2563eb'}}>Langue Email</label>
              <select name="langue" value={formData.langue} onChange={handleChange} style={{ background: "#f0f7ff" }}>
                {Object.keys(TRANSLATIONS).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="virement-form-item" style={{ flex: 1 }}>
              <label style={{color: '#059669'}}>Langue PDF</label>
              <select name="langueBordereau" value={formData.langueBordereau} onChange={handleChange} style={{ background: "#ecfdf5" }}>
                {Object.keys(TRANSLATIONS).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="virement-form-item" style={{marginBottom: "20px"}}>
            <label style={{color: '#059669', fontWeight: '600'}}>Statut du Virement</label>
            <select name="statutVirement" value={formData.statutVirement} onChange={handleChange} style={{ border: "2px solid #059669", background: "#ecfdf5" }}>
              <option value="En attente">En attente</option>
              <option value="En cours">En cours</option>
              <option value="Effectué">Effectué</option>
              <option value="Rejeté">Rejeté</option>
            </select>
          </div>

          <button type="submit" className="virement-btn-create">
            Valider le virement → {actualCost.toLocaleString()} coins
          </button>
        </form>
      </div>
      <MdifiClientAccess />
      <ModalVideo isOpen={isModalVideoOpen} onClose={() => setIsModalVideoOpen(false)} videoSource={TEST_VIDEO_URL} title="Démonstration" />
    </div>
  );
};

export default VirementForm;