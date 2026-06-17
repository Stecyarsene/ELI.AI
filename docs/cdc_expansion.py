# -*- coding: utf-8 -*-
"""cdc_expansion.py — CDC Expansion internationale d'Eli (Afrique francophone).
Document strategique original. Notation cp1252. Moteur de marque (logo + devise)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from elidoc import build_document  # noqa: E402

TITLE = "CDC - Expansion internationale"
SUBTITLE = "Strategie de conquete du marche educatif francophone d'Afrique<br/>Du Gabon vers un modele multi-pays"
BRAND_SUB = "CDC - Expansion internationale"
INTRO = ("Document strategique decrivant comment Eli, ne au Gabon, peut s'etendre a l'espace francophone "
         "africain. Il fixe les criteres de choix des pays, la methode d'adaptation par curriculum "
         "national, le modele economique, les partenariats et la feuille de route. Les chiffres precis "
         "sont a confirmer pays par pays ; ce document pose la methode et les priorites.")

S = []

S.append({"h": "Resume executif", "blocks": [
    "Eli a construit au Gabon une plateforme bi-programme (national et AEFE) qui combine tutorat IA, "
    "cours originaux, annales, suivi, paiement mobile money et fonctionnement hors ligne (Mode Bougie). "
    "Ces briques sont directement transposables a d'autres pays francophones d'Afrique, ou les besoins "
    "educatifs sont immenses et les solutions de qualite rares.",
    ("li", "Atout cle : une architecture multi-programme et multi-pays deja pensee (code pays, curriculum par pays)."),
    ("li", "Methode : entrer pays par pays, en respectant strictement le curriculum national local."),
    ("li", "Ambition : devenir la reference du soutien scolaire IA en Afrique francophone."),
    ("quote", "L'intelligence au service de ta reussite, partout ou le francais s'enseigne."),
]})

S.append({"h": "Vision de l'expansion", "blocks": [
    "L'expansion n'est pas une duplication : c'est une adaptation respectueuse. Chaque pays a son "
    "systeme, ses examens, sa culture. Eli s'y insere comme un appui local, jamais comme un produit "
    "importe tel quel.",
    ("h2", "Principes directeurs"),
    ("li", "Respect du curriculum national : Eli enseigne le programme officiel du pays, pas un programme generique."),
    ("li", "Ancrage culturel : exemples, references et langue de proximite adaptes au pays."),
    ("li", "Accessibilite : prix et technologie penses pour le pouvoir d'achat et les reseaux locaux."),
    ("li", "Partenariat : avancer avec les acteurs educatifs locaux, pas contre eux."),
]})

S.append({"h": "Pourquoi l'Afrique francophone", "blocks": [
    "L'espace francophone africain reunit plusieurs facteurs favorables a une EdTech comme Eli.",
    ("li", "Une population jeune et nombreuse, avec une forte demande d'education et de reussite aux examens."),
    ("li", "Des systemes educatifs largement inspires du modele francais (CEP, BEPC, Baccalaureat), "
           "ce qui facilite la reutilisation de la structure d'Eli."),
    ("li", "Une penetration rapide du mobile et du mobile money, socle du paiement et de l'acces."),
    ("li", "Un deficit d'accompagnement scolaire de qualite, surtout hors des grandes villes."),
    ("li", "L'usage massif de WhatsApp comme canal de communication quotidien."),
    "Eli repond a ces realites : faible consommation de donnees, paiement mobile, presence sur WhatsApp, "
    "fonctionnement hors ligne.",
]})

S.append({"h": "Le modele Eli, atout pour l'expansion", "blocks": [
    ("kv", [
        ("Multi-programme", "Architecture deja capable de gerer plusieurs programmes en parallele."),
        ("Code pays", "Les donnees portent un code pays, permettant le cloisonnement par territoire."),
        ("Mobile money", "Paiement par USSD sans redirection, adaptable aux operateurs locaux."),
        ("Mode Bougie", "Fonctionnement sobre et hors ligne, decisif en zones mal desservies."),
        ("WhatsApp", "Onboarding et marketing cross-canal sur le reseau le plus utilise."),
        ("Contenus", "Methode de production de cours originaux reutilisable pour tout curriculum."),
    ]),
    "L'essentiel de la plateforme est mutualise ; seul le contenu curriculaire et la configuration locale "
    "changent d'un pays a l'autre.",
]})

S.append({"h": "Criteres de selection des pays cibles", "blocks": [
    "Le choix des pays suit une grille de criteres ponderes :",
    ("li", "Taille et jeunesse de la population scolarisee."),
    ("li", "Proximite du curriculum avec le modele deja outille (examens de type CEP/BEPC/Bac)."),
    ("li", "Penetration du mobile money et des smartphones."),
    ("li", "Usage de WhatsApp et qualite/cout de la connexion."),
    ("li", "Stabilite et environnement reglementaire (donnees, paiement, education)."),
    ("li", "Presence d'un reseau AEFE (effet de levier : on sert deja ce programme)."),
    ("li", "Concurrence locale et cout d'acquisition."),
    "Chaque pays recoit un score ; on entre d'abord la ou le rapport impact/effort est le meilleur.",
]})

S.append({"h": "Pays cibles - vague 1 (priorite haute)", "blocks": [
    "Marches importants, curriculum proche, forte demande, mobile money mature :",
    ("kv", [
        ("Cameroun", "Grand marche francophone, systeme proche, double sous-systeme a considerer ; forte demande de soutien."),
        ("Cote d'Ivoire", "Economie dynamique, mobile money tres repandu, demande urbaine forte."),
        ("Senegal", "Bonne connectivite relative, ecosysteme mobile money solide, culture d'examen forte."),
    ]),
    "Ces trois pays offrent un volume important et une adaptation curriculaire raisonnable a partir de "
    "l'existant. Ils servent de tete de pont regionale (Afrique centrale et de l'Ouest).",
]})

S.append({"h": "Pays cibles - vague 2 (priorite moyenne)", "blocks": [
    ("kv", [
        ("RD Congo", "Population tres nombreuse ; defis de connectivite mais potentiel majeur a moyen terme."),
        ("Benin / Togo", "Marches de taille moyenne, curriculum proche, bons relais regionaux."),
        ("Burkina Faso / Mali / Guinee", "Forte demande, contraintes d'infrastructure ou de contexte a evaluer."),
        ("Congo-Brazzaville", "Proximite et continuite naturelle avec le Gabon (Afrique centrale)."),
    ]),
    "Vague a engager apres validation du modele sur la vague 1, en capitalisant sur les contenus communs.",
]})

S.append({"h": "Pays cibles - vague 3 et reseau AEFE", "blocks": [
    ("li", "Tchad, Niger, Madagascar, Centrafrique : a evaluer selon stabilite et infrastructure."),
    ("li", "Maghreb (Maroc, Tunisie) : surtout via le reseau AEFE deja servi, comme relais francophone."),
    ("li", "Diaspora francophone : familles suivant le programme francais a l'etranger."),
    "Le programme AEFE constitue un levier transversal : il est identique d'un pays a l'autre et permet "
    "d'entrer par les lycees francais avant d'adresser le programme national local.",
]})

S.append({"h": "Adaptation par curriculum national (coeur du projet)", "blocks": [
    "C'est le point critique de l'expansion. Eli doit enseigner LE programme du pays, pas un programme "
    "approximatif. La demarche d'integration d'un nouveau pays :",
    ("li", "1) Recueillir le curriculum officiel (niveaux, series, matieres, attendus, examens)."),
    ("li", "2) Le modeliser dans la base (curriculum par pays et par classe, code pays)."),
    ("li", "3) Produire ou adapter les cours originaux au format Eli, valides par des enseignants locaux."),
    ("li", "4) Integrer les annales des examens nationaux du pays."),
    ("li", "5) Calibrer le tuteur (ton, exemples, references) au contexte local."),
    ("li", "6) Tester avec un groupe pilote d'eleves et d'enseignants avant ouverture large."),
    "La structure technique est commune ; ce sont les contenus et la configuration qui se declinent.",
]})

S.append({"h": "Architecture multi-pays", "blocks": [
    ("kv", [
        ("Code pays", "Chaque profil, contenu et evenement porte un code pays ; les donnees sont cloisonnees."),
        ("Curriculum par pays", "Le referentiel (classes, series, matieres) est parametre par pays."),
        ("Contenus", "Bibliotheque de cours indexee par pays / programme / niveau / serie."),
        ("Paiement", "Connecteurs mobile money par operateur et par pays."),
        ("Configuration", "Langue de proximite, devise, numeros, canaux, par pays."),
    ]),
    "L'ouverture d'un pays devient une operation de configuration et de contenu, sans reecrire le coeur "
    "de la plateforme. C'est la cle d'une expansion rapide et maitrisee.",
]})

S.append({"h": "Localisation et langues", "blocks": [
    ("li", "Le francais reste la langue d'enseignement, conformement aux systemes vises."),
    ("li", "Les exemples et references sont adaptes au pays (monnaie, lieux, situations du quotidien)."),
    ("li", "Prise en compte respectueuse des langues nationales et du contexte culturel."),
    ("li", "Adaptation du vocabulaire scolaire local (intitules d'examens, denominations de classes)."),
    "La localisation n'est pas que linguistique : c'est une mise en resonance avec le vecu des eleves.",
]})

S.append({"h": "Go-to-market par pays", "blocks": [
    "Sequence type pour l'ouverture d'un pays :",
    ("li", "1) Etude express : curriculum, operateurs mobile money, reglementation, concurrence."),
    ("li", "2) Partenariats d'amorcage (ecoles pilotes, enseignants, eventuel operateur telecom)."),
    ("li", "3) Production des contenus prioritaires (classes d'examen d'abord) et integration des annales."),
    ("li", "4) Pilote restreint, mesure des resultats, iterations."),
    ("li", "5) Lancement public avec campagne WhatsApp et bouche-a-oreille."),
    ("li", "6) Montee en charge progressive (autres niveaux, autres regions)."),
    "On vise d'abord les classes d'examen (forte motivation a payer) avant d'elargir aux autres niveaux.",
]})

S.append({"h": "Modele economique adapte", "blocks": [
    ("li", "Tarifs calibres sur le pouvoir d'achat local, abonnement mensuel accessible."),
    ("li", "Paiement par mobile money de l'operateur dominant dans le pays."),
    ("li", "Offre d'essai (decouverte du tuteur) pour lever le frein a l'inscription."),
    ("li", "Premium enseignant au meme tarif que les eleves, comme au Gabon."),
    ("li", "Pistes B2B2C : etablissements, collectivites, operateurs telecom (forfaits data + Eli)."),
    "L'accessibilite prix est strategique : mieux vaut un grand nombre d'abonnements abordables qu'un "
    "petit nombre cher. Le volume sert la mission d'equite.",
]})

S.append({"h": "Partenariats strategiques", "blocks": [
    ("kv", [
        ("Etablissements", "Ecoles et lycees (dont reseau AEFE) comme points d'entree et de credibilite."),
        ("Enseignants", "Producteurs et validateurs de contenu, prescripteurs aupres des familles."),
        ("Operateurs telecom", "Mobile money, forfaits data dedies, distribution."),
        ("Ministeres / institutions", "Alignement curriculaire, legitimite, acces a l'echelle."),
        ("ONG et bailleurs", "Programmes d'equite educative, financement de l'acces en zones fragiles."),
    ]),
    "Les partenariats reduisent le cout d'acquisition et ancrent Eli dans l'ecosysteme local.",
]})

S.append({"h": "Acquisition et croissance", "blocks": [
    ("li", "WhatsApp comme canal central : onboarding, rappels, bouche-a-oreille."),
    ("li", "Marketing cross-canal : invitations a continuer sur l'app/WhatsApp, felicitations d'inscription."),
    ("li", "Programmes de parrainage entre eleves et entre familles."),
    ("li", "Preuve par les resultats : mettre en avant les progressions reelles (statuts, examens)."),
    "Le meilleur moteur de croissance reste un eleve qui progresse : il en parle autour de lui.",
]})

S.append({"h": "Mode Bougie et contextes a faible infrastructure", "blocks": [
    ("li", "Contenus essentiels telechargeables et consultables hors ligne."),
    ("li", "Interface tres legere, faible consommation de donnees."),
    ("li", "Reprise sans perte des que la connexion revient."),
    "Dans de nombreux pays cibles, l'electricite et la connexion sont intermittentes : le Mode Bougie "
    "n'est pas un detail, c'est un avantage concurrentiel decisif.",
]})

S.append({"h": "Conformite, donnees et reglementation", "blocks": [
    ("li", "Respect des reglementations locales sur les donnees personnelles, surtout des mineurs."),
    ("li", "Cloisonnement des donnees par pays (code pays) et minimisation des donnees collectees.",),
    ("li", "Consentement parental et transparence (espace parent) adaptes au cadre local."),
    ("li", "Conformite aux regles locales de paiement et de fiscalite."),
    "La conformite se traite pays par pays, en amont de chaque ouverture, comme un prerequis et non comme "
    "une formalite a posteriori.",
]})

S.append({"h": "Organisation et equipe", "blocks": [
    ("li", "Un noyau produit/tech central, mutualise pour tous les pays."),
    ("li", "Des relais locaux : referents pedagogiques (validation des contenus) et partenaires terrain."),
    ("li", "Un reseau d'enseignants contributeurs par pays."),
    ("li", "Un support client de proximite (langue, fuseau, canaux locaux)."),
    "Le modele combine une plateforme centralisee et une presence locale legere mais reelle.",
]})

S.append({"h": "Risques et parades", "blocks": [
    ("kv", [
        ("Adaptation curriculaire", "Risque d'imprecision -> validation systematique par des enseignants locaux."),
        ("Infrastructure", "Connexion/electricite -> Mode Bougie et contenus hors ligne."),
        ("Paiement", "Fragmentation des operateurs -> connecteurs modulaires par pays."),
        ("Reglementation", "Variabilite -> revue de conformite avant chaque ouverture."),
        ("Concurrence", "Acteurs locaux -> differenciation par la qualite, le suivi et le Mode Bougie."),
        ("Qualite a l'echelle", "Volume de contenu -> production par lots et gouvernance editoriale stricte."),
    ]),
]})

S.append({"h": "Indicateurs et jalons", "blocks": [
    ("li", "Par pays : eleves actifs, taux de reussite, conversion, retention, canaux d'usage."),
    ("li", "Couverture curriculaire : part des niveaux/series couverts par des cours valides."),
    ("li", "Sante du modele : cout d'acquisition, valeur par abonne, marge par pays."),
    "Un pays n'est considere comme 'valide' qu'apres des indicateurs de progression et de retention "
    "satisfaisants sur un pilote, avant d'investir dans la montee en charge.",
]})

S.append({"h": "Feuille de route (3 ans, indicative)", "blocks": [
    ("kv", [
        ("Annee 1", "Consolidation Gabon + ouverture vague 1 (1 a 2 pays pilotes), contenus classes d'examen."),
        ("Annee 2", "Generalisation vague 1, lancement vague 2, elargissement des niveaux et des contenus."),
        ("Annee 3", "Vague 3 et consolidation regionale, partenariats institutionnels, effet de reseau."),
    ]),
    "La sequence reste adaptable : on accelere la ou les indicateurs sont bons, on temporise ailleurs. "
    "La discipline d'execution (qualite, verification, validation locale) prime sur la vitesse brute.",
]})

S.append({"h": "Annexe : grille d'evaluation pays (modele)", "blocks": [
    "Pour chaque pays candidat, on renseigne une fiche standard :",
    ("kv", [
        ("Demographie scolaire", "Population, taux de scolarisation, jeunesse."),
        ("Curriculum", "Niveaux, series, examens, proximite avec l'existant."),
        ("Technologie", "Penetration mobile, mobile money, qualite/cout data, usage WhatsApp."),
        ("Reglementation", "Donnees personnelles, paiement, education, mineurs."),
        ("Ecosysteme", "Partenaires potentiels, presence AEFE, concurrence."),
        ("Score / decision", "Note ponderee et recommandation (vague 1/2/3 ou non prioritaire)."),
    ]),
    "Cette grille rend les choix d'expansion explicites, comparables et revisables.",
]})

S.append({"h": "Fiche pays - Cameroun", "blocks": [
    ("kv", [
        ("Atouts", "Grand marche francophone, forte demande de soutien, culture de l'examen marquee."),
        ("Curriculum", "Systeme proche du modele francais ; specificite d'un double sous-systeme a prendre en compte."),
        ("Technologie", "Mobile money repandu ; WhatsApp omnipresent ; connectivite variable hors villes."),
        ("Strategie d'entree", "Classes d'examen d'abord (BEPC, Bac), ecoles pilotes urbaines, relais WhatsApp."),
        ("Points d'attention", "Bien gerer les specificites du systeme et la diversite regionale."),
    ]),
    "Le Cameroun est un candidat de tete : volume eleve et structure curriculaire familiere, a condition "
    "d'adapter finement les contenus et de valider avec des enseignants locaux.",
]})

S.append({"h": "Fiche pays - Cote d'Ivoire", "blocks": [
    ("kv", [
        ("Atouts", "Economie dynamique, classe moyenne urbaine en croissance, forte demande educative."),
        ("Curriculum", "Examens de type BEPC/Bac ; bonne proximite avec l'existant."),
        ("Technologie", "Mobile money tres mature, ecosysteme de paiement avance, WhatsApp dominant."),
        ("Strategie d'entree", "Abidjan et grandes villes en priorite, partenariats etablissements, offre mobile money locale."),
        ("Points d'attention", "Concurrence urbaine possible -> differenciation par le suivi et la qualite."),
    ]),
    "La maturite du mobile money y rend l'activation du paiement particulierement fluide.",
]})

S.append({"h": "Fiche pays - Senegal", "blocks": [
    ("kv", [
        ("Atouts", "Stabilite, forte valeur accordee a l'education, connectivite relative correcte."),
        ("Curriculum", "Examens nationaux structures ; adaptation raisonnable a partir de l'existant."),
        ("Technologie", "Mobile money solide, usage intensif de WhatsApp."),
        ("Strategie d'entree", "Dakar puis regions, partenariats ecoles et enseignants, campagne WhatsApp."),
        ("Points d'attention", "Prise en compte du contexte multilingue dans les exemples."),
    ]),
    "Le Senegal offre un terrain favorable pour un pilote de reference en Afrique de l'Ouest.",
]})

S.append({"h": "Fiche pays - RD Congo et Afrique centrale", "blocks": [
    ("kv", [
        ("RD Congo", "Population tres nombreuse, potentiel majeur ; infrastructure a contourner par le Mode Bougie."),
        ("Congo-Brazzaville", "Proximite immediate avec le Gabon, continuite naturelle d'expansion."),
        ("Strategie", "Capitaliser sur la proximite regionale et les contenus deja produits en Afrique centrale."),
    ]),
    "L'Afrique centrale prolonge naturellement la base gabonaise ; la RDC est un pari de moyen terme a "
    "fort potentiel.",
]})

S.append({"h": "Fiche pays - Benin, Togo et Afrique de l'Ouest", "blocks": [
    ("kv", [
        ("Benin / Togo", "Marches de taille moyenne, curriculum proche, bons relais regionaux."),
        ("Burkina / Mali / Guinee", "Forte demande ; evaluer infrastructure et contexte avant engagement."),
        ("Strategie", "Mutualiser les contenus d'Afrique de l'Ouest, entrer par les classes d'examen."),
    ]),
]})

S.append({"h": "Strategie de contenu et production par lots", "blocks": [
    "Le contenu est le principal poste d'effort de l'expansion. La methode :",
    ("li", "Mutualiser ce qui est commun (notions scientifiques, methodes) entre pays a curriculum proche."),
    ("li", "Adapter ce qui est specifique (intitules, exemples, attendus d'examen)."),
    ("li", "Prioriser les classes d'examen, puis elargir niveau par niveau."),
    ("li", "Produire par lots, au format Eli, avec validation enseignante locale avant diffusion."),
    ("li", "Constituer une bibliotheque indexee par pays/programme/niveau/serie."),
    "Une grande part des contenus scientifiques est transferable ; l'adaptation porte surtout sur la "
    "forme, les exemples et l'alignement aux examens nationaux.",
]})

S.append({"h": "Financement de l'expansion", "blocks": [
    ("li", "Reinvestissement des revenus d'abonnement des marches matures (Gabon puis vague 1)."),
    ("li", "Partenariats operateurs telecom (forfaits data + Eli) reduisant le cout d'acquisition."),
    ("li", "Financements d'impact (bailleurs, ONG) pour l'acces en zones fragiles."),
    ("li", "Pistes B2B2C : etablissements et collectivites finançant l'acces de leurs eleves."),
    "L'expansion est sequencee pour rester soutenable : on autofinance autant que possible la vague "
    "suivante par les revenus de la precedente.",
]})

S.append({"h": "Concurrence et differenciation", "blocks": [
    "Face aux solutions generiques ou importees, Eli se differencie par :",
    ("li", "Le respect strict du curriculum national de chaque pays."),
    ("li", "Le tutorat IA socratique et le suivi personnalise (statuts, bilans)."),
    ("li", "Le Mode Bougie, decisif en contexte de faible infrastructure."),
    ("li", "L'ancrage local (langue de proximite, exemples, partenariats enseignants)."),
    ("li", "Un prix accessible et un paiement mobile money local."),
    "La differenciation ne se joue pas sur la technologie seule, mais sur la pertinence locale et la "
    "qualite du suivi.",
]})

S.append({"h": "Playbook d'ouverture d'un pays (90 jours)", "blocks": [
    ("h2", "Jours 1 a 30 - Etude et amorcage"),
    ("li", "Recueil du curriculum officiel et des annales ; cartographie des operateurs mobile money."),
    ("li", "Revue de conformite (donnees, paiement, mineurs) ; identification de partenaires pilotes."),
    ("h2", "Jours 31 a 60 - Construction"),
    ("li", "Modelisation du curriculum dans la base (code pays) ; production des contenus classes d'examen."),
    ("li", "Configuration locale (langue de proximite, devise, canaux) ; connecteur de paiement."),
    ("h2", "Jours 61 a 90 - Pilote et lancement"),
    ("li", "Pilote restreint avec ecoles et enseignants ; mesure des resultats ; iterations."),
    ("li", "Lancement public progressif avec campagne WhatsApp et parrainage."),
    "Ce rythme est indicatif : il s'ajuste selon la disponibilite du curriculum et des partenaires.",
]})

S.append({"h": "Marque et communication par region", "blocks": [
    ("li", "Conserver l'identite Eli (logo, devise) tout en adaptant le ton aux references locales."),
    ("li", "Messages centres sur la reussite aux examens nationaux du pays."),
    ("li", "Temoignages et preuves locales (progressions reelles d'eleves) une fois le pilote mene."),
    ("li", "Canaux : WhatsApp en priorite, relais par les ecoles et le bouche-a-oreille."),
    "La promesse reste universelle - l'intelligence au service de ta reussite - mais sa demonstration est "
    "toujours locale.",
]})

S.append({"h": "Reseau d'enseignants contributeurs", "blocks": [
    ("li", "Recruter, par pays, des enseignants pour produire et valider les contenus."),
    ("li", "Les outiller avec l'espace enseignant (generation de materiel, PDF de marque)."),
    ("li", "Les associer comme prescripteurs aupres des familles et des etablissements."),
    ("li", "Reconnaitre et remunerer la contribution (modele premium prof, partenariats)."),
    "Les enseignants locaux sont a la fois gages de qualite curriculaire et puissants relais de croissance.",
]})

S.append({"h": "Technologie a l'echelle multi-pays", "blocks": [
    ("li", "Plateforme unique, donnees cloisonnees par code pays ; configuration par pays."),
    ("li", "Connecteurs de paiement modulaires (un par operateur) actives selon le pays."),
    ("li", "Supervision centralisee : indicateurs par pays dans le centre de commandement."),
    ("li", "Deploiements verifies (typage, tests, build) avant chaque mise en ligne, sans regression."),
    ("li", "Mode Bougie generalise pour absorber l'heterogeneite des reseaux."),
    "Ajouter un pays doit rester une operation de configuration et de contenu, pas une refonte technique.",
]})

S.append({"h": "Synthese des vagues d'expansion", "blocks": [
    ("kv", [
        ("Base", "Gabon (national + AEFE) - modele eprouve, socle de contenus."),
        ("Vague 1", "Cameroun, Cote d'Ivoire, Senegal - volume et proximite curriculaire."),
        ("Vague 2", "RD Congo, Benin, Togo, Congo-Brazzaville, et autres selon evaluation."),
        ("Vague 3", "Tchad, Niger, Madagascar, Maghreb via AEFE, diaspora francophone."),
    ]),
    "Chaque passage a la vague suivante est conditionne par la validation des indicateurs de la vague "
    "precedente. La prudence d'execution protege la qualite et la soutenabilite.",
]})

S.append({"h": "Etude de marche : signaux a collecter", "blocks": [
    "Avant d'engager un pays, on documente des signaux concrets :",
    ("li", "Effectifs scolarises par niveau et calendrier des examens nationaux."),
    ("li", "Part des familles equipees en smartphone et utilisant le mobile money."),
    ("li", "Cout et qualite de la data ; taux de penetration de WhatsApp."),
    ("li", "Offre existante de soutien scolaire (prix, qualite, couverture)."),
    ("li", "Cadre reglementaire (donnees, paiement, education, protection des mineurs)."),
    "Ces signaux alimentent la grille d'evaluation pays et fiabilisent la decision d'entree.",
]})

S.append({"h": "Impact social et mission", "blocks": [
    "L'expansion n'est pas qu'une croissance : c'est l'extension d'une mission d'equite.",
    ("li", "Toucher en priorite les eleves les moins bien servis par l'offre existante."),
    ("li", "Maintenir l'accessibilite prix et le Mode Bougie comme engagements, pas comme options."),
    ("li", "Mesurer l'impact reel (progressions, reussite aux examens), pas seulement l'usage."),
    "La croissance se justifie par le nombre d'eleves reellement aides, pays apres pays.",
]})

S.append({"h": "Scenarios prudent et ambitieux", "blocks": [
    ("kv", [
        ("Prudent", "Un pilote reussi en vague 1, consolidation lente, autofinancement strict avant d'elargir."),
        ("Median", "Vague 1 generalisee en deux ans, vague 2 amorcee, partenariats telecom actifs."),
        ("Ambitieux", "Presence multi-pays rapide via partenariats institutionnels et financements d'impact."),
    ]),
    "Le pilotage par indicateurs permet de naviguer entre ces scenarios sans dogmatisme : on accelere ou "
    "l'on temporise selon les resultats observes.",
]})

S.append({"h": "Annexe : checklist d'ouverture d'un pays", "blocks": [
    ("li", "Curriculum officiel recueilli et modelise (code pays)."),
    ("li", "Annales des examens nationaux integrees."),
    ("li", "Contenus prioritaires (classes d'examen) produits et valides localement."),
    ("li", "Connecteur mobile money de l'operateur dominant active."),
    ("li", "Configuration locale (langue de proximite, devise, canaux, numeros)."),
    ("li", "Revue de conformite (donnees, paiement, mineurs) validee."),
    ("li", "Partenaires pilotes engages (ecoles, enseignants)."),
    ("li", "Pilote mesure et iteré ; indicateurs de progression satisfaisants."),
    ("li", "Plan de lancement WhatsApp et parrainage pret."),
    "Tant que la checklist n'est pas verte, on n'ouvre pas largement : la qualite prime sur la vitesse.",
]})

S.append({"h": "Lecons du modele gabonais", "blocks": [
    "L'expansion s'appuie sur ce qui a fonctionne au Gabon, eprouve avant d'etre dupliquer ailleurs.",
    "D'abord, la centralite du tutorat socratique : les eleves progressent quand on les fait chercher "
    "plutot que lorsqu'on leur donne la reponse. Ce principe est universel et se transpose tel quel.",
    "Ensuite, l'importance du suivi visible : les statuts de couleur et les bilans rendent l'effort "
    "lisible pour l'eleve comme pour le parent, ce qui entretient la motivation et la confiance.",
    "Enfin, l'adaptation au contexte : le Mode Bougie, le paiement mobile money et la presence sur "
    "WhatsApp ne sont pas des details techniques mais des conditions d'acces. Tout pays cible partage, a "
    "des degres divers, ces memes contraintes ; les memes reponses y feront la difference.",
]})

S.append({"h": "Gouvernance et qualite a l'echelle", "blocks": [
    "Grandir vite sans perdre en qualite est le principal defi d'une expansion educative.",
    "La parade est une gouvernance editoriale stricte : chaque contenu, meme reutilise d'un pays a "
    "l'autre, est revu et valide par des enseignants du pays concerne avant diffusion. La structure est "
    "mutualisee, la validation reste locale.",
    "Cote technique, la discipline de verification (typage, tests, anti-mock, build) s'applique a chaque "
    "evolution, quel que soit le pays. Aucune mise en ligne sans chaine de controle complete.",
    "La qualite n'est pas une variable d'ajustement de la croissance : c'est la condition de la confiance "
    "des familles et des institutions, et donc la condition meme de la croissance durable.",
]})

S.append({"h": "Saisonnalite et calendrier des examens", "blocks": [
    "Le calendrier scolaire et les sessions d'examen rythment fortement l'usage et les inscriptions.",
    "La demande de soutien culmine a l'approche des examens nationaux : c'est la fenetre ou la "
    "disposition a s'abonner est la plus forte. Le contenu des classes d'examen doit donc etre pret en "
    "amont de ces periodes dans chaque pays.",
    "Comme les calendriers different d'un pays a l'autre, une presence multi-pays lisse l'activite sur "
    "l'annee : les pics des uns compensent les creux des autres. C'est aussi un argument de resilience "
    "economique pour le modele.",
]})

S.append({"h": "Partenariats institutionnels approfondis", "blocks": [
    "Au-dela des ecoles et des enseignants, des partenariats de plus grande echelle peuvent accelerer "
    "l'adoption et la legitimite d'Eli.",
    "Les operateurs telecom sont des allies naturels : ils maitrisent le mobile money et la distribution, "
    "et peuvent proposer des forfaits combinant data et acces a Eli, levant la barriere du cout.",
    "Les institutions educatives et les collectivites peuvent financer ou faciliter l'acces de leurs "
    "eleves, transformant Eli en service d'interet general. Les bailleurs et ONG, enfin, peuvent soutenir "
    "le deploiement en zones fragiles, la ou l'equite educative est la plus en jeu.",
    "Ces partenariats se nouent dans la duree et exigent de la constance ; ils sont un investissement "
    "strategique, pas un raccourci.",
]})

S.append({"h": "Conclusion", "blocks": [
    "Eli dispose au Gabon d'un modele eprouve et d'une architecture pensee pour le multi-pays. "
    "L'expansion francophone est moins une question de faisabilite technique que de discipline : choisir "
    "les bons pays, adapter fidelement chaque curriculum, nouer les bons partenariats, et tenir la "
    "qualite a l'echelle.",
    ("quote", "Partout ou un eleve apprend en francais, Eli peut etre a ses cotes."),
]})


if __name__ == "__main__":
    out = "/mnt/user-data/outputs/Eli-CDC-Expansion-Internationale.pdf"
    build_document(out, TITLE, SUBTITLE, BRAND_SUB, S, intro=INTRO)
    print("OK ->", out, "| sections:", len(S))
