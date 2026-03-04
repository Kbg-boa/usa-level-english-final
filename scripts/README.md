# 📜 Scripts Folder

Ce dossier contient les scripts d'automatisation pour le setup et la maintenance du projet.

---

## 📋 Scripts disponibles

### `import-vocabulary.ts`

**Fonction:** Import automatique des 9000 mots de vocabulaire dans Supabase

**Prérequis:**
```bash
# 1. Créer fichier .env avec clés Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# 2. Installer dépendances
npm install
```

**Usage:**
```bash
npx tsx scripts/import-vocabulary.ts
```

**Résultat:**
- Import 9000 mots en ~2-3 minutes
- Batches de 100 mots (évite timeout)
- Affichage progression temps réel
- Statistiques par catégorie à la fin

**Sortie attendue:**
```
🚀 Import des 9000 mots de vocabulaire...

📊 Total mots à importer: 9000

📂 Catégories trouvées: 10

📝 Daily Conversation: 900 mots...
  ✅ 1/9 ✅ 2/9 ... ✅ 9/9 

...

✅ Import terminé!
   Importés: 9000 mots
   Erreurs: 0

📊 Total dans la base: 9000 mots
```

---

## 🔧 Ajouter un nouveau script

1. Créer fichier `.ts` dans ce dossier
2. Ajouter documentation dans ce README
3. Utiliser format:
   ```typescript
   /**
    * Script description
    * Usage: npx tsx scripts/your-script.ts
    */
   
   // Import dependencies
   import { ... } from '...'
   
   // Main function
   async function main() {
     // Your code here
   }
   
   // Execute
   main()
     .then(() => process.exit(0))
     .catch((error) => {
       console.error('Error:', error)
       process.exit(1)
     })
   ```

---

## 📚 Ressources

- [TSX Documentation](https://github.com/privatenumber/tsx)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- Guide complet: `/SUPABASE_SETUP_GUIDE.md`
