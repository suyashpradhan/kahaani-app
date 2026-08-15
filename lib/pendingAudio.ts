const databaseName = "kahaani-pending-audio";

export async function keepPendingAudio(key: string, blob: Blob) {
  return new Promise<void>((resolve, reject) => {
    const open = indexedDB.open(databaseName, 1);
    open.onupgradeneeded = () => open.result.createObjectStore("audio");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => { const transaction = open.result.transaction("audio", "readwrite"); transaction.objectStore("audio").put(blob, key); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); };
  });
}

export async function clearPendingAudio(key: string) {
  return new Promise<void>((resolve) => { const open = indexedDB.open(databaseName, 1); open.onupgradeneeded = () => open.result.createObjectStore("audio"); open.onsuccess = () => { const transaction = open.result.transaction("audio", "readwrite"); transaction.objectStore("audio").delete(key); transaction.oncomplete = () => resolve(); transaction.onerror = () => resolve(); }; open.onerror = () => resolve(); });
}
