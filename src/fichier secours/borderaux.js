import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./BordereauVirement.css";

const BordereauVirement = () => {
  const location = useLocation();
  const [virement, setVirement] = useState(null);

  // Générateur numéro compte
  const generateNumeroCompte = () => {
    return Math.floor(10000000000 + Math.random() * 90000000000).toString();
  };

  // Générateur clé RIB
  const generateCleRIB = () => {
    return Math.floor(10 + Math.random() * 90).toString();
  };

  useEffect(() => {
    const fetchVirementData = async () => {
      let virementData = location.state || {};

      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        let numeroCompte;
        let cleRIB;
        let debiteurNom;

        if (userSnap.exists()) {
          const userData = userSnap.data();

          numeroCompte = userData.numeroCompte || generateNumeroCompte();
          cleRIB = userData.cleRIB || generateCleRIB();

          // Récupérer le nom depuis Firestore, sinon depuis Auth
          debiteurNom = userData.name || auth.currentUser.displayName || "";

          // Sauvegarde si absent
          if (!userData.numeroCompte || !userData.cleRIB || !userData.name) {
            await setDoc(
              userDocRef,
              {
                numeroCompte,
                cleRIB,
                name: debiteurNom,
              },
              { merge: true }
            );
          }

          virementData = {
            ...virementData,
            debiteurNom,
            debiteurCompte: numeroCompte,
            debiteurCleRib: cleRIB,
          };
        } else {
          // Utilisateur non trouvé → générer et sauvegarder
          numeroCompte = generateNumeroCompte();
          cleRIB = generateCleRIB();
          debiteurNom = auth.currentUser.displayName || "";

          virementData = {
            ...virementData,
            debiteurNom,
            debiteurCompte: numeroCompte,
            debiteurCleRib: cleRIB,
          };

          await setDoc(userDocRef, {
            name: debiteurNom,
            numeroCompte,
            cleRIB,
          });
        }
      }

      setVirement({
        debiteurNom: virementData.debiteurNom || "",
        debiteurCompte: virementData.debiteurCompte || "12345678901",
        debiteurCleRib: virementData.debiteurCleRib || "88",
        montant: virementData.montant || "",
        devise: virementData.devise || "",
        paysDestination: virementData.paysDestination || "",
        beneficiaireNom: virementData.beneficiaireNom || "",
        beneficiaireIban: virementData.beneficiaireIban || "",
        beneficiaireCleRib: virementData.beneficiaireCleRib || "",
        beneficiaireBic: virementData.beneficiaireBic || "",
        beneficiaireBanqueNom: virementData.beneficiaireBanqueNom || "",
        beneficiaireBanqueAdresse: virementData.beneficiaireBanqueAdresse || "",
        dateExecution: virementData.dateExecution || "",
        signatureSrc:
          virementData.signatureSrc || "https://lefaso.net/IMG/jpg/4-5129.jpg",
      });
    };

    fetchVirementData();
  }, [location.state]);

  if (!virement) return <p>Chargement du bordereau...</p>;

  return (
    <div className="bordereaux-container">
      <div className="bordereau-container">
        {/* HEADER */}
        <header className="bordereau-header">
          <div className="logo-section">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvDYPf8wF-v7MS54Ytp4A7-hK2iCznePmj2Q&s"
              alt="Logo La Banque Postale"
              className="banque-logo"
            />
          </div>
          <div className="title-section">
            <h1>BORDEREAU DE VIREMENT</h1>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="bordereau-main">
          {/* Section Virement ordinaire */}
          <div className="grouped-sections-container">
            <div className="section">
              <h2>Virement ordinaire</h2>
              <div className="subsection">
                <div className="field-group">
                  <span className="label">Pays de destination :</span>
                  <span className="value">{virement.paysDestination}</span>
                </div>
                <div className="field-group">
                  <span className="label">La somme de :</span>
                  <span className="value">{virement.montant},00€</span>
                  <span className="sub-label">
                    Montant et devise en chiffre
                  </span>
                  <span className="label right-align">Devise :</span>
                  <span className="value">{virement.devise}</span>
                </div>
              </div>
            </div>

            <hr className="section-separator" />

            {/* Section Donneur d'ordre */}
            <div className="section">
              <h2>Donneur d'ordre</h2>
              <div className="subsection">
                <div className="field-group">
                  <span className="label">Par le débit du compte :</span>
                  <span className="value">{virement.debiteurCompte}</span>
                  <span className="sub-label">
                    Compte à débiter (Numéro de compte)
                  </span>
                  <span className="value rib">{virement.debiteurCleRib}</span>
                  <span className="sub-label rib">Clé RIB</span>
                </div>
                <div className="field-group">
                  <span className="label">
                    Nom et prénom / raison sociale :
                  </span>
                  <span className="value">{virement.debiteurNom}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Bénéficiaire */}
          <div className="section beneficiary-section">
            <h2>Bénéficiaire</h2>
            <div className="subsection">
              <div className="field-group">
                <span className="label">Au bénéfice de :</span>
                <span className="value">{virement.beneficiaireNom}</span>
                <span className="sub-label">
                  Nom et prénom / raison sociale
                </span>
              </div>

              <h3>Informations bancaires (Bénéficiaire)</h3>
              <div className="field-group">
                <span className="value">{virement.beneficiaireIban}</span>
                <span className="sub-label">Compte à créditer (IBAN)</span>
                <span className="value rib">{virement.beneficiaireCleRib}</span>
                <span className="sub-label rib">Clé RIB</span>
              </div>
              <div className="field-group">
                <span className="value">{virement.beneficiaireBic}</span>
                <span className="sub-label">
                  Identifiant de la banque du bénéficiaire (BIC/SWIFT)
                </span>
              </div>
              <div className="field-group">
                <span className="label">Banque du bénéficiaire :</span>
                <span className="value">{virement.beneficiaireBanqueNom}</span>
              </div>
              <div className="field-group">
                <span className="label">Adresse de la banque :</span>
                <span className="value">
                  {virement.beneficiaireBanqueAdresse}
                </span>
              </div>
            </div>
          </div>

          {/* Date d'exécution */}
          <div className="section">
            <div className="field-group">
              <span className="label">Date d'exécution :</span>
              <span className="value">{virement.dateExecution}</span>
            </div>
          </div>

          {/* Signature */}
          <div className="section signature-section">
            <span className="label">Signature donneur d'ordre :</span>
            <img
              src={virement.signatureSrc}
              alt="Signature"
              className="signature-image"
            />
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bordereau-footer">
          <p>
            La Banque Postale – Société anonyme à Directoire et Conseil de
            Surveillance, au capital de 2 342 454 050 euros
            <br />
            RCS Paris 421 100 645 – Code APE 651C – 34 Avenue de la Fédération
            75115 Paris
          </p>
        </footer>
      </div>
    </div>
  );
};

export default BordereauVirement;
