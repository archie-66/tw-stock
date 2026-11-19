"""
個股詳細頁用的資料（在 update.py 之後跑）：
  hist/NN.json  每檔股票最近 60 個交易日的 K 線 [日期, 開, 高, 低, 收, 張數]（分成 40 個檔，App 只載入需要的那個）
  info.json     公司基本資料（產業、成立、上市日期、資本額、英文簡稱），每週更新一次
  news.json     熱門股最近 3 天的新聞標題和連結（Google 新聞），每天更新一次
回補歷史：BACKFILL=40 python extra.py
"""
import json, os, re, sys, time, urllib.parse, urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

import update as U

TW = timezone(timedelta(hours=8))
SHARDS = 40
KEEP = 60
NEWS_TOP = 150


def shard(code):
    return sum(ord(ch) for ch in code) % SHARDS


def load(path, default):
    try:
        return json.load(open(path, encoding="utf-8"))
    except Exception:
        return default


def save(path, obj):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    json.dump(obj, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))


# ---------- 歷史 K 線 ----------
def add_days(days):
    """days: {"2026-11-18": [stock rows...]}，寫進分片檔"""
    shards = {i: load(f"hist/{i:02d}.json", {}) for i in range(SHARDS)}
    for date in sorted(days):
        d = date.replace("-", "")
        for s in days[date]:
            code, close, hi, lo, lots = s[0], s[4], s[6], s[7], s[3]
            op = s[9] if len(s) > 9 and s[9] else close
            if close is None:
                continue
            rows = shards[shard(code)].setdefault(code, [])
            rows[:] = [r for r in rows if r[0] != d]
            rows.append([d, op, hi, lo, close, lots])
            rows.sort(key=lambda r: r[0])
            del rows[:-KEEP]
    for i, obj in shards.items():
        save(f"hist/{i:02d}.json", obj)


def backfill(n):
    now = datetime.now(TW)
    day, got, days = now, 0, {}
    while got < n and (now - day).days < n * 2 + 10:
        day -= timedelta(days=1)
        if day.weekday() >= 5:
            continue
        ymd = day.strftime("%Y%m%d")
        mi = U.get(f"{U.BASE}/afterTrading/MI_INDEX?date={ymd}&type=ALLBUT0999&response=json")
        listed, _ = U.parse_listed(mi)
        time.sleep(3)
        if not listed:
            print("沒有資料（假日？）", ymd)
            continue
        otc = U.get_otc(day)
        time.sleep(3)
        days[day.strftime("%Y-%m-%d")] = listed + otc
        got += 1
        print("回補", ymd, len(listed), len(otc))
    add_days(days)


# ---------- 公司基本資料 ----------
TWSE_IND = {"01": "水泥工業", "02": "食品工業", "03": "塑膠工業", "04": "紡織纖維", "05": "電機機械", "06": "電器電纜",
            "08": "玻璃陶瓷", "09": "造紙工業", "10": "鋼鐵工業", "11": "橡膠工業", "12": "汽車工業", "14": "建材營造",
            "15": "航運業", "16": "觀光餐旅", "17": "金融保險", "18": "貿易百貨", "19": "綜合", "20": "其他", "21": "化學工業",
            "22": "生技醫療", "23": "油電燃氣", "24": "半導體業", "25": "電腦及週邊設備", "26": "光電業", "27": "通信網路",
            "28": "電子零組件", "29": "電子通路", "30": "資訊服務", "31": "其他電子", "32": "文化創意", "33": "農業科技",
            "34": "電子商務", "35": "綠能環保", "36": "數位雲端", "37": "運動休閒", "38": "居家生活", "80": "管理股票"}


def fetch_info():
    out = {}
    for url, mk in (("https://openapi.twse.com.tw/v1/opendata/t187ap03_L", ""),
                    ("https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O", "o")):
        js = U.get(url)
        if not isinstance(js, list) or not js:
            print("公司資料抓不到", url)
            continue
        keys = list(js[0].keys())
        print("公司資料欄位", mk or "listed", keys[:20])
        pick = lambda *names: next((k for n in names for k in keys if n.lower() in k.lower()), None)
        kc = pick("公司代號", "SecuritiesCompanyCode", "CompanyCode")
        kind = pick("產業別", "SecuritiesIndustryCode", "IndustryCode", "Industry")
        kf = pick("成立日期", "DateOfIncorporation", "Establish")
        kl = pick("上市日期", "上櫃日期", "DateOfListing", "Listing")
        kcap = pick("實收資本額", "PaidInCapital", "Paidin")
        ken = pick("英文簡稱", "EnglishAbbreviation", "EnglishShortName", "英文名稱")
        if not kc:
            continue
        for x in js:
            code = str(x.get(kc, "")).strip()
            if not code:
                continue
            ind = str(x.get(kind, "")).strip() if kind else ""
            ind = TWSE_IND.get(ind.zfill(2), ind) if ind.isdigit() else ind
            cap = U.num(x.get(kcap)) if kcap else None
            out[code] = [ind, str(x.get(kf, "")).strip() if kf else "", str(x.get(kl, "")).strip() if kl else "",
                         round(cap / 1e8, 1) if cap else None, str(x.get(ken, "")).strip() if ken else ""]
        time.sleep(2)
    if out:
        save("info.json", {"updated": datetime.now(TW).strftime("%Y-%m-%d"), "c": out})
    print("公司資料", len(out))


# ---------- 新聞 ----------
def fetch_news(stocks, today):
    old = load("news.json", {})
    out = {}
    top = sorted(stocks, key=lambda s: -s[2])[:NEWS_TOP]
    cutoff = datetime.now(TW) - timedelta(days=3)
    for s in top:
        code, name = s[0], s[1]
        q = urllib.parse.quote(f'"{name}" {code} when:3d')
        url = f"https://news.google.com/rss/search?q={q}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
        try:
            req = urllib.request.Request(url, headers=U.UA)
            xml = urllib.request.urlopen(req, timeout=20).read()
            root = ET.fromstring(xml)
            items = []
            for it in root.iter("item"):
                title = (it.findtext("title") or "").strip()
                link = (it.findtext("link") or "").strip()
                src = (it.findtext("source") or "").strip()
                try:
                    dt = parsedate_to_datetime(it.findtext("pubDate")).astimezone(TW)
                except Exception:
                    continue
                if dt < cutoff or not title or not link:
                    continue
                if src and title.endswith(" - " + src):
                    title = title[: -len(" - " + src)]
                if name not in title and code not in title:
                    continue
                items.append([dt.strftime("%m/%d"), title[:80], src[:20], link])
                if len(items) >= 3:
                    break
            out[code] = items
        except Exception as e:
            print("新聞失敗", code, e)
            out[code] = old.get("c", {}).get(code, [])
        time.sleep(0.6)
    save("news.json", {"date": today, "c": out})
    print("新聞", sum(1 for v in out.values() if v), "/", len(out))


def main():
    n = int(os.environ.get("BACKFILL") or 0)
    if n:
        backfill(n)
    d = load("data.json", {})
    if not d.get("stocks"):
        return
    today = d["date"]
    add_days({today: d["stocks"]})
    info = load("info.json", {})
    if not info.get("updated") or (datetime.now(TW) - datetime.strptime(info["updated"], "%Y-%m-%d").replace(tzinfo=TW)).days >= 7:
        fetch_info()
    news = load("news.json", {})
    if d.get("complete") and news.get("date") != today:
        fetch_news(d["stocks"], today)


if __name__ == "__main__":
    sys.exit(main())
