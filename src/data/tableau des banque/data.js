// src/data/tableau des banque/data.js

// =============================================================================
// 1. DONNÉES STATIQUES (Listes pour les menus déroulants)
// =============================================================================

export const PAYS = [
  "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola", "Antigua-et-Barbuda", 
  "Arabie Saoudite", "Argentine", "Arménie", "Australie", "Autriche", "Azerbaïdjan", "Bahamas", "Bahreïn", 
  "Bangladesh", "Barbade", "Belgique", "Belize", "Bénin", "Bhoutan", "Biélorussie", "Birmanie", "Bolivie", 
  "Bosnie-Herzégovine", "Botswana", "Brésil", "Brunei", "Bulgarie", "Burkina Faso", "Burundi", "Cambodge", 
  "Cameroun", "Canada", "Cap-Vert", "Chili", "Chine", "Chypre", "Colombie", "Comores", "Congo", "Corée du Nord", 
  "Corée du Sud", "Costa Rica", "Croatie", "Cuba", "Danemark", "Djibouti", "Dominique", "Égypte", "Émirats arabes unis", 
  "Équateur", "Érythrée", "Espagne", "Estonie", "États-Unis", "Éthiopie", "Fidji", "Finlande", "France", "Gabon", 
  "Gambie", "Géorgie", "Ghana", "Grèce", "Grenade", "Guatemala", "Guinée", "Guinée-Bissau", "Guinée équatoriale", 
  "Guyana", "Haïti", "Honduras", "Hongrie", "Îles Cook", "Îles Marshall", "Îles Salomon", "Inde", "Indonésie", 
  "Irak", "Iran", "Irlande", "Islande", "Israël", "Italie", "Jamaïque", "Japon", "Jordanie", "Kazakhstan", 
  "Kenya", "Kirghizistan", "Kiribati", "Koweït", "Laos", "Lesotho", "Lettonie", "Liban", "Libéria", "Libye", 
  "Liechtenstein", "Lituanie", "Luxembourg", "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi", "Maldives", 
  "Mali", "Malte", "Maroc", "Maurice", "Mauritanie", "Mexique", "Micronésie", "Moldavie", "Monaco", "Mongolie", 
  "Monténégro", "Mozambique", "Namibie", "Nauru", "Népal", "Nicaragua", "Niger", "Nigéria", "Norvège", 
  "Nouvelle-Zélande", "Oman", "Ouganda", "Ouzbékistan", "Pakistan", "Palaos", "Panama", "Papouasie-Nouvelle-Guinée", 
  "Paraguay", "Pays-Bas", "Pérou", "Philippines", "Pologne", "Portugal", "Qatar", "République centrafricaine", 
  "République démocratique du Congo", "République dominicaine", "République tchèque", "Roumanie", "Royaume-Uni", 
  "Russie", "Rwanda", "Saint-Christophe-et-Niévès", "Saint-Marin", "Saint-Vincent-et-les Grenadines", "Sainte-Lucie", 
  "Salvador", "Samoa", "São Tomé-et-Príncipe", "Sénégal", "Serbie", "Seychelles", "Sierra Leone", "Singapour", 
  "Slovaquie", "Slovénie", "Somalie", "Soudan", "Sri Lanka", "Suède", "Suisse", "Suriname", "Swaziland", "Syrie", 
  "Tadjikistan", "Tanzanie", "Tchad", "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago", 
  "Tunisie", "Turkménistan", "Turquie", "Ukraine", "Uruguay", "Vanuatu", "Vatican", "Venezuela", "Viêt Nam", 
  "Yémen", "Zambie", "Zimbabwe"
];

export const DEVISES = [
  "EUR", "USD", "GBP", "CHF", "CAD", "AUD", "JPY", "CNY", "PLN", "MAD", "XOF", "XAF", "AED", "SAR", "RUB", "INR", "BRL", "ZAR",
  "AFN", "ALL", "DZD", "AOA", "XCD", "ARS", "AMD", "AZN", "BSD", "BHD", "BDT", "BBD", "BZD", "BTN", "BYN", "MMK", 
  "BOB", "BAM", "BWP", "BND", "BGN", "BIF", "KHR", "CVE", "CLP", "COP", "KMF", "KPW", "KRW", "CRC", "HRK", "CUP", 
  "DKK", "DJF", "EGP", "ERN", "ETB", "FJD", "GMD", "GEL", "GHS", "GTQ", "GNF", "GYD", "HTG", "HNL", "HUF", "NZD", 
  "SBD", "IDR", "IQD", "IRR", "ISK", "ILS", "JMD", "JOD", "KZT", "KES", "KGS", "KWD", "LAK", "LSL", "LBP", "LRD", 
  "LYD", "MKD", "MGA", "MYR", "MWK", "MVR", "MUR", "MRU", "MXN", "MDL", "MNT", "MZN", "NAD", "NPR", "NIO", "NGN", 
  "NOK", "OMR", "UGX", "UZS", "PKR", "PAB", "PGK", "PYG", "PEN", "PHP", "QAR", "CDF", "DOP", "CZK", "RON", "RWF", 
  "WST", "STN", "RSD", "SCR", "SLL", "SGD", "SOS", "SDG", "LKR", "SEK", "SRD", "SZL", "SYP", "TJS", "TZS", "THB", 
  "TOP", "TTD", "TND", "TMT", "TRY", "UAH", "UYU", "VUV", "VES", "VND", "YER", "ZMW", "ZWL"
];

