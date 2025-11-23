"use client";

import { useState } from "react";
import { storage } from "@/lib/storage";
import { CATEGORIES, euro } from "@/lib/finance";
import { Budget } from "@/types/finance";
import { useSyncExternalStore } from "react";

function useBudgets() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("mf_bg_change", cb as EventListener);
      return () => window.removeEventListener("mf_bg_change", cb as EventListener);
    },
    () => storage.getBudgets(),
    () => []
  );
}
function emitBg() {
  window.dispatchEvent(new Event("mf_bg_change"));
}

export default function BudgetsPage() {
  const budgets = useBudgets();
  const [form, setForm] = useState<Partial<Budget>>({
    category: "Autre",
    monthlyLimit: 0,
  });

  function saveBudget() {
    if (!form.category) return;
    const all = storage.getBudgets();
    const existing = all.find((b) => b.category === form.category);
    if (existing) {
      existing.monthlyLimit = Number(form.monthlyLimit ?? 0);
    } else {
      all.push({
        id: crypto.randomUUID(),
        category: form.category as any,
        monthlyLimit: Number(form.monthlyLimit ?? 0),
      });
    }
    storage.setBudgets(all);
    emitBg();
  }

  function removeBudget(id: string) {
    storage.setBudgets(storage.getBudgets().filter((b) => b.id !== id));
    emitBg();
  }

  return (
    <div className="grid">
      <section className="card" style={{ gridColumn: "span 12" }}>
        <div className="card-title">D?finir un budget mensuel</div>
        <div className="form">
          <div>
            <label>Cat?gorie</label>
            <select
              value={form.category as any}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Plafond (? / mois)</label>
            <input
              type="number"
              value={form.monthlyLimit ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, monthlyLimit: Number(e.target.value) }))}
            />
          </div>
          <div className="full">
            <button className="btn primary" onClick={saveBudget}>Enregistrer</button>
          </div>
        </div>
      </section>

      <section className="card" style={{ gridColumn: "span 12" }}>
        <div className="card-title">Budgets d?finis</div>
        <table className="table">
          <thead>
            <tr>
              <th>Cat?gorie</th>
              <th className="amount">Plafond mensuel</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => (
              <tr key={b.id}>
                <td>{b.category}</td>
                <td className="amount">{euro(b.monthlyLimit)}</td>
                <td>
                  <button className="btn" onClick={() => removeBudget(b.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

