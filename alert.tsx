import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Snapshot, SnapshotWithEntrees, Affaire, Entree } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarDays, Plus, Trash2, Copy, Moon, Sun, Download, Save,
  ChevronLeft, ChevronRight, Clock, CheckCircle2, BarChart3
} from "lucide-react";

// Types locaux pour les données en cours d'édition
type EntreeLocal = Omit<Entree, "id"> & { affaireId: number };

const COLONNES = [
  { key: "tot", label: "TOT" },
  { key: "regime", label: "RÉGIME" },
  { key: "adr", label: "ADR" },
  { key: "gelMetier", label: "GEL MÉTIER" },
  { key: "pds", label: "PDS" },
  { key: "rpm", label: "RPM" },
  { key: "logistique", label: "LOGISTIQUE (DL)" },
  { key: "tachePlanning", label: "TÂCHE PLANNING" },
] as const;

type ColKey = typeof COLONNES[number]["key"];

function toEntreeLocal(e: Entree & { affaire: Affaire }): EntreeLocal {
  return {
    snapshotId: e.snapshotId,
    affaireId: e.affaireId,
    totFait: e.totFait,
    regimeFait: e.regimeFait,
    adrFait: e.adrFait,
    gelMetierFait: e.gelMetierFait,
    pdsFait: e.pdsFait,
    rpmFait: e.rpmFait,
    logistiqueFait: e.logistiqueFait,
    tachePlanningFait: e.tachePlanningFait,
    totCommentaire: e.totCommentaire,
    regimeCommentaire: e.regimeCommentaire,
    adrCommentaire: e.adrCommentaire,
    gelMetierCommentaire: e.gelMetierCommentaire,
    pdsCommentaire: e.pdsCommentaire,
    rpmCommentaire: e.rpmCommentaire,
    logistiqueCommentaire: e.logistiqueCommentaire,
    tachePlanningCommentaire: e.tachePlanningCommentaire,
  };
}