export const BANQUES = [
  // --- Principales Banques Françaises ---
  "BNP Paribas", "Société Générale", "Crédit Agricole", "Banque Populaire", "Caisse d'Épargne", 
  "La Banque Postale", "Crédit Mutuel", "LCL", "CIC", "HSBC", "AXA Banque", "Crédit du Nord", "CCF", 
  "Banque de France", "Banque Palatine", "Banque Transatlantique", "Crédit Maritime", "Banque Delubac", 
  "Milleis Banque", "Banque Wormser Frères", "Société Marseillaise de Crédit", "Banque Courtois", 
  "Banque Laydernier", "Banque Nuger", "Banque Rhône-Alpes", "Banque Tarneaud", "Banque Kolb", "Arkéa",

  // --- Banques en Ligne & Fintech ---
  "Boursorama Banque", "Fortuneo", "Hello Bank!", "Monabanq", "Orange Bank", "BforBank", 
  "Ma French Bank", "N26", "Revolut", "Lydia", "Nickel", "Qonto", "Shine", "Blank", "Anytime", 
  "Bunq", "Monese", "Sogexia", "Wise", "Paysera", "Skrill", "PayPal", "Pixpay", "Kard", 
  "Vivid Money", "Curve", "SumUp", "Holvi", "Tomorrow", "Klarna", "Finom", "Manager.one", 
  "PCS", "Vybe", "Aumax",

  // --- Afrique & Maghreb ---
  "Attijariwafa Bank", "Banque Centrale Populaire", "Bank of Africa", "BMCE Bank", "CIH Bank", 
  "Crédit du Maroc", "BIAT", "Amen Bank", "STB", "BNA", "Zitouna Bank", "Ecobank", "Orabank", 
  "Coris Bank", "NSIA Banque", "Banque Atlantique", "BGFI Bank", "UBA", "SIB", "Afriland First Bank", 
  "Rawbank", "Equity Bank", "Zenith Bank", "Access Bank", "Guaranty Trust Bank", "First Bank", "CBA", 
  "KCB Bank", "Standard Bank", "Absa Bank", "Nedbank", "Capitec Bank", "FNB", "CIB", "QNB", 
  "Wafa bank", "CFG Bank", "Barid Bank", "UBCI", "ATB", "BH Bank", "Bridge Bank", "Versus Bank", 
  "Fidelity Bank", "Diamond Bank", "Union Bank",

  // --- Europe (Hors France) ---
  "Deutsche Bank", "Commerzbank", "Sparkasse", "Volksbank", "DZ Bank", "Santander", "BBVA", 
  "CaixaBank", "Banco Sabadell", "Bankinter", "Intesa Sanpaolo", "UniCredit", "Monte dei Paschi", 
  "Banco BPM", "Poste Italiane", "BNP Paribas Fortis", "Belfius", "KBC", "ING", "Argenta", "Crelan", 
  "UBS", "Credit Suisse", "Raiffeisen", "PostFinance", "Migros Bank", "Julius Baer", "Pictet", 
  "Lombard Odier", "Nordea", "Danske Bank", "Swedbank", "SEB", "DNB", "Handelsbanken", 
  "Erste Group", "ABN AMRO", "Rabobank", "Millennium BCP", "Novo Banco", "BPI", "PKO Bank Polski", 
  "Pekao", "mBank", "Santander Bank Polska",

  // --- Royaume-Uni ---
  "Barclays", "Lloyds Bank", "NatWest", "RBS", "Standard Chartered", "Halifax", "Metro Bank", 
  "Monzo", "Starling Bank", "TSB", "Virgin Money", "Nationwide", "Coutts",

  // --- USA & Canada ---
  "JPMorgan Chase", "Bank of America", "Wells Fargo", "Citibank", "Goldman Sachs", "Morgan Stanley", 
  "U.S. Bank", "Capital One", "PNC Bank", "TD Bank", "RBC", "BMO", "Scotiabank", "CIBC", 
  "National Bank", "Desjardins", "Charles Schwab", "American Express", "State Street", 
  "BNY Mellon", "Truist",

  // --- Asie & Moyen-Orient ---
  "MUFG Bank", "SMBC", "Mizuho Bank", "Japan Post Bank", "ICBC", "China Construction Bank", 
  "Agricultural Bank of China", "Bank of China", "DBS Bank", "OCBC Bank", "UOB", "Emirates NBD", 
  "First Abu Dhabi Bank", "ADCB", "Mashreq", "Dubai Islamic Bank", "Al Rajhi Bank", "Saudi National Bank", 
  "Riyad Bank", "HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Bangkok Bank", 
  "Kasikornbank", "SCB", "Maybank", "CIMB", "Public Bank",

  // --- Banque Privée / Gestion de Fortune ---
  "Rothschild & Co", "Lazard", "Edmond de Rothschild", "Oddo BHF", "Neuflize OBC", "Banque Richelieu", 
  "JP Morgan Private Bank"
];

