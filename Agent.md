# **4元數 Node 紀錄表 \- AI Agent 指導手冊 (System Context)**

## **1\. 專案概述 (Project Overview)**

本專案為一個數學/邏輯獨立研究的視覺化輔助工具。主要功能是紀錄一系列「4元數 (2x2 矩陣)」節點 (Node) 的推演過程。專案採用 HTML/CSS/JS (Vanilla) 撰寫，並透過 Firebase Firestore 實現即時雲端共編。

此文件旨在提供 AI 代理（如程式碼助手、資料分析 Agent）足夠的上下文，以便在後續維護、資料運算或擴展功能時，能嚴格遵守該數學模型的特定規則。

## **2\. 核心資料結構與定義 (Core Data Structures)**

### **2.1 節點 (Node)**

* **數學意義**：每個 Node 代表一個 2x2 矩陣。  
* **變數對應**：  
  * 第一列 (Row 1)：a (左上), c (右上)  
  * 第二列 (Row 2)：b (左下), d (右下)  
* **狀態顏色 (Color)**：  
  * white (預設狀態)  
  * green (代表「勝點」/ O)  
  * red (代表「敗點」/ X)

### **2.2 樹狀圖結構 (Tree Structure)**

* **列 (Row, 變數 r)**：自下而上生長，從 r \= 0 開始遞增。  
* **節點索引 (Index, 變數 i)**：在第 r 列中，總共有 2r \+ 1 個節點。節點索引 i 範圍為 0 到 2r。  
* **中央軸 (Central Axis)**：每一列的中心節點索引恆為 i \= r。

## **3\. 核心數學與推演規則 (Mathematical & Logical Rules)**

AI 代理在處理資料或擴充邏輯時，**必須絕對遵守**以下三大規則：

### **3.1 對稱鏡像規則 (Symmetry Rule)**

以中央軸 (i \= r) 為基準，左右兩側的 Node 互為對稱。

* **對應關係**：節點 i 的對稱節點為 2r \- i。  
* **數值變換**：對稱的兩個節點，其矩陣的「第一列與第二列互換」。  
  * 即：a \<-\> b 且 c \<-\> d。  
* **中央軸**：中央軸節點 (i \= r) 的數值由使用者自由決定，無須強制對稱。

### **3.2 衍生連線規則 (Arrow Connection Rule)**

節點之間的關係以箭頭表示，方向包含「向上 (跨列)」與「橫向 (同列)」。 對於第 r 列的第 i 個節點：

1. **向上衍生**：必然連接至第 r+1 列的第 i+1 個節點。  
2. **橫向衍生 (依據位置決定)**：  
   * **中央軸 (i \== r)**：同時向左連接 i-1，向右連接 i+1。  
   * **中軸左側 (i \< r)**：只向左連接 i-1。  
   * **中軸右側 (i \> r)**：只向右連接 i+1。

### **3.3 層級參照規則 (Level Reference Rule)**

推演過程以分頁 (Lv\_n) 進行管理，不同 Lv 之間存在繼承關係。 在 Lv\_n 的最上方會顯示一行「唯讀的參照列 (Reference Row)」，其規則如下：

* **若 n 為奇數**：參照 Lv\_{n-1} (前一頁) 的最後一列。  
* **若 n 為偶數**：參照 Lv\_{n-2} (前兩頁) 的最後一列。  
* *註：Lv\_0 為初始狀態，無參照列。*

### **3.4 實驗性疊加參照層 (Experimental Reference Layer / Overlay)**

除了唯讀的參照列之外，系統（特別是 `index-test.html` 與 `index2.html`）實作了「半透明參照層」的疊加功能，方便比對上下層級的圖形擴張：

