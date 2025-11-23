"use client";

import { storage } from "@/lib/storage";
import { generateAlerts } from "@/lib/finance";
import { useMemo } from "react";
import { useSyncExternalStore } from "react";

function useAll() {
  const settings = storage.getSettings();
  const tx = useSyncExternalStore(
    (cb) => {
      window.addEventListener("mf_tx_change", cb as EventListener);
      return () => window.removeEventListener("mf_tx_change", cb as EventListener);
    },
    () => storage.getTransactions(),
    () => []
  );
  const budgets = useSyncExternalStore(
    (cb) => {
      window.addEventListener("mf_bg_change", cb as EventListener);
      return () => window.removeEventListener("mf_bg_change", cb as EventListener);
    },
    () => storage.getBudgets(),
    () => []
  );
  return { settings, tx, budgets };
}

export default function AlertsPage() {
  const { settings, tx, budgets } = useAll();
  const alerts = useMemo(
    () => generateAlerts(tx, budgets, settings.month),
    [tx, budgets, settings.month]
  );
  return (
    <div className="grid">
      <section className="card" style={{ gridColumn: "span 12" }}>
        <div className="card-title">Alertes</div>
        {alerts.length === 0 ? (
          <div className="muted">Aucune alerte pour {settings.month}.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
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

