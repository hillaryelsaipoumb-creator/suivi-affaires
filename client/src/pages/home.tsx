import { useState } from "react";

type Ligne = {
  collegue: string;
  specialite: string;
  affaire: string;
  libelle: string;
};

const DATA: Ligne[] = [
  { collegue: "Rachid (AIT SAID)", specialite: "MECA", affaire: "PNPP2601", libelle: "Optimisation du renforcement DVN" },
  { collegue: "Rachid (AIT SAID)", specialite: "MECA", affaire: "PNPE2579", libelle: "Traitement du risque de fluite aux singularit\u00e9s sur RHY" },
  { collegue: "Rachid (AIT SAID)", specialite: "MECA", affaire: "PNPE2483", libelle: "ASG" },
  { collegue: "Rachid (AIT SAID)", specialite: "MECA", affaire: "PNPE2538", libelle: "Dispositions issues des \u00e9tudes thermiques grand chaud des locaux des pompes RCV" },
  { collegue: "Cardenel Sognon / Xavier GROSJEAN", specialite: "ELEC", affaire: "PNPE2141", libelle: "PNPE2141" },
  { collegue: "Cardenel Sognon / Xavier GROSJEAN", specialite: "ELEC", affaire: "PNPE2258A-A", libelle: "Disposition SEG (r\u00e9alimentation de la b\u00e2che ASG et appoint en eau \u00e0 la piscine BK ainsi qu\u2019\u00e0 la piscine BR en situations ND) - P4 - SEG Partie Ilot Nucl\u00e9aire" },
  { collegue: "ARCADIA (Lahcen / LAKMOUCHI)", specialite: "MECA", affaire: "PNPE2360AA", libelle: "Maitrise du risque Hydrazine secondaire" },
  { collegue: "Sylver (NGATCHA)", specialite: "ELEC", affaire: "PNPE2567", libelle: "Modification CC skids air de d\u00e9marrage DUS" },
  { collegue: "Sylver (NGATCHA)", specialite: "ELEC", affaire: "PNPE2568AA", libelle: "Traitement des cases compresseur DUV" },
  { collegue: "Arnaud (ROTT)", specialite: "ELEC", affaire: "PNPE2552", libelle: "Liaison souterraine SGR" },
  { collegue: "Rafa\u00ebl LEMMONIER", specialite: "ELEC", affaire: "PNPE2360AA", libelle: "Maitrise du risque Hydrazine secondaire" },
  { collegue: "Rafa\u00ebl LEMMONIER", specialite: "ELEC", affaire: "PNPE2258A-A", libelle: "Disposition SEG (r\u00e9alimentation de la b\u00e2che ASG et appoint en eau \u00e0 la piscine BK ainsi qu\u2019\u00e0 la piscine BR en situations ND) - P4 - SEG Partie Ilot Nucl\u00e9aire" },
  { collegue: "Christophe & Omer (ROUSSEL / AYDOGDU)", specialite: "ELEC", affaire: "PNPE2431A-A", libelle: "Remplacement des coffrets survitesse TPS ASG" },
  { collegue: "Christophe & Omer (ROUSSEL / AYDOGDU)", specialite: "ELEC", affaire: "PNPE2354BA", libelle: "Pr\u00e9l\u00e8vement des Armoires de CC LHP/Q + relais Auto et Protection - Tome B - Pr\u00e9l\u00e8vement des r\u00e9gulateurs" },
  { collegue: "Christophe & Omer (ROUSSEL / AYDOGDU)", specialite: "ELEC", affaire: "PNPE2489A-A", libelle: "Dossier d\u2019assurance poste MQ" },
  { collegue: "Ahmed & Dris (DJELAILI / FILAHY)", specialite: "ELEC", affaire: "PNPE2619A-A", libelle: "Maintien de Qualification des Trappes DVH" },
  { collegue: "Ahmed & Dris (DJELAILI / FILAHY)", specialite: "ELEC", affaire: "PNPE2538", libelle: "Dispositions issues des \u00e9tudes thermiques grand chaud des locaux des pompes RCV" },
  { collegue: "Ahmed & Dris (DJELAILI / FILAHY)", specialite: "ELEC", affaire: "PNPE2617", libelle: "Remplacement connecteurs sur SME P4" },
  { collegue: "J\u00e9r\u00f4me (OKOBO)", specialite: "ELEC", affaire: "PNPE2483", libelle: "Disposition ASG ND (alimentation en eau des GV)" },
  { collegue: "J\u00e9r\u00f4me (OKOBO)", specialite: "ELEC", affaire: "PNPE2488", libelle: "Dossier d\u2019assurance remplacement des T140" },
  { collegue: "Matthieu (Blondel) / Axel LE LANCHON", specialite: "ELEC", affaire: "PNPE2976", libelle: "Corrium" },
  { collegue: "Matthieu (Blondel) / Axel LE LANCHON", specialite: "MECA", affaire: "PNPE2374", libelle: "Remplacement TF" },
  { collegue: "Matthieu (Blondel) / Axel LE LANCHON", specialite: "ELEC", affaire: "PNPE2490", libelle: "Modification des VG" },
];

