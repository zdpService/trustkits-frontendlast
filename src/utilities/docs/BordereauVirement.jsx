import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Loading from "../laoding/Loading";
import "./BordereauVirement.css";
import AccountLayout from "../../layout/AccountLayout";
import html2pdf from "html2pdf.js";
import imageIgnature from "../../pages/heelo-removebg-preview.png";

const BordereauVirement = () => {
  const location = useLocation();
  const [virement, setVirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [virementId, setVirementId] = useState(null);

  const bordereauRef = useRef(null);

  const generateNumeroCompte = () => {
    return Math.floor(10000000000 + Math.random() * 90000000000).toString();
  };

  const generateCleRIB = () => {
    return Math.floor(10 + Math.random() * 90).toString();
  };

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

          if (!userData.numeroCompte || !userData.cleRIB || !userData.name) {
            await setDoc(
              userDocRef,
              { numeroCompte, cleRIB, name: debiteurNom },
              { merge: true }
            );
          }
        } else {
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

        const finalVirementData = {
          ...virementData,
          debiteurNom,
          debiteurCompte: numeroCompte,
          debiteurCleRib: cleRIB,
        };

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
            new Date().toLocaleString("fr-FR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
          signatureSrc: imageIgnature,
        });
      }

      setLoading(false);
    };

    fetchVirementData();
  }, [location.state]);

  const handleDownloadPDF = async () => {
    if (!bordereauRef.current) return;

    const images = bordereauRef.current.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve();
            else {
              img.onload = resolve;
              img.onerror = resolve;
            }
          })
      )
    );

    const opt = {
      margin: 0,
      filename: `bordereau_virement_${virementId || Date.now()}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 4,
        logging: true,
        dpi: 300,
        letterRendering: true,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().set(opt).from(bordereauRef.current).save();
  };

  if (loading || !virement) {
    return <Loading />;
  }

  return (
    <AccountLayout>
      <div className="bordereaux-container">
        <button onClick={handleDownloadPDF} className="download-btn">
          Télécharger en PDF
        </button>

        <main className="section_viremnt" ref={bordereauRef}>
          <section className="section_items">
            <div className="items_logo">
              <div className="logo">
                <img
                  width="80px"
                  height="80px"
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b2/BNP_Paribas.png"
                  alt="Logo"
                />
              </div>
              <div>
                <h4>BORDEREAU DE VIREMENT</h4>
              </div>
            </div>

            <section className="section_client__main-bottom">
              <div className="main-bottom">
                <h4>virement ordinaire</h4>
              </div>
              <div className="section_bottom-left">
                <span className="section_bottom-left-items">
                  pays de destination :{" "}
                </span>
                <span className="section_bottom-left-item">
                  {virement.paysDestination}
                </span>
              </div>
              <div className="section_bottom-rigth">
                <div>
                  <span className="section_bottom-left-items">
                    la somme de :{" "}
                  </span>
                </div>
                <div className="section_client__items-bottom_nav">
                  <p className="section_bottom-left-item barside">
                    {virement.montant} {virement.devise}
                  </p>
                  <span className="describ_bars">
                    montant et devise en chiffre
                  </span>
                </div>
                <div className="section_bottom-left_nav">
                  <span className="section_bottom-left-items"> Devise : </span>
                  <span className="section_bottom-left-item">
                    {virement.devise}
                  </span>
                </div>
              </div>
              <div className="section_left__orders">
                <div className="main-bottom">
                  <h4>Donneur d'ordre</h4>
                </div>
                <div className="section_bottom-rigth">
                  <div>
                    <span className="section_bottom-left-items">
                      Par le débit du compte :
                    </span>
                  </div>
                  <div className="section_client__items-bottom_nav">
                    <p className="section_bottom-left-item barside">
                      {virement.debiteurCompte}
                    </p>
                    <span className="describ_bars">
                      Compte à débiter ( Numéro de compte )
                    </span>
                  </div>
                  <div className="section_bottom-left_nav navFlex">
                    <span className="section_bottom-left-item">
                      {virement.debiteurCleRib}
                    </span>
                    <span className="section_bottom-left-items"> Clé RIB </span>
                  </div>
                </div>
              </div>

              <div className="navFlexbox">
                <span className="describ_bars">
                  Nom et prénom de la personne ou raison sociale de l'entreprise
                </span>
                <span className="section_bottom-left-item fl">
                  {virement.debiteurNom}
                </span>
              </div>
            </section>

            <section className="section_client__main-bottom">
              <div className="main-bottom">
                <h4>Bénéficiaire</h4>
              </div>
              <div className="section_bottom-left">
                <span className="section_bottom-left-items">
                  Au bénéfice de :{" "}
                </span>
                <div className="section_client__items-bottom_nav para_desrs">
                  <p className="section_bottom-left-item barside">
                    {virement.beneficiaireNom}
                  </p>
                  <span className="describ_bars">
                    Nom et prénom de la personne ou raison sociale de
                    l'entreprise
                  </span>
                </div>
              </div>
              <div className="main-bottom section_title_bottom bordereau_container_items">
                <h4>Information bancaire</h4>
                <span>(Bénéficiaire)</span>
              </div>
              <div className="bottom__items_nav">
                <div className="section_client__items-bottom_nav it">
                  <p className="section_bottom-left-item barside">
                    {virement.beneficiaireIban}
                  </p>
                  <span className="describ_bars">
                    Compte à créditer ( code IBAN ou n° de compte )
                  </span>
                </div>
                <div>
                  <span className="section_bottom-left-item">
                    {virement.beneficiaireCleRib}
                  </span>
                </div>
              </div>
              <div className="section_client__items-bottom_nav it">
                <p className="section_bottom-left-item barside">
                  {virement.beneficiaireBic}
                </p>
                <span className="describ_bars">
                  Identifiant de la banque du bénéficiaire ( code BIC SWIFT ou
                  banque )
                </span>
              </div>
              <div className="section_bottom-left">
                <span className="section_bottom-left-items">
                  Banque du bénéficiaire :
                </span>
                <div className="section_client__items-bottom_nav para_desrs">
                  <p className="section_bottom-left-item barside">
                    {virement.beneficiaireBanqueNom}
                  </p>
                  <span className="describ_bars">
                    Nom de la banque du bénéficiaire
                  </span>
                </div>
              </div>
              <div className="section_bottom-left">
                <span className="section_bottom-left-items">
                  Adresse de Banque du bénéficiaire:
                </span>
                <div className="section_client__items-bottom_nav para_desrs">
                  <p className="section_bottom-left-item barside">
                    {virement.beneficiaireBanqueAdresse}
                  </p>
                </div>
              </div>
            </section>

            <div className="date__section-items">
              <div>Date d'exécution :</div>
              <div>{virement.dateExecution}</div>
            </div>
            <div className="date__section-items">
              <div>Signature :</div>
              {virement.signatureSrc ? (
                <img src={virement.signatureSrc} alt="Signature" />
              ) : (
                <span>Signature manquante</span>
              )}
            </div>
          </section>
        </main>
      </div>
    </AccountLayout>
  );
};

export default BordereauVirement;
