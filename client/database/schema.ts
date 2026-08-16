import { getDatabase } from "./database";

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS troubleshooting_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT,
      category_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS troubleshooting_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      step_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      command TEXT,
      note TEXT,
      FOREIGN KEY (topic_id)
        REFERENCES troubleshooting_topics(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS configuration_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS configuration_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      step_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      command TEXT,
      note TEXT,
      FOREIGN KEY (task_id)
        REFERENCES configuration_tasks(id)
        ON DELETE CASCADE
    );
  `);
}
