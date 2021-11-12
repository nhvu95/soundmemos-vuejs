import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ISound } from 'src/components/models';

const VERSION = +(process.env.VERSION ? process.env.VERSION : '');

interface ISoundMemosDB extends DBSchema {
  'sound-db': { key: string; value: ISound };
}

let dbInstance: Promise<IDBPDatabase>;
function initIndexedDB() {
  dbInstance = openDB('sound-memos', VERSION, {
    upgrade(db) {
      // …
      const v1Db = db as unknown as IDBPDatabase<ISoundMemosDB>;
      v1Db.createObjectStore('sound-db', {
        keyPath: 'id',
      });
    },
    blocked() {
      // …
    },
    blocking() {
      // …
    },
    terminated() {
      // …
    },
  });
  return dbInstance;
}

async function getDBInstance() {
  return initIndexedDB();
}

async function addSoundToDB(sound: ISound) {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  return (await dbInstance).put('sound-db', sound);
}

async function getSoundList() {
  return (await dbInstance).getAll('sound-db');
}

async function getSound(soundId: string) {
  return (await dbInstance).get('sound-db', soundId);
}

export { getDBInstance, addSoundToDB, getSound, getSoundList };
