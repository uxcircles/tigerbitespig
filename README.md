# Tiger Bites Pig — 網站

純靜態網站（HTML / CSS / JS），不需要建置步驟，任何靜態主機都能直接部署。

> **概念設計展示**：這是由 [UX CIRCLES](https://ux-circles.com/web) 設計的改版提案，並非 Tiger Bites Pig 官方網站。
> 每頁頂端有「概念設計」標示列，所有頁面都設為 `noindex`，`robots.txt` 也禁止搜尋引擎收錄，避免和官方網站搶搜尋結果。
> 如果店家正式採用：刪掉各頁的 `.concept-bar`、`<meta name="robots" content="noindex, nofollow">`，並把 `robots.txt` 改回 `Allow: /`。

## 檔案結構

```
index.html            首頁（菜單、分店、外燴、FAQ）
book.html             訂位頁（嵌入 DesignMyNight 訂位工具）
privacy.html          隱私權政策（草稿，上線前需店家補齊資料）
zh/                   繁體中文版（index / book / privacy）
styles.css            全站樣式
main.js               互動：導覽、菜單分頁/篩選、營業狀態、手機底部列
assets/img/           所有照片（WebP，每張兩種尺寸）＋ og.jpg 分享圖
assets/menus/         菜單 PDF 與 Saint Pauls Market 菜單 JPG
favicon.ico, favicon-32.png, apple-touch-icon.png, site.webmanifest
robots.txt, sitemap.xml
_redirects            舊網址轉址（Netlify / Cloudflare Pages）
vercel.json           舊網址轉址＋快取設定（Vercel）
```

`.claude/` 和 `README.md` 不需要上傳。

## 本機預覽

```bash
python3 -m http.server 5173
```

然後打開 http://localhost:5173 。訂位工具一定要透過 http(s) 開啟，直接雙擊 HTML 檔是不會出現的。

## 部署

選一個就好：

- **Netlify**：把整個資料夾拖到 app.netlify.com/drop，會自動讀取 `_redirects`。
- **Cloudflare Pages**：建立專案，選「直接上傳」，上傳這個資料夾。同樣會讀取 `_redirects`。
- **Vercel**：在資料夾裡執行 `npx vercel`，會讀取 `vercel.json`。

部署完成後，把 `tigerbitespig.co.uk` 的 DNS 從 GoDaddy 網站編輯器改指到新主機。舊網址（例如 `/book-now`、`/menu`、`/faqs`）會 301 轉到新頁面，Google 搜尋結果和 IG 簡介裡的連結都不會失效。

## 日常更新

| 要改什麼 | 改哪裡 |
|---|---|
| 菜色／價格 | `index.html` **和** `zh/index.html` 的 `#menu` 區塊（`data-diet` 填 `vg` `vgo` `gf` `gfo`，用來篩選） |
| 營業時間 | `main.js` 的 `HOURS`，**以及**中英文 `index.html` 的營業時間表、頁尾和 JSON-LD，中英文 `book.html` 也各有一行 |
| 菜單 PDF | 直接覆蓋 `assets/menus/` 裡同名的檔案 |
| 照片 | 放進 `assets/img/`，建議做成 WebP、正方形 450 和 900 兩種寬度 |
| 改了 CSS／JS | 把各頁 `styles.css?v=4`、`main.js?v=3` 的版本號 +1，避免訪客看到快取的舊版 |
| 圖示 | 各頁 `<body>` 開頭的 SVG sprite（`#i-ext` `#i-left` `#i-right` `#i-spark`）；勾勾、加號、下拉箭頭在 `styles.css` 的 `--i-*` 變數 |

## 內部筆記

原網站檢視結果、待店家確認事項和 pitch 資料放在本機的 `.private/`（已被 `.gitignore` 排除，不會進 git）。

第一次 clone 後啟用 git hooks：

```
git config core.hooksPath .githooks
```

之後每次 commit / push 會擋下 `.private/` 的檔案和 `.private/blocklist.txt` 裡的敏感字詞，並列出 `.private/NOTES.md` 裡未完成的待辦。隨時查看：`sh .githooks/remind.sh`
