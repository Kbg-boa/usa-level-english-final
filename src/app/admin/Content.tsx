import { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Filter,
  BookOpen,
  Tags,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload
} from 'lucide-react';

interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  example?: string;
  pronunciation?: string;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  'Business',
  'Travel',
  'Food',
  'Technology',
  'Health',
  'Education',
  'Entertainment',
  'Sports',
  'Nature',
  'Communication'
];

export function Content() {
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Mock pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Form state
  const [formData, setFormData] = useState({
    word: '',
    translation: '',
    category: 'Business',
    difficulty: 'intermediate' as VocabularyWord['difficulty'],
    example: '',
    pronunciation: '',
  });

  useEffect(() => {
    fetchVocabulary();
  }, [searchTerm, categoryFilter, difficultyFilter]);

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API call
      const mockData: VocabularyWord[] = [
        {
          id: '1',
          word: 'Entrepreneur',
          translation: 'A person who starts a business',
          category: 'Business',
          difficulty: 'intermediate',
          example: 'She became a successful entrepreneur at age 25.',
          pronunciation: '/ˌɑːntrəprəˈnɜːr/',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          word: 'Innovation',
          translation: 'A new idea or method',
          category: 'Technology',
          difficulty: 'intermediate',
          example: 'The company is known for its innovation.',
          pronunciation: '/ˌɪnəˈveɪʃən/',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        // Add more mock data as needed
      ];

      let filtered = mockData;

      // Apply filters
      if (searchTerm) {
        filtered = filtered.filter(
          (word) =>
            word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            word.translation.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (categoryFilter) {
        filtered = filtered.filter((word) => word.category === categoryFilter);
      }

      if (difficultyFilter) {
        filtered = filtered.filter((word) => word.difficulty === difficultyFilter);
      }

      setVocabulary(filtered);
    } catch (err: any) {
      console.error('Vocabulary fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWord = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // TODO: Replace with actual API call
      const newWord: VocabularyWord = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setVocabulary([newWord, ...vocabulary]);

      // Reset form
      setFormData({
        word: '',
        translation: '',
        category: 'Business',
        difficulty: 'intermediate',
        example: '',
        pronunciation: '',
      });

      setShowCreateModal(false);
    } catch (err: any) {
      alert('Error creating word: ' + err.message);
    }
  };

  const handleUpdateWord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingWord) return;

    try {
      // TODO: Replace with actual API call
      const updatedVocabulary = vocabulary.map((word) =>
        word.id === editingWord.id
          ? { ...word, ...formData, updated_at: new Date().toISOString() }
          : word
      );

      setVocabulary(updatedVocabulary);
      setEditingWord(null);
      setFormData({
        word: '',
        translation: '',
        category: 'Business',
        difficulty: 'intermediate',
        example: '',
        pronunciation: '',
      });
    } catch (err: any) {
      alert('Error updating word: ' + err.message);
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    if (!confirm('Are you sure you want to delete this word?')) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      setVocabulary(vocabulary.filter((word) => word.id !== wordId));
    } catch (err: any) {
      alert('Error deleting word: ' + err.message);
    }
  };

  const handleEditWord = (word: VocabularyWord) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      translation: word.translation,
      category: word.category,
      difficulty: word.difficulty,
      example: word.example || '',
      pronunciation: word.pronunciation || '',
    });
  };

  const getDifficultyColor = (difficulty: VocabularyWord['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = vocabulary.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(vocabulary.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage vocabulary database (9000 words)</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-5 h-5" />
            Import CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Word
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Words</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{vocabulary.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{CATEGORIES.length}</p>
            </div>
            <Tags className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Beginner</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {vocabulary.filter((w) => w.difficulty === 'beginner').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Advanced</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {vocabulary.filter((w) => w.difficulty === 'advanced').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search words or translations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vocabulary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            Error: {error}
            <button
              onClick={fetchVocabulary}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium">No vocabulary found</p>
            <p className="text-sm mt-1">Add your first word to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Word
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Translation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Example
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((word) => (
                    <tr key={word.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{word.word}</div>
                          {word.pronunciation && (
                            <div className="text-xs text-gray-500 font-mono mt-1">
                              {word.pronunciation}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{word.translation}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {word.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                            word.difficulty
                          )}`}
                        >
                          {word.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {word.example || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditWord(word)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWord(word.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, vocabulary.length)}
                </span>{' '}
                of <span className="font-medium">{vocabulary.length}</span> words
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingWord) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingWord ? 'Edit Word' : 'Add New Word'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingWord(null);
                  setFormData({
                    word: '',
                    translation: '',
                    category: 'Business',
                    difficulty: 'intermediate',
                    example: '',
                    pronunciation: '',
                  });
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingWord ? handleUpdateWord : handleCreateWord}
              className="p-6 space-y-6"
            >
              {/* Word */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Word *
                </label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  placeholder="Innovation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Translation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Translation *
                </label>
                <input
                  type="text"
                  value={formData.translation}
                  onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                  placeholder="A new idea or method"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Category & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target.value as VocabularyWord['difficulty'],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Pronunciation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pronunciation (IPA)
                </label>
                <input
                  type="text"
                  value={formData.pronunciation}
                  onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                  placeholder="/ˌɪnəˈveɪʃən/"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>

              {/* Example */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Example Sentence
                </label>
                <textarea
                  value={formData.example}
                  onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                  placeholder="The company is known for its innovation."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingWord(null);
                    setFormData({
                      word: '',
                      translation: '',
                      category: 'Business',
                      difficulty: 'intermediate',
                      example: '',
                      pronunciation: '',
                    });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingWord ? 'Update Word' : 'Add Word'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
