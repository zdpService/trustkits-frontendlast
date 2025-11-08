const LOCAL_STORAGE_KEY = "flashClientAccesses";
const DEFAULT_ACCOUNT_STATE = "Flash Compte actif";
const ACCOUNT_CREATION_COST = "10000 Crédits";
const LOGIN_URL = "http://localhost:3000/login";

const loadInitialData = () => {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedData) {
    return JSON.parse(storedData);
  }
  return [
    {
      id: 1,
      lienConnexion: LOGIN_URL,
      dateCreation: "28/09/25 à 15:57 UTC+0",
      etat: DEFAULT_ACCOUNT_STATE,
      details: {
        email: "irinapetrova@myyahoo.com",
        codePin: "071975",
        iban: "FR7630006000011234567890189",
        nom: "PETROVA",
        prenom: "IRINA",
        telephone: "N/A",
        paysResidence: "🇧🇬 Bulgarie",
        adresseResidence: "MARIADORF",
        langueClient: "BG (Code ISO)",
        soldeCompte: 78600.0, // Stocké comme un nombre
        devise: "€",
        messageApresVirement:
          "Erreur de transfert. Votre compte est temporairement bloqué. Un frais unique de déblocage de 7.600€ est requis pour réactiver l’accès complet à vos services.",
        codeActivationVirement: "948BD1AD",
        alertesEmail: "Activé",
      },
    },
    {
      id: 2,
      lienConnexion: LOGIN_URL,
      dateCreation: "09/09/25 à 20:11 UTC+0",
      etat: DEFAULT_ACCOUNT_STATE,
      details: {
        email: "jean.dupont@gmail.com",
        codePin: "123456",
        iban: "DE89370400440532013000",
        nom: "DUPONT",
        prenom: "JEAN",
        telephone: "+33612345678",
        paysResidence: "🇫🇷 France",
        adresseResidence: "PARIS",
        langueClient: "FR (Code ISO)",
        soldeCompte: 5000.0, // Stocké comme un nombre
        devise: "€",
        notification: "Compte en attente de vérification.",
        messageApresVirement:
          "Compte inactif. Veuillez contacter le support pour réactivation.",
        codeActivationVirement: "N/A",
        alertesEmail: "Désactivé",
      },
    },
  ];
};

let accesses = loadInitialData();

const saveAccesses = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(accesses));
};

// Services API
const apiService = {
  getFlashClientAccesses: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...accesses]);
      }, 500);
    });
  },

  createFlashClientAccess: async (clientData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingClient = accesses.find(
          (acc) => acc.details.email === clientData.email
        );
        if (existingClient) {
          return reject({ message: "Un compte avec cet e-mail existe déjà." });
        }

        const newId =
          accesses.length > 0 ? Math.max(...accesses.map((c) => c.id)) + 1 : 1;
        const now = new Date();
        const dateCreation = `${now.getDate().toString().padStart(2, "0")}/${(
          now.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${now.getFullYear().toString().slice(-2)} à ${now
          .getHours()
          .toString()
          .padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")} UTC+0`;

        const newAccess = {
          id: newId,
          lienConnexion: LOGIN_URL,
          dateCreation: dateCreation,
          etat: DEFAULT_ACCOUNT_STATE,
          details: {
            ...clientData,
            codePin: clientData.password, // Mappage du mot de passe en codePin
            soldeCompte: parseFloat(clientData.soldeInitial), // Stocke le solde comme un nombre
            coutCreation: ACCOUNT_CREATION_COST,
            notification:
              clientData.notification || "Accès client créé avec succès.",
          },
        };

        accesses.push(newAccess);
        saveAccesses();

        resolve({
          message: "Accès client créé avec succès !",
          clientId: newId,
          details: {
            lienConnexion: newAccess.lienConnexion,
            codePin: newAccess.details.codePin,
            iban: newAccess.details.iban,
          },
        });
      }, 1000);
    });
  },

  validateFlashClientAccess: async (email, codePin) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundAccess = accesses.find(
          (acc) =>
            acc.details.email === email && acc.details.codePin === codePin
        );
        if (foundAccess) {
          resolve(foundAccess.details);
        } else {
          reject({ message: "E-mail ou PIN incorrect." });
        }
      }, 300);
    });
  },

  // Nouvelle fonction pour mettre à jour un compte existant
  updateFlashClientAccess: async (email, updateData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const accessIndex = accesses.findIndex(
          (acc) => acc.details.email === email
        );

        if (accessIndex === -1) {
          return reject({ message: "Compte non trouvé." });
        }

        const currentAccess = accesses[accessIndex];

        // Met à jour les détails du compte avec les nouvelles données
        const updatedAccess = {
          ...currentAccess,
          details: {
            ...currentAccess.details,
            ...updateData,
          },
        };

        accesses[accessIndex] = updatedAccess;
        saveAccesses();

        resolve({
          message: "Compte mis à jour avec succès.",
          updatedAccount: updatedAccess.details,
        });
      }, 1000); // Délai de 1 seconde pour simuler le traitement
    });
  },

  // Nouvelle fonction pour créditer ou débiter un compte
  transferFunds: async (iban, amount, type = "credit") => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const accountToUpdate = accesses.find(
          (acc) => acc.details.iban === iban
        );

        if (!accountToUpdate) {
          return reject({ message: "IBAN non trouvé." });
        }

        let newBalance = accountToUpdate.details.soldeCompte;

        if (type === "credit") {
          newBalance += amount;
        } else if (type === "debit") {
          newBalance -= amount;
        } else {
          return reject({
            message:
              "Type de transaction non valide. Utilisez 'credit' ou 'debit'.",
          });
        }

        if (newBalance < 0) {
          return reject({ message: "Solde insuffisant." });
        }

        accountToUpdate.details.soldeCompte = newBalance;
        saveAccesses();

        resolve({
          message: `Transaction de ${type} réussie. Nouveau solde : ${newBalance} ${accountToUpdate.details.devise}`,
          newBalance: newBalance,
        });
      }, 1500);
    });
  },
};

export default apiService;
