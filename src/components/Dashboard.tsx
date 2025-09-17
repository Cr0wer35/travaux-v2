import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { BudgetSummary } from '../types';
import { formatCurrency, getBudgetStatus } from '../utils/calculations';

interface DashboardProps {
  budgetSummary: BudgetSummary;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'];

export const Dashboard: React.FC<DashboardProps> = ({ budgetSummary }) => {
  const { totalBudget, totalSpent, categories, rooms } = budgetSummary;
  const overallStatus = getBudgetStatus(totalBudget, totalSpent);
  const remainingBudget = totalBudget - totalSpent;

  // Data for category pie chart
  const categoryData = Object.entries(categories)
    .filter(([_, data]) => data.spent > 0)
    .map(([name, data]) => ({
      name,
      value: data.spent
    }));

  // Data for budget comparison chart
  const comparisonData = Object.entries(categories)
    .filter(([_, data]) => data.budget > 0 || data.spent > 0)
    .map(([name, data]) => ({
      name: name.length > 10 ? name.substring(0, 10) + '...' : name,
      budget: data.budget,
      spent: data.spent
    }));

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Budget Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
          overallStatus === 'success' ? 'border-green-500' : 
          overallStatus === 'warning' ? 'border-yellow-500' : 'border-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dépensé</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
            </div>
            <div className={`p-3 rounded-full ${
              overallStatus === 'success' ? 'bg-green-100' : 
              overallStatus === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {overallStatus === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : overallStatus === 'warning' ? (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Remaining Budget Card */}
        <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
          remainingBudget >= 0 ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Restant</p>
              <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(remainingBudget)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${remainingBudget >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {remainingBudget >= 0 ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Budget Usage Percentage */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisation</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par Catégorie</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              Aucune dépense enregistrée
            </div>
          )}
        </div>

        {/* Budget vs Actual Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget vs Réel par Catégorie</h3>
          {comparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}€`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
                <Bar dataKey="spent" fill="#10B981" name="Dépensé" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              Aucun budget défini
            </div>
          )}
        </div>
      </div>

      {/* Category Details */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Détail par Catégorie</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categories).map(([category, data]) => {
            if (data.budget === 0 && data.spent === 0) return null;
            const status = getBudgetStatus(data.budget, data.spent);
            const percentage = data.budget > 0 ? (data.spent / data.budget) * 100 : 0;
            
            return (
              <div key={category} className={`p-4 rounded-lg border-l-4 ${
                status === 'success' ? 'border-green-500 bg-green-50' : 
                status === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'
              }`}>
                <h4 className="font-medium text-gray-800 mb-2">{category}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">{formatCurrency(data.budget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dépensé:</span>
                    <span className="font-medium">{formatCurrency(data.spent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Restant:</span>
                    <span className={`font-medium ${data.budget - data.spent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(data.budget - data.spent)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilisation:</span>
                    <span className={`font-medium ${
                      percentage <= 80 ? 'text-green-600' : 
                      percentage <= 100 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};