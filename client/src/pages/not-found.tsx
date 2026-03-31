export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "100px 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "72px", fontWeight: "bold", color: "#1e293b", margin: 0 }}>404</h1>
      <p style={{ fontSize: "24px", color: "#64748b", marginTop: "16px" }}>Page non trouvée</p>
      <a href="/" style={{ display: "inline-block", marginTop: "24px", padding: "12px 24px", background: "#2563eb", color: "white", textDecoration: "none", borderRadius: "6px" }}>Retour à l'accueil</a>
    </div>
  );
}
