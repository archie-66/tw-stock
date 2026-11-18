"""
每日抓取證交所（TWSE）盤後資料，寫成 data.json。
由 GitHub Actions 在每個平日 15:20（台北時間）自動執行，只用 Python 內建模組。
沒開盤（假日）或資料還沒出來時，不會改動 data.json。
"""
import json, os, re, sys, time, urllib.request
from datetime import datetime, timedelta, timezone

TW = timezone(timedelta(hours=8))
UA = {"User-Agent": "Mozilla/5.0 (tw-stock-beginner-app)"}
BASE = "https://www.twse.com.tw/rwd/zh"
DATA_FILE = "data.json"
KEEP = 20


def get(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa
            print(f"retry {i+1}: {url} -> {e}")
            time.sleep(5 * (i + 1))
    return None


def num(s):
    if s is None:
        return None
    s = re.sub(r"<[^>]+>", "", str(s)).replace(",", "").strip()
    if s in ("", "--", "---", "X"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def roc(d):  # "115/11/13" -> "2026-11-13"
    y, m, dd = d.strip().split("/")
    return f"{int(y)+1911:04d}-{int(m):02d}-{int(dd):02d}"


def tables(js):
    """證交所新舊格式都整理成 [(title, fields, data)]"""
    out = []
    if not js:
        return out
    if "tables" in js:
        for t in js["tables"]:
            out.append((t.get("title", ""), t.get("fields", []) or [], t.get("data", []) or []))
    if "fields" in js and "data" in js:
        out.append((js.get("title", ""), js["fields"], js["data"]))
    for k in list(js.keys()):  # 舊格式 fields1/data1...
        m = re.match(r"fields(\d+)$", k)
        if m and f"data{m.group(1)}" in js:
            out.append((js.get(f"subtitle{m.group(1)}", ""), js[k], js[f"data{m.group(1)}"]))
    return out


def col(fields, *names):
    for n in names:
        for i, f in enumerate(fields):
            if n in f:
                return i
    return None


def get_otc(now):
    """上櫃股票收盤行情（櫃買中心）。格式可能改版，所以試好幾個來源、用欄位名稱找。"""
    roc_d = f"{now.year-1911}/{now.month:02d}/{now.day:02d}"
    roc_compact = f"{now.year-1911}{now.month:02d}{now.day:02d}"
    out = []

    def add(code, name, close, chg, hi, lo, shares, amount):
        code = str(code).strip(); c = num(close)
        if not code or c is None or not re.match(r"^[0-9A-Z]{4,6}$", code):
            return
        d = num(chg) or 0.0
        if isinstance(chg, str) and chg.strip().startswith("-"):
            d = -abs(d)
        out.append([code, str(name).strip(), round((num(amount) or 0) / 1e8, 2), int((num(shares) or 0) / 1000),
                    c, round(d, 2), num(hi) or c, num(lo) or c, "o"])

    # A) OpenAPI（JSON 陣列，英文欄位）
    js = get("https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes")
    if isinstance(js, list) and js:
        k = list(js[0].keys())
        pick = lambda *names: next((x for x in k for n in names if n.lower() == x.lower()), None)
        kd, kc, kn = pick("Date"), pick("SecuritiesCompanyCode", "Code"), pick("CompanyName", "Name")
        kcl, kch, kh, kl = pick("Close"), pick("Change"), pick("High"), pick("Low")
        ksh, kam = pick("TradingShares", "TradeVolume"), pick("TransactionAmount", "TradeValue")
        print("TPEx OpenAPI keys:", k[:14], "date:", js[0].get(kd))
        if kc and kcl and (not kd or str(js[0].get(kd)).replace("/", "") == roc_compact):
            for x in js:
                add(x.get(kc), x.get(kn, ""), x.get(kcl), x.get(kch), x.get(kh), x.get(kl), x.get(ksh), x.get(kam))
    if out:
        return out
    # B) 舊版網址（aaData）
    js = get(f"https://www.tpex.org.tw/web/stock/aftertrading/otc_quotes_no1430/stk_wn1430_result.php?l=zh-tw&d={roc_d}&se=EW&o=json")
    rows = (js or {}).get("aaData") or []
    if rows and (js or {}).get("reportDate", roc_d) in (roc_d, roc_d.replace("/", "")):
        print("TPEx legacy rows:", len(rows), rows[0][:9])
        for x in rows:
            # 代號,名稱,收盤,漲跌,開盤,最高,最低,均價,成交股數,成交金額
            if len(x) >= 10:
                add(x[0], x[1], x[2], x[3], x[5], x[6], x[8], x[9])
    if out:
        return out
    # C) 新版網站
    js = get(f"https://www.tpex.org.tw/www/zh-tw/afterTrading/otc?date={now.year}%2F{now.month:02d}%2F{now.day:02d}&type=EW&id=&response=json")
    for (title, f, data) in tables(js):
        ic, iname, icl = col(f, "代號"), col(f, "名稱"), col(f, "收盤")
        if None in (ic, icl):
            continue
        ich, ih, il = col(f, "漲跌"), col(f, "最高"), col(f, "最低")
        ish, iam = col(f, "成交股數"), col(f, "成交金額")
        print("TPEx new-site fields:", f[:12])
        for x in data:
            add(x[ic], x[iname] if iname is not None else "", x[icl], x[ich] if ich is not None else 0,
                x[ih] if ih is not None else None, x[il] if il is not None else None,
                x[ish] if ish is not None else 0, x[iam] if iam is not None else 0)
    return out


def main():
    now = datetime.now(TW)
    ymd = now.strftime("%Y%m%d")
    today = now.strftime("%Y-%m-%d")

    try:
        old = json.load(open(DATA_FILE, encoding="utf-8"))
    except Exception:
        old = {}

    # 今天的完整資料已經有了就不用再抓（每 15 分鐘會跑一次）
    if old.get("date") == today and old.get("complete") and not os.environ.get("FORCE"):
        print("今天的資料已經完整，不用更新。")
        return 0

    # 1) 大盤：成交量、成交金額、收盤、漲跌（FMTQIK，當月每日）
    fm = get(f"{BASE}/afterTrading/FMTQIK?date={ymd}&response=json")
    rows = [r for (_, f, d) in tables(fm) for r in d] if fm and fm.get("stat") == "OK" else []
    if not rows or roc(rows[-1][0]) != today:
        print("今天沒有收盤資料（假日或還沒公布），不更新。")
        return 0
    fm_fields = tables(fm)[0][1]
    r = rows[-1]
    i_sh, i_amt, i_tx = col(fm_fields, "成交股數"), col(fm_fields, "成交金額"), col(fm_fields, "成交筆數")
    i_close, i_chg = col(fm_fields, "指數"), col(fm_fields, "漲跌")
    close = num(r[i_close]); change = num(r[i_chg])

    # 2) 加權指數開高低收（當月 + 上個月，做走勢圖）
    hist = []
    first = now.replace(day=1)
    prev_month = (first - timedelta(days=1)).strftime("%Y%m01")
    for d in (prev_month, now.strftime("%Y%m01")):
        js = get(f"{BASE}/TAIEX/MI_5MINS_HIST?date={d}&response=json")
        for (_, f, data) in tables(js):
            io, ih, il, ic = col(f, "開盤"), col(f, "最高"), col(f, "最低"), col(f, "收盤")
            if None in (io, ih, il, ic):
                continue
            for x in data:
                hist.append({"date": roc(x[0]), "o": num(x[io]), "h": num(x[ih]), "l": num(x[il]), "c": num(x[ic])})
        time.sleep(2)
    hist = sorted({h["date"]: h for h in hist}.values(), key=lambda h: h["date"])
    if not any(h["date"] == today for h in hist):
        hist.append({"date": today, "o": None, "h": None, "l": None, "c": close})
    todays = next((h for h in hist if h["date"] == today), None)
    prev = close - change if change is not None else None
    idx = {
        "open": todays["o"] if todays else None, "high": todays["h"] if todays else None,
        "low": todays["l"] if todays else None, "close": close, "prev": round(prev, 2) if prev else None,
    }

    # 3) 每檔股票收盤行情 + 漲跌家數（MI_INDEX）
    time.sleep(2)
    mi = get(f"{BASE}/afterTrading/MI_INDEX?date={ymd}&type=ALLBUT0999&response=json")
    stocks, breadth = [], None
    for (title, f, data) in tables(mi):
        if col(f, "證券代號") is not None and col(f, "收盤價") is not None:
            ic, iname = col(f, "證券代號"), col(f, "證券名稱")
            ish, iam = col(f, "成交股數"), col(f, "成交金額")
            icl, isg, idf = col(f, "收盤價"), col(f, "漲跌(+/-)"), col(f, "漲跌價差")
            ihi, ilo = col(f, "最高價"), col(f, "最低價")
            for x in data:
                c = num(x[icl]); diff = num(x[idf]) or 0.0
                sign_txt = str(x[isg]) if isg is not None else ""
                if "-" in sign_txt or "green" in sign_txt:
                    diff = -abs(diff)
                elif "+" in sign_txt or "red" in sign_txt:
                    diff = abs(diff)
                elif "X" in sign_txt:
                    diff = 0.0
                if c is None:
                    continue
                hi = num(x[ihi]) if ihi is not None else None
                lo = num(x[ilo]) if ilo is not None else None
                stocks.append([x[ic].strip(), x[iname].strip(), round((num(x[iam]) or 0) / 1e8, 2),
                               int((num(x[ish]) or 0) / 1000), c, round(diff, 2), hi or c, lo or c, ""])
        if "漲跌證券數" in title or (col(f, "類型") is not None and data and "上漲" in str(data[0][0])):
            istk = col(f, "股票")
            if istk is None:
                continue
            b = {}
            for x in data:
                k = str(x[0]); v = num(str(x[istk]).split("(")[0])
                if "上漲" in k: b["up"] = int(v or 0)
                elif "下跌" in k: b["down"] = int(v or 0)
                elif "持平" in k: b["flat"] = int(v or 0)
            if "up" in b:
                breadth = b
    if not stocks:
        print("個股收盤行情還沒公布，等下一次再試。")
        return 0
    if breadth is None and stocks:  # 備用：自己數
        breadth = {"up": sum(1 for s in stocks if s[5] > 0), "down": sum(1 for s in stocks if s[5] < 0),
                   "flat": sum(1 for s in stocks if s[5] == 0)}

    time.sleep(2)
    m5 = get(f"{BASE}/afterTrading/MI_5MINS?date={ymd}&response=json")
    # 新聞用的是一般交易時段（13:30 收盤）的累積成交金額，不含盤後、零股、鉅額交易
    session = {}
    for (title, f, data) in tables(m5):
        ia = col(f, "成交金額")
        if ia is not None and data:
            last = data[-1]
            session["amount"] = num(last[ia])  # 百萬元
            for key, name in (("bid", "委託買進數量"), ("ask", "委託賣出數量"), ("shares", "成交數量"), ("tx", "成交筆數")):
                ik = col(f, name)
                if ik is not None:
                    session[key] = num(last[ik])

    # 4) 三大法人買賣金額（BFI82U）
    time.sleep(2)
    bf = get(f"{BASE}/fund/BFI82U?type=day&dayDate={ymd}&response=json")
    inst = None
    if bf and bf.get("stat") == "OK":
        f, data = tables(bf)[0][1], tables(bf)[0][2]
        idiff = col(f, "買賣差額")
        fo = tr = de = 0.0
        for x in data:
            name, v = str(x[0]), (num(x[idiff]) or 0) / 1e8
            if "合計" in name or name.startswith("外資自營商"): continue  # 新聞的「外資及陸資」不含外資自營商
            if name.startswith("外資"): fo += v
            elif "投信" in name: tr += v
            elif "自營商" in name: de += v
        inst = {"foreign": round(fo, 2), "trust": round(tr, 2), "dealer": round(de, 2)}

    # 5) 組合資料（漲跌家數、漲停、排行只算上市；上櫃股票加進來給搜尋、自選、模擬用）
    pct = lambda s: s[5] / (s[4] - s[5]) * 100 if (s[4] - s[5]) > 0 else 0
    liquid = [s for s in stocks if s[2] >= 1 and (s[4] - s[5]) > 0]
    gainers = sorted([s for s in liquid if pct(s) > 0], key=lambda s: -pct(s))[:5]
    losers = sorted([s for s in liquid if pct(s) < 0], key=lambda s: pct(s))[:5]
    limit_up = sum(1 for s in liquid if pct(s) >= 9.5)
    limit_down = sum(1 for s in liquid if pct(s) <= -9.5)
    otc = get_otc(now)
    print("上櫃股票：", len(otc))
    if not otc and old.get("date") == today:
        otc = [s for s in old.get("stocks", []) if len(s) > 8 and s[8] == "o"]  # 這次沒抓到就保留上一次的
    stocks = stocks + otc
    stocks.sort(key=lambda s: -s[2])

    inst_hist = [h for h in old.get("instHistory", []) if h.get("date") != today]
    if inst:
        inst_hist.append({"date": today, **inst})
    elif old.get("date") == today and old.get("inst"):  # 不要把已經抓到的法人資料蓋掉
        inst = old["inst"]
        inst_hist.append({"date": today, **inst})
    inst_hist = inst_hist[-KEEP:]

    out = {
        "date": today,
        "weekday": "一二三四五六日"[now.weekday()],
        "updatedAt": now.strftime("%Y-%m-%d %H:%M"),
        "complete": bool(inst and idx["open"] is not None and breadth and (otc or now.hour * 60 + now.minute >= 16 * 60 + 30)),
        "idx": idx,
        "amount": round(session["amount"] / 100, 2) if session.get("amount") else round((num(r[i_amt]) or 0) / 1e8, 2),
        "shares": int(session["shares"]) if session.get("shares") else int((num(r[i_sh]) or 0) / 1000),
        "transactions": int(session["tx"]) if session.get("tx") else (int(num(r[i_tx]) or 0) if i_tx is not None else None),
        "bid": int(session["bid"]) if session.get("bid") else None,
        "ask": int(session["ask"]) if session.get("ask") else None,
        "breadth": breadth,
        "limitUp": limit_up, "limitDown": limit_down,
        "inst": inst,
        "instHistory": inst_hist,
        "otcCount": sum(1 for s in stocks if s[8] == "o"),
        "stocks": stocks,  # 全部股票（依成交金額排序），排行取前幾名、搜尋用全部
        "gainers": [s[:6] for s in gainers],
        "losers": [s[:6] for s in losers],
        "history": [{"d": h["date"][5:].replace("-", "/"), "c": h["c"]} for h in hist[-KEEP:]],
        "sources": [["臺灣證券交易所 盤後資料", "https://www.twse.com.tw/zh/trading/historical/mi-index.html"], ["證券櫃檯買賣中心 上櫃行情", "https://www.tpex.org.tw/"]],
    }
    json.dump(out, open(DATA_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("更新完成：", today, close, change)
    return 0


if __name__ == "__main__":
    sys.exit(main())
