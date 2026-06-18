# -*- coding: utf-8 -*-
"""cours_philo_tle.py — Lot AEFE : Philosophie, Terminale (tronc commun, toutes specialites).
Contenu 100% ORIGINAL. Notation cp1252. Format pedagogique impose."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from elidoc import build_course  # noqa: E402

TITLE = "Philosophie - Terminale"
SUBTITLE = "Tronc commun - Programme AEFE (toutes specialites)<br/>Lot 1 : six notions essentielles"
BRAND_SUB = "Cours - Philosophie Terminale"
INTRO = ("Cours original concu par Eli pour la Terminale. La philosophie ne s'apprend pas par coeur : "
         "elle se pratique. Chaque notion est presentee pour aider l'eleve a problematiser, argumenter "
         "et nuancer, en vue de la dissertation et de l'explication de texte. A valider par un enseignant.")


def ch(t, o, p, c, m, e, er, en):
    return {"titre": t, "sections": [
        ("Objectif", o), ("Prerequis", [("li", x) for x in p]), ("Cours", c),
        ("Methode", m), ("Exemple", e), ("Erreurs frequentes", [("li", x) for x in er]),
        ("Entrainement", en)]}


CHAPTERS = [
    ch("La conscience",
       ["Comprendre ce que signifie etre conscient, distinguer conscience et connaissance de soi, et "
        "interroger l'idee d'inconscient."],
       ["Distinction sujet / objet", "Notion de pensee reflexive"],
       ["La conscience est ce par quoi un etre se rapporte a lui-meme et au monde : etre conscient, "
        "c'est savoir que l'on percoit, que l'on pense, que l'on agit. Descartes y voit le fondement de "
        "toute certitude : meme si je doute de tout, je ne peux douter que je pense, donc que je suis.",
        "Mais la conscience que j'ai de moi est-elle transparente ? Rien n'est moins sur. La conscience "
        "peut se tromper sur ses propres motifs : je crois agir par generosite alors que c'est par "
        "vanite. C'est ici qu'intervient l'hypothese de l'inconscient : une part de notre vie psychique "
        "nous echapperait, influencant nos actes a notre insu.",
        "Reconnaitre l'inconscient ne supprime pas la responsabilite : cela invite a la lucidite, a "
        "interroger ses propres raisons plutot qu'a s'y fier aveuglement."],
       ["Pour traiter un sujet sur la conscience : 1) definir le terme (conscience immediate, reflexive, "
        "morale). 2) Poser une tension (la conscience me rend-elle maitre de moi, ou me donne-t-elle "
        "seulement l'illusion de l'etre ?). 3) Confronter des theses opposees. 4) Nuancer."],
       ["Quand je conduis une route connue, je peux arriver sans me souvenir du trajet : mes actes "
        "etaient conscients sans etre pleinement reflechis. Cet exemple montre que la conscience admet "
        "des degres, du simple eveil a la reflexion sur soi."],
       ["Confondre conscience (etre present a soi) et connaissance de soi (se comprendre vraiment).",
        "Croire que reconnaitre l'inconscient supprime toute liberte et toute responsabilite.",
        "Reciter des auteurs sans construire un probleme."],
       ["Ex. 1 : Distinguer, par un exemple, conscience immediate et conscience reflexive.<br/>"
        "Ex. 2 : 'Suis-je ce que j'ai conscience d'etre ?' Degager le probleme du sujet.<br/>"
        "Ex. 3 : L'hypothese de l'inconscient menace-t-elle la responsabilite morale ? Argumenter."]),
    ch("La liberte",
       ["Distinguer liberte comme absence de contrainte et liberte comme autonomie, et interroger le "
        "rapport entre liberte et determinisme."],
       ["Notion de cause et de loi", "Distinction vouloir / pouvoir"],
       ["Au sens courant, etre libre, c'est faire ce que l'on veut. Mais faire ce que l'on veut sans "
        "examiner ses desirs, n'est-ce pas etre l'esclave de ses pulsions ? Les philosophes distinguent "
        "donc la liberte-spontaneite (agir sans contrainte exterieure) de l'autonomie (se donner a "
        "soi-meme sa propre regle, par la raison).",
        "Le determinisme objecte que tout evenement a une cause : si mes choix sont entierement causes "
        "par mon histoire et ma nature, sont-ils encore libres ? Certains repondent que la liberte n'est "
        "pas l'absence de causes, mais la capacite d'agir selon sa raison plutot que sous la seule "
        "pression des circonstances.",
        "Etre libre, dans cette perspective, c'est moins echapper aux causes que devenir l'auteur "
        "reflechi de ses actes."],
       ["1) Distinguer les sens de 'libre'. 2) Opposer liberte ressentie et determinisme. 3) Chercher "
        "une conciliation (liberte comme autonomie, non comme indetermination pure). 4) Conclure de "
        "maniere nuancee."],
       ["Un fumeur 'libre' d'allumer une cigarette obeit en realite a une dependance : il fait ce qu'il "
        "veut, mais veut-il vraiment vouloir cela ? L'exemple montre que la liberte exige un retour "
        "critique sur ses propres desirs."],
       ["Reduire la liberte au simple fait de faire ce qu'on veut.",
        "Opposer liberte et raison, alors que l'autonomie les relie.",
        "Confondre liberte politique et liberte metaphysique sans le preciser."],
       ["Ex. 1 : Donner deux sens differents du mot 'liberte' et un exemple pour chacun.<br/>"
        "Ex. 2 : 'Sommes-nous libres de nos desirs ?' Problematiser.<br/>"
        "Ex. 3 : Le determinisme rend-il la liberte impossible ? Discuter."]),
    ch("Le devoir",
       ["Comprendre ce qui distingue une action morale d'une action interessee, et interroger la valeur "
        "de l'obligation morale."],
       ["Distinction fait / valeur", "Notion d'interet"],
       ["Le devoir est ce que je dois faire independamment de mon interet ou de mon plaisir. Kant "
        "soutient qu'une action n'a de valeur morale que si elle est accomplie par devoir, et non "
        "seulement conforme au devoir : aider autrui par calcul n'a pas la meme valeur qu'aider par "
        "respect du principe.",
        "Pour juger une maxime, Kant propose une regle : agis seulement d'apres une maxime que tu "
        "pourrais vouloir voir erigee en loi universelle. Mentir ne passe pas le test, car un monde ou "
        "tous mentiraient rendrait le mensonge inutile et le langage impossible.",
        "On objecte que cette morale, trop rigide, ignore les consequences. D'autres approches jugent "
        "l'acte a ses effets. Le debat entre morale du devoir et morale des consequences reste ouvert."],
       ["1) Distinguer agir par devoir et agir par interet. 2) Exposer le test d'universalisation. "
        "3) Confronter morale du devoir et morale des consequences. 4) Nuancer selon les situations."],
       ["Rendre la monnaie exacte a un client par honnetete, meme sans temoin et sans risque, releve du "
        "devoir ; le faire seulement par peur d'etre pris releve de l'interet. La difference de motif "
        "fait la difference morale."],
       ["Confondre 'conforme au devoir' et 'par devoir'.",
        "Reduire la morale a l'obeissance a des regles sans en interroger le fondement.",
        "Oublier d'examiner les objections (rigidite, cas limites)."],
       ["Ex. 1 : Distinguer agir par devoir et agir par interet, avec un exemple.<br/>"
        "Ex. 2 : 'Le devoir s'oppose-t-il au bonheur ?' Degager le probleme.<br/>"
        "Ex. 3 : Faut-il toujours dire la verite ? Discuter a partir du test d'universalisation."]),
    ch("Le bonheur",
       ["Interroger la nature du bonheur et se demander s'il est un but accessible et legitime de "
        "l'existence."],
       ["Distinction plaisir / bonheur", "Notion de desir"],
       ["Le bonheur est souvent defini comme un etat de satisfaction durable et complet, a distinguer du "
        "plaisir, ponctuel et passager. Mais ce bonheur total est-il atteignable ? Le desir, toujours "
        "renaissant, semble nous condamner a l'insatisfaction : a peine un desir comble, un autre surgit.",
        "Deux grandes voies s'opposent. Les unes cherchent a augmenter les plaisirs ; les autres, comme "
        "les stoiciens, conseillent de maitriser ses desirs pour ne plus dependre de ce qui ne nous "
        "appartient pas. Epicure distingue les desirs naturels et necessaires des desirs vains, et fait "
        "du bonheur une tranquillite raisonnee plutot qu'une accumulation.",
        "Le bonheur n'est peut-etre pas un etat a posseder mais une maniere de vivre : non l'absence de "
        "manque, mais un rapport juste a ses desirs."],
       ["1) Distinguer plaisir et bonheur. 2) Poser le probleme du desir (manque vs satisfaction). "
        "3) Confronter recherche des plaisirs et maitrise des desirs. 4) Proposer une voie nuancee."],
       ["Celui qui croit qu'il sera heureux 'quand' il aura tel objet decouvre, une fois l'objet obtenu, "
        "un nouveau manque. Cet exemple courant illustre le caractere sans fin du desir et invite a "
        "interroger ce qu'on cherche vraiment."],
       ["Confondre plaisir immediat et bonheur durable.",
        "Croire que le bonheur consiste seulement a satisfaire tous ses desirs.",
        "Traiter le sujet sans definir ni le bonheur ni le desir."],
       ["Ex. 1 : Distinguer, par un exemple, un plaisir et le bonheur.<br/>"
        "Ex. 2 : 'Le bonheur depend-il de nous ?' Problematiser.<br/>"
        "Ex. 3 : Faut-il satisfaire tous ses desirs pour etre heureux ? Discuter."]),
    ch("La verite",
       ["Distinguer verite, opinion et certitude, et interroger les criteres qui permettent de tenir un "
        "enonce pour vrai."],
       ["Distinction vrai / reel", "Notion de demonstration"],
       ["La verite est une propriete des jugements : un enonce est vrai s'il correspond a ce qui est. "
        "Elle se distingue de l'opinion, qui est une croyance non justifiee, et de la certitude, qui est "
        "un etat subjectif : on peut etre certain d'une chose fausse.",
        "Comment etablir le vrai ? En mathematiques, par la demonstration ; dans les sciences "
        "experimentales, par la confrontation des hypotheses a l'experience, toujours revisable. La "
        "verite scientifique n'est pas un dogme : elle progresse en se laissant refuter.",
        "Rechercher la verite suppose donc une exigence : ne pas confondre ce que je crois, ce que je "
        "souhaite, et ce qui est. C'est une discipline de l'esprit autant qu'une quete."],
       ["1) Distinguer verite, opinion, certitude. 2) Distinguer les criteres selon les domaines "
        "(logique, experience). 3) Interroger l'idee de verite absolue vs verite revisable. 4) Conclure."],
       ["Longtemps on a tenu pour 'evident' que le Soleil tourne autour de la Terre : une certitude "
        "partagee n'est pas une preuve. L'exemple montre que la verite ne se mesure pas au nombre de "
        "ceux qui y croient."],
       ["Confondre 'vrai' (jugement) et 'reel' (ce qui existe).",
        "Confondre certitude subjective et verite.",
        "Croire qu'une verite scientifique est definitive et indiscutable."],
       ["Ex. 1 : Distinguer une opinion et une verite, avec un exemple.<br/>"
        "Ex. 2 : 'Peut-on etre certain de quelque chose de faux ?' Problematiser.<br/>"
        "Ex. 3 : Toute verite est-elle definitive ? Discuter a partir de la science."]),
    ch("L'art",
       ["Interroger ce qui distingue l'oeuvre d'art de l'objet ordinaire, et la valeur du beau et de la "
        "creation."],
       ["Distinction technique / art", "Notion de jugement de gout"],
       ["L'art designe la creation d'oeuvres dont la valeur n'est pas seulement utilitaire. A la "
        "difference de l'artisan qui fabrique selon un modele et un usage, l'artiste cree quelque chose "
        "de singulier, qui vaut pour lui-meme. Une chaise sert a s'asseoir ; une oeuvre, a etre percue "
        "et eprouvee.",
        "Le jugement de gout pose un probleme : dire 'c'est beau' semble subjectif, et pourtant on "
        "pretend que les autres devraient le reconnaitre. Kant parle d'une universalite sans concept : "
        "le beau plait d'une maniere qui aspire a etre partagee, sans pouvoir se prouver comme un theoreme.",
        "L'art ne se reduit donc ni a l'utile ni au simple agreable : il ouvre un rapport particulier au "
        "monde, ou la forme et le sens comptent autant que la fonction."],
       ["1) Distinguer art, technique et nature. 2) Interroger le beau (subjectif ? universel ?). "
        "3) Discuter la fonction de l'art (imiter, exprimer, faire penser). 4) Nuancer."],
       ["Un meme paysage peut etre vu comme un terrain a exploiter ou comme un spectacle a contempler. "
        "Le regard artistique transforme le rapport a l'objet : il fait voir, au lieu de seulement "
        "utiliser."],
       ["Confondre 'beau' et 'agreable' ou 'utile'.",
        "Reduire l'art a l'imitation fidele du reel.",
        "Croire que 'tous les gouts se valent' dispense de tout argument."],
       ["Ex. 1 : Distinguer un objet technique et une oeuvre d'art, avec un exemple.<br/>"
        "Ex. 2 : 'Les gouts et les couleurs ne se discutent-ils pas ?' Problematiser.<br/>"
        "Ex. 3 : L'art n'a-t-il pour but que de plaire ? Discuter."]),
]


if __name__ == "__main__":
    out = "/mnt/user-data/outputs/Eli-Cours-Philosophie-Terminale-AEFE-Lot1.pdf"
    build_course(out, TITLE, SUBTITLE, BRAND_SUB, CHAPTERS, intro=INTRO)
    print("OK ->", out, "| chapitres:", len(CHAPTERS))
