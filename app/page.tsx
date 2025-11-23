"use client";

import { useMemo } from "react";
import { storage } from "@/lib/storage";
import { euro, summarize, generateAlerts, guidance } from "@/lib/finance";
import { useSyncExternalStore } from "react";

function useStore<T>(getter: () => T, subscribeKey: string): T {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(subscribeKey, cb as EventListener);
      return () => window.removeEventListener(subscribeKey, cb as EventListener);
    },
    getter,
    getter
  );
}

function emit(key: string) {
  window.dispatchEvent(new Event(key));
}

export default function Dashboard() {
  const settings = useStore(() => storage.getSettings(), "mf_settings_change");
  const transactions = useStore(() => storage.getTransactions(), "mf_tx_change");
  const budgets = useStore(() => storage.getBudgets(), "mf_bg_change");

  const sum = useMemo(
    () => summarize(transactions, budgets, settings.month),
    [transactions, budgets, settings.month]
  );
  const alerts = useMemo(
    () => generateAlerts(transactions, budgets, settings.month),
    [transactions, budgets, settings.month]
  );
  const tips = useMemo(
    () => guidance(transactions, budgets, settings.month),
    [transactions, budgets, settings.month]
  );

  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
      <section className="card" style={{ gridColumn: "span 12" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
          <h2 className="card-title">Vue mensuelle: {settings.month}</h2>
          <MonthPicker
            value={settings.month}
            onChange={(m) => {
              storage.setSettings({ ...settings, month: m });
              emit("mf_settings_change");
            }}
          />
        </div>
        <div className="grid" style={{ marginTop: 8 }}>
          <div className="card" style={{ gridColumn: "span 4" }}>
            <div className="muted">Revenus</div>
            <div className="kpi">{euro(sum.income)}</div>
          </div>
          <div className="card" style={{ gridColumn: "span 4" }}>
            <div className="muted">D?penses</div>
            <div className="kpi">{euro(sum.expense)}</div>
          </div>
          <div className="card" style={{ gridColumn: "span 4" }}>
            <div className="muted">Solde</div>
            <div className="kpi">
              {euro(sum.balance)} <small>apr?s d?penses</small>
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{ gridColumn: "span 8" }}>
        <div className="card-title">D?penses par cat?gorie</div>
        <div style={{ display: "grid", gap: 10 }}>
          {sum.byCategory.map((row) => {
            const cls =
              row.limit === 0
                ? "progress"
                : row.progress >= 1
                ? "progress danger"
                : row.progress >= 0.8
                ? "progress warning"
                : "progress success";
            const pct = Math.min(100, Math.round((row.limit ? row.spent / row.limit : 0) * 100));
            return (
              <div key={row.category}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div className="muted" style={{ fontWeight: 600 }}>{row.category}</div>
                  <div className="muted">
                    {row.limit ? `${euro(row.spent)} / ${euro(row.limit)}` : euro(row.spent)}
                  </div>
                </div>
                <div className={cls}>
                  <span style={{ width: `${row.limit ? Math.min(100, (row.spent / row.limit) * 100) : 0}%` }} />
                </div>
                {row.limit === 0 && (
                  <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                    Aucun budget d?fini.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card" style={{ gridColumn: "span 4" }}>
        <div className="card-title">Guidance</div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
          {tips.map((t, i) => (
            <li key={i} className="tag" style={{ background: "rgba(255,255,255,0.03)" }}>
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="card" style={{ gridColumn: "span 12" }}>
        <div className="card-title">Alertes</div>
        {alerts.length === 0 ? (
          <div className="muted">Aucune alerte.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {alerts.map((a) => (
              <div
                key={a.id}
                className="card"
                style={{
                  borderColor:
                    a.severity === "danger"
                      ? "#ef4444"
                      : a.severity === "warning"
                      ? "#f59e0b"
                      : "rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.message}</div>
                    {a.category && <div className="muted" style={{ fontSize: 12 }}>{a.category}</div>}
                  </div>
                  <span className="tag">{a.severity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MonthPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const months = (() => {
    const now = new Date();
    const arr: string[] = [];
    for (let i = -6; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      arr.push(`${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`);
    }
    return arr;
  })();
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="btn"
      style={{ padding: 8 }}
    >
      {months.map((m) => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>
  );
}