* **對齊基準**：參照層 (Lv n-1) 的節點與當前層 (Lv n) 的節點「**從第一列 (r=0) 開始一對一幾何對齊**」。
* **位移計算 (Offset)**：在取得同位節點位置後，參照層節點會往正上方平移至「垂直間隙的中央」（Y 軸偏移量為 `(節點高度 + 垂直gap) / 2`），水平維持置中不動。
* **顯示過濾規則 (Visibility)**：
  * **當 n 為奇數時** (如 Lv 5 疊加 Lv 4)：排除參照層的「**第一列 (r=0)**」與「**最後一列**」不顯示。
  * **當 n 為偶數時** (如 Lv 6 疊加 Lv 5)：僅排除參照層的「**第一列 (r=0)**」不顯示。
* **分頁標籤代數顯示**：在獨立的 `index2.html` 分支中，Lv 標籤被轉換為 `4n`, `4n+1`, `4n+2`... 等代數連續顯示。

## **4\. 資料儲存格式 (JSON Schema)**

本專案將推演結果序列化為 JSON，並儲存於 Firebase Firestore (research\_data/board\_state) 中。 
為了支援 Firebase 的 Delta Updates 並且防範陣列賦值覆蓋的問題，`state` 內部的 `rows` 與 `nodes` 皆採用 Javascript **Map (Object)** 結構而非 JS Array。結構如下：

```json
{  
  "Lv_0": {  
    "id": "Lv_0",  
    "rows": {  
      "0": {  
        "r": "0",  
        "nodes": {  
          "0": {  
            "i": "0",  
            "color": "white|green|red",  
            "vals": {  
              "a": "2n+1",  
              "b": "1",  
              "c": "4n-2",  
              "d": "0"  
            }  
          }  
        }  
      }  
    }  
  }  
}
```

* **注意**：儲存的 JSON **不包含**唯讀的參照列 (.ref-row)，參照列是由前端 UI 在渲染時依據「層級參照規則」動態生成的。

## **5\. UI 與協作機制說明 (UI & Collaborative Mechanisms)**

* **DOM 排列與 Focus 順序**：為了支援原生的 Tab 鍵順序 (左上-\>左下-\>右上-\>右下)，Node 的內部 CSS 採用 grid-auto-flow: column。因此 DOM 中的 input 順序定義為 a, b, c, d。  
* **鍵盤方向鍵導航**：實作了智慧方向鍵邏輯，當游標在文字邊緣時按左右鍵，會自動跳躍至相鄰的 input 或相鄰的 Node。
* **緊密模式 (Compact Mode)**：可透過 UI 勾選來隱藏參照層，並縮小樹狀圖中垂直與水平的渲染間距為 10px。
* **進階 Firebase 協作防寫衝突架構**：  
  * **Offline Persistence**：透過 IndexedDB 快取加速跨分頁載入效能，並支援離線讀寫。
  * **編輯鎖 (Level-based Lock)**：使用者在指定 `Lv_n` 進行輸入、增刪列或改色時，會於 Firebase `/locks` 節點租用 10 秒的編輯權；處於租用期的其他客戶端會看到紅色的唯讀警告標語 (.locked-banner)，並且所有輸入框無法被 Focus 點擊。
  * **Delta 差異發布與反彈防禦 (Bounce-back Prevention)**：
    * 修改數值後系統等待 0.6s 才利用 `updateDoc` 將純粹差異的欄位推上雲端，預防全面陣列覆寫的資料庫 Race Condition。
    * 在 Debounce 等待期間觸發 `hasPendingChanges` 護盾，拒絕接收與覆寫雲端回傳的 snapshot，以保護客戶端暫存建立的新資料列 (DOM Element) 不被刪除。

## **6\. AI 代理任務指南 (Agent Directives)**

當 User 要求你進行以下任務時，請參考對應方針：

1. **擴充前端功能**：請直接修改 index.html，並確保不破壞 Firebase onSnapshot 的防跳動機制以及 SVG 箭頭 drawArrows() 的座標計算。  
2. **分析資料 (Data Analysis)**：如果 User 提供 JSON 檔案並要求找出數學規律，請優先分析 vals 內的代數表達式關係，並注意驗證是否滿足「對稱鏡像規則」。  
3. **自動補全推演 (Auto-completion)**：若要求預測下一列的值，需嚴格遵守使用者在中央軸定義的代數遞迴關係，並應用規則自動展開左右兩側。