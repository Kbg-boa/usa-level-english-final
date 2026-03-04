# 🔄 GUIDE MIGRATION FRONTEND → SUPABASE

**Objectif:** Remplacer les données statiques par des appels API Supabase  
**Temps:** 20-30 minutes  
**Impact:** Sécurité maximale + Performance améliorée

---

## 📋 FICHIERS À MODIFIER

### Priorité 1 - Vocabulary (Principal)
- ✅ `/src/app/data/vocabulary.ts` - API wrapper
- ✅ `/src/app/components/Vocabulary.tsx` - Composant principal

### Priorité 2 - Autres modules (Optionnel)
- `/src/app/data/quiz-database.ts`
- `/src/app/data/slang-database.ts`
- `/src/app/data/speaking-exercises.ts`
- `/src/app/data/writing-templates.ts`

---

## 🔧 ÉTAPE 1: Modifier vocabulary.ts

### AVANT (données statiques) ❌

```typescript
// /src/app/data/vocabulary.ts

export const vocabularyDatabase = {
  'Daily Conversation': [
    {
      word: "What's up?",
      pronunciation: "wʌts ʌp",
      definition: "Casual greeting...",
      example: "Hey! What's up?",
      level: "beginner",
      usFrequency: 95
    },
    // ... 900 mots en dur
  ],
  // ... 10 catégories × 900 mots = 9000 mots en dur ❌
};
```

### APRÈS (API Supabase) ✅

```typescript
// /src/app/data/vocabulary.ts

import { supabaseClient } from '@/lib/supabase';

export interface VocabularyWord {
  id?: string;
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  category: string;
  level: string;
  us_frequency: number;
  created_at?: string;
}

/**
 * Récupérer vocabulaire par catégorie (avec cache local)
 * @param category - Nom de la catégorie (ex: "Daily Conversation")
 * @param limit - Nombre de mots (défaut: 50, max: 100)
 */
export async function getVocabularyByCategory(
  category: string,
  limit: number = 50
): Promise<VocabularyWord[]> {
  // Cache local (optionnel mais recommandé)
  const cacheKey = `vocab_${category}_${limit}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // Cache valide 1 heure
    if (Date.now() - timestamp < 3600000) {
      return data;
    }
  }

  try {
    const { data, error } = await supabaseClient
      .from('vocabulary')
      .select('*')
      .eq('category', category)
      .limit(Math.min(limit, 100)) // Max 100 pour sécurité
      .order('us_frequency', { ascending: false });

    if (error) throw error;

    // Sauvegarder dans cache
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    return data || [];
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return [];
  }
}

/**
 * Récupérer vocabulaire par niveau
 */
