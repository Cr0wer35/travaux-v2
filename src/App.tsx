import React, { useState, useEffect } from 'react';
import { BarChart3, Calculator, Receipt, Home, Wrench } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { BudgetManager } from './components/BudgetManager';
import { ExpenseManager } from './components/ExpenseManager';
import { ViewMode, Expense, Budget } from './types';
import { budgetService } from './services/budgetService';
import { expenseService } from './services/expenseService';
import { calculateBudgetSummary } from './utils/calculations';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, budgetsData] = await Promise.all([
        expenseService.getExpenses(),
        budgetService.getBudgets()
      ]);
      setExpenses(expensesData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Gestion des budgets
  const handleCreateBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'children'>) => {
    await budgetService.createBudget(budget);
    await loadData(); // Recharger les données
  };

  const handleUpdateBudget = async (id: string, budget: Partial<Budget>) => {
    await budgetService.updateBudget(id, budget);
    await loadData(); // Recharger les données
  };

  const handleDeleteBudget = async (id: string) => {
    await budgetService.deleteBudget(id);
    await loadData(); // Recharger les données
  };

  // Gestion des dépenses
  const handleCreateExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    await expenseService.createExpense(expense);
    await loadData(); // Recharger les données
  };

  const handleUpdateExpense = async (id: string, expense: Partial<Expense>) => {
    await expenseService.updateExpense(id, expense);
    await loadData(); // Recharger les données
  };

  const handleDeleteExpense = async (id: string) => {
    await expenseService.deleteExpense(id);
    await loadData(); // Recharger les données
  };

  const budgetSummary = calculateBudgetSummary(expenses, budgets);

  const navigationItems = [
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: BarChart3 },
    { id: 'budget' as ViewMode, label: 'Budgets', icon: Calculator },
    { id: 'expenses' as ViewMode, label: 'Dépenses', icon: Receipt }
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard budgetSummary={budgetSummary} />;
      case 'budget':
        return (
          <BudgetManager 
            budgets={budgets} 
            onBudgetChange={setBudgets}
            onCreateBudget={handleCreateBudget}
            onUpdateBudget={handleUpdateBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        );
      case 'expenses':
        return (
          <ExpenseManager 
            expenses={expenses}
            onCreateExpense={handleCreateExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RénoTracker</h1>
                <p className="text-xs text-gray-500">Suivi des travaux d'appartement</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Projet en cours</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  currentView === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            RénoTracker - Gestion simplifiée de vos travaux d'appartement
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;