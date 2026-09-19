# Le référencement de Mendly

Ce document sert à deux choses : savoir ce que le site déclare aujourd'hui aux
moteurs, et savoir ce qui reste à faire à la main. La partie technique est dans
le dépôt ; la partie qui fait vraiment remonter un site ne s'écrit pas en code.

## Ce que le site déclare maintenant

| Élément | Adresse | À quoi ça sert |
| --- | --- | --- |
| Fichier robots | `/robots.txt` | La première adresse que demande un robot. Elle répondait « page introuvable ». |
| Plan du site | `/sitemap.xml` | La liste des 11 pages publiques × 2 langues, avec leurs traductions. |
| Adresse canonique | chaque page | Dit quelle adresse compte, pour qu'une même page ne se fasse pas concurrence à elle-même. |
| Liens entre langues | chaque page | `hreflang` : dit à Google que `/fr/` et `/en/` sont deux versions d'une même page, et laquelle servir selon le pays. |
| Image de partage | `/og/mendly-fr.png`, `-en.png` | Un lien collé sur LinkedIn, X, WhatsApp ou Slack sort avec une vignette au lieu d'un bloc gris. |
| Données structurées | page d'accueil | Un bloc qui dit en clair : qui édite le site, ce qu'est le produit, ses trois tarifs, et les six questions fréquentes avec leurs réponses. |
| Icônes et manifeste | `/icons/`, `/manifest.webmanifest` | L'icône sur mobile et dans les résultats de recherche. |
| Descriptions bilingues | toutes les pages | Les pages anglaises se présentaient en français dans les résultats Google. |

Le domaine de référence est **www.mendlyai.io** : le domaine sans `www` renvoie
vers lui. C'est ce domaine, et lui seul, qui est écrit dans toutes les adresses.

## Ce que tu dois faire toi, dans l'ordre

Sans ces étapes, le travail ci-dessus ne sert qu'à moitié : un site correct mais
inconnu de Google reste invisible.

1. **Déployer.** Rien de tout cela n'existe tant que la mise en ligne n'est pas
   faite.
2. **Revendiquer le site dans la Google Search Console**
   (search.google.com/search-console). Choisis la propriété de type domaine.
   Google te donnera un code de vérification : mets-le dans la variable
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` sur Vercel, et il sera posé
   automatiquement dans la page.
3. **Déposer le plan du site** dans la Search Console :
   `https://www.mendlyai.io/sitemap.xml`. Puis, dans « Inspection de l'URL »,
   demander l'indexation de la page d'accueil dans les deux langues. C'est ce
   qui déclenche la première visite du robot au lieu de l'attendre.
4. **Faire la même chose sur Bing Webmaster Tools.** C'est cinq minutes, et
   Bing alimente les réponses de plusieurs assistants IA.
5. **Vérifier que Vercel garde `www` comme domaine principal.** Si le principal
   devient le domaine nu, les adresses canoniques pointeront vers une
   redirection et il faudra changer `SITE_URL` dans `lib/seo/site.ts`.

## Le vrai obstacle : le nom

Une recherche sur « mendly ai » ne ramène pas le produit, et ce n'est pas un
problème technique. Le nom est déjà occupé :

- **mendlyai.com** — une société américaine de suivi post-opératoire ;
- **mendlylabs.tech** — un studio de développement, avec une fiche Crunchbase.

Les deux existent depuis plus longtemps et ont des liens entrants. Un site neuf
ne passe pas devant en réglant des balises : il passe devant quand d'autres
sites parlent de lui. Concrètement, ce qui compte, dans l'ordre d'efficacité :

1. **Des fiches qui font autorité et qui pointent vers toi** : Product Hunt,
   Indie Hackers, BetaList, une fiche Crunchbase, le profil LinkedIn de
   l'entreprise, une page X/Twitter. Ce sont des liens que Google associe
   immédiatement au nom de marque.
2. **Des mentions par des gens** : un lancement raconté, un article invité, un
   podcast d'indie hackers, une discussion Reddit ou Hacker News. Un seul
   article repris vaut plus que cent réglages.
3. **Du contenu sur les questions que les gens posent**, pas sur ton nom. Les
   requêtes qui amènent des clients ressemblent à « IA qui critique mon idée de
   startup », « alternative à ChatGPT qui ne dit pas oui à tout », « comment
   décider seul quand on est fondateur ». Ces pages-là n'existent pas encore
   sur le site : c'est le prochain gros chantier, et c'est celui qui rapporte.
4. **Le temps.** Compte deux à quatre semaines avant d'apparaître sur ton propre
   nom, et plusieurs mois sur des requêtes disputées.

## Vérifier que ça marche

Après la mise en ligne :

- `https://www.mendlyai.io/robots.txt` doit s'afficher, pas une erreur ;
- `https://www.mendlyai.io/sitemap.xml` doit lister 22 adresses ;
- colle `https://www.mendlyai.io/fr/` dans le test des résultats enrichis de
  Google (search.google.com/test/rich-results) : il doit reconnaître
  l'organisation, l'application et la foire aux questions ;
- colle le même lien dans une conversation Slack ou LinkedIn : la vignette doit
  apparaître ;
- dans la Search Console, l'onglet « Pages » dira, après quelques jours,
  combien de pages sont indexées et pourquoi les autres ne le sont pas.

## Quand on ajoute une page

Une nouvelle page publique n'est pas finie tant qu'elle n'est pas ajoutée à
`INDEXED_PAGES` dans `lib/seo/site.ts`, avec sa description dans la section
`seo` de `messages/fr.json` et `messages/en.json`. C'est cette liste qui
alimente le plan du site. Une page privée, elle, n'y entre jamais et doit être
bloquée dans `app/robots.ts`.
