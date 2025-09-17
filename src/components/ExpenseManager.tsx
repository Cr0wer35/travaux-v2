import React, { useState } from 'react';
import { Plus, Search, Filter, Edit3, Trash2, ExternalLink } from 'lucide-react';
import { Expense } from '../types';
import { CATEGORIES, ROOMS } from '../constants';
import { formatCurrency } from '../utils/calculations';
import { ExpenseForm } from './ExpenseForm';

interface ExpenseManagerProps {
  expenses: Expense[];
  onCreateExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({ 
  expenses, 
  onCreateExpense, 
  onUpdateExpense, 
  onDeleteExpense 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.room.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filterCategory || expense.category === filterCategory;
      const matchesRoom = !filterRoom || expense.room === filterRoom;
      
      return matchesSearch && matchesCategory && matchesRoom;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await onCreateExpense(expense);
      setShowForm(false);
    } catch (error) {
      console.error('Erreur lors de la création de la dépense:', error);
      alert('Erreur lors de la création de la dépense');
    }
  };

  const handleEditExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingExpense) return;
    
    try {
      await onUpdateExpense(editingExpense.id, expense);
      setEditingExpense(null);
      setShowForm(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dépense:', error);
      alert('Erreur lors de la mise à jour de la dépense');
    }
  };

  const handleDeleteExpenseClick = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      try {
        await onDeleteExpense(id);
      } catch (error) {
        console.error('Erreur lors de la suppression de la dépense:', error);
        alert('Erreur lors de la suppression de la dépense');
      }
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Dépenses</h2>
          <p className="text-gray-600 mt-1">
            {filteredExpenses.length} dépense{filteredExpenses.length !== 1 ? 's' : ''} • Total: {formatCurrency(totalExpenses)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Dépense</span>
        </button>
      </div>

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
          onCancel={handleCancel}
        />
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par description, fournisseur, catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les pièces</option>
              {ROOMS.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                setSortBy(sort as 'date' | 'amount' | 'category');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date-desc">Plus récent</option>
              <option value="date-asc">Plus ancien</option>
              <option value="amount-desc">Montant décroissant</option>
              <option value="amount-asc">Montant croissant</option>
              <option value="category-asc">Catégorie A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {expenses.length === 0 ? (
              <>
                <p>Aucune dépense enregistrée.</p>
                <p className="text-sm mt-1">Cliquez sur "Nouvelle Dépense" pour commencer.</p>
              </>
            ) : (
              <p>Aucune dépense ne correspond à vos critères de recherche.</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {expense.category}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {expense.room}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {expense.description}
                    </h4>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Fournisseur: {expense.supplier}</span>
                      {expense.invoiceUrl && (
                        <a
                          href={expense.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Voir facture</span>
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between lg:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(expense)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpenseClick(expense.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};