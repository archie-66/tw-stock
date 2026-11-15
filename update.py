"""
每日抓取證交所（TWSE）盤後資料，寫成 data.json。
由 GitHub Actions 在每個平日 15:20（台北時間）自動執行，只用 Python 內建模組。
沒開盤（假日）或資料還沒出來時，不會改動 data.json。
"""
import json, re, sys, time, urllib.request
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


def main():
    now = datetime.now(TW)
    ymd = now.strftime("%Y%m%d")
    today = now.strftime("%Y-%m-%d")

    try:
        old = json.load(open(DATA_FILE, encoding="utf-8"))
    except Exception:
        old = {}

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
                stocks.append([x[ic].strip(), x[iname].strip(), round((num(x[iam]) or 0) / 1e8, 2),
                               int((num(x[ish]) or 0) / 1000), c, round(diff, 2)])
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
    if breadth is None and stocks:  # 備用：自己數
        breadth = {"up": sum(1 for s in stocks if s[5] > 0), "down": sum(1 for s in stocks if s[5] < 0),
                   "flat": sum(1 for s in stocks if s[5] == 0)}

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

    # 5) 組合資料
    stocks.sort(key=lambda s: -s[2])
    top = stocks[:40]
    liquid = [s for s in stocks if s[2] >= 1 and (s[4] - s[5]) > 0]
    for s in liquid:
        s_pct = s[5] / (s[4] - s[5]) * 100
        s.append(round(s_pct, 2))
    gainers = sorted([s for s in liquid if s[6] > 0], key=lambda s: -s[6])[:5]
    losers = sorted([s for s in liquid if s[6] < 0], key=lambda s: s[6])[:5]
    limit_up = sum(1 for s in liquid if s[6] >= 9.5)
    limit_down = sum(1 for s in liquid if s[6] <= -9.5)

    inst_hist = [h for h in old.get("instHistory", []) if h.get("date") != today]
    if inst:
        inst_hist.append({"date": today, **inst})
    inst_hist = inst_hist[-KEEP:]

    out = {
        "date": today,
        "weekday": "一二三四五六日"[now.weekday()],
        "updatedAt": now.strftime("%Y-%m-%d %H:%M"),
        "idx": idx,
        "amount": round((num(r[i_amt]) or 0) / 1e8, 2),
        "shares": int((num(r[i_sh]) or 0) / 1000),
        "transactions": int(num(r[i_tx]) or 0) if i_tx is not None else None,
        "breadth": breadth,
        "limitUp": limit_up, "limitDown": limit_down,
        "inst": inst,
        "instHistory": inst_hist,
        "stocks": [s[:6] for s in stocks],  # 全部股票（依成交金額排序），排行取前幾名、搜尋用全部
        "gainers": [s[:6] for s in gainers],
        "losers": [s[:6] for s in losers],
        "history": [{"d": h["date"][5:].replace("-", "/"), "c": h["c"]} for h in hist[-KEEP:]],
        "sources": [["臺灣證券交易所 盤後資料", "https://www.twse.com.tw/zh/trading/historical/mi-index.html"]],
    }
    json.dump(out, open(DATA_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("更新完成：", today, close, change)
    return 0


if __name__ == "__main__":
    sys.exit(main())
