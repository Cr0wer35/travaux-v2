import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Expense } from '../types';
import { CATEGORIES, ROOMS } from '../constants';

interface ExpenseFormProps {
  expense?: Expense | null;
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

interface FormData {
  date: string;
  amount: string;
  category: string;
  room: string;
  supplier: string;
  description: string;
  invoiceUrl: string;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: CATEGORIES[0],
    room: ROOMS[0],
    supplier: '',
    description: '',
    invoiceUrl: ''
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        amount: expense.amount.toString(),
        category: expense.category,
        room: expense.room,
        supplier: expense.supplier,
        description: expense.description,
        invoiceUrl: expense.invoiceUrl || ''
      });
    }
  }, [expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || isNaN(parseFloat(formData.amount))) return;

    onSubmit({
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      room: formData.room,
      supplier: formData.supplier,
      description: formData.description,
      invoiceUrl: formData.invoiceUrl || undefined
    });
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {expense ? 'Modifier la Dépense' : 'Nouvelle Dépense'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pièce *
            </label>
            <select
              value={formData.room}
              onChange={(e) => handleChange('room', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {ROOMS.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fournisseur / Artisan *
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Leroy Merlin, Electricien Martin..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lien Facture
            </label>
            <input
              type="url"
              value={formData.invoiceUrl}
              onChange={(e) => handleChange('invoiceUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://drive.google.com/..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Décrivez la dépense..."
            required
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{expense ? 'Mettre à jour' : 'Enregistrer'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Annuler</span>
          </button>
        </div>
      </form>
    </div>
  );
};