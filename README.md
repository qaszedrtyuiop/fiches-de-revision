[README.md](https://github.com/user-attachments/files/24151478/README.md)
# Générateur de Fiches de Révision

Petit outil front-end pour créer des fiches de révision à partir d'un cours collé ou importé en `.txt`.

Fonctionnalités :
- Coller son texte de cours ou importer un fichier `.txt`
- Choisir la longueur du résumé (Court, Moyen, Long)
- Génération automatique d'une fiche structurée : Termes-clés, Définitions, Plan détecté, Résumé
- Copier la fiche dans le presse-papiers
- Imprimer / Télécharger via la fonction d'impression

- Importer un fichier `.pdf` (texte extrait via PDF.js) ou `.txt`
 - Drag & drop : dépose ton PDF / TXT directement sur le champ "Importer" pour l'ajouter rapidement.
 - Le site est responsive et optimisé pour mobile : la zone de saisie, le bouton, et la fiche s'adaptent en mode portrait.
 - Les boutons `Copier` et `Imprimer` restent désactivés jusqu'à la génération d'une fiche.
 - Les boutons `Copier` et `Imprimer` restent désactivés jusqu'à la génération d'une fiche.
 - Le layout a été amélioré : zone de saisie à gauche, fiche à droite, impression optimisée, et une fiche stylée (header, termes-clés, définitions, résumé).

Utilisation :
- Ouvre `index.html` dans un navigateur moderne (Chrome, Edge, Firefox)
- Colle ton cours ou importe un fichier `.txt`
- Clique sur `Créer ma fiche`
- Optionnel : `Copier` pour récupérer le texte, `Imprimer / Télécharger` pour PDF

Remarques :
- La génération est heuristique : elle se base sur la fréquence des mots et quelques règles simples pour détecter titres et définitions. Pour des cours complexes, la fiche peut être ajustée manuellement.
- Si tu veux une extraction plus avancée (PDF, images, modèles ML), je peux ajouter un backend et des traitements plus précis.

- Dépannage:
- Si rien ne se passe après avoir cliqué sur `Créer ma fiche`, ouvre la console du navigateur (`F12`) pour voir les logs d\u0027erreur.
- Vérifie que les fichiers `index.html`, `style.css` et `app.js` sont dans le même dossier et que tu ouvres `index.html` directement (pas en tant que fichier distant bloqué par des politiques de CORS).

Note sur le PDF : l'extraction de texte fonctionne pour la majorité des PDF basés sur du texte (pas pour des images scannées). Si ton PDF contient des images, il faudra ajouter un OCR côté serveur ou API externe.

Exécuter sur `localhost` (recommandé si certaines fonctionnalités ne marchent pas):

- Avec Python (si installé) :

```powershell
cd "c:\Users\cypry\OneDrive\Bureau\FICHES REVISION"
python -m http.server 8000
```

Ouvre ensuite `http://localhost:8000` dans le navigateur. Cela règle des problèmes de sécurité (clipboard API, CORS, modules).

- Avec Node.js (si installé) :

```powershell
cd "c:\Users\cypry\OneDrive\Bureau\FICHES REVISION"
npx http-server -p 8000
```

Access : `http://localhost:8000`.

Licence : Sans licence (repo d'exemple).