const SPECIALITES = ["Toutes", "MECA", "ELEC"];

export default function HomePage() {
  const [filtre, setFiltre] = useState("Toutes");
  const [recherche, setRecherche] = useState("");

  const lignesFiltrees = DATA.filter((l) => {
    const matchSpec = filtre === "Toutes" || l.specialite === filtre;
    const q = recherche.toLowerCase();
    const matchSearch =
      q === "" ||
      l.collegue.toLowerCase().includes(q) ||
      l.affaire.toLowerCase().includes(q) ||
      l.libelle.toLowerCase().includes(q);
    return matchSpec && matchSearch;
  });

  const th: React.CSSProperties = {
    padding: "11px 14px",
    textAlign: "left",
    border: "1px solid #cbd5e1",
    background: "#1e3a5f",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    whiteSpace: "nowrap",
  };

  const tdBase: React.CSSProperties = {
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    fontSize: 13,
    verticalAlign: "middle",
  };

  const badgeSpec = (s: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 12,
    background: s === "MECA" ? "#fef3c7" : "#dbeafe",
    color: s === "MECA" ? "#92400e" : "#1e40af",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: "#1e3a5f", padding: "24px 32px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>\ud83d\udcc1</div>
          <div>
            <h1 style={{ margin: 0, color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: 0.5 }}>Suivi des Affaires</h1>
            <p style={{ margin: 0, color: "#93c5fd", fontSize: 13 }}>Tableau de bord collaborateurs</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 32px" }}>
        {/* STATS */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { label: "Total lignes", val: DATA.length, color: "#3b82f6" },
            { label: "MECA", val: DATA.filter(d => d.specialite === "MECA").length, color: "#f59e0b" },
            { label: "ELEC", val: DATA.filter(d => d.specialite === "ELEC").length, color: "#6366f1" },
            { label: "Collaborateurs", val: [...new Set(DATA.map(d => d.collegue))].length, color: "#10b981" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: "14px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderTop: `3px solid ${s.color}`, minWidth: 130 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* FILTRES */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="\ud83d\udd0d Rechercher (coll\u00e8gue, affaire, libell\u00e9)..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            style={{ padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: 7, fontSize: 13, width: 320, outline: "none" }}
          />
          {SPECIALITES.map(s => (
            <button
              key={s}
              onClick={() => setFiltre(s)}
              style={{
                padding: "9px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: filtre === s ? "#1e3a5f" : "#e2e8f0",
                color: filtre === s ? "#fff" : "#475569",
              }}
            >{s}</button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>{lignesFiltrees.length} ligne(s) affich\u00e9e(s)</span>
        </div>

        {/* TABLEAU */}
        <div style={{ overflowX: "auto", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr>
                <th style={th}>Coll\u00e8gue</th>
                <th style={th}>Sp\u00e9cialit\u00e9</th>
                <th style={th}>Affaire</th>
                <th style={th}>Libell\u00e9 affaire</th>
              </tr>
            </thead>
            <tbody>
              {lignesFiltrees.map((l, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#eff6ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#f8fafc")}
                >
                  <td style={{ ...tdBase, fontWeight: 600, color: "#1e3a5f" }}>{l.collegue}</td>
                  <td style={{ ...tdBase, textAlign: "center" }}><span style={badgeSpec(l.specialite)}>{l.specialite}</span></td>
                  <td style={{ ...tdBase, fontFamily: "monospace", fontWeight: 700, color: "#0f4c81" }}>{l.affaire}</td>
                  <td style={{ ...tdBase, color: "#334155" }}>{l.libelle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
