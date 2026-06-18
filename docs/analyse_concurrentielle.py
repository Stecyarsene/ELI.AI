# -*- coding: utf-8 -*-
"""analyse_concurrentielle.py — Analyse concurrentielle Éli (premium, accents, ~13 pages)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from elidoc import build_document  # noqa: E402

TITLE = "Analyse Concurrentielle"
SUBTITLE = "Paysage & positionnement stratégique"
BRAND_SUB = "Analyse Concurrentielle — Éli"
INTRO = ("Éli — Plateforme éducative à intelligence artificielle. Deux angles : validation au Gabon "
         "& expansion en Afrique francophone (< 1 an).")

S = []

S.append({"h": "Synthèse stratégique", "blocks": [
    "Le marché des applications éducatives à intelligence artificielle est en pleine expansion en Afrique "
    "et en France. Pourtant, aucun acteur ne réunit aujourd'hui la combinaison exacte que propose Éli. "
    "Les concurrents existants possèdent chacun un ou deux des ingrédients d'Éli, jamais l'ensemble.",
    ("callout", "En une phrase",
     "Éli n'a pas de copie directe, mais des « cousins éloignés ». Le modèle (tuteur IA + annales + "
     "programme national) est déjà prouvé en Afrique anglophone et partiellement en France ; le créneau "
     "précis d'Éli — francophone, programme gabonais réel, bi-programme National + AEFE, ancré sur de "
     "vraies annales et pensé pour le contexte local — reste libre. C'est une fenêtre, pas un vide définitif."),
    "Le risque principal n'est pas un concurrent identique, mais (a) un acteur anglophone performant "
    "(type EduMate Africa) qui basculerait vers le français, et (b) des générateurs IA francophones "
    "légers (type Revizly) déjà présents sur la zone, y compris au Gabon. L'avantage défendable d'Éli se "
    "joue donc sur deux leviers : la profondeur du contenu local (que personne d'autre n'a envie de "
    "construire) et la vitesse d'exécution.",
]})

S.append({"h": "Périmètre et méthode", "blocks": [
    "Cette analyse évalue les concurrents au regard des deux angles stratégiques du projet Éli :",
    ("h2", "Angle 1 — Validation au Gabon"),
    "S'imposer comme la référence de l'accompagnement scolaire IA pour les programmes gabonais (CEP, "
    "BEPC, BAC et ses séries A1, A2, B, C, D, E) et le réseau AEFE local.",
    ("h2", "Angle 2 — Expansion en Afrique francophone (< 1 an)"),
    "Répliquer le modèle vers les pays voisins partageant des examens de type BEPC/BAC francophone "
    "(Cameroun, Sénégal, Côte d'Ivoire, Congo, Bénin, Togo, etc.).",
    "Les concurrents sont classés en quatre familles : (A) concurrents directs en Afrique francophone, "
    "(B) tuteurs IA en Afrique anglophone, (C) acteurs du programme français / AEFE, (D) EdTech africaine "
    "générale. Sources : sites officiels des acteurs et recherche web, juin 2026.",
]})

S.append({"h": "Cartographie des concurrents", "blocks": [
    ("h2", "A. Concurrents directs — Afrique francophone"),
    "La famille la plus pertinente pour les deux angles : ces acteurs ciblent les examens francophones africains.",
    ("table",
     ["Acteur", "Pays / portée", "Ce qu'il fait", "Statut"],
     [["Revizly", "Afrique francophone (Cameroun, Sénégal, Côte d'Ivoire, Gabon…)",
       "IA qui génère fiches, QCM et flashcards à partir des cours de l'élève (photo/PDF) ; BAC/BEPC, séries A/C/D", "Gratuit"],
      ["Perform (EDTECH CASE)", "Côte d'Ivoire",
       "Révision CEPE/BEPC/BAC alignée aux programmes nationaux ; annales officielles, corrigés guidés, suivi", "Freemium / partenariats"],
      ["LeChaya", "Comores, Madagascar, Sénégal, Côte d'Ivoire",
       "Banque de 698+ sujets et corrigés BAC/BEPC, exercices par chapitre", "Gratuit"],
      ["epreuvesetcorriges.com", "Multi-pays (dont Gabon)",
       "Bibliothèque d'épreuves et corrigés CEP/BEPC/BAC/CAP/BTS à télécharger", "Gratuit"],
      ["Bac 2026 (app)", "Maghreb + portée francophone",
       "Révision Bac optimisée pour la Tunisie, utilisable ailleurs", "Gratuit / app"]],
     [26 * 1.0, 40, 78, 26]),
    ("h2", "B. Tuteurs IA — Afrique anglophone (menace d'expansion)"),
    "Ces acteurs prouvent que le modèle d'Éli fonctionne. Leur menace : un basculement vers le français.",
    ("table",
     ["Acteur", "Pays", "Modèle", "Menace pour Éli"],
     [["EduMate Africa", "Ghana, Nigeria, Kenya, Afrique du Sud, Ouganda",
       "Tuteur IA + annales alignés aux curricula nationaux (BECE/WASSCE/WAEC), audio, suivi", "Élevée : modèle quasi identique, multi-pays, pourrait passer au français"],
      ["Study AI", "Nigeria", "Prépa IA JAMB/WAEC/NECO, parcours personnalisé, examens blancs", "Moyenne"],
      ["ExamsTutor / TestDriller / LearnLift", "Nigeria", "Tuteurs IA WAEC/JAMB, CBT réaliste, souvent hors-ligne", "Moyenne"],
      ["ExamPrep", "Nigeria", "15 000+ annales JAMB/WAEC avec explications IA, gratuit", "Moyenne"]],
     [34, 40, 60, 36]),
    ("h2", "C. Programme français / AEFE"),
    "Pertinents pour l'interface AEFE d'Éli. Marché mûr, très concurrentiel et largement sous copyright.",
    ("table",
     ["Acteur", "Modèle", "Contenu", "Limite vs Éli"],
     [["Nomad Education", "App de révision, primaire au Bac+3",
       "Cours, fiches, annales conformes aux programmes (400 professeurs), freemium", "Éditorial, pas de tuteur IA ; aucun programme national africain"],
      ["Kartable / SchoolMouv / Maxicours", "Plateformes de révision payantes",
       "Cours, vidéos, exercices ; contenu sous copyright", "France-centré, payant, pas d'Afrique francophone"],
      ["CNED — Académie en ligne", "Service public",
       "Cours officiels gratuits du CP à la Terminale (copyright CNED)", "Statique, non personnalisé, non réutilisable"]],
     [38, 40, 56, 36]),
    ("h2", "D. EdTech africaine générale (contexte)"),
    "Acteurs de l'écosystème, non directement concurrents mais utiles à connaître : Tuteria (Nigeria, "
    "place de marché de professeurs humains), M-Shule (Kenya, apprentissage par SMS et IA), Zonoa (Togo, "
    "app ludique), Obami (Afrique du Sud, plateforme communautaire). La Banque mondiale et l'UNESCO "
    "confirment une forte dynamique IA-éducation en Afrique (sommet de Nairobi, novembre 2025), ce qui "
    "valide le marché mais annonce une concurrence croissante.",
]})

S.append({"h": "Analyse par angle stratégique", "blocks": [
    ("h2", "Angle 1 — Validation au Gabon"),
    "Sur le terrain gabonais, la concurrence frontale est faible. Aucun acteur n'offre un tuteur IA dédié "
    "au programme gabonais. Les seules présences notables :",
    ("li", "Revizly mentionne explicitement le Gabon, mais reste un générateur de fiches à partir du "
           "contenu que l'élève téléverse — sans curriculum gabonais curé, ni banque d'annales officielle, "
           "ni tutorat conversationnel ancré."),
    ("li", "epreuvesetcorriges.com propose des annales gabonaises en téléchargement, mais c'est une "
           "simple bibliothèque, sans IA ni accompagnement."),
    ("callout", "Verdict — Angle 1",
     "Le Gabon est un quasi-espace vierge pour un tuteur IA local. L'avantage d'Éli y est net, à "
     "condition d'arriver vite avec un contenu authentique (annales réelles, séries du BAC) et une "
     "expérience adaptée (hors-ligne, mobile money)."),
    ("h2", "Angle 2 — Expansion en Afrique francophone (< 1 an)"),
    "C'est là que se trouvent les vrais adversaires. Deux profils ressortent :",
    ("li", "Revizly : déjà multi-pays francophone (Cameroun, Sénégal, Côte d'Ivoire, Gabon…), gratuit, "
           "tire parti de l'IA. Le concurrent le plus mobile. Faiblesse : produit léger, générique, sans "
           "ancrage curriculaire profond ni bi-programme."),
    ("li", "Perform (EDTECH CASE) : solide en Côte d'Ivoire, aligné aux programmes nationaux, adossé à "
           "des partenariats institutionnels. Faiblesse : centré sur un pays, tutorat IA peu mis en avant, "
           "pas d'AEFE."),
    "À surveiller : EduMate Africa, qui maîtrise déjà 5 curricula nationaux anglophones. Un ajout du "
    "français en ferait le concurrent le plus dangereux sur l'ensemble du continent.",
    ("callout", "Verdict — Angle 2",
     "L'expansion est disputée mais non verrouillée. Les concurrents francophones sont soit légers "
     "(Revizly), soit mono-pays (Perform). Éli peut gagner en combinant profondeur (vraies annales par "
     "pays) et bi-programme, deux choses qu'aucun ne propose."),
]})

S.append({"h": "Matrice de différenciation", "blocks": [
    "Comparaison d'Éli avec les quatre concurrents les plus représentatifs, sur les critères qui font la "
    "valeur du produit. Légende : Oui = présent, Partiel = partiellement, Non = absent.",
    ("table",
     ["Critère", "Éli", "Revizly", "Perform", "EduMate", "Nomad"],
     [["Tuteur IA conversationnel", "Oui", "Partiel", "Non", "Oui", "Non"],
      ["Programme national gabonais (CEP/BEPC/BAC + séries)", "Oui", "Partiel", "Non", "Non", "Non"],
      ["Bi-programme National + AEFE (français)", "Oui", "Non", "Non", "Non", "Partiel"],
      ["Banque d'annales réelles curée", "Oui", "Non", "Oui", "Oui", "Oui"],
      ["Curriculum propriétaire par notion", "Oui", "Non", "Partiel", "Partiel", "Oui"],
      ["Hors-ligne / faible connexion (Mode Bougie)", "Oui", "Non", "Non", "Partiel", "Non"],
      ["Paiement mobile money (Airtel / Moov)", "Oui", "Non", "Partiel", "Partiel", "Non"],
      ["Langue française", "Oui", "Oui", "Oui", "Non", "Oui"]],
     [62, 22, 22, 22, 22, 20]),
    "Aucun concurrent ne coche l'ensemble des cases : c'est la combinaison qui constitue le fossé d'Éli.",
]})

S.append({"h": "Profils des adversaires clés", "blocks": [
    ("h2", "Revizly — le plus mobile"),
    ("li", "Forces : gratuit, déjà multi-pays francophone (dont le Gabon), génération IA rapide, séduisant pour l'élève pressé."),
    ("li", "Faiblesses : produit générique dépendant du contenu téléversé ; pas de curriculum officiel curé, pas de banque d'annales propre, pas de bi-programme, pas d'expérience locale (offline, paiement)."),
    ("li", "Comment Éli gagne : profondeur curriculaire réelle, vraies annales gabonaises, tutorat conversationnel ancré, adaptation au terrain."),
    ("h2", "Perform (EDTECH CASE) — l'ancré institutionnel"),
    ("li", "Forces : alignement aux programmes nationaux, annales officielles et corrigés, partenariats institutionnels."),
    ("li", "Faiblesses : centré Côte d'Ivoire, tutorat IA peu visible, pas d'offre AEFE."),
    ("li", "Comment Éli gagne : jouer le bi-programme et l'IA conversationnelle ; viser la complémentarité ou la différenciation par l'expérience."),
    ("h2", "EduMate Africa — la menace de demain"),
    ("li", "Forces : modèle quasi identique à Éli, déjà 5 pays, tuteur IA + annales + audio, exécution mature."),
    ("li", "Faiblesses : anglophone, curricula non francophones, aucun ancrage Gabon/AEFE."),
    ("li", "Comment Éli gagne : prendre une longueur d'avance sur le francophone avant un éventuel pivot, et bâtir un contenu local qu'un acteur étranger mettra des mois à reproduire."),
    ("h2", "Nomad Education — le géant éditorial français"),
    ("li", "Forces : immense bibliothèque conforme aux programmes, marque établie, validée par des centaines de professeurs."),
    ("li", "Faiblesses : contenu éditorial statique (pas de tuteur IA conversationnel), aucun programme national africain."),
    ("li", "Comment Éli gagne : sur l'AEFE, l'avantage d'Éli est l'IA conversationnelle personnalisée et le lien avec le programme national ; on ne l'affronte pas frontalement sur le volume éditorial."),
]})

S.append({"h": "Menaces et risques", "blocks": [
    ("li", "Pivot d'un acteur anglophone (EduMate) vers le français : risque le plus structurant à 12-24 mois."),
    ("li", "Banalisation par les générateurs IA légers (Revizly et similaires) : gratuits et rapides, ils peuvent capter les élèves pressés avant qu'Éli ne s'installe."),
    ("li", "Acteurs institutionnels (ministères, CNED, éditeurs) qui lanceraient une offre publique gratuite."),
    ("li", "Pouvoir d'achat et connectivité : un produit payant doit prouver sa valeur face à des annales gratuites largement disponibles en ligne."),
    ("li", "Vitesse : la fenêtre francophone est ouverte mais visible de tous ; l'avantage est périssable."),
]})

S.append({"h": "Recommandations stratégiques", "blocks": [
    ("li", "Creuser le fossé du contenu local. Le vrai moat d'Éli, c'est la profondeur curriculaire et les annales réelles que personne d'autre ne veut construire. Industrialiser ce contenu, pays par pays."),
    ("li", "Capitaliser sur le bi-programme. National + AEFE dans une seule app est un différenciateur unique : en faire un argument central."),
    ("li", "Avancer vite sur le Gabon, puis répliquer. Valider une vitrine d'excellence au Gabon, mesurer la qualité, puis dupliquer le patron vers un 2e pays francophone sous 12 mois."),
    ("li", "Soigner l'expérience terrain. Hors-ligne (Mode Bougie) et paiement mobile money sont des avantages concrets que les concurrents négligent."),
    ("li", "Verrouiller par les partenariats. Écoles, réseau AEFE, autorités éducatives : un accord institutionnel vaut plus que n'importe quelle fonctionnalité."),
    ("li", "Surveiller EduMate et Revizly. Veille active sur tout signal de passage au français."),
]})

S.append({"h": "Plan de veille concurrentielle", "blocks": [
    "L'avantage d'Éli étant périssable, une veille régulière et légère est indispensable pour réagir vite.",
    ("table",
     ["Quoi surveiller", "Signal d'alerte", "Fréquence"],
     [["EduMate Africa", "Tout ajout du français ou d'un curriculum francophone", "Mensuelle"],
      ["Revizly", "Ancrage curriculaire réel, banque d'annales, bi-programme", "Mensuelle"],
      ["Acteurs institutionnels (CNED, ministères)", "Lancement d'une offre IA publique gratuite", "Trimestrielle"],
      ["Nouveaux entrants francophones", "Levée de fonds, lancement, partenariats écoles", "Mensuelle"],
      ["Tarifs et perception", "Évolution du prix perçu et de la disposition à payer", "Trimestrielle"]],
     [70, 70, 30]),
    "La veille alimente directement les décisions de produit, de prix et de partenariats, et déclenche "
    "une réponse documentée à chaque signal fort.",
]})

S.append({"h": "Conclusion", "blocks": [
    "Éli n'affronte aujourd'hui aucun concurrent identique. Le modèle est validé ailleurs, mais le "
    "créneau précis — tuteur IA francophone, bi-programme National gabonais + AEFE, ancré sur de vraies "
    "annales et pensé pour le contexte local — est libre. Cette avance n'est cependant pas acquise : elle "
    "se défend par la profondeur du contenu et la vitesse d'exécution. Le travail de fond engagé sur le "
    "curriculum et les annales est précisément ce qui transformera cette fenêtre en position durable.",
    ("callout", "À retenir",
     "Pas de copie, des cousins éloignés. Avantage réel mais périssable. Gagner = profondeur locale + "
     "vitesse + bi-programme + partenariats."),
]})


if __name__ == "__main__":
    out = "/mnt/user-data/outputs/Eli-Analyse-Concurrentielle.pdf"
    build_document(out, TITLE, SUBTITLE, BRAND_SUB, S, intro=INTRO,
                   reference="ELI-MKT-2026", version="1.0", date="Juin 2026", confidential=True, page_per_section=True)
    from pypdf import PdfReader
    print("OK ->", out, "| pages:", len(PdfReader(out).pages))
