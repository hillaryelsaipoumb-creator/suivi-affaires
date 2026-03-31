export interface Affaire {
  id: number;
  reference: string;
  client: string;
  description: string;
  statut: string;
  dateCreation: string;
  dateEcheance?: string;
}

interface IStorage {
  getAffaires(): Promise<Affaire[]>;
  createAffaire(data: Omit<Affaire, "id">): Promise<Affaire>;
  updateAffaire(id: number, data: Partial<Affaire>): Promise<Affaire | undefined>;
  deleteAffaire(id: number): Promise<void>;
}

class MemStorage implements IStorage {
  private affaires: Map<number, Affaire> = new Map();
  private nextId = 1;

  async getAffaires(): Promise<Affaire[]> {
    return Array.from(this.affaires.values());
  }

  async createAffaire(data: Omit<Affaire, "id">): Promise<Affaire> {
    const affaire = { ...data, id: this.nextId++ };
    this.affaires.set(affaire.id, affaire);
    return affaire;
  }

  async updateAffaire(id: number, data: Partial<Affaire>): Promise<Affaire | undefined> {
    const existing = this.affaires.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.affaires.set(id, updated);
    return updated;
  }

  async deleteAffaire(id: number): Promise<void> {
    this.affaires.delete(id);
  }
}

export const storage = new MemStorage();
