# Tiger Bites Pig — 網站

純靜態網站（HTML / CSS / JS），不需要建置步驟，任何靜態主機都能直接部署。

## 檔案結構

```
index.html            首頁（菜單、分店、外燴、FAQ）
book.html             訂位頁（嵌入 DesignMyNight 訂位工具）
privacy.html          隱私權政策（草稿，見下方待確認）
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

## 上線前待確認

已查證（2026-10-19）：
- 週日公休：Tiger Bites Pig 官網 Contact Us 頁
- Saint Pauls Market 地址、營業時間、QR code 點餐：saintpaulsmarket.co.uk
- 雙人套餐：£45（依 `assets/menus/set-menu.pdf`）

還需要店家提供：
- [ ] **隱私權政策**裡所有黃色標記的欄位：公司名稱與註冊號碼、ICO 登記號、Email 與刷卡服務商、是否有監視器、保存期限、網站主機
- [ ] 隱私權政策是依 UK GDPR 擬的草稿，不是法律意見，正式上線前建議請專業人士過目
- [ ] 中文版翻譯請母語人士再順一次，尤其是菜名