export async function getVocabularyByLevel(
  level: 'beginner' | 'intermediate' | 'advanced',
  limit: number = 50
): Promise<VocabularyWord[]> {
  const cacheKey = `vocab_level_${level}_${limit}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 3600000) {
      return data;
    }
  }

  try {
    const { data, error } = await supabaseClient
      .from('vocabulary')
      .select('*')
      .eq('level', level)
      .limit(Math.min(limit, 100))
      .order('us_frequency', { ascending: false });

    if (error) throw error;

    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    return data || [];
  } catch (error) {
    console.error('Error fetching vocabulary by level:', error);
    return [];
  }
}

/**
 * Recherche de vocabulaire
 */
export async function searchVocabulary(
  query: string,
  limit: number = 20
): Promise<VocabularyWord[]> {
  try {
    const { data, error } = await supabaseClient
      .from('vocabulary')
      .select('*')
      .or(`word.ilike.%${query}%,definition.ilike.%${query}%`)
      .limit(Math.min(limit, 50));

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching vocabulary:', error);
    return [];
  }
}

/**
 * Récupérer statistiques (total par catégorie)
 */
export async function getVocabularyStats() {
  try {
    const { data, error } = await supabaseClient
      .from('vocabulary')
      .select('category')
      .order('category');

    if (error) throw error;

    // Compter par catégorie
    const stats = (data || []).reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {};
  }
}

// Export des catégories (statique, pas besoin API)
export const VOCABULARY_CATEGORIES = [
  'Daily Conversation',
  'Business & Professional',
  'Real Estate',
  'Music & Entertainment',
  'Technology',
  'Social & Relationships',
  'Food & Dining',
  'Travel',
  'Emotions & Feelings',
  'Slang & Informal'
] as const;

export type VocabularyCategory = typeof VOCABULARY_CATEGORIES[number];
```

---

## 🔧 ÉTAPE 2: Modifier Vocabulary.tsx

### AVANT (synchrone) ❌

```typescript
// /src/app/components/Vocabulary.tsx

import { vocabularyDatabase } from '../data/vocabulary';

export default function Vocabulary() {
  const [category, setCategory] = useState('Daily Conversation');
  const words = vocabularyDatabase[category]; // ❌ Synchrone, tout chargé

  return (
    <div>
      {words.map(word => (
        <div key={word.word}>
          {word.word} - {word.definition}
        </div>
      ))}
    </div>
  );
}
```

### APRÈS (asynchrone avec loading) ✅

```typescript
// /src/app/components/Vocabulary.tsx

import { useState, useEffect } from 'react';
import {
  getVocabularyByCategory,
  VOCABULARY_CATEGORIES,
  VocabularyWord
} from '../data/vocabulary';
import { Loader2 } from 'lucide-react';

export default function Vocabulary() {
  const [category, setCategory] = useState<string>('Daily Conversation');
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const WORDS_PER_PAGE = 50;

  // Charger vocabulaire au changement de catégorie
  useEffect(() => {
    async function loadVocabulary() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getVocabularyByCategory(category, WORDS_PER_PAGE * page);
        setWords(data);
      } catch (err) {
        setError('Erreur de chargement. Vérifier la connexion.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadVocabulary();
  }, [category, page]);

  // Charger plus de mots
  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📚 Vocabulary Builder</h1>
          <p className="text-gray-400">Master 9000 real American words</p>
        </div>

        {/* Catégories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {VOCABULARY_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1); // Reset page
              }}
              className={`
                px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all
                ${category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-400">Loading vocabulary...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Words grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {words.map((word, index) => (
                <div
                  key={word.id || index}
                  className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-blue-400">
                      {word.word}
                    </h3>
                    <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                      {word.level}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">
                    /{word.pronunciation}/
                  </p>
                  
                  <p className="text-gray-200 mb-2">
                    {word.definition}
                  </p>
                  
                  <p className="text-sm text-gray-500 italic">
                    "{word.example}"
                  </p>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${word.us_frequency}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {word.us_frequency}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more button */}
            {words.length >= WORDS_PER_PAGE * page && (
              <button
                onClick={loadMore}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all"
              >
                Load More Words
              </button>
            )}

            {/* Stats */}
            <div className="mt-6 text-center text-gray-500 text-sm">
              Showing {words.length} words in {category}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## ✅ VÉRIFICATION

### Test local

```bash
# 1. Vérifier que .env existe
cat .env

# 2. Installer dépendances si manquantes
npm install

# 3. Lancer dev
npm run dev

# 4. Ouvrir http://localhost:5173
# 5. Aller dans Vocabulary module
# 6. Vérifier que les mots se chargent
```

### Test Network tab

1. Ouvrir DevTools → Network
2. Cliquer sur une catégorie
3. Vérifier requête:
   ```
   GET https://xxx.supabase.co/rest/v1/vocabulary?category=eq.Daily%20Conversation&limit=50
   Status: 200
   ```

### Test cache

1. Sélectionner une catégorie
2. Recharger la page
3. Retourner sur la même catégorie
4. ➡️ Devrait charger instantanément (depuis localStorage)

---

## 🚀 OPTIMISATIONS AVANCÉES (OPTIONNEL)

### 1. Prefetch catégories populaires

```typescript
// Dans App.tsx ou Dashboard.tsx
useEffect(() => {
  // Prefetch les 3 catégories les plus populaires
  getVocabularyByCategory('Daily Conversation', 50);
  getVocabularyByCategory('Business & Professional', 50);
  getVocabularyByCategory('Slang & Informal', 50);
}, []);
```

### 2. Infinite scroll au lieu de "Load More"

```typescript
import { useEffect, useRef } from 'react';

function Vocabulary() {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* ... words grid ... */}
      <div ref={observerTarget} className="h-10" />
    </div>
  );
}
```

### 3. Service Worker pour offline

```typescript
// /public/sw.js (déjà existant)
// Ajouter cache des requêtes API

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('supabase.co')) {
    event.respondWith(
      caches.open('api-cache').then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

---

## 📊 IMPACT PERFORMANCE

### AVANT (données statiques)
```
✅ Chargement initial: Rapide
✅ Pas de requêtes réseau
❌ Bundle size: ~500 KB (9000 mots)
❌ Données non sécurisées
❌ Pas de mise à jour sans redeploy
```

### APRÈS (API Supabase)
```
✅ Bundle size: ~50 KB (90% réduction!)
✅ Données sécurisées backend
✅ Mise à jour en temps réel
✅ Cache local intelligent
🟡 Requête API nécessaire (mais cachée)
```

---

## ❓ DÉPANNAGE

### Erreur: "supabaseClient is not defined"

**Cause:** Import manquant  
**Solution:**
```typescript
import { supabaseClient } from '@/lib/supabase';
```

### Erreur: "Invalid API key"

**Cause:** Variables .env pas chargées  
**Solution:** Vérifier `.env` existe et contient `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

### Loading infini

**Cause:** Edge Function pas déployée ou erreur réseau  
**Solution:**
1. Vérifier Edge Function déployée: `supabase functions list`
2. Tester manuellement: `curl https://xxx.supabase.co/functions/v1/vocab-get`
3. Vérifier logs Supabase Dashboard

### Cache ne fonctionne pas

**Cause:** localStorage désactivé ou plein  
**Solution:**
```typescript
// Vérifier disponibilité
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.warn('localStorage not available');
}
```

---

## 📝 CHECKLIST FINALE

Avant de commit:

- [ ] `.env` configuré avec clés Supabase
- [ ] `vocabulary.ts` modifié (fonctions async)
- [ ] `Vocabulary.tsx` modifié (useEffect + loading)
- [ ] Test local fonctionne (`npm run dev`)
- [ ] Cache fonctionne (reload page)
- [ ] Variables Vercel ajoutées
- [ ] Build passe (`npm run build`)
- [ ] Aucune erreur console

---

**🎯 Résultat final:**  
✅ Données sécurisées  
✅ Performance optimisée  
✅ UX améliorée (loading states)  
✅ Cache intelligent  
✅ Prêt pour production

**LET'S GO! 🚀**