function formatDate(d: string) {
  const [y, m, j] = d.split("-");
  return `${j}/${m}/${y}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function HomePage() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [newDate, setNewDate] = useState(todayStr());
  const [newLabel, setNewLabel] = useState("");
  const [dirtyEntrees, setDirtyEntrees] = useState<Map<number, EntreeLocal>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [filterSpec, setFilterSpec] = useState<"ALL" | "MECA" | "ELEC">("ALL");

  // Chargement liste snapshots
  const { data: snapshots = [] } = useQuery<Snapshot[]>({
    queryKey: ["/api/snapshots"],
  });

  // Chargement snapshot sélectionné
  const { data: currentSnap, isLoading: loadingSnap } = useQuery<SnapshotWithEntrees>({
    queryKey: ["/api/snapshots", selectedId],
    enabled: !!selectedId,
  });

  // Mutation créer snapshot
  const createMut = useMutation({
    mutationFn: (data: { dateSnapshot: string; label: string }) =>
      apiRequest("POST", "/api/snapshots", data).then(r => r.json()),
    onSuccess: (snap: Snapshot) => {
      queryClient.invalidateQueries({ queryKey: ["/api/snapshots"] });
      setSelectedId(snap.id);
      setDirtyEntrees(new Map());
      setShowNewDialog(false);
      toast({ title: "Tableau créé", description: formatDate(snap.dateSnapshot) });
    },
  });

  // Mutation dupliquer snapshot
  const duplicateMut = useMutation({
    mutationFn: ({ id, dateSnapshot, label }: { id: number; dateSnapshot: string; label: string }) =>
      apiRequest("POST", `/api/snapshots/${id}/duplicate`, { dateSnapshot, label }).then(r => r.json()),
    onSuccess: (snap: Snapshot) => {
      queryClient.invalidateQueries({ queryKey: ["/api/snapshots"] });
      setSelectedId(snap.id);
      setDirtyEntrees(new Map());
      setShowDuplicateDialog(false);
      toast({ title: "Tableau dupliqué", description: formatDate(snap.dateSnapshot) });
    },
  });

  // Mutation supprimer snapshot
  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/snapshots/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snapshots"] });
      setSelectedId(null);
      setDirtyEntrees(new Map());
      toast({ title: "Tableau supprimé" });
    },
  });

  // Sauvegarde des entrées modifiées
  const saveEntrees = useCallback(async () => {
    if (!selectedId || dirtyEntrees.size === 0) return;
    setIsSaving(true);
    try {
      const payload = Array.from(dirtyEntrees.values()).map(e => ({ ...e, snapshotId: selectedId }));
      await apiRequest("PUT", `/api/snapshots/${selectedId}/entrees`, payload);
      queryClient.invalidateQueries({ queryKey: ["/api/snapshots", selectedId] });
      setDirtyEntrees(new Map());
      toast({ title: "Sauvegardé ✓", description: `${payload.length} ligne(s) mise(s) à jour` });
    } catch {
      toast({ title: "Erreur de sauvegarde", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [selectedId, dirtyEntrees, toast]);

  // Mise à jour locale d'une entrée
  const updateEntree = useCallback((affaireId: number, field: string, value: boolean | string) => {
    setDirtyEntrees(prev => {
      const map = new Map(prev);
      const existing = map.get(affaireId);
      const base = existing || (currentSnap?.entrees.find(e => e.affaireId === affaireId)
        ? toEntreeLocal(currentSnap!.entrees.find(e => e.affaireId === affaireId)! as any)
        : null);
      if (!base) return map;
      map.set(affaireId, { ...base, [field]: value });
      return map;
    });
  }, [currentSnap]);

  // Export CSV
  const exportCSV = useCallback(() => {
    if (!currentSnap) return;
    const headers = ["Collègue", "Spécialité", "Affaire", "Libellé affaire",
      ...COLONNES.flatMap(c => [`${c.label} Fait`, `${c.label} Commentaire`])];

    const rows = currentSnap.entrees.map(e => {
      const a = e.affaire;
      return [
        a.collegue, a.specialite, a.codeAffaire, a.libelleAffaire,
        e.totFait ? "Oui" : "Non", e.totCommentaire,
        e.regimeFait ? "Oui" : "Non", e.regimeCommentaire,
        e.adrFait ? "Oui" : "Non", e.adrCommentaire,
        e.gelMetierFait ? "Oui" : "Non", e.gelMetierCommentaire,
        e.pdsFait ? "Oui" : "Non", e.pdsCommentaire,
        e.rpmFait ? "Oui" : "Non", e.rpmCommentaire,
        e.logistiqueFait ? "Oui" : "Non", e.logistiqueCommentaire,
        e.tachePlanningFait ? "Oui" : "Non", e.tachePlanningCommentaire,
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
    });

    const csv = [headers.map(h => `"${h}"`), ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suivi_affaires_${currentSnap.dateSnapshot}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentSnap]);

  // Calcul du taux de complétion
  const getCompletionStats = useCallback((snap: SnapshotWithEntrees) => {
    let total = 0, done = 0;
    snap.entrees.forEach(e => {
      total += 8;
      [e.totFait, e.regimeFait, e.adrFait, e.gelMetierFait, e.pdsFait, e.rpmFait, e.logistiqueFait, e.tachePlanningFait]
        .forEach(v => { if (v) done++; });
    });
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, []);

  // Entrées à afficher (avec modifications locales)
  const displayEntrees = currentSnap?.entrees.map(e => {
    const dirty = dirtyEntrees.get(e.affaireId);
    if (dirty) return { ...e, ...dirty };
    return e;
  }).filter(e => filterSpec === "ALL" || e.affaire.specialite === filterSpec) ?? [];

  const hasDirty = dirtyEntrees.size > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-72" : "w-0 overflow-hidden"} transition-all duration-300 flex flex-col border-r border-border bg-card shrink-0`}
      >
        <div className="px-4 pt-5 pb-3 border-b border-border">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <svg aria-label="Suivi Affaires" viewBox="0 0 32 32" width="28" height="28" fill="none">
              <rect x="2" y="2" width="28" height="28" rx="6" fill="hsl(214 72% 25%)" />
              <rect x="6" y="9" width="14" height="2" rx="1" fill="white" />
              <rect x="6" y="14" width="20" height="2" rx="1" fill="white" />
              <rect x="6" y="19" width="11" height="2" rx="1" fill="white" />
              <circle cx="24" cy="22" r="5" fill="hsl(28 95% 52%)" />
              <path d="M22 22l1.5 1.5L26 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div className="font-bold text-sm text-foreground">Suivi Affaires</div>
              <div className="text-xs text-muted-foreground">Tableau de bord</div>
            </div>
          </div>

          <Button
            className="w-full"
            size="sm"
            onClick={() => { setNewDate(todayStr()); setNewLabel(""); setShowNewDialog(true); }}
            data-testid="button-new-snapshot"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau tableau
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Historique ({snapshots.length})
          </div>

          {snapshots.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Aucun tableau enregistré
            </div>
          )}

          {snapshots.map(snap => {
            const isActive = selectedId === snap.id;
            return (
              <div
                key={snap.id}
                className={`history-item ${isActive ? "active" : ""}`}
                onClick={() => { setSelectedId(snap.id); setDirtyEntrees(new Map()); }}
                data-testid={`history-item-${snap.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-semibold text-sm">{formatDate(snap.dateSnapshot)}</span>
                  </div>
                  {snap.label && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5 ml-5">{snap.label}</div>
                  )}
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary ml-2 shrink-0" />}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="shrink-0 px-4 py-2.5 border-b border-border bg-card flex items-center gap-3">
          <button
            className="p-1.5 rounded hover:bg-secondary transition-colors"
            onClick={() => setSidebarOpen(o => !o)}
            data-testid="button-toggle-sidebar"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {currentSnap ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h1 className="font-bold text-base text-foreground">
                Tableau du {formatDate(currentSnap.dateSnapshot)}
              </h1>
              {currentSnap.label && (
                <span className="text-sm text-muted-foreground truncate">— {currentSnap.label}</span>
              )}
              {/* Stats */}
              {(() => {
                const { done, total, pct } = getCompletionStats(currentSnap);
                return (
                  <div className="flex items-center gap-2 ml-3 text-xs text-muted-foreground">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>{done}/{total} tâches ({pct}%)</span>
                    <div className="progress-bar w-20">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <h1 className="font-bold text-base text-foreground flex-1">Tableau de Suivi des Affaires</h1>
          )}

          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Filtre spécialité */}
            {currentSnap && (
              <div className="flex rounded-md overflow-hidden border border-border text-xs">
                {(["ALL", "MECA", "ELEC"] as const).map(s => (
                  <button
                    key={s}
                    className={`px-2.5 py-1.5 font-medium transition-colors ${filterSpec === s ? "bg-primary text-white" : "bg-card hover:bg-secondary"}`}
                    onClick={() => setFilterSpec(s)}
                    data-testid={`filter-${s}`}
                  >
                    {s === "ALL" ? "Tout" : s}
                  </button>
                ))}
              </div>
            )}

            {currentSnap && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setNewDate(todayStr()); setNewLabel(""); setShowDuplicateDialog(true); }}
                  data-testid="button-duplicate"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Dupliquer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportCSV}
                  data-testid="button-export"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  CSV
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMut.mutate(currentSnap.id)}
                  data-testid="button-delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}

            {hasDirty && (
              <Button
                size="sm"
                onClick={saveEntrees}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-save"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {isSaving ? "Sauvegarde..." : `Sauvegarder (${dirtyEntrees.size})`}
              </Button>
            )}

            <button
              className="p-1.5 rounded hover:bg-secondary transition-colors"
              onClick={toggleTheme}
              data-testid="button-theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Zone principale */}
        <main className="flex-1 overflow-auto p-4">
          {!selectedId && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg viewBox="0 0 80 80" width="80" height="80" fill="none" className="mb-4 opacity-30">
                <rect x="8" y="8" width="64" height="64" rx="12" fill="currentColor" />
                <rect x="18" y="24" width="28" height="4" rx="2" fill="white" />
                <rect x="18" y="34" width="44" height="4" rx="2" fill="white" />
                <rect x="18" y="44" width="22" height="4" rx="2" fill="white" />
              </svg>
              <h2 className="text-xl font-semibold text-muted-foreground mb-2">Aucun tableau sélectionné</h2>
              <p className="text-sm text-muted-foreground mb-4">Créez un nouveau tableau ou sélectionnez une date dans l'historique</p>
              <Button onClick={() => { setNewDate(todayStr()); setNewLabel(""); setShowNewDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un tableau
              </Button>
            </div>
          )}

          {selectedId && loadingSnap && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-9 rounded bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {currentSnap && !loadingSnap && (
            <div className="fade-in overflow-x-auto rounded-lg border border-border shadow-sm">
              <table className="border-collapse text-xs" style={{ minWidth: "1400px", width: "100%" }}>
                <thead className="table-header-group">
                  <tr>
                    <th className="text-left" style={{ minWidth: 160 }}>Collègue</th>
                    <th style={{ minWidth: 55 }}>Spéc.</th>
                    <th style={{ minWidth: 110 }}>Affaire</th>
                    <th className="text-left" style={{ minWidth: 200 }}>Libellé affaire</th>
                    {COLONNES.map(col => (
                      <th key={col.key} colSpan={2} style={{ minWidth: 180 }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th colSpan={4} className="text-left text-xs opacity-70">Infos affaire</th>
                    {COLONNES.map(col => (
                      <>
                        <th key={`${col.key}-fait`} style={{ minWidth: 50 }} className="text-center">✓</th>
                        <th key={`${col.key}-comm`} style={{ minWidth: 130 }} className="text-left">Commentaire</th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayEntrees.map((e, idx) => {
                    const a = e.affaire;
                    const specClass = a.specialite === "MECA" ? "meca" : "elec";
                    return (
                      <tr key={e.affaireId} className={`data-row ${specClass}`} data-testid={`row-affaire-${e.affaireId}`}>
                        <td className="text-xs font-medium">{a.collegue}</td>
                        <td className="text-center">
                          <span className={a.specialite === "MECA" ? "badge-meca" : "badge-elec"}>
                            {a.specialite}
                          </span>
                        </td>
                        <td className="font-mono text-xs">{a.codeAffaire}</td>
                        <td className="text-xs max-w-xs" title={a.libelleAffaire}>
                          <span className="line-clamp-2">{a.libelleAffaire}</span>
                        </td>

                        {COLONNES.map(col => {
                          const faitKey = `${col.key}Fait` as keyof typeof e;
                          const commKey = `${col.key}Commentaire` as keyof typeof e;
                          const faitVal = e[faitKey] as boolean;
                          const commVal = e[commKey] as string;
                          return (
                            <>
                              <td key={`${e.affaireId}-${col.key}-fait`} className="text-center" style={{ background: faitVal ? "hsl(142 71% 45% / 0.15)" : undefined }}>
                                <input
                                  type="checkbox"
                                  className="fait-checkbox"
                                  checked={faitVal}
                                  onChange={ev => updateEntree(e.affaireId, faitKey as string, ev.target.checked)}
                                  data-testid={`check-${e.affaireId}-${col.key}`}
                                />
                              </td>
                              <td key={`${e.affaireId}-${col.key}-comm`}>
                                <input
                                  type="text"
                                  className="comment-input"
                                  value={commVal}
                                  placeholder="—"
                                  maxLength={200}
                                  onChange={ev => updateEntree(e.affaireId, commKey as string, ev.target.value)}
                                  data-testid={`input-${e.affaireId}-${col.key}`}
                                />
                              </td>
                            </>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Indicateur modifications non sauvegardées */}
          {hasDirty && (
            <div className="fixed bottom-5 right-5 bg-amber-500 text-white rounded-full px-4 py-2 text-sm font-medium shadow-lg flex items-center gap-2 fade-in">
              <CheckCircle2 className="w-4 h-4" />
              {dirtyEntrees.size} modification(s) non sauvegardée(s)
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:text-white hover:bg-amber-600 ml-1 h-6 px-2 text-xs"
                onClick={saveEntrees}
              >
                Sauvegarder
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Dialog : Nouveau tableau */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau tableau</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-date">Date du tableau</Label>
              <Input
                id="new-date"
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                data-testid="input-new-date"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-label">Étiquette (optionnel)</Label>
              <Input
                id="new-label"
                type="text"
                placeholder="ex: Réunion hebdo, Point avancement..."
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                data-testid="input-new-label"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button
              onClick={() => createMut.mutate({ dateSnapshot: newDate, label: newLabel })}
              disabled={!newDate || createMut.isPending}
              data-testid="button-confirm-new"
            >
              {createMut.isPending ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog : Dupliquer */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dupliquer vers une nouvelle date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Copie toutes les données du tableau actuel vers une nouvelle date.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="dup-date">Nouvelle date</Label>
              <Input
                id="dup-date"
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                data-testid="input-dup-date"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dup-label">Étiquette (optionnel)</Label>
              <Input
                id="dup-label"
                type="text"
                placeholder="ex: Semaine 14..."
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                data-testid="input-dup-label"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>Annuler</Button>
            <Button
              onClick={() => selectedId && duplicateMut.mutate({ id: selectedId, dateSnapshot: newDate, label: newLabel })}
              disabled={!newDate || duplicateMut.isPending}
              data-testid="button-confirm-duplicate"
            >
              {duplicateMut.isPending ? "Duplication..." : "Dupliquer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
