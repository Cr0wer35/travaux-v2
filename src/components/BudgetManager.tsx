import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, ChevronRight, ChevronDown } from 'lucide-react';
import { Budget } from '../types';
import { CATEGORIES, ROOMS } from '../constants';
import { formatCurrency } from '../utils/calculations';

interface BudgetManagerProps {
  budgets: Budget[];
  onBudgetChange: (budgets: Budget[]) => void;
  onCreateBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'children'>) => Promise<void>;
  onUpdateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
}

interface BudgetForm {
  name: string;
  amount: string;
  category: string;
  room: string;
  parentId: string;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({ 
  budgets, 
  onCreateBudget, 
  onUpdateBudget, 
  onDeleteBudget 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedBudgets, setExpandedBudgets] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<BudgetForm>({
    name: '',
    amount: '',
    category: '',
    room: '',
    parentId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || isNaN(parseFloat(form.amount))) return;

    const budgetData = {
      name: form.name,
      amount: parseFloat(form.amount),
      category: form.category || undefined,
      room: form.room || undefined,
      parentId: form.parentId || undefined
    };

    try {
      if (editingId) {
        await onUpdateBudget(editingId, budgetData);
        setEditingId(null);
      } else {
        await onCreateBudget(budgetData);
      }

      setForm({ name: '', amount: '', category: '', room: '', parentId: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du budget:', error);
      alert('Erreur lors de la sauvegarde du budget');
    }
  };

  const handleEdit = (budget: Budget) => {
    setForm({
      name: budget.name,
      amount: budget.amount.toString(),
      category: budget.category || '',
      room: budget.room || '',
      parentId: budget.parentId || ''
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) {
      try {
        await onDeleteBudget(id);
      } catch (error) {
        console.error('Erreur lors de la suppression du budget:', error);
        alert('Erreur lors de la suppression du budget');
      }
    }
  };

  const handleCancel = () => {
    setForm({ name: '', amount: '', category: '', room: '', parentId: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleExpanded = (budgetId: string) => {
    const newExpanded = new Set(expandedBudgets);
    if (newExpanded.has(budgetId)) {
      newExpanded.delete(budgetId);
    } else {
      newExpanded.add(budgetId);
    }
    setExpandedBudgets(newExpanded);
  };

  const getAllBudgets = (budgets: Budget[]): Budget[] => {
    const result: Budget[] = [];
    budgets.forEach(budget => {
      result.push(budget);
      if (budget.children) {
        result.push(...getAllBudgets(budget.children));
      }
    });
    return result;
  };

  const calculateTotalBudget = (budgets: Budget[]): number => {
    return budgets.reduce((total, budget) => {
      if (budget.children && budget.children.length > 0) {
        return total + calculateTotalBudget(budget.children);
      }
      return total + budget.amount;
    }, 0);
  };

  const renderBudgetTree = (budgets: Budget[], level = 0) => {
    return budgets.map((budget) => (
      <div key={budget.id}>
        <div className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${
          level === 0 ? 'border-blue-500' : level === 1 ? 'border-green-500' : 'border-gray-300'
        }`} style={{ marginLeft: `${level * 20}px` }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {budget.children && budget.children.length > 0 && (
                  <button
                    onClick={() => toggleExpanded(budget.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {expandedBudgets.has(budget.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{budget.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {budget.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {budget.category}
                      </span>
                    )}
                    {budget.room && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {budget.room}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(budget.amount)}
                </div>
                {budget.children && budget.children.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Sous-total: {formatCurrency(calculateTotalBudget(budget.children))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(budget)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(budget.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {budget.children && budget.children.length > 0 && expandedBudgets.has(budget.id) && (
          <div>
            {renderBudgetTree(budget.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const totalBudget = calculateTotalBudget(budgets);
  const allBudgets = getAllBudgets(budgets);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Budgets</h2>
          <p className="text-gray-600 mt-1">Budget total: {formatCurrency(totalBudget)}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Budget</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingId ? 'Modifier le Budget' : 'Nouveau Budget'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Budget *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Budget Global, Salle de bain..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Parent
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Aucun (Budget principal)</option>
                  {allBudgets
                    .filter(b => b.id !== editingId)
                    .map(budget => (
                      <option key={budget.id} value={budget.id}>
                        {budget.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Aucune catégorie</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pièce
                </label>
                <select
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Aucune pièce</option>
                  {ROOMS.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{editingId ? 'Mettre à jour' : 'Ajouter'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Annuler</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Hiérarchie des Budgets</h3>
        </div>
        
        {budgets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Aucun budget défini.</p>
            <p className="text-sm mt-1">Cliquez sur "Nouveau Budget" pour commencer.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {renderBudgetTree(budgets)}
          </div>
        )}
      </div>
    </div>
  );
};