"use client";

import { useMemo, useState } from "react";
import { storage } from "@/lib/storage";
import { CATEGORIES, euro, monthOf } from "@/lib/finance";
import { Transaction } from "@/types/finance";
import { useSyncExternalStore } from "react";

function useTx() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("mf_tx_change", cb as EventListener);
      return () => window.removeEventListener("mf_tx_change", cb as EventListener);
    },
    () => storage.getTransactions(),
    () => []
  );
}

function emitTx() {
  window.dispatchEvent(new Event("mf_tx_change"));
}

export default function TransactionsPage() {
  const settings = storage.getSettings();
  const [form, setForm] = useState<Partial<Transaction>>({
    type: "depense",
    category: "Autre",
    date: new Date().toISOString().slice(0, 10),
  });
  const tx = useTx();
  const monthTx = useMemo(
    () => tx.filter((t) => monthOf(t.date) === settings.month),
    [tx, settings.month]
  );

  function addTx() {
    if (!form.type || !form.category || !form.label || !form.amount || !form.date) return;
    const item: Transaction = {
      id: crypto.randomUUID(),
      type: form.type as "revenu" | "depense",
      category: form.category as any,
      label: form.label!,
      amount: Number(form.amount),
      date: form.date!,
      notes: form.notes,
    };
    const all = [item, ...storage.getTransactions()];
    storage.setTransactions(all);
    emitTx();
    setForm((f) => ({ ...f, label: "", amount: 0, notes: "" }));
  }

  function removeTx(id: string) {
    const all = storage.getTransactions().filter((t) => t.id !== id);
    storage.setTransactions(all);
    emitTx();
  }

  return (
    <div className="grid">
      <section className="card" style={{ gridColumn: "span 12" }}>
        <div className="card-title">Nouvelle transaction</div>
        <div className="form">
          <div className="row">
            <div>
              <label>Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
              >
                <option value="depense">D?pense</option>
                <option value="revenu">Revenu</option>
              </select>
            </div>
            <div>
              <label>Cat?gorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row">
            <div>
              <label>Libell?</label>
              <input
                value={form.label ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Ex: Courses, Salaire..."
              />
            </div>
            <div>
              <label>Montant (?)</label>
              <input
                type="number"
                value={form.amount ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="row">
            <div>
              <label>Date</label>
              <input
                type="date"
                value={form.date as string}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div>
              <label>Notes</label>
              <input
                value={form.notes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="row full">
            <button className="btn primary" onClick={addTx}>Ajouter</button>
          </div>
        </div>
      </section>

      <section className="card" style={{ gridColumn: "span 12" }}>
        <div className="card-title">Transactions du mois</div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Cat?gorie</th>
              <th>Libell?</th>
              <th className="amount">Montant</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {monthTx.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.type}</td>
                <td>{t.category}</td>
                <td>{t.label}</td>
                <td className="amount">{euro(t.amount)}</td>
                <td>
                  <button className="btn" onClick={() => removeTx(t.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

