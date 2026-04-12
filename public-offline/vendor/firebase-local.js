/**
 * firebase-local.js — 離線展示用 Firebase shim
 * 以普通 <script> 載入（非 ESM），掛在 window._FB
 * 資料從 window._OFFLINE_DATA 讀取
 */
window._FB = (() => {
  // deleteField 哨兵值
  const DELETE_SENTINEL = Symbol('deleteField');

  // --- 初始化 stubs ---
  function initializeApp() { return {}; }
  function initializeFirestore() { return {}; }
  function getFirestore() { return {}; }
  function persistentLocalCache() { return {}; }
  function persistentMultipleTabManager() { return {}; }
  function deleteField() { return DELETE_SENTINEL; }

  // --- doc 參照 ---
  function doc(db, collection, docId) {
    return { key: collection + '/' + docId };
  }

  // --- 讀取離線資料 ---
  function _read(docRef) {
    return (window._OFFLINE_DATA || {})[docRef.key] || null;
  }

  // --- onSnapshot：立即用離線資料觸發一次，不監聽後續變更 ---
  function onSnapshot(docRef, onNext, onError) {
    const data = _read(docRef);
    const snap = {
      exists: () => data !== null,
      data: () => data
    };
    setTimeout(() => onNext(snap), 0);
    return () => {}; // unsubscribe noop
  }

  // --- getDoc：一次性讀取 ---
  async function getDoc(docRef) {
    const data = _read(docRef);
    return {
      exists: () => data !== null,
      data: () => data
    };
  }

  // --- 寫入 noop（唯讀展示模式） ---
  async function updateDoc() {}
  async function setDoc() {}

  return {
    initializeApp,
    initializeFirestore,
    getFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    deleteField,
    doc,
    onSnapshot,
    getDoc,
    updateDoc,
    setDoc
  };
})();
