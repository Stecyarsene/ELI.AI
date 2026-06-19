# CURRICULUM_INGESTION.md — comment peupler `curriculum` et `cours` SANS fabrication

> Règle d'or : on n'ingère que du **réel sourcé**. `source` est NOT NULL en base sur `cours` ; tout payload `curriculum` doit porter un champ `source`. Aucune notion/chapitre inventé.

## A. Table `curriculum` (structure de programme)

Clé : `(program, class_key, country_code)`. RPC d'upsert : `set_curriculum(p_program program_t, p_class_key text, p_country text, p_payload jsonb)`.
`program_t` ∈ `national` | `aefe`. `country_code` = `GA`.

### Schéma du `payload` (jsonb) — calqué sur les lignes réelles existantes
```json
{
  "exam": "BAC",                         // ou "CEP", "BEPC", null
  "source": "Annales BAC Gabon 2012-2024 (Direction du Baccalauréat)",  // OBLIGATOIRE
  "updated": "2026-06",
  "subjects": [
    { "name": "Mathematiques",
      "chapters": [ { "title": "Suites numeriques (...)" }, { "title": "Fonction logarithme (...)" } ] }
  ],
  "by_serie": {                           // optionnel, pour les classes à séries (terminale)
    "C": { "coef": 5, "duree_h": 4, "chapters": ["Nombres complexes (...)", "Arithmetique (...)"] },
    "D": { "coef": 4, "duree_h": 4, "chapters": ["..."] }
  },
  "granularity": "notions consolidees depuis les annales reelles",
  "note": "optionnel — ex. 'A2 provisoire, a affiner'"
}
```

### Appel d'ingestion (exemple)
```sql
select public.set_curriculum(
  'national', 'premiere', 'GA',
  $json${ "exam": null, "source": "<SOURCE OFFICIELLE>", "updated": "2026-06",
          "subjects": [ { "name": "Mathematiques", "chapters": [ {"title":"..."} ] } ] }$json$::jsonb
);
```

### État actuel (10 lignes réelles)
- national : `cm2`, `3e`, `terminale`
- aefe : `6e`, `5e`, `4e`, `3e`, `2nde`, `1ere`, `terminale`
- **Manquent (national)** : `cp1, cp2, ce1, ce2, cm1, 6e, 5e, 4e, 2nde, 1ere` → **c'est le gros du chantier**.

## B. Table `cours` (contenu de leçon, granularité notion)

Colonnes NOT NULL : `program`, `notion`, `source`, `status`. Nullable : `class_key, subject, objectif, prerequis, cours, methode(jsonb), exemple, erreurs, entrainement`.

### Gabarit d'insertion (une notion = une ligne)
```sql
insert into public.cours
  (program, class_key, subject, notion, objectif, prerequis, cours, methode, exemple, erreurs, entrainement, source, status)
values
  ('national','terminale','Mathematiques','Nombres complexes — forme exponentielle',
   '<objectif>', '<prerequis>', '<cours>', '<methode jsonb>'::jsonb, '<exemple>', '<erreurs frequentes>', '<entrainement>',
   '<SOURCE>', 'draft');     -- status reste 'draft' tant que NON validé par un enseignant
```

### Porte de validation (non négociable)
`status='published'` (donc exploité par l'IA) **uniquement après validation enseignant**. Tant que non validé → `status='draft'`, non servi à l'élève. C'est ce qui empêche l'IA de s'appuyer sur du contenu non vérifié (et qui attaque la cause racine du « bégaiement » proprement).

État actuel : `cours` = **0 ligne**.

## C. Ce dont j'ai besoin de toi / l'IPN / les enseignants (intrants réels)

Pour que je seede sans rien inventer, fournis l'un de ces intrants :
1. **Programmes officiels gabonais** par classe-série (PDF/scans IPN ou Ministère) → je les structure au format ci-dessus et je seede `curriculum`.
2. **Annales réelles** (Direction du Bac / CEP / BEPC) pour une classe → je consolide les notions comme pour les lignes existantes.
3. **Contenus de leçon validés** par un enseignant (les 16 chapitres Maths + 9 Physique-Chimie déjà produits, une fois relus) → j'ingère dans `cours` avec `status='published'` et la `source`.

Sans l'un de ces intrants, je **ne seede pas** (refus de fabriquer). Avec, j'enchaîne immédiatement, vérifié et idempotent.
