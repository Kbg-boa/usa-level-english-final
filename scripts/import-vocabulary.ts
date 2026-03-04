/**
 * Script d'import des 9000 mots de vocabulaire dans Supabase
 * Usage: npx tsx scripts/import-vocabulary.ts
 */

import { createClient } from '@supabase/supabase-js';
import { fullVocabularyDatabase } from '../src/app/data/vocabulary-generator';

// Charger les variables d'environnement
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERREUR: Variables d\'environnement manquantes');
  console.error('');
  console.error('Créer un fichier .env avec:');
  console.error('VITE_SUPABASE_URL=https://xxx.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=eyJhbG...');
  console.error('');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface VocabRow {
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  category: string;
  level: string;
  us_frequency: number;
}

async function importVocabulary() {
  console.log('🚀 Import des 9000 mots de vocabulaire...\n');
  
  const allWords = fullVocabularyDatabase;
  console.log(`📊 Total mots à importer: ${allWords.length}`);
  
  // Vérifier que la table existe
  const { error: tableCheck } = await supabase
    .from('vocabulary')
    .select('id')
    .limit(1);
  
  if (tableCheck) {
    console.error('❌ Erreur: Table vocabulary non trouvée');
    console.error('');
    console.error('Exécuter d\'abord la migration SQL:');
    console.error('Supabase Dashboard → SQL Editor → Copier 001_initial_schema.sql');
    console.error('');
    process.exit(1);
  }
  
  // Grouper par catégorie
  const byCategory = allWords.reduce((acc, word) => {
    if (!acc[word.category]) {
      acc[word.category] = [];
    }
    acc[word.category].push(word);
    return acc;
  }, {} as Record<string, typeof allWords>);
  
  console.log(`\n📂 Catégories trouvées: ${Object.keys(byCategory).length}\n`);
  
  let totalImported = 0;
  let totalErrors = 0;
  
  // Importer par catégorie (batch de 100 mots max)
  for (const [category, words] of Object.entries(byCategory)) {
    console.log(`📝 ${category}: ${words.length} mots...`);
    
    // Batch de 100 pour éviter timeout
    const BATCH_SIZE = 100;
    const batches = Math.ceil(words.length / BATCH_SIZE);
    
    for (let i = 0; i < batches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, words.length);
      const batch = words.slice(start, end);
      
      const rows: VocabRow[] = batch.map(word => ({
        word: word.word,
        pronunciation: word.pronunciation,
        definition: word.definition,
        example: word.example,
        category: word.category,
        level: word.level,
        us_frequency: word.usFrequency
      }));
      
      const { data, error } = await supabase
        .from('vocabulary')
        .insert(rows)
        .select();
      
      if (error) {
        console.error(`  ❌ Erreur batch ${i + 1}/${batches}:`, error.message);
        totalErrors += batch.length;
      } else {
        totalImported += data?.length || 0;
        process.stdout.write(`  ✅ ${i + 1}/${batches} `);
      }
    }
    
    console.log(''); // Nouvelle ligne après la catégorie
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Import terminé!`);
  console.log(`   Importés: ${totalImported} mots`);
  console.log(`   Erreurs: ${totalErrors}`);
  console.log(`\n${'='.repeat(60)}\n`);
  
  // Vérification finale
  const { count, error: countError } = await supabase
    .from('vocabulary')
    .select('*', { count: 'exact', head: true });
  
  if (!countError) {
    console.log(`📊 Total dans la base: ${count} mots\n`);
  }
  
  // Statistiques par catégorie
  console.log('📈 Statistiques par catégorie:\n');
  for (const category of Object.keys(byCategory)) {
    const { count: catCount } = await supabase
      .from('vocabulary')
      .select('*', { count: 'exact', head: true })
      .eq('category', category);
    
    console.log(`   ${category}: ${catCount} mots`);
  }
  
  console.log('\n✅ Données prêtes! Tu peux maintenant utiliser l\'API.\n');
}

// Exécuter l'import
importVocabulary()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
