import { Expense, Budget, BudgetSummary } from '../types';

export const calculateBudgetSummary = (expenses: Expense[], budgets: Budget[]): BudgetSummary => {
  // Calculer le budget total en parcourant la hiérarchie
  const totalBudget = calculateTotalBudget(budgets);
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = totalBudget - totalSpent;

  const categories: { [key: string]: { budget: number; spent: number; remaining: number } } = {};
  const rooms: { [key: string]: { budget: number; spent: number; remaining: number } } = {};

  // Initialiser les catégories et pièces à partir des budgets
  const flatBudgets = flattenBudgets(budgets);
  flatBudgets.forEach(budget => {
    if (budget.category && !categories[budget.category]) {
      categories[budget.category] = { budget: 0, spent: 0, remaining: 0 };
    }
    if (budget.category) {
      categories[budget.category].budget += budget.amount;
    }

    if (budget.room && !rooms[budget.room]) {
      rooms[budget.room] = { budget: 0, spent: 0, remaining: 0 };
    }
    if (budget.room) {
      rooms[budget.room].budget += budget.amount;
    }
  });

  // Calculer les montants dépensés
  expenses.forEach(expense => {
    if (!categories[expense.category]) {
      categories[expense.category] = { budget: 0, spent: 0, remaining: 0 };
    }
    categories[expense.category].spent += expense.amount;

    if (!rooms[expense.room]) {
      rooms[expense.room] = { budget: 0, spent: 0, remaining: 0 };
    }
    rooms[expense.room].spent += expense.amount;
  });

  // Calculer les montants restants
  Object.keys(categories).forEach(category => {
    categories[category].remaining = categories[category].budget - categories[category].spent;
  });

  Object.keys(rooms).forEach(room => {
    rooms[room].remaining = rooms[room].budget - rooms[room].spent;
  });

  return {
    totalBudget,
    totalSpent,
    remainingBudget,
    categories,
    rooms,
    budgetHierarchy: budgets
  };
};

// Calculer le budget total en parcourant la hiérarchie
const calculateTotalBudget = (budgets: Budget[]): number => {
  return budgets.reduce((total, budget) => {
    // Si le budget a des enfants, on compte seulement les enfants
    if (budget.children && budget.children.length > 0) {
      return total + calculateTotalBudget(budget.children);
    }
    // Sinon on compte le budget lui-même
    return total + budget.amount;
  }, 0);
};

// Aplatir la hiérarchie des budgets
const flattenBudgets = (budgets: Budget[]): Budget[] => {
  const result: Budget[] = [];
  
  budgets.forEach(budget => {
    result.push(budget);
    if (budget.children && budget.children.length > 0) {
      result.push(...flattenBudgets(budget.children));
    }
  });
  
  return result;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const getBudgetStatus = (budget: number, spent: number): 'success' | 'warning' | 'error' => {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  if (percentage <= 80) return 'success';
  if (percentage <= 100) return 'warning';
  return 'error';
};