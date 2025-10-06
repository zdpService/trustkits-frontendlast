import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { auth, db } from "../../firebase/config"; // Assurez-vous que les chemins sont corrects
import { doc, getDoc, setDoc } from "firebase/firestore";
import Loading from "../laoding/Loading"; // Assurez-vous que le chemin est correct
import "./BordereauVirement.css"; // Votre CSS adapté
import AccountLayout from "../../layout/AccountLayout"; // Assurez-vous que le chemin est correct
import html2pdf from "html2pdf.js";
import imageIgnature from "../../pages/heelo-removebg-preview.png"; // Assurez-vous que le chemin est correct

const BordereauVirement = () => {
  const location = useLocation();
  const [virement, setVirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [virementId, setVirementId] = useState(null);

  const bordereauRef = useRef(null); // Ref pour le conteneur du bordereau pour le PDF

  // Fonctions pour générer des numéros de compte et clés RIB aléatoires
  const generateNumeroCompte = () => {
    return Math.floor(10000000000 + Math.random() * 90000000000).toString();
  };

  const generateCleRIB = () => {
    return Math.floor(10 + Math.random() * 90).toString();
  };

  // Effet pour récupérer et préparer les données du virement
  useEffect(() => {
    const fetchVirementData = async () => {
      setLoading(true);

      const locationState = location.state || {};
      const virementData = locationState.virementData || {};
      setVirementId(locationState.virementId || null);

      let numeroCompte;
      let cleRIB;
      let debiteurNom = virementData.debiteurNom || "";

      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          numeroCompte = userData.numeroCompte || generateNumeroCompte();
          cleRIB = userData.cleRIB || generateCleRIB();

          debiteurNom =
            virementData.debiteurNom ||
            userData.name ||
            (auth.currentUser.displayName &&
            auth.currentUser.displayName.trim() !== ""
              ? auth.currentUser.displayName
              : "Nom Utilisateur");

          // Si les données utilisateur manquent, les sauvegarder dans Firebase
          if (!userData.numeroCompte || !userData.cleRIB || !userData.name) {
            await setDoc(
              userDocRef,
              { numeroCompte, cleRIB, name: debiteurNom },
              { merge: true } // Utiliser merge pour ne pas écraser les autres champs
            );
          }
        } else {
          // Si l'utilisateur n'a pas de document, en créer un
          numeroCompte = generateNumeroCompte();
          cleRIB = generateCleRIB();

          debiteurNom =
            virementData.debiteurNom ||
            (auth.currentUser.displayName &&
            auth.currentUser.displayName.trim() !== ""
              ? auth.currentUser.displayName
              : "Nom Utilisateur");

          await setDoc(userDocRef, {
            name: debiteurNom,
            numeroCompte,
            cleRIB,
          });
        }

        // Finaliser les données du virement
        const finalVirementData = {
          ...virementData, // Garde toutes les données initiales
          debiteurNom,
          debiteurCompte: numeroCompte,
          debiteurCleRib: cleRIB,
        };

        // Mettre à jour l'état `virement` avec toutes les données nécessaires
        setVirement({
          motif: finalVirementData.motif || "Virement bancaire standard",
          debiteurNom: finalVirementData.debiteurNom || "Non spécifié",
          debiteurCompte:
            finalVirementData.debiteurCompte || "FRXX XXXX XXXX XXXX XXXX XXX",
          debiteurCleRib: finalVirementData.debiteurCleRib || "XX",
          montant: finalVirementData.montant || "0.00",
          devise: finalVirementData.devise || "EUR",
          paysDestination: finalVirementData.paysDestination || "France",
          beneficiaireNom:
            finalVirementData.beneficiaireNom || "Nom du bénéficiaire",
          beneficiaireIban:
            finalVirementData.beneficiaireIban ||
            "FRXX XXXX XXXX XXXX XXXX XXX",
          beneficiaireCleRib: finalVirementData.beneficiaireCleRib || "XX",
          beneficiaireBic: finalVirementData.beneficiaireBic || "BICXXXXXXX",
          beneficiaireBanqueNom:
            finalVirementData.beneficiaireBanqueNom || "Nom de la banque",
          beneficiaireBanqueAdresse:
            finalVirementData.beneficiaireBanqueAdresse ||
            "Adresse de la banque du bénéficiaire",
          dateExecution:
            finalVirementData.dateExecution ||
            new Date().toLocaleDateString("fr-FR"), // Format français
          signatureSrc: imageIgnature, // Utilise l'image importée
        });
      }

      setLoading(false);
    };

    fetchVirementData();
  }, [location.state]); // Dépendance à location.state pour recharger si l'état change

  // Gestion du téléchargement PDF
  const handleDownloadPDF = async () => {
    if (!bordereauRef.current) return;

    // Attendre que toutes les images soient chargées avant de générer le PDF
    const images = bordereauRef.current.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve();
            else {
              img.onload = resolve;
              img.onerror = resolve; // Gérer les erreurs de chargement pour ne pas bloquer
            }
          })
      )
    );

    const opt = {
      margin: 0, // Pas de marges par défaut
      filename: `bordereau_virement_${virementId || Date.now()}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 4, // Augmenter l'échelle pour une meilleure qualité d'image
        logging: true,
        dpi: 300,
        letterRendering: true,
        useCORS: true, // Très important pour les images externes comme le logo BNP
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().set(opt).from(bordereauRef.current).save();
  };

  // Afficher un écran de chargement si les données ne sont pas prêtes
  if (loading || !virement) {
    // Vérifie aussi si virement est null
    return <Loading />;
  }

  return (
    <AccountLayout>
      <div className="bordereaux-container">
        {/* Bouton de téléchargement PDF */}
        <button className="download-btn" onClick={handleDownloadPDF}>
          📄 Télécharger PDF
        </button>

        {/* Conteneur principal du bordereau pour le PDF */}
        <main className="section_viremnt" ref={bordereauRef}>
          {" "}
          {/* Lier la ref ici */}
          <section className="bordereau_container">
            {/* Section Titre et Logo */}
            <div className="section_title">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b2/BNP_Paribas.png"
                alt="Logo BNP Paribas"
              />
              <div>
                <h3>BORDEREAU DE VIREMENT</h3>
                <p>
                  ID Virement : <strong>{virementId || "N/A"}</strong>
                </p>
              </div>
            </div>

            <div className="section_order__main">
              {/* Section Virement Ordinaire */}
              <div className="section_order">
                <div className="title">
                  <h5>Virement ordinaire</h5>
                </div>
                <div className="section_descr">
                  <h6>Pays de destination :</h6>
                  <span className="section_descr-item">
                    {" "}
                    {virement.paysDestination}{" "}
                  </span>
                </div>

                <div className="section_descr_items">
                  <div className="section_descr">
                    <h6>La somme de :</h6>
                    <p className="descr_items">
                      <span className="section_descr-item">
                        {" "}
                        {virement.montant}{" "}
                      </span>
                      <span className="para_desr">
                        {" "}
                        Montant et devise en chiffre
                      </span>
                    </p>
                  </div>
                  <div className="section_descr">
                    <h6>Devise :</h6>
                    <span className="section_descr-item">
                      {" "}
                      {virement.devise}
                    </span>
                  </div>
                </div>
                <div className="section_descr">
                  <h6>Motif du virement :</h6>
                  <span className="section_descr-item"> {virement.motif} </span>
                </div>
              </div>

              {/* Section Donneur d'ordre */}
              <div className="section_order">
                <div className="title">
                  <h5>Donneur d'ordre</h5>
                </div>

                <div className="section_descr_items">
                  <div className="section_descr">
                    <h6>Par le débit du compte :</h6>
                    <p className="descr_items">
                      <span className="section_descr-item">
                        {virement.debiteurCompte}{" "}
                      </span>
                      <span className="para_desr">
                        compte à débiter (Numéro de compte)
                      </span>
                    </p>
                  </div>
                  <div className="section_descr">
                    <p className="descr_items">
                      <span className="section_descr-item">
                        {virement.debiteurCleRib}{" "}
                      </span>
                      <span
                        className="para_desr"
                        style={{ textAlign: "center" }}
                      >
                        Clé RIB
                      </span>
                    </p>
                  </div>
                </div>
                <div className="section_descr">
                  <p className="descr_items">
                    <span className="para_desr" style={{ textAlign: "center" }}>
                      Nom et prénom de la personne ou raison sociale de
                      l'entreprise
                    </span>
                    <span className="section_descr-item">
                      {virement.debiteurNom}{" "}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Section Bénéficiaire */}
            <div className="section_client__main">
              <div className="section_order">
                {" "}
                {/* Cette div reste comme un conteneur stylistique */}
                <div className="title">
                  <h5>Bénéficiaire</h5>
                </div>
                <div className="section_descr">
                  <h6>Au bénéfice de :</h6>
                  <p className="descr_items">
                    <span className="section_descr-item">
                      {virement.beneficiaireNom}
                    </span>
                    <span className="para_desr">
                      {" "}
                      Nom et prénom de la personne ou raison sociale de
                      l'entreprise
                    </span>
                  </p>
                </div>
                <div className="section_client__main-bottom">
                  <h6>
                    Information bancaire{" "}
                    <span className="para_desr">(Bénéficiaire)</span>
                  </h6>
                </div>
                <div className="section_descr_items">
                  <div className="section_descr">
                    <p className="descr_items">
                      <span className="section_descr-item">
                        {virement.beneficiaireIban}
                      </span>
                      <span
                        className="para_desr"
                        style={{ textAlign: "center" }}
                      >
                        Compte à créditer ( Code IBAN ou N° de compte)
                      </span>
                    </p>
                  </div>
                  <div className="section_descr">
                    <p className="descr_items">
                      <span className="section_descr-item">
                        {" "}
                        {virement.beneficiaireCleRib}{" "}
                      </span>
                      <span
                        className="para_desr"
                        style={{ textAlign: "center" }}
                      >
                        Clé RIB
                      </span>
                    </p>
                  </div>
                </div>
                <div className="section_descr">
                  <p className="descr_items">
                    <span className="section_descr-item">
                      {virement.beneficiaireBic}
                    </span>
                    <span className="para_desr" style={{ textAlign: "center" }}>
                      Identifiant de la banque (Code BIC SWIFT ou code banque)
                    </span>
                  </p>
                </div>
                <div className="section_descr">
                  <h6>Banque du bénéficiaire :</h6>
                  <p className="descr_items">
                    <span className="section_descr-item">
                      {" "}
                      {virement.beneficiaireBanqueNom}
                    </span>
                    <span className="para_desr" style={{ textAlign: "center" }}>
                      Nom de la banque du bénéficiaire
                    </span>
                  </p>
                </div>
                <div className="section_descr">
                  <span
                    className="para_desr"
                    style={{ textAlign: "center", fontSize: "11px" }}
                  >
                    Adresse de la banque du bénéficiaire :
                  </span>
                  <p className="descr_items">
                    <span className="section_descr-item">
                      {virement.beneficiaireBanqueAdresse}
                    </span>
                  </p>
                </div>
              </div>{" "}
              {/* Fin de section_order pour Bénéficiaire */}
            </div>

            {/* Section Date d'exécution et Signature */}
            <div className="aivalable_date-container">
              <strong>
                <h6>Date d'exécution:</h6>
                <span>{virement.dateExecution}</span>
              </strong>
              <strong style={{ display: "flex", alignItems: "center" }}>
                <h6>signature donneur d'ordre</h6>
                {virement.signatureSrc ? (
                  <img
                    style={{
                      height: "100px",
                      width: "150px",
                      objectFit: "cover",
                    }}
                    src={virement.signatureSrc}
                    alt="Signature"
                    className="signature-image"
                  />
                ) : (
                  <span className="signature-placeholder">
                    Signature manquante
                  </span>
                )}
              </strong>
            </div>
          </section>
        </main>
      </div>
    </AccountLayout>
  );
};

export default BordereauVirement;
