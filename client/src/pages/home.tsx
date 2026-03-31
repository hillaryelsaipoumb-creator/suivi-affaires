import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Affaire {
  id: number;
  reference: string;
  client: string;
  description: string;
  statut: string;
  dateCreation: string;
  dateEcheance?: string;
}

export default function HomePage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reference: "", client: "", description: "", statut: "En cours", dateCreation: new Date().toISOString().split("T")[0], dateEcheance: "" });

  const { data: affaires = [], isLoading } = useQuery<Affaire[]>({
    queryKey: ["/api/affaires"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Affaire, "id">) => {
      const res = await fetch("/api/affaires", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/affaires"] }); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/affaires/${id}`, { method: "DELETE" }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/affaires"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form as Omit<Affaire, "id">);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>Suivi des Affaires</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#2563eb", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "16px" }}>
          {showForm ? "Annuler" : "+ Nouvelle Affaire"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", marginBottom: "24px" }}>
          <h2 style={{ marginTop: 0 }}>Nouvelle Affaire</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div><label>Référence *</label><br/><input required value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", marginTop: "4px" }} /></div>
            <div><label>Client *</label><br/><input required value={form.client} onChange={e => setForm({...form, client: e.target.value})} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", marginTop: "4px" }} /></div>
            <div style={{ gridColumn: "1/-1" }}><label>Description</label><br/><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", marginTop: "4px", minHeight: "80px" }} /></div>
            <div><label>Statut</label><br/><select value={form.statut} onChange={e => setForm({...form, statut: e.target.value})} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", marginTop: "4px" }}><option>En cours</option><option>En attente</option><option>Terminé</option><option>Annulé</option></select></div>
            <div><label>Date d'échéance</label><br/><input type="date" value={form.dateEcheance} onChange={e => setForm({...form, dateEcheance: e.target.value})} style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", marginTop: "4px" }} /></div>
          </div>
          <button type="submit" style={{ marginTop: "16px", background: "#16a34a", color: "white", border: "none", padding: "10px 24px", borderRadius: "6px", cursor: "pointer", fontSize: "16px" }}>Enregistrer</button>
        </form>
      )}

      {isLoading ? (
        <p>Chargement...</p>
      ) : affaires.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
          <p style={{ fontSize: "18px" }}>Aucune affaire pour le moment</p>
          <p>Cliquez sur "+ Nouvelle Affaire" pour commencer</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f1f5f9" }}>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #e2e8f0" }}>Référence</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #e2e8f0" }}>Client</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #e2e8f0" }}>Description</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #e2e8f0" }}>Statut</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #e2e8f0" }}>Date création</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #e2e8f0" }}>Actions</th>
            </tr></thead>
            <tbody>{affaires.map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>{a.reference}</td>
                <td style={{ padding: "12px", border: "1px solid #e2e8f0" }}>{a.client}</td>
                <td style={{ padding: "12px", border: "1px solid #e2e8f0" }}>{a.description}</td>
                <td style={{ padding: "12px", border: "1px solid #e2e8f0" }}><span style={{ padding: "4px 8px", borderRadius: "4px", background: a.statut === "Terminé" ? "#dcfce7" : a.statut === "En cours" ? "#dbeafe" : a.statut === "Annulé" ? "#fee2e2" : "#fef3c7", fontSize: "13px" }}>{a.statut}</span></td>
                <td style={{ padding: "12px", border: "1px solid #e2e8f0" }}>{a.dateCreation}</td>
                <td style={{ padding: "12px", border: "1px solid #e2e8f0" }}><button onClick={() => deleteMutation.mutate(a.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>Supprimer</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
