// db.ts
// @ts-nocheck

import * as SQLite from 'expo-sqlite';

// Tek bir db instance asenkron
let dbPromise = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('smilehair.db'); // cihazda oluşacak gerçek .db dosyası
  }
  return dbPromise;
}

// ------------------------------
// TABLOLARI OLUŞTUR
// ------------------------------
export async function initDb() {
  try {
    const db = await getDb();

    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS capture_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS capture_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        set_id INTEGER NOT NULL,
        angle_index INTEGER NOT NULL,
        uri TEXT NOT NULL,
        FOREIGN KEY (set_id) REFERENCES capture_sets(id) ON DELETE CASCADE
      );
    `);

    console.log('✅ DB hazır');
  } catch (e) {
    console.log('DB init hatası:', e);
  }
}

// ------------------------------
// 5’li çekim setini kaydet
// photoUris: [uri0, uri1, uri2, uri3, uri4]
// ------------------------------
export async function saveCaptureSetFromArray(photoUris) {
  try {
    const db = await getDb();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        'INSERT INTO capture_sets (created_at) VALUES (datetime(\'now\'))'
      );

      const row = await db.getFirstAsync(
        'SELECT last_insert_rowid() AS id'
      );
      const setId = row.id;

      for (let i = 0; i < photoUris.length; i++) {
        const uri = photoUris[i];
        if (!uri) continue;

        await db.runAsync(
          'INSERT INTO capture_photos (set_id, angle_index, uri) VALUES (?, ?, ?)',
          setId,
          i,
          uri
        );
      }
    });

    console.log('✅ 5\'li çekim seti kaydedildi');
  } catch (e) {
    console.log('saveCaptureSetFromArray hatası:', e);
  }
}

// ------------------------------
// EN SON çekim setinin 5 fotosunu getir
// Dönüş: { photos: [uri0..uri4], created_at } veya null
// ------------------------------
export async function getLastCaptureSetPhotos() {
  try {
    const db = await getDb();

    const lastSet = await db.getFirstAsync(
      'SELECT id, created_at FROM capture_sets ORDER BY id DESC LIMIT 1'
    );

    if (!lastSet) {
      return null;
    }

    const rows = await db.getAllAsync(
      'SELECT angle_index, uri FROM capture_photos WHERE set_id = ?',
      lastSet.id
    );

    const photos = Array(5).fill(null);
    for (const row of rows) {
      const idx = row.angle_index;
      if (idx >= 0 && idx < 5) {
        photos[idx] = row.uri;
      }
    }

    return {
      photos,
      created_at: lastSet.created_at,
    };
  } catch (e) {
    console.log('getLastCaptureSetPhotos hatası:', e);
    return null;
  }
}
