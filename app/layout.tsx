export const metadata = {
  title: "Ma Finance - Suivi et Alertes",
  description: "G?rez vos d?penses, budgets et alertes locales.",
};

import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import { NavLink } from "@/lib/navlink";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <div className="brand">
              <span className="brand-badge" />
              <span>Ma Finance</span>
            </div>
            <div className="nav-links">
              <NavLink href="/">Tableau de bord</NavLink>
              <NavLink href="/transactions">Transactions</NavLink>
              <NavLink href="/budgets">Budgets</NavLink>
              <NavLink href="/alerts">Alertes</NavLink>
            </div>
          </div>
        </nav>
        <main className="container">{children}</main>
        <footer className="container" style={{ opacity: 0.6, fontSize: 12 }}>
          Fichier local uniquement ? vos donn?es restent dans votre navigateur.
        </footer>
      </body>
    </html>
  );
}