export const MOTIFS = [
  "Facture", "Loyer", "Services", "Achat", "Remboursement", "Salaire", "Donation", "Dons", 
  "Aide familiale", "Investissement", "Voyage", "Prêt personnel", "Frais médicaux", "Frais d’étude", 
  "Achat véhicule", "Frais de réparation", "Cadeau", "Cotisation", "Abonnement", "Autre", 
  "Assurance", "Impôts"
];

export const LANGUES = [
  "Afrikaans", "Albanais", "Allemand", "Amharique", "Anglais", "Arabe", "Arménien", "Azéri", 
  "Basque", "Bengali", "Biélorusse", "Birman", "Bosniaque", "Bulgare", "Catalan", "Cebuano", 
  "Chichewa", "Chinois (simplifié)", "Chinois (traditionnel)", "Cingalais", "Coréen", "Corse", 
  "Créole haïtien", "Croate", "Danois", "Espagnol", "Espéranto", "Estonien", "Français", "Finnois", 
  "Frison", "Gaélique (Écosse)", "Galicien", "Gallois", "Géorgien", "Grec", "Gujarati", "Haoussa", 
  "Hawaïen", "Hébreu", "Hindi", "Hmong", "Hongrois", "Igbo", "Indonésien", "Irlandais", "Islandais", 
  "Italien", "Japonais", "Javanais", "Kannada", "Kazakh", "Khmer", "Kinyarwanda", "Kirghiz", 
  "Kurde", "Laotien", "Latin", "Letton", "Lituanien", "Luxembourgeois", "Macédonien", "Malaisien", 
  "Malayalam", "Malgache", "Maltais", "Maori", "Marathi", "Mongol", "Néerlandais", "Népalais", 
  "Norvégien", "Odia (oriya)", "Ouïgour", "Ouzbek", "Pachtô", "Panjabi", "Persan", "Philippin", 
  "Polonais", "Portugais", "Roumain", "Russe", "Samoan", "Serbe", "Sesotho", "Shona", "Sindhî", 
  "Slovaque", "Slovène", "Somali", "Soundanais", "Suédois", "Swahili", "Tadjik", "Tamoul", "Tatar", 
  "Tchèque", "Telugu", "Thaï", "Turc", "Turkmène", "Ukrainien", "Urdu", "Vietnamien", "Xhosa", 
  "Yiddish", "Yorouba", "Zoulou"
];



const BANK_LOGOS = {
  "Société Générale": "https://upload.wikimedia.org/wikipedia/de/thumb/8/83/Soci%C3%A9t%C3%A9_G%C3%A9n%C3%A9rale_Logo.svg/1200px-Soci%C3%A9t%C3%A9_G%C3%A9n%C3%A9rale_Logo.svg.png",
  "BNP Paribas": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/BNP_Paribas.svg/1200px-BNP_Paribas.svg.png",
  "La Banque Postale": "https://upload.wikimedia.org/wikipedia/fr/thumb/3/33/Logo_La_Banque_Postale_%282006%29.svg/1200px-Logo_La_Banque_Postale_%282006%29.svg.png",
  "Crédit Agricole": "https://upload.wikimedia.org/wikipedia/fr/thumb/a/aa/Logo_Cr%C3%A9dit_Agricole_%282006%29.svg/1200px-Logo_Cr%C3%A9dit_Agricole_%282006%29.svg.png",
  "Defaut": "https://cdn-icons-png.flaticon.com/512/2830/2830284.png" 
};
