# -*- coding: utf-8 -*-
"""cours_svt_tle.py — Lot AEFE : SVT, Terminale specialite. Contenu original. cp1252."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from elidoc import build_course  # noqa: E402

TITLE = "SVT - Terminale"
SUBTITLE = "Specialite - Programme AEFE<br/>Lot 1 : Genetique, organisme et environnement"
BRAND_SUB = "Cours - SVT Terminale"
INTRO = ("Cours original concu par Eli pour la Terminale specialite SVT. Chaque chapitre suit la meme "
         "methode : objectif, prerequis, cours structure, methode, exemple, erreurs frequentes, "
         "entrainement. A valider par un enseignant avant diffusion.")


def ch(t, o, p, c, m, e, er, en):
    return {"titre": t, "sections": [
        ("Objectif", o), ("Prerequis", [("li", x) for x in p]), ("Cours", c),
        ("Methode", m), ("Exemple", e), ("Erreurs frequentes", [("li", x) for x in er]),
        ("Entrainement", en)]}


CHAPTERS = [
    ch("Brassage genetique et diversite",
       ["Comprendre comment la meiose et la fecondation produisent la diversite genetique des individus."],
       ["Notion de chromosome et de gene", "Cycle cellulaire et mitose", "Allele"],
       ["Chez les especes a reproduction sexuee, la formation des gametes se fait par meiose : une "
        "cellule a 2n chromosomes donne quatre cellules a n chromosomes. Deux mecanismes y creent de la "
        "diversite. Le brassage interchromosomique resulte de la repartition aleatoire des chromosomes "
        "de chaque paire dans les gametes. Le brassage intrachromosomique resulte des echanges (crossing-over) "
        "entre chromosomes homologues, qui recombinent les alleles le long d'un meme chromosome.",
        "La fecondation ajoute un troisieme niveau de brassage : la rencontre aleatoire de deux gametes "
        "parmi un immense nombre possible. Combines, ces mecanismes expliquent que deux enfants d'un meme "
        "couple soient genetiquement differents.",
        "Des anomalies peuvent survenir : un mauvais partage des chromosomes (non-disjonction) donne un "
        "gamete avec un chromosome en trop ou en moins, a l'origine de certaines trisomies."],
       ["Pour un exercice de genetique : 1) identifier les genes et alleles en jeu. 2) Ecrire les "
        "genotypes des parents. 3) Determiner les gametes possibles (et leurs proportions). 4) Construire "
        "un echiquier de croisement. 5) En deduire les phenotypes attendus et leurs proportions."],
       ["Un individu heterozygote pour deux genes situes sur des chromosomes differents produit quatre "
        "types de gametes en proportions egales (25% chacun) : c'est la signature du brassage "
        "interchromosomique. Si les genes sont sur le meme chromosome, les proportions changent selon "
        "les crossing-over."],
       ["Confondre meiose (gametes, n chromosomes) et mitose (cellules identiques, 2n).",
        "Oublier le brassage intrachromosomique (crossing-over) dans le decompte des gametes.",
        "Croire que tous les gametes sont identiques chez un heterozygote."],
       ["Ex. 1 : Citer les deux mecanismes de brassage de la meiose.<br/>"
        "Ex. 2 : Un individu de genotype (A//a ; B//b), genes independants : lister les gametes et leurs "
        "proportions.<br/>"
        "Ex. 3 : Expliquer l'origine d'une trisomie a partir de la meiose."]),
    ch("Le fonctionnement du systeme immunitaire",
       ["Distinguer immunite innee et adaptative et comprendre la reponse a une infection."],
       ["Notion de cellule et de molecule", "Antigene"],
       ["Face a une agression, l'organisme dispose d'abord de l'immunite innee : rapide, non specifique, "
        "elle declenche la reaction inflammatoire (rougeur, chaleur, gonflement, douleur) et mobilise des "
        "cellules comme les phagocytes qui ingerent les intrus.",
        "Si elle ne suffit pas, l'immunite adaptative prend le relais : plus lente mais specifique d'un "
        "antigene donne. Les lymphocytes B produisent des anticorps qui neutralisent l'agent ; les "
        "lymphocytes T cytotoxiques detruisent les cellules infectees. Apres l'infection, des cellules "
        "memoire persistent : c'est pourquoi une seconde rencontre avec le meme agent declenche une "
        "reponse plus rapide et plus forte.",
        "La vaccination exploite cette memoire : en presentant un antigene inoffensif, elle prepare "
        "l'organisme a reagir efficacement lors d'une vraie infection."],
       ["Pour analyser une experience d'immunologie : 1) reperer l'antigene et le moment de l'injection. "
        "2) Suivre la quantite d'anticorps dans le temps. 3) Comparer premiere et seconde reponses. "
        "4) Conclure sur le role de la memoire immunitaire."],
       ["Lors d'un second contact avec un antigene, la concentration d'anticorps monte plus vite et plus "
        "haut que lors du premier : ce graphe caracteristique met en evidence la memoire immunitaire, "
        "principe meme du rappel vaccinal."],
       ["Confondre immunite innee (rapide, non specifique) et adaptative (lente, specifique).",
        "Croire qu'un anticorps detruit directement une cellule infectee (role des LT cytotoxiques).",
        "Oublier le role des cellules memoire dans la reponse secondaire."],
       ["Ex. 1 : Citer deux differences entre immunite innee et adaptative.<br/>"
        "Ex. 2 : Expliquer pourquoi une seconde infection par le meme microbe est souvent benigne.<br/>"
        "Ex. 3 : En quoi un vaccin de rappel renforce-t-il la protection ?"]),
    ch("La communication nerveuse",
       ["Comprendre la transmission d'un message nerveux le long d'un neurone et au niveau d'une synapse."],
       ["Notion de cellule", "Difference de potentiel"],
       ["Le neurone transmet l'information sous forme de signaux electriques. Au repos, sa membrane "
        "presente une difference de potentiel. Une stimulation suffisante declenche un potentiel "
        "d'action : une breve inversion de cette difference, qui se propage le long de l'axone sans "
        "s'attenuer. L'intensite d'un stimulus n'augmente pas la taille du signal mais sa frequence : "
        "c'est un codage en frequence.",
        "Entre deux neurones, ou entre un neurone et un muscle, le message franchit une synapse. Le "
        "signal electrique y est converti en signal chimique : des molecules, les neurotransmetteurs, "
        "sont liberees et se fixent sur la cellule suivante, transmettant ou non le message.",
        "Cette organisation explique la rapidite des reflexes et la possibilite d'integrer de "
        "nombreux signaux avant de reagir."],
       ["Pour un exercice sur le message nerveux : 1) identifier le type de signal (electrique le long "
        "du neurone, chimique a la synapse). 2) Relier intensite du stimulus et frequence des potentiels "
        "d'action. 3) Decrire les etapes de la transmission synaptique."],
       ["Quand on touche un objet brulant, la main se retire avant meme qu'on en ait conscience : le "
        "reflexe met en jeu un trajet nerveux court (recepteur, neurones, muscle) qui illustre la "
        "rapidite de la transmission."],
       ["Croire que l'intensite du stimulus augmente l'amplitude du potentiel d'action (c'est la "
        "frequence qui varie).",
        "Confondre transmission electrique (le long du neurone) et chimique (a la synapse).",
        "Oublier le sens unique de la transmission synaptique."],
       ["Ex. 1 : Comment est code, dans le neurone, l'intensite d'un stimulus ?<br/>"
        "Ex. 2 : Decrire les etapes de la transmission au niveau d'une synapse.<br/>"
        "Ex. 3 : Expliquer la rapidite d'un reflexe a partir du trajet nerveux."]),
    ch("La regulation de la glycemie",
       ["Comprendre comment l'organisme maintient un taux de glucose sanguin stable."],
       ["Notion de concentration", "Role du foie"],
       ["La glycemie, taux de glucose dans le sang, doit rester proche d'une valeur de consigne malgre "
        "les repas et les depenses. Deux hormones pancreatiques s'y opposent. Apres un repas, la glycemie "
        "monte : l'insuline est liberee, elle fait entrer le glucose dans les cellules et favorise son "
        "stockage dans le foie sous forme de glycogene ; la glycemie baisse.",
        "A jeun ou a l'effort, la glycemie baisse : le glucagon est libere, il commande la liberation "
        "du glucose stocke par le foie ; la glycemie remonte. Insuline et glucagon agissent en sens "
        "opposes : c'est une regulation par hormones antagonistes.",
        "Un defaut de cette regulation conduit au diabete : soit l'insuline manque (production "
        "insuffisante), soit les cellules y repondent mal, et la glycemie reste durablement trop elevee."],
       ["Pour un exercice de regulation : 1) reperer la perturbation (hausse ou baisse de glycemie). "
        "2) Identifier l'hormone mobilisee. 3) Decrire son action sur les organes cibles. 4) Conclure "
        "sur le retour a la valeur de consigne."],
       ["Apres un repas sucre, la glycemie d'une personne saine monte puis revient a la normale en "
        "quelques heures grace a l'insuline. Chez un diabetique non traite, elle reste elevee : la "
        "comparaison des deux courbes revele le defaut de regulation."],
       ["Confondre les roles de l'insuline (fait baisser) et du glucagon (fait monter).",
        "Oublier le foie comme organe de stockage et de liberation du glucose.",
        "Croire que la glycemie doit etre nulle a jeun (elle reste regulee autour d'une consigne)."],
       ["Ex. 1 : Quelle hormone est liberee apres un repas, et quel est son effet ?<br/>"
        "Ex. 2 : Expliquer le role du foie dans la regulation de la glycemie.<br/>"
        "Ex. 3 : En quoi le diabete traduit-il un defaut de regulation ?"]),
    ch("Le climat : comprendre l'effet de serre",
       ["Comprendre le mecanisme de l'effet de serre et le lien entre gaz a effet de serre et climat."],
       ["Notion d'energie et de rayonnement", "Notion de gaz atmospherique"],
       ["La Terre recoit l'energie du Soleil et en renvoie une partie vers l'espace sous forme de "
        "rayonnement infrarouge. Certains gaz de l'atmosphere, dits gaz a effet de serre (dioxyde de "
        "carbone, methane, vapeur d'eau), absorbent une partie de ce rayonnement et en renvoient vers "
        "le sol : ils rechauffent la surface. Sans cet effet de serre naturel, la Terre serait gelee.",
        "Le probleme actuel est son intensification : en brulant des combustibles fossiles, les "
        "activites humaines augmentent la concentration de dioxyde de carbone, ce qui renforce l'effet "
        "de serre et eleve la temperature moyenne du globe.",
        "L'etude des archives climatiques (carottes de glace, sediments) montre une correlation entre "
        "concentration de gaz a effet de serre et temperature, et eclaire les evolutions passees comme "
        "les projections futures."],
       ["Pour analyser un document climatique : 1) lire les axes (temps, temperature, concentration). "
        "2) Decrire l'evolution (tendance, ruptures). 3) Mettre en relation deux courbes. 4) Conclure "
        "prudemment sur un lien, sans confondre correlation et preuve absolue."],
       ["Les carottes de glace conservent des bulles d'air ancien : leur analyse montre que les periodes "
        "chaudes du passe coincident avec des concentrations elevees de dioxyde de carbone, ce qui "
        "eclaire le role de ce gaz dans le climat."],
       ["Confondre effet de serre naturel (vital) et son intensification (problematique).",
        "Confondre meteo (temps qu'il fait) et climat (tendance sur des decennies).",
        "Conclure d'une simple correlation a une preuve, sans prudence."],
       ["Ex. 1 : Expliquer en quoi consiste l'effet de serre naturel.<br/>"
        "Ex. 2 : Pourquoi parle-t-on d'intensification de l'effet de serre ?<br/>"
        "Ex. 3 : Quel interet presentent les carottes de glace pour l'etude du climat ?"]),
    ch("Domestication et selection",
       ["Comprendre comment l'humain a faconne le vivant par la selection."],
       ["Notion d'allele et de phenotype", "Variation au sein d'une espece"],
       ["Depuis le neolithique, l'humain choisit, generation apres generation, les individus presentant "
        "les caracteres souhaites (rendement, gout, resistance) pour les reproduire : c'est la selection "
        "artificielle. Elle accelere des changements qui, dans la nature, prendraient beaucoup plus de "
        "temps.",
        "Cette demarche a transforme des especes sauvages en varietes cultivees et en races d'elevage "
        "tres differentes de leurs ancetres. Elle s'appuie sur la variabilite genetique existante : on "
        "ne cree pas n'importe quel caractere, on trie et on amplifie ceux qui sont presents.",
        "La selection intensive a un cout : en privilegiant quelques varietes performantes, on appauvrit "
        "la diversite genetique, ce qui rend les cultures plus vulnerables aux maladies. Conserver cette "
        "diversite est un enjeu pour l'avenir."],
       ["Pour un exercice sur la selection : 1) identifier le caractere selectionne. 2) Reperer le tri "
        "opere de generation en generation. 3) Relier le resultat a la variabilite genetique de depart. "
        "4) Discuter les consequences (performance vs diversite)."],
       ["Les nombreuses varietes de choux (chou-fleur, brocoli, chou de Bruxelles) derivent d'une meme "
        "espece sauvage : la selection de differentes parties de la plante a produit des formes tres "
        "variees, illustrant la puissance et les limites de la selection humaine."],
       ["Croire que la selection cree de nouveaux alleles (elle trie ceux qui existent).",
        "Confondre selection naturelle (milieu) et selection artificielle (humain).",
        "Ignorer le cout de la selection sur la diversite genetique."],
       ["Ex. 1 : Definir la selection artificielle avec un exemple.<br/>"
        "Ex. 2 : Sur quoi s'appuie la selection : cree-t-elle ou trie-t-elle les caracteres ?<br/>"
        "Ex. 3 : Pourquoi la perte de diversite genetique est-elle un risque pour l'agriculture ?"]),
]


if __name__ == "__main__":
    out = "/mnt/user-data/outputs/Eli-Cours-SVT-Terminale-AEFE-Lot1.pdf"
    build_course(out, TITLE, SUBTITLE, BRAND_SUB, CHAPTERS, intro=INTRO)
    print("OK ->", out, "| chapitres:", len(CHAPTERS))
