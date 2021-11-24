/* eslint-disable */
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import JSZip from 'jszip';
import { ISound } from './models';
import { saveAs } from 'file-saver';

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
/**
 * Get IndexedDB Instance
 * @returns IndexedDb Instance
 */
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

async function deleteSound(soundId: string) {
  return (await dbInstance).delete('sound-db', soundId);
}

async function downloadAll() {
  return new Promise((resolve, reject) => {
    getSoundList().then((list) => {
      const zip = new JSZip();
      list.forEach((sound, index) => {
        zip.file(`${index}.${sound.name}.wav`, sound.blob);
      });
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        saveAs(content, 'download.zip');
        void resolve(true);
      });
    });
  });
}

async function downloadOne(id: string) {
  return new Promise((resolve, reject) => {
    void getSound(id).then((sound: ISound) => {
      saveAs(sound.blob, `${sound.name}.wav`);
      resolve(true);
    });
  });
}

export {
  getDBInstance,
  addSoundToDB,
  getSound,
  getSoundList,
  deleteSound,
  downloadAll,
  downloadOne,
};
