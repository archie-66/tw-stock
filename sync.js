/* Google 登入＋雲端同步（Firebase）：自選股、模擬交易、測驗進度 */
const CFG = window.FB_CONFIG;
const KEYS = ["tw_watch", "tw_sim", "tw_lv", "tw_seen", "tw_weak"];
const $ = id => document.getElementById(id);
const tt = (zh, en) => (window.EN ? en : zh);
const ls = { get: k => { try { return localStorage.getItem(k) } catch (e) { return null } },
             set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch (e) {} } };

if (!CFG || !CFG.apiKey) {
  // 還沒設定 Firebase：隱藏帳號列
  const r = $("acctRow"); if (r) r.hidden = true;
} else {
  start().catch(e => { console.error(e); status(tt("登入功能暫時無法使用", "Sign-in is unavailable right now")); });
}

function status(s) { const el = $("acctSub"); if (el) el.textContent = s; }
const hhmm = d => d.toTimeString().slice(0, 5);

async function start() {
  const V = "10.12.2", base = `https://www.gstatic.com/firebasejs/${V}/`;
  const [{ initializeApp }, A, F] = await Promise.all([
    import(base + "firebase-app.js"), import(base + "firebase-auth.js"), import(base + "firebase-firestore.js")]);
  const app = initializeApp(CFG);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  const prov = new A.GoogleAuthProvider();
  prov.setCustomParameters({ prompt: "select_account" });
  let user = null, timer = null, applying = false;

  const local = () => { const o = {}; KEYS.forEach(k => o[k] = ls.get(k)); return o; };
  const hasLocal = o => KEYS.some(k => o[k] && o[k] !== "[]" && o[k] !== "{}");
  const same = (a, b) => KEYS.every(k => (a[k] || null) === (b[k] || null));
  const ref = () => F.doc(db, "users", user.uid);

  async function push() {
    if (!user) return;
    const data = local(), at = Date.now();
    try {
      await F.setDoc(ref(), { ...data, at });
      ls.set("tw_sync_at", String(at));
      status(tt(`已同步 · ${hhmm(new Date())}`, `Synced · ${hhmm(new Date())}`));
    } catch (e) { console.error(e); status(tt("同步失敗，稍後會再試", "Sync failed, will retry")); }
  }
  const later = () => { clearTimeout(timer); timer = setTimeout(push, 2500); };

  // 這幾個資料一改就上傳
  const orig = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    orig.call(this, k, v);
    if (this === localStorage && KEYS.includes(k) && user && !applying) later();
  };

  function apply(cloud) {
    applying = true;
    KEYS.forEach(k => ls.set(k, cloud[k] ?? null));
    ls.set("tw_sync_at", String(cloud.at || Date.now()));
    applying = false;
    location.reload();
  }

  async function pull(first) {
    if (!user) return;
    let snap;
    try { snap = await F.getDoc(ref()); } catch (e) { console.error(e); status(tt("同步失敗，稍後會再試", "Sync failed, will retry")); return; }
    const cur = local();
    if (!snap.exists()) { await push(); return; }
    const cloud = snap.data();
    if (same(cur, cloud)) { status(tt(`已同步 · ${hhmm(new Date())}`, `Synced · ${hhmm(new Date())}`)); ls.set("tw_sync_at", String(cloud.at || 0)); return; }
    const last = +ls.get("tw_sync_at") || 0;
    if (first && hasLocal(cur) && !last) {
      // 第一次在這台登入，兩邊都有資料：讓使用者選
      const useCloud = confirm(tt(
        "這個帳號在雲端已經有資料（自選股、模擬交易、測驗進度）。\n\n按「確定」：用雲端的資料\n按「取消」：用這台裝置的資料蓋過雲端",
        "This account already has data in the cloud (watchlist, paper trading, quiz progress).\n\nOK: use the cloud data\nCancel: replace the cloud with this device's data"));
      if (useCloud) apply(cloud); else await push();
      return;
    }
    if ((cloud.at || 0) > last) apply(cloud);   // 別台裝置比較新
    else await push();                           // 這台比較新（例如離線時改的）
  }

  function paint() {
    const btn = $("acctBtn"), nm = $("acctName"), av = $("acctAv");
    if (user) {
      nm.textContent = user.displayName || user.email || "";
      av.src = user.photoURL || "icon-192.png"; av.hidden = false;
      btn.textContent = tt("登出", "Sign out"); btn.classList.add("ghost");
    } else {
      nm.textContent = ""; av.hidden = true;
      btn.textContent = tt("用 Google 登入", "Sign in with Google"); btn.classList.remove("ghost");
      status(tt("登入後，自選股、模擬交易和測驗進度會存在雲端，換手機或 iPad 也還在。", "Sign in to keep your watchlist, paper trades and quiz progress on every device."));
    }
  }

  $("acctBtn").onclick = async () => {
    if (user) {
      if (!confirm(tt("要登出嗎？這台裝置上的資料會保留。", "Sign out? Data on this device stays."))) return;
      await A.signOut(auth); ls.set("tw_sync_at", null); return;
    }
    status(tt("登入中…", "Signing in…"));
    try { await A.signInWithPopup(auth, prov); }
    catch (e) {
      if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") {
        try { await A.signInWithRedirect(auth, prov); return; } catch (e2) { e = e2; }
      }
      if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") { paint(); return; }
      console.error(e); status(tt("登入沒有成功：", "Sign-in failed: ") + (e.code || e.message));
    }
  };

  A.getRedirectResult(auth).catch(() => {});
  A.onAuthStateChanged(auth, u => { user = u; paint(); if (u) { status(tt("同步中…", "Syncing…")); pull(true); } });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && user) pull(false); else if (user && timer) { clearTimeout(timer); push(); } });
  $("acctRow").hidden = false;
}
