import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for affaires (cases/matters)
  app.get("/api/affaires", async (req, res) => {
    const affaires = await storage.getAffaires();
    res.json(affaires);
  });

  app.post("/api/affaires", async (req, res) => {
    const affaire = await storage.createAffaire(req.body);
    res.status(201).json(affaire);
  });

  app.put("/api/affaires/:id", async (req, res) => {
    const affaire = await storage.updateAffaire(parseInt(req.params.id), req.body);
    if (!affaire) return res.status(404).json({ message: "Affaire not found" });
    res.json(affaire);
  });

  app.delete("/api/affaires/:id", async (req, res) => {
    await storage.deleteAffaire(parseInt(req.params.id));
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}
