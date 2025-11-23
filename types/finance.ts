export type Category =
  | "Logement"
  | "Alimentation"
  | "Transport"
  | "Sant?"
  | "Loisirs"
  | "Factures"
  | "?pargne"
  | "Autre";

export interface Transaction {
  id: string;
  type: "revenu" | "depense";
  category: Category;
  label: string;
  amount: number; // euros
  date: string; // ISO
  notes?: string;
}

export interface Budget {
  id: string;
  category: Category;
  monthlyLimit: number; // euros
}

export interface Settings {
  currency: string; // e.g., "?"
  month: string; // YYYY-MM, current scope
}

export interface Alert {
  id: string;
  severity: "info" | "warning" | "danger";
  message: string;
  category?: Category;
}

