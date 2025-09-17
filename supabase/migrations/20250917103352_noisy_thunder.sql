/*
  # Création des tables pour le suivi des travaux d'appartement

  1. Nouvelles Tables
    - `budgets`
      - `id` (uuid, primary key)
      - `name` (text) - nom du budget (ex: "Budget Global", "Salle de bain")
      - `amount` (numeric) - montant du budget
      - `category` (text, nullable) - catégorie si applicable
      - `room` (text, nullable) - pièce si applicable
      - `parent_id` (uuid, nullable) - référence au budget parent pour hiérarchie
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `date` (date) - date de la dépense
      - `amount` (numeric) - montant de la dépense
      - `category` (text) - catégorie de la dépense
      - `room` (text) - pièce concernée
      - `supplier` (text) - fournisseur/artisan
      - `description` (text) - description de la dépense
      - `invoice_url` (text, nullable) - lien vers la facture
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques pour permettre toutes les opérations (usage personnel)
*/

-- Table des budgets avec hiérarchie
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  category text,
  room text,
  parent_id uuid REFERENCES budgets(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des dépenses
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  room text NOT NULL,
  supplier text NOT NULL,
  description text NOT NULL,
  invoice_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Politiques pour usage personnel (accès complet)
CREATE POLICY "Allow all operations on budgets"
  ON budgets
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on expenses"
  ON expenses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_budgets_parent_id ON budgets(parent_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_room ON expenses(room);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();