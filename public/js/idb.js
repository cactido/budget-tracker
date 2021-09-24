const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;
let db;
const request = indexedDB.open('budget', 1);
request.onupgradeneeded((event) => {
    event.target.result.createObjectStore('pending', {
        keyPath: 'id',
        autoIncrement: true
    })
});
request.onerror((err) => {
    console.log(err.message);
});
request.onsuccess((event) => {
    db = event.target.result;
    if (navigator.onLine) { checkDatabase(); }
});

function storeRecord(record) {
    const transaction = db.transaction('pending', 'readwrite');
    const store = transaction.createObjectStore('pending');
    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction('pending', 'readonly');
    const store = transaction.objectStore('pending');
    const getAll = store.getAll();

    getAll.onsuccess(() => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: { 'Content-Type': 'application/json' }
            })
            .then((res) => res.json())
            .then(() => {
                const transaction = db.transaction('pending', 'readwrite');
                const store = transaction.objectStore('pending');
                store.clear();
            })
        }
    });
}

// online connection restored listener
window.addEventListener('online', checkDatabase);