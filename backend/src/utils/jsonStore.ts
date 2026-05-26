import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../data/db.json');

interface DbSchema {
  users: Record<string, any>;
  repos: Record<string, any>;
}

// ── Ensure data dir + file exist ──────────────────────────────
function ensureDb(): DbSchema {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: {}, repos: {} }, null, 2));
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as DbSchema;
}

function save(db: DbSchema) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// ── Generic Collection ────────────────────────────────────────
export class Collection<T extends Record<string, any>> {
  constructor(private collectionKey: keyof DbSchema) {}

  private read(): Record<string, T> {
    return (ensureDb()[this.collectionKey] as Record<string, T>);
  }

  private write(data: Record<string, T>) {
    const db = ensureDb();
    (db as any)[this.collectionKey] = data;
    save(db);
  }

  /** Mimics Mongoose findOne({ field: value }) */
  findOne(query: Partial<T>): T | null {
    const data = this.read();
    const entries = Object.values(data);
    return entries.find(doc =>
      Object.keys(query).every(key => doc[key] === (query as any)[key])
    ) ?? null;
  }

  /** Mimics Mongoose findById */
  findById(id: string): T | null {
    const data = this.read();
    return data[id] ?? null;
  }

  /** Mimics Mongoose find(query).sort() */
  find(query: Partial<T> = {}): T[] {
    const data = this.read();
    const entries = Object.values(data);
    if (Object.keys(query).length === 0) return entries;
    return entries.filter(doc =>
      Object.keys(query).every(key => doc[key] === (query as any)[key])
    );
  }

  /** Mimics Mongoose Model.findOne({ _id, ...}) */
  findOneById(id: string, extraQuery: Partial<T> = {}): T | null {
    const data = this.read();
    const doc = data[id];
    if (!doc) return null;
    const matchesExtra = Object.keys(extraQuery).every(
      key => doc[key] === (extraQuery as any)[key]
    );
    return matchesExtra ? doc : null;
  }

  /** Create and persist a new document */
  create(fields: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): T {
    const data = this.read();
    const id = generateId();
    const now = new Date().toISOString();
    const doc: T = { ...fields, _id: id, createdAt: now, updatedAt: now } as any;
    data[id] = doc;
    this.write(data);
    return doc;
  }

  /** Update a document by id */
  updateById(id: string, fields: Partial<T>): T | null {
    const data = this.read();
    if (!data[id]) return null;
    data[id] = { ...data[id], ...fields, updatedAt: new Date().toISOString() };
    this.write(data);
    return data[id];
  }

  /** Delete a document by id */
  deleteById(id: string): boolean {
    const data = this.read();
    if (!data[id]) return false;
    delete data[id];
    this.write(data);
    return true;
  }

  count(): number {
    return Object.keys(this.read()).length;
  }
}

// ── Exported singletons ───────────────────────────────────────
export const usersDb   = new Collection<any>('users');
export const reposDb   = new Collection<any>('repos');
