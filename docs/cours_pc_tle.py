"""
cours_pc_tle.py — Lot AEFE : Physique-Chimie, Terminale specialite (programme francais).
Contenu 100% ORIGINAL (explications, exemples et exercices ecrits pour Eli, sans copie).
Double usage : utile aussi au programme national gabonais (series C / D).
Notation cp1252 : -> , >= , <= , x (multiplier), "racine", lettres grecques epelees.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from elidoc import build_course  # noqa: E402

TITLE = "Physique-Chimie - Terminale"
SUBTITLE = "Specialite - Programme AEFE (francais)<br/>Lot 1 : Mecanique, Ondes et Chimie des solutions"
BRAND_SUB = "Cours - Physique-Chimie Terminale"
INTRO = ("Cours original concu par Eli pour la classe de Terminale, specialite Physique-Chimie. "
         "Chaque chapitre suit la meme methode : on fixe l'objectif, on rappelle les prerequis, "
         "on construit le cours pas a pas, on degage une methode, on l'illustre, on liste les erreurs "
         "frequentes, puis on s'entraine. A valider par un enseignant avant diffusion.")


def ch(titre, objectif, prereq, cours, methode, exemple, erreurs, entrainement):
    return {"titre": titre, "sections": [
        ("Objectif", objectif),
        ("Prerequis", [("li", x) for x in prereq]),
        ("Cours", cours),
        ("Methode", methode),
        ("Exemple", exemple),
        ("Erreurs frequentes", [("li", x) for x in erreurs]),
        ("Entrainement", entrainement),
    ]}


CHAPTERS = [
    ch(
        "Lois de Newton et mouvement dans un champ uniforme",
        ["Savoir relier les forces exercees sur un systeme a la variation de son vecteur vitesse, "
         "et decrire un mouvement dans un champ de pesanteur uniforme."],
        ["Vecteurs et coordonnees dans un repere", "Notion de vitesse et d'acceleration moyennes",
         "Poids d'un corps : P = m x g"],
        ["On modelise un objet par un point materiel, son centre de masse. La premiere loi de Newton "
         "(principe d'inertie) affirme que, dans un referentiel galileen, un systeme isole ou "
         "pseudo-isole conserve un vecteur vitesse constant : immobile il reste immobile, en mouvement "
         "il avance en ligne droite a vitesse constante.",
         "La deuxieme loi relie la somme des forces a l'acceleration : somme(F) = m x a, ou a est le "
         "vecteur acceleration (variation du vecteur vitesse par unite de temps). Plus la masse est "
         "grande, plus il faut de force pour produire la meme acceleration : la masse mesure l'inertie.",
         "La troisieme loi (actions reciproques) : si A exerce une force sur B, alors B exerce sur A "
         "une force de meme intensite, de meme direction et de sens oppose.",
         "Dans un champ de pesanteur uniforme, si l'on neglige les frottements, la seule force est le "
         "poids. L'acceleration vaut alors a = g, dirigee vers le bas, independante de la masse : tous "
         "les corps tombent de la meme facon. La trajectoire d'un projectile est une parabole."],
        ["1) Definir le systeme et le referentiel (galileen). 2) Faire le bilan des forces (schema). "
         "3) Ecrire la deuxieme loi de Newton et la projeter sur des axes bien choisis. "
         "4) Integrer l'acceleration pour obtenir la vitesse, puis la position. "
         "5) Verifier l'homogeneite des resultats (unites)."],
        ["Une bille lancee horizontalement a v0 = 5 m/s depuis une hauteur h = 1,8 m. En negligeant l'air, "
         "le mouvement vertical est une chute libre : y(t) = h - (1/2) x g x t². Au sol y = 0, donc "
         "t = racine(2h/g) = racine(2 x 1,8 / 9,8) ~ 0,61 s. La portee horizontale vaut x = v0 x t ~ 3,0 m. "
         "Remarque : la masse n'intervient jamais."],
        ["Confondre vitesse et acceleration : une vitesse peut etre grande alors que l'acceleration est nulle.",
         "Oublier que le poids agit meme quand l'objet monte (au sommet d'une trajectoire, v vertical = 0 "
         "mais a = g).",
         "Choisir un referentiel non galileen sans le justifier."],
        ["Ex. 1 : Un palet glisse sans frottement sur une table horizontale a vitesse constante. Que vaut "
         "la somme des forces ? Justifier par une loi de Newton.<br/>"
         "Ex. 2 : Un projectile part avec v0 = 20 m/s a 30 deg au-dessus de l'horizontale. Donner les "
         "composantes initiales de la vitesse (g = 9,8 m/s²) et la nature de la trajectoire.<br/>"
         "Ex. 3 : Justifier qu'une plume et une bille tombent ensemble dans un tube vide d'air."],
    ),
    ch(
        "Travail d'une force et energie mecanique",
        ["Calculer le travail d'une force, relier travail et variation d'energie cinetique, et utiliser "
         "la conservation (ou non) de l'energie mecanique."],
        ["Produit scalaire de deux vecteurs", "Energie cinetique Ec = (1/2) x m x v²",
         "Notion de force constante"],
        ["Le travail d'une force constante F sur un deplacement d vaut W = F x d x cos(angle), ou l'angle "
         "est celui entre la force et le deplacement. Le travail est moteur si l'angle est aigu (W > 0), "
         "resistant s'il est obtus (W < 0), nul si la force est perpendiculaire au deplacement.",
         "Le theoreme de l'energie cinetique enonce que la variation d'energie cinetique d'un systeme est "
         "egale a la somme des travaux des forces : Delta Ec = somme(W). C'est un outil puissant car il "
         "ne fait intervenir que les positions de depart et d'arrivee, pas le detail du trajet.",
         "L'energie potentielle de pesanteur vaut Ep = m x g x z (z hauteur par rapport a une reference "
         "choisie). L'energie mecanique est Em = Ec + Ep. En l'absence de frottements, Em se conserve : "
         "l'energie passe de cinetique a potentielle et inversement. Avec frottements, Em diminue : "
         "l'energie se dissipe sous forme thermique."],
        ["Pour un probleme d'energie : 1) choisir le systeme et une reference d'altitude. "
         "2) Identifier les etats initial et final. 3) Ecrire la conservation Em(i) = Em(f) si pas de "
         "frottements, sinon Em(f) - Em(i) = W(frottements) (< 0). 4) Isoler la grandeur cherchee."],
        ["Un skieur part du repos d'une piste de hauteur h = 50 m. Sans frottement, sa vitesse en bas "
         "verifie (1/2) x m x v² = m x g x h, donc v = racine(2 x g x h) = racine(2 x 9,8 x 50) ~ 31 m/s. "
         "Si l'on mesure en realite 25 m/s, l'energie dissipee par frottement vaut "
         "Delta E = (1/2) x m x (31² - 25²), soit une perte bien reelle a quantifier."],
        ["Oublier le cos(angle) et compter tout le travail comme moteur.",
         "Melanger une reference d'altitude entre l'etat initial et l'etat final.",
         "Croire que l'energie mecanique se conserve toujours : elle ne se conserve que sans frottement."],
        ["Ex. 1 : Une force de 12 N tire une caisse sur 4 m en faisant un angle de 60 deg avec le sol. "
         "Calculer le travail de cette force.<br/>"
         "Ex. 2 : Une bille lachee sans vitesse tombe de 1,25 m. Calculer sa vitesse a l'arrivee par "
         "conservation de l'energie (g = 9,8 m/s²).<br/>"
         "Ex. 3 : Expliquer pourquoi un pendule reel finit par s'arreter alors qu'un pendule ideal "
         "oscillerait indefiniment."],
    ),
    ch(
        "Ondes : diffraction et interferences",
        ["Reconnaitre une onde, relier periode, frequence et longueur d'onde, et interpreter la "
         "diffraction et les interferences lumineuses."],
        ["Periode T et frequence f = 1/T", "Notion de vitesse de propagation v",
         "Lumiere monochromatique"],
        ["Une onde est la propagation d'une perturbation qui transporte de l'energie sans transport de "
         "matiere. Pour une onde periodique, la longueur d'onde lambda est la distance parcourue en une "
         "periode : lambda = v x T = v / f.",
         "La diffraction est l'etalement d'une onde lorsqu'elle rencontre une ouverture ou un obstacle de "
         "taille comparable a lambda. Pour une fente de largeur a, l'ecart angulaire du premier minimum "
         "vaut environ theta ~ lambda / a : plus la fente est etroite, plus la lumiere s'etale.",
         "Les interferences apparaissent quand deux ondes coherentes se superposent. La oU elles arrivent "
         "en phase, elles s'additionnent (frange brillante) ; en opposition de phase, elles s'annulent "
         "(frange sombre). La difference de marche (difference des chemins parcourus) controle le resultat : "
         "un ecart egal a un nombre entier de lambda donne une frange brillante."],
        ["Pour la diffraction par une fente : 1) reperer lambda et la largeur a. 2) Utiliser theta ~ lambda/a "
         "(en radians, petits angles). 3) Relier theta a la largeur de la tache centrale sur un ecran a "
         "distance D : largeur ~ 2 x D x lambda / a. Verifier que tout est en metres."],
        ["Un laser de longueur d'onde lambda = 633 nm = 633 x 10^-9 m eclaire une fente de largeur "
         "a = 0,10 mm = 1,0 x 10^-4 m. L'ecran est a D = 2,0 m. La demi-largeur de la tache centrale vaut "
         "D x lambda / a = 2,0 x 633 x 10^-9 / 1,0 x 10^-4 ~ 1,3 x 10^-2 m, soit une tache centrale d'environ "
         "2,5 cm. Plus la fente est fine, plus la tache est large."],
        ["Confondre longueur d'onde (en m) et frequence (en Hz).",
         "Oublier de convertir les nanometres et millimetres en metres avant le calcul.",
         "Croire que la diffraction change la couleur : elle change la repartition, pas lambda."],
        ["Ex. 1 : Une onde sonore de frequence 340 Hz se propage a 340 m/s. Calculer sa longueur d'onde.<br/>"
         "Ex. 2 : On double la largeur de la fente. La tache centrale de diffraction devient-elle plus "
         "large ou plus etroite ? Justifier.<br/>"
         "Ex. 3 : Expliquer pourquoi on observe des franges colorees sur une bulle de savon."],
    ),
    ch(
        "Cinetique chimique : vitesse de reaction et catalyse",
        ["Decrire l'evolution temporelle d'une transformation chimique et identifier les facteurs qui "
         "modifient sa vitesse."],
        ["Notion de concentration (mol/L)", "Avancement d'une reaction",
         "Ecriture d'une equation de reaction equilibree"],
        ["Toutes les reactions ne sont pas instantanees. La cinetique etudie leur vitesse, c'est-a-dire "
         "la rapidite avec laquelle les reactifs disparaissent et les produits se forment. On suit souvent "
         "la concentration d'une espece au cours du temps.",
         "Trois facteurs cinetiques principaux : la temperature (l'augmenter accelere la reaction car les "
         "molecules sont plus energetiques et se rencontrent plus souvent), la concentration des reactifs "
         "(plus elle est grande, plus les chocs efficaces sont frequents) et la surface de contact pour "
         "les solides (un solide divise reagit plus vite).",
         "Un catalyseur est une espece qui accelere une reaction sans figurer dans le bilan : il est "
         "regenere a la fin. Il ouvre un chemin reactionnel demandant moins d'energie. La catalyse peut "
         "etre homogene (meme phase que les reactifs), heterogene (phase differente, ex. un solide) ou "
         "enzymatique (catalyseurs biologiques tres selectifs)."],
        ["Pour estimer une vitesse : 1) tracer la concentration en fonction du temps. 2) La vitesse a un "
         "instant est liee a la pente de la tangente a la courbe. 3) Comparer deux experiences en ne "
         "changeant qu'un facteur a la fois pour conclure sur son influence."],
        ["La decomposition de l'eau oxygenee est lente a temperature ambiante. En ajoutant des ions "
         "metalliques (catalyse homogene) ou du dioxyde de manganese solide (catalyse heterogene), on "
         "observe un degagement gazeux bien plus rapide, alors que la quantite finale de dioxygene "
         "produite reste la meme : le catalyseur change la vitesse, pas l'etat final."],
        ["Croire qu'un catalyseur deplace l'etat final : il ne change que la vitesse.",
         "Confondre vitesse de reaction et quantite finale de produit.",
         "Oublier qu'une temperature trop elevee peut detruire un catalyseur enzymatique."],
        ["Ex. 1 : Citer deux facteurs permettant d'accelerer la dissolution d'un comprime effervescent.<br/>"
         "Ex. 2 : Sur un graphe concentration-temps, ou la vitesse est-elle la plus grande : au debut ou "
         "a la fin ? Justifier par la pente.<br/>"
         "Ex. 3 : Expliquer le role des enzymes dans la digestion en termes de cinetique."],
    ),
    ch(
        "Acides, bases et pH des solutions aqueuses",
        ["Definir un acide et une base, manipuler le pH et reconnaitre les couples acide/base."],
        ["Concentration molaire", "Logarithme decimal (notion)", "Equation d'une dissolution"],
        ["Selon Bronsted, un acide est une espece capable de ceder un proton H+, une base une espece "
         "capable d'en capter un. A chaque acide correspond sa base conjuguee : ensemble ils forment un "
         "couple acide/base, note AH / A-.",
         "Dans l'eau, l'acidite se mesure par le pH : pH = -log([H3O+]), ou [H3O+] est la concentration en "
         "ions oxonium en mol/L. Une solution est acide si pH < 7, neutre si pH = 7, basique si pH > 7 "
         "(a 25 deg C). Quand [H3O+] est multipliee par 10, le pH diminue de 1 unite.",
         "Un acide fort se dissocie totalement dans l'eau (tout l'acide cede son proton) : pour une "
         "concentration C d'acide fort, [H3O+] = C et pH = -log(C). Un acide faible ne se dissocie que "
         "partiellement : sa solution est moins acide qu'un acide fort de meme concentration."],
        ["Pour calculer un pH d'acide fort : 1) ecrire la reaction de dissociation totale. "
         "2) En deduire [H3O+] = C. 3) Appliquer pH = -log(C). 4) Verifier que le resultat est < 7 et "
         "coherent avec l'ordre de grandeur de C."],
        ["Une solution d'acide chlorhydrique de concentration C = 1,0 x 10^-2 mol/L est un acide fort. "
         "Alors [H3O+] = 1,0 x 10^-2 mol/L et pH = -log(1,0 x 10^-2) = 2,0. Si l'on dilue 10 fois, "
         "C devient 1,0 x 10^-3 mol/L et le pH passe a 3,0 : diluer un acide fait monter le pH vers 7."],
        ["Ecrire pH = -log(C) pour un acide faible (faux : dissociation partielle).",
         "Oublier que le pH n'a pas d'unite et qu'il depend de la temperature.",
         "Penser qu'ajouter de l'eau rend une solution plus acide : la dilution rapproche le pH de 7."],
        ["Ex. 1 : Donner la base conjuguee de l'acide ethanoique CH3COOH.<br/>"
         "Ex. 2 : Calculer le pH d'une solution d'acide fort de concentration 5,0 x 10^-3 mol/L.<br/>"
         "Ex. 3 : Le pH d'une solution passe de 3 a 5. La concentration en ions oxonium a-t-elle augmente "
         "ou diminue, et d'un facteur combien ?"],
    ),
    ch(
        "Titrages : suivre une transformation pour doser",
        ["Determiner une concentration inconnue par un titrage et reperer l'equivalence."],
        ["Reaction acide/base", "Quantite de matiere n = C x V", "Lecture d'une burette"],
        ["Titrer, c'est determiner la concentration d'une espece (le reactif titre) en la faisant reagir "
         "avec une solution de concentration connue (le reactif titrant) versee progressivement. La "
         "reaction support d'un titrage doit etre rapide, totale et unique.",
         "L'equivalence est l'instant ou les reactifs ont ete introduits dans les proportions exactes de "
         "l'equation : il n'y a alors ni exces ni defaut. Avant l'equivalence, le reactif titre est en "
         "exces ; apres, c'est le titrant. A l'equivalence, les quantites de matiere verifient la relation "
         "stoechiometrique de l'equation.",
         "On repere l'equivalence selon la methode : par un saut brusque de pH (suivi pH-metrique), par un "
         "changement de pente de la conductivite (suivi conductimetrique), ou par le virage d'un "
         "indicateur colore bien choisi. A l'equivalence d'un titrage acide fort / base forte de meme "
         "stoechiometrie : C(titre) x V(titre) = C(titrant) x V(verse a l'equivalence)."],
        ["1) Ecrire l'equation de la reaction de titrage. 2) Reperer le volume verse a l'equivalence (Veq) "
         "sur la courbe. 3) Ecrire la relation a l'equivalence (egalite des quantites selon les "
         "coefficients). 4) Isoler la concentration inconnue. 5) Conclure avec un nombre de chiffres "
         "significatifs raisonnable."],
        ["On titre V = 10,0 mL d'une solution d'acide chlorhydrique par de la soude a "
         "C(titrant) = 0,10 mol/L. L'equivalence est atteinte pour Veq = 12,0 mL. La reaction etant de "
         "stoechiometrie 1 pour 1 : C(acide) x V = C(titrant) x Veq, donc "
         "C(acide) = 0,10 x 12,0 / 10,0 = 0,12 mol/L."],
        ["Lire le volume a l'equivalence avant le saut de pH plutot qu'a son milieu.",
         "Oublier les coefficients de l'equation dans la relation a l'equivalence.",
         "Choisir un indicateur colore dont la zone de virage ne contient pas le pH a l'equivalence."],
        ["Ex. 1 : Definir l'equivalence d'un titrage avec vos propres mots.<br/>"
         "Ex. 2 : On titre 20,0 mL d'acide fort par une base a 0,050 mol/L ; Veq = 16,0 mL. Calculer la "
         "concentration de l'acide.<br/>"
         "Ex. 3 : Pourquoi un suivi conductimetrique est-il utile quand le saut de pH est peu marque ?"],
    ),
]


if __name__ == "__main__":
    out = "/mnt/user-data/outputs/Eli-Cours-PhysiqueChimie-Terminale-AEFE-Lot1.pdf"
    build_course(out, TITLE, SUBTITLE, BRAND_SUB, CHAPTERS, intro=INTRO)
    print("OK ->", out)
