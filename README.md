import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertSnapshotSchema, insertEntreeSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express) {
  // Seed des affaires au démarrage
  storage.seedAffaires();

  // GET /api/affaires
  app.get("/api/affaires", (_req, res) => {
    const list = storage.getAllAffaires();
    res.json(list);
  });

  // GET /api/snapshots
  app.get("/api/snapshots", (_req, res) => {
    const list = storage.getAllSnapshots();
    res.json(list);
  });

  // GET /api/snapshots/:id
  app.get("/api/snapshots/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });
    const snap = storage.getSnapshot(id);
    if (!snap) return res.status(404).json({ message: "Snapshot introuvable" });
    res.json(snap);
  });

  // POST /api/snapshots — crée un nouveau snapshot vide
  app.post("/api/snapshots", (req, res) => {
    const parsed = insertSnapshotSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Données invalides", errors: parsed.error.flatten() });
    const snap = storage.createSnapshot(parsed.data);
    storage.createDefaultEntrees(snap.id);
    res.status(201).json(snap);
  });

  // DELETE /api/snapshots/:id
  app.delete("/api/snapshots/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });
    storage.deleteSnapshot(id);
    res.json({ ok: true });
  });

  // PUT /api/snapshots/:id/entrees — met à jour toutes les entrées d'un snapshot
  app.put("/api/snapshots/:snapshotId/entrees", (req, res) => {
    const snapshotId = parseInt(req.params.snapshotId);
    if (isNaN(snapshotId)) return res.status(400).json({ message: "ID invalide" });

    const schema = z.array(insertEntreeSchema);
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Données invalides", errors: parsed.error.flatten() });

    const results = parsed.data.map(e => storage.upsertEntree({ ...e, snapshotId }));
    res.json(results);
  });

  // POST /api/snapshots/:id/duplicate — duplique un snapshot vers une nouvelle date
  app.post("/api/snapshots/:id/duplicate", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

    const { dateSnapshot, label } = req.body as { dateSnapshot: string; label?: string };
    if (!dateSnapshot) return res.status(400).json({ message: "dateSnapshot requis" });

    const source = storage.getSnapshot(id);
    if (!source) return res.status(404).json({ message: "Snapshot source introuvable" });

    const newSnap = storage.createSnapshot({ dateSnapshot, label: label || "" });
    // Copier les entrées existantes
    for (const e of source.entrees) {
      storage.upsertEntree({
        snapshotId: newSnap.id,
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
      });
    }
    res.status(201).json(newSnap);
  });

}
