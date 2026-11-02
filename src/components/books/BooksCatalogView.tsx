import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book as BookIcon, Search, Plus, Filter, Trash2, Edit3, Bookmark, Check, X, ArrowUpRight } from 'lucide-react';
import { Book } from '../../types/database';
import { useLibraryData } from '../../context/LibraryDataContext';
import { useAuth } from '../../context/AuthContext';

interface BooksCatalogViewProps {
  onIssueBook?: (bookId: string) => void;
}

export const BooksCatalogView: React.FC<BooksCatalogViewProps> = ({ onIssueBook }) => {
  const { books, addBook, updateBook, deleteBook } = useLibraryData();
  const { role } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'borrowed'>('all');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formIsbn, setFormIsbn] = useState('');
  const [formCategory, setFormCategory] = useState('Technology');
  const [formPublisher, setFormPublisher] = useState('');
  const [formYear, setFormYear] = useState<number>(2024);
  const [formCopies, setFormCopies] = useState<number>(5);
  const [formShelf, setFormShelf] = useState('A-101');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ['All', ...Array.from(set).sort()];
  }, [books]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter((b) => {
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.shelf_location.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;

      const matchesAvail =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && b.available_copies > 0) ||
        (availabilityFilter === 'borrowed' && b.available_copies < b.total_copies);

      return matchesSearch && matchesCat && matchesAvail;
    });
  }, [books, search, selectedCategory, availabilityFilter]);

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormAuthor('');
    setFormIsbn(`978-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setFormCategory('Technology');
    setFormPublisher('Alexandria Press');
    setFormYear(2024);
    setFormCopies(4);
    setFormShelf(`LOC-${Math.floor(100 + Math.random() * 900)}`);
    setEditingBook(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (b: Book) => {
    setEditingBook(b);
    setFormTitle(b.title);
    setFormAuthor(b.author);
    setFormIsbn(b.isbn);
    setFormCategory(b.category);
    setFormPublisher(b.publisher || '');
    setFormYear(b.year || 2024);
    setFormCopies(b.total_copies);
    setFormShelf(b.shelf_location);
    setIsAddOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAuthor.trim()) return;

    if (editingBook) {
      // Delta adjustment for copies
      const diff = formCopies - editingBook.total_copies;
      const newAvail = Math.max(0, editingBook.available_copies + diff);

      await updateBook(editingBook.id, {
        title: formTitle.trim(),
        author: formAuthor.trim(),
        isbn: formIsbn.trim(),
        category: formCategory,
        publisher: formPublisher.trim() || undefined,
        year: Number(formYear),
        total_copies: Number(formCopies),
        available_copies: newAvail,
        shelf_location: formShelf.trim(),
      });
    } else {
      await addBook({
        title: formTitle.trim(),
        author: formAuthor.trim(),
        isbn: formIsbn.trim(),
        category: formCategory,
        publisher: formPublisher.trim() || undefined,
        year: Number(formYear),
        total_copies: Number(formCopies),
        available_copies: Number(formCopies),
        shelf_location: formShelf.trim(),
      });
    }

    setIsAddOpen(false);
  };

  const handleDelete = async (b: Book) => {
    if (confirm(`Are you sure you want to remove "${b.title}" from the catalog?`)) {
      await deleteBook(b.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-850">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-stone-900 dark:text-stone-100">
            Holdings Catalogue
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            {books.length} registered bibliographic records across {categories.length - 1} disciplines
          </p>
        </div>

        {role !== 'member' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-mono uppercase tracking-wider rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#C8962E]" />
            <span>Add Title to Catalog</span>
          </button>
        )}
      </div>

      {/* Filters and search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, ISBN, or shelf location..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/90 dark:bg-stone-900/90 border border-stone-300 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Discipline: {c}
              </option>
            ))}
          </select>

          {/* Availability filter */}
          <div className="flex items-center p-1 bg-stone-200/60 dark:bg-stone-800/60 rounded-lg text-xs font-mono">
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                availabilityFilter === 'all'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                availabilityFilter === 'available'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setAvailabilityFilter('borrowed')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                availabilityFilter === 'borrowed'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Borrowed
            </button>
          </div>
        </div>
      </div>

      {/* Book Cards Grid with 3D tilt hover */}
      {filteredBooks.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-stone-300 dark:border-stone-800 bg-white/40 dark:bg-stone-900/40 p-8">
          <BookIcon className="w-10 h-10 text-stone-400 mx-auto mb-2 opacity-60" />
          <h3 className="font-serif text-base font-medium text-stone-800 dark:text-stone-200">
            No books match &ldquo;{search}&rdquo;
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try another title, author, or reset the discipline filter.
          </p>
          {(search || selectedCategory !== 'All' || availabilityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setAvailabilityFilter('all');
              }}
              className="mt-4 px-3 py-1.5 text-xs font-mono text-[#12372A] dark:text-emerald-400 border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBooks.map((book) => {
            const isAvail = book.available_copies > 0;
            return (
              <motion.div
                key={book.id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative p-4 rounded-xl bg-white/85 dark:bg-[#161C19]/90 border border-stone-200/90 dark:border-stone-800 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top metadata line with typographic separators */}
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-stone-500 dark:text-stone-400 mb-2">
                    <span className="truncate">{book.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="shrink-0">Loc: {book.shelf_location}</span>
                  </div>

                  {/* Title & Author */}
                  <h3 className="font-serif text-base font-medium text-stone-900 dark:text-stone-100 group-hover:text-[#12372A] dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {book.title}
                  </h3>
                  <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    by {book.author}
                  </div>

                  {/* ISBN & Year */}
                  <div className="text-[11px] font-mono text-stone-400 mt-2">
                    ISBN: {book.isbn} {book.year ? `· ${book.year}` : ''}
                  </div>
                </div>

                {/* Bottom copy status & action */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between gap-2">
                  <div className="font-mono text-xs">
                    <span
                      className={`font-semibold ${
                        isAvail ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {book.available_copies} / {book.total_copies}
                    </span>{' '}
                    <span className="text-stone-400 text-[10px]">copies</span>
                  </div>

                  {role !== 'member' ? (
                    <div className="flex items-center gap-1.5">
                      {isAvail && onIssueBook && (
                        <button
                          onClick={() => onIssueBook(book.id)}
                          title="Issue this volume"
                          className="px-2 py-1 text-[11px] font-mono bg-[#12372A] hover:bg-[#1A4D3B] text-white rounded transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Issue</span>
                          <ArrowUpRight className="w-3 h-3 text-[#C8962E]" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(book)}
                        title="Edit title details"
                        className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(book)}
                        title="Remove title"
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      {isAvail ? (
                        <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          Available on shelf
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                          All copies on loan
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Book Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#FCFAF6] dark:bg-[#18201C] border border-stone-300 dark:border-stone-800 rounded-xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
                  {editingBook ? 'Edit Bibliographic Record' : 'Add New Title to Catalogue'}
                </h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBook} className="mt-4 space-y-4 text-xs font-mono">
                <div>
                  <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Structure and Interpretation of Computer Programs"
                    className="w-full px-3 py-2 text-sm font-sans bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                      Author(s) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="e.g. Harold Abelson"
                      className="w-full px-3 py-2 text-sm font-sans bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                      ISBN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formIsbn}
                      onChange={(e) => setFormIsbn(e.target.value)}
                      placeholder="978-0262510875"
                      className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                      Discipline / Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Science">Science</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Philosophy">Philosophy</option>
                      <option value="History">History</option>
                      <option value="Economics">Economics</option>
                      <option value="Psychology">Psychology</option>
                      <option value="Art & Design">Art &amp; Design</option>
                      <option value="Literature">Literature</option>
                    </select>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                      Shelf Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formShelf}
                      onChange={(e) => setFormShelf(e.target.value)}
                      placeholder="e.g. TECH-420"
                      className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-[#C8962E] text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                      Total Copies
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={formCopies}
                      onChange={(e) => setFormCopies(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      min={1800}
                      max={2030}
                      value={formYear}
                      onChange={(e) => setFormYear(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                      Publisher
                    </label>
                    <input
                      type="text"
                      value={formPublisher}
                      onChange={(e) => setFormPublisher(e.target.value)}
                      placeholder="MIT Press"
                      className="w-full px-3 py-2 text-sm font-sans bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#12372A] hover:bg-[#1A4D3B] text-white rounded font-mono uppercase tracking-wider cursor-pointer"
                  >
                    {editingBook ? 'Save Changes' : 'Add to Catalog'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
