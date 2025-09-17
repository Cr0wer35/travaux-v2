import { supabase } from '../lib/supabase';
import { Budget } from '../types';

export const budgetService = {
  // Récupérer tous les budgets avec hiérarchie
  async getBudgets(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Convertir les données de la DB vers le format de l'app
    const budgets: Budget[] = data.map(budget => ({
      id: budget.id,
      name: budget.name,
      amount: budget.amount,
      category: budget.category || undefined,
      room: budget.room || undefined,
      parentId: budget.parent_id || undefined,
      createdAt: budget.created_at,
      updatedAt: budget.updated_at,
      children: []
    }));

    // Construire la hiérarchie
    return buildBudgetHierarchy(budgets);
  },

  // Créer un nouveau budget
  async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'children'>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        name: budget.name,
        amount: budget.amount,
        category: budget.category || null,
        room: budget.room || null,
        parent_id: budget.parentId || null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      amount: data.amount,
      category: data.category || undefined,
      room: data.room || undefined,
      parentId: data.parent_id || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      children: []
    };
  },

  // Mettre à jour un budget
  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update({
        name: updates.name,
        amount: updates.amount,
        category: updates.category || null,
        room: updates.room || null,
        parent_id: updates.parentId || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      amount: data.amount,
      category: data.category || undefined,
      room: data.room || undefined,
      parentId: data.parent_id || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      children: []
    };
  },

  // Supprimer un budget
  async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Fonction utilitaire pour construire la hiérarchie des budgets
function buildBudgetHierarchy(budgets: Budget[]): Budget[] {
  const budgetMap = new Map<string, Budget>();
  const rootBudgets: Budget[] = [];

  // Créer une map de tous les budgets
  budgets.forEach(budget => {
    budgetMap.set(budget.id, { ...budget, children: [] });
  });

  // Construire la hiérarchie
  budgets.forEach(budget => {
    const budgetWithChildren = budgetMap.get(budget.id)!;
    
    if (budget.parentId) {
      const parent = budgetMap.get(budget.parentId);
      if (parent) {
        parent.children!.push(budgetWithChildren);
      }
    } else {
      rootBudgets.push(budgetWithChildren);
    }
  });

  return rootBudgets;
}