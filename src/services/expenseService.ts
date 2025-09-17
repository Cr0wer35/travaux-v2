import { supabase } from '../lib/supabase';
import { Expense } from '../types';

export const expenseService = {
  // Récupérer toutes les dépenses
  async getExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(expense => ({
      id: expense.id,
      date: expense.date,
      amount: expense.amount,
      category: expense.category,
      room: expense.room,
      supplier: expense.supplier,
      description: expense.description,
      invoiceUrl: expense.invoice_url || undefined,
      createdAt: expense.created_at,
      updatedAt: expense.updated_at
    }));
  },

  // Créer une nouvelle dépense
  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        date: expense.date,
        amount: expense.amount,
        category: expense.category,
        room: expense.room,
        supplier: expense.supplier,
        description: expense.description,
        invoice_url: expense.invoiceUrl || null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      date: data.date,
      amount: data.amount,
      category: data.category,
      room: data.room,
      supplier: data.supplier,
      description: data.description,
      invoiceUrl: data.invoice_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Mettre à jour une dépense
  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        date: updates.date,
        amount: updates.amount,
        category: updates.category,
        room: updates.room,
        supplier: updates.supplier,
        description: updates.description,
        invoice_url: updates.invoiceUrl || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      date: data.date,
      amount: data.amount,
      category: data.category,
      room: data.room,
      supplier: data.supplier,
      description: data.description,
      invoiceUrl: data.invoice_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Supprimer une dépense
  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};