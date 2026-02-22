import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Loading from "../laoding/Loading";
import "./BordereauVirement.css";
import AccountLayout from "../../layout/AccountLayout";
import html2pdf from "html2pdf.js";
import imageIgnature from "../../pages/heelo-removebg-preview.png";

// Traductions de secours
const DEFAULT_TRANSLATIONS = {
  header_title: "BORDEREAU DE VIREMENT",
  subtitle: "Virement ordinaire",
  country_dest: "Pays de destination",
  amount_sum: "La somme de",
  currency_label: "Devise",
  amount_digits_desc: "Montant et devise en chiffre",
  label_sender: "Donneur d'ordre",
  debit_from: "Par le débit du compte",
  debit_account_desc: "Numéro de compte",
  label_key: "Clé RIB",
  name_desc: "Nom et prénom / Raison sociale",
  beneficiary: "Bénéficiaire",
  beneficiary_label: "Au bénéfice de",
  beneficiary_desc: "Nom du bénéficiaire",
  bank_info: "Information bancaire",
  beneficiary_sub: "(Bénéficiaire)",
  credit_account_desc: "Compte à créditer (IBAN)",
  bic_desc: "Code BIC / SWIFT",
  bank_name_label: "Banque",
  bank_name_desc: "Nom de la banque",
  bank_addr_label: "Adresse de la banque",
  label_date: "Date d'exécution",
  label_motive: "Motif",
  signature: "Signature",
  label_amount: "Montant"
};

const normalizeKey = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[\s'-]/g, "_");
};

// 🔴 Logo par défaut global si aucune URL n'est fournie
const DEFAULT_LOGO_URL = "https://cdn-icons-png.flaticon.com/128/3936/3936759.png";

const BordereauVirement = () => {
  const location = useLocation();
  const [virement, setVirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [virementId, setVirementId] = useState(null);
  const [t, setT] = useState(DEFAULT_TRANSLATIONS);

  const bordereauRef = useRef(null);

  const generateNumeroCompte = () => Math.floor(10000000000 + Math.random() * 90000000000).toString();
  const generateCleRIB = () => Math.floor(10 + Math.random() * 90).toString();

  const formatMontantEuropeen = (montant, devise = "EUR") => {
    if (!montant) return "0,00 €";
    const nombre = parseFloat(montant.toString().replace(",", "."));
    if (isNaN(nombre)) return `${montant} ${devise}`;
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: devise, minimumFractionDigits: 2 }).format(nombre);
  };

  useEffect(() => {
    const fetchVirementData = async () => {
      setLoading(true);
      const locationState = location.state || {};
      const virementData = locationState.virementData || {};
      
      const translations = locationState.translations ? { ...DEFAULT_TRANSLATIONS, ...locationState.translations } : DEFAULT_TRANSLATIONS;
      setT(translations);
      setVirementId(locationState.virementId || null);

      const displayDate = locationState.formattedDate || virementData.dateExecution || new Date().toLocaleDateString();
      const rawPays = virementData.paysDestination || "France";
      const rawMotif = virementData.motif || "Virement";
      const paysTraduit = translations[`c_${normalizeKey(rawPays)}`] || rawPays;
      const motifTraduit = translations[`m_${normalizeKey(rawMotif)}`] || rawMotif;

      let numeroCompte, cleRIB, debiteurNom = virementData.debiteurNom || "";

      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          numeroCompte = userData.numeroCompte || generateNumeroCompte();
          cleRIB = userData.cleRIB || generateCleRIB();
          debiteurNom = virementData.debiteurNom || userData.name || auth.currentUser.displayName || "Client";
          if (!userData.numeroCompte) await setDoc(userDocRef, { numeroCompte, cleRIB, name: debiteurNom }, { merge: true });
        } else {
          numeroCompte = generateNumeroCompte();
          cleRIB = generateCleRIB();
          debiteurNom = virementData.debiteurNom || auth.currentUser.displayName || "Client";
          await setDoc(userDocRef, { name: debiteurNom, numeroCompte, cleRIB });
        }
      }

      setVirement({
        motif: motifTraduit,
        debiteurNom: debiteurNom,
        debiteurCompte: numeroCompte,
        debiteurCleRib: cleRIB,
        montant: virementData.montant || "0.00",
        devise: virementData.devise || "EUR",
        paysDestination: paysTraduit,
        beneficiaireNom: virementData.beneficiaireNom || "",
        beneficiaireIban: virementData.beneficiaireIban || "",
        beneficiaireCleRib: virementData.beneficiaireCleRib || "XX",
        beneficiaireBic: virementData.beneficiaireBic || "",
        beneficiaireBanqueNom: virementData.beneficiaireBanqueNom || "",
        beneficiaireBanqueAdresse: virementData.beneficiaireBanqueAdresse || "",
        dateExecution: displayDate,
        signatureSrc: imageIgnature,
        // 🔴 On récupère l'URL du logo venant du formulaire
        logoBanqueUrl: virementData.logoBanqueUrl || "" 
      });
      setLoading(false);
    };
    fetchVirementData();
  }, [location.state]);

  const handleDownloadPDF = async () => {
    const element = bordereauRef.current;
    if (!element) return;

    // 1. Sauvegarde du style
    const originalStyle = {
      width: element.style.width,
      padding: element.style.padding,
      margin: element.style.margin,
      background: element.style.background,
      transform: element.style.transform,
      maxWidth: element.style.maxWidth
    };

    // 2. CONFIGURATION OPTIMISÉE POUR A4
    // 700px assure que ça rentre dans les marges de 10mm sans être coupé
    element.style.width = '700px'; 
    element.style.maxWidth = 'none';
    element.style.padding = '15px';
    element.style.margin = '0 auto';
    element.style.background = '#ffffff'; 
    element.style.transform = 'none';

    // Chargement des images
    const images = element.querySelectorAll("img");
    await Promise.all(Array.from(images).map(img => new Promise(resolve => {
        if (img.complete) resolve();
        else { img.onload = resolve; img.onerror = resolve; }
    })));

    // 3. Génération PDF
    const opt = {
      margin: [10, 10, 10, 10], 
      filename: `bordereau_${virementId || Date.now()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        scrollY: 0,
        windowWidth: 1200 
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    await html2pdf().set(opt).from(element).save();

    // 4. Restauration
    element.style.width = originalStyle.width;
    element.style.padding = originalStyle.padding;
    element.style.margin = originalStyle.margin;
    element.style.background = originalStyle.background;
    element.style.transform = originalStyle.transform;
    element.style.maxWidth = originalStyle.maxWidth;
  };

  if (loading || !virement) return <Loading />;

  // 🔴 Choix du logo final (Perso OU Défaut)
  const finalLogo = virement.logoBanqueUrl ? virement.logoBanqueUrl : DEFAULT_LOGO_URL;

  return (
    <AccountLayout>
      <div className="bordereaux-container">
        <div className="actions-bar" style={{textAlign: 'center', marginBottom: '20px'}}>
           <button onClick={handleDownloadPDF} className="download-btn">Télécharger en PDF</button>
        </div>

        {/* Wrapper Scrollable pour mobile */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflowX: 'auto' }}>
          <main className="section_viremnt" ref={bordereauRef}>
            <section className="section_items">
              {/* EN-TÊTE */}
              <div className="items_logo">
                <div className="logo">
                  {/* 🔴 Application de l'image dynamique */}
                  <img width="80px" height="80px" src={finalLogo} alt="Logo de la banque" style={{objectFit: 'contain'}} />
                </div>
                <div><h4>{t.header_title}</h4></div>
              </div>

              {/* SECTION 1: VIREMENT */}
              <section className="section_client__main-bottom">
                <div className="main-bottom"><h4>{t.subtitle}</h4></div>
                
                <div className="section_bottom-left">
                  <span className="section_bottom-left-items">{t.country_dest} : </span>
                  <span className="section_bottom-left-item">{virement.paysDestination}</span>
                </div>

                <div className="section_bottom-rigth">
                  <div><span className="section_bottom-left-items">{t.amount_sum} : </span></div>
                  <div className="section_client__items-bottom_nav">
                    <p className="section_bottom-left-item barside">{formatMontantEuropeen(virement.montant, virement.devise)}</p>
                    <span className="describ_bars">{t.amount_digits_desc}</span>
                  </div>
                  <div className="section_bottom-left_nav">
                    <span className="section_bottom-left-items"> {t.currency_label} : </span>
                    <span className="section_bottom-left-item">{virement.devise}</span>
                  </div>
                </div>

                {/* SECTION 2: DONNEUR D'ORDRE */}
                <div className="section_left__orders">
                  <div className="main-bottom"><h4>{t.label_sender}</h4></div>
                  <div className="section_bottom-rigth">
                    <div><span className="section_bottom-left-items">{t.debit_from} :</span></div>
                    <div className="section_client__items-bottom_nav">
                      <p className="section_bottom-left-item barside">{virement.debiteurCompte}</p>
                      <span className="describ_bars">{t.debit_account_desc}</span>
                    </div>
                    <div className="section_bottom-left_nav navFlex">
                      <span className="section_bottom-left-item">{virement.debiteurCleRib}</span>
                      <span className="section_bottom-left-items"> {t.label_key} </span>
                    </div>
                  </div>
                </div>

                <div className="navFlexbox">
                  <span className="describ_bars">{t.name_desc}</span>
                  <span className="section_bottom-left-item fl">{virement.debiteurNom}</span>
                </div>
              </section>

              {/* SECTION 3: BÉNÉFICIAIRE */}
              <section className="section_client__main-bottom">
                <div className="main-bottom"><h4>{t.beneficiary}</h4></div>
                
                <div className="section_bottom-left">
                  <span className="section_bottom-left-items">{t.beneficiary_label} : </span>
                  <div className="section_client__items-bottom_nav para_desrs">
                    <p className="section_bottom-left-item barside">{virement.beneficiaireNom}</p>
                    <span className="describ_bars">{t.beneficiary_desc}</span>
                  </div>
                </div>

                <div className="main-bottom section_title_bottom bordereau_container_items">
                  <h4>{t.bank_info}</h4>
                  <span>{t.beneficiary_sub}</span>
                </div>

                <div className="bottom__items_nav">
                  <div className="section_client__items-bottom_nav it">
                    <p className="section_bottom-left-item barside">{virement.beneficiaireIban}</p>
                    <span className="describ_bars">{t.credit_account_desc}</span>
                  </div>
                  <div><span className="section_bottom-left-item">{virement.beneficiaireCleRib}</span></div>
                </div>

                <div className="section_client__items-bottom_nav it">
                  <p className="section_bottom-left-item barside">{virement.beneficiaireBic}</p>
                  <span className="describ_bars">{t.bic_desc}</span>
                </div>

                <div className="section_bottom-left">
                  <span className="section_bottom-left-items">{t.bank_name_label} :</span>
                  <div className="section_client__items-bottom_nav para_desrs">
                    <p className="section_bottom-left-item barside">{virement.beneficiaireBanqueNom}</p>
                    <span className="describ_bars">{t.bank_name_desc}</span>
                  </div>
                </div>

                <div className="section_bottom-left">
                  <span className="section_bottom-left-items">{t.bank_addr_label} :</span>
                  <div className="section_client__items-bottom_nav para_desrs">
                    <p className="section_bottom-left-item barside">{virement.beneficiaireBanqueAdresse}</p>
                  </div>
                </div>
              </section>

              {/* PIED DE PAGE */}
              <div className="date__section-items">
                <div>{t.label_date} :</div>
                <div>{virement.dateExecution}</div>
              </div>
               <div className="date__section-items">
                <div>{t.label_motive} :</div>
                <div>{virement.motif}</div>
              </div>
              <div className="date__section-items">
                <div>{t.signature} :</div>
                {virement.signatureSrc ? <img src={virement.signatureSrc} alt="Signature" /> : <span>Signature manquante</span>}
              </div>
            </section>
          </main>
        </div>
      </div>
    </AccountLayout>
  );
};
export default BordereauVirement;