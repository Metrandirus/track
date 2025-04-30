// ambrela.js
// Зависимости: utils.js (parseParams, groupItems, renderTable, saveToCart)

(function() {
  const params   = parseParams();
  const color    = (params.get("color") || "black").toLowerCase();
  const mounting = (params.get("mounting") || "surface").toLowerCase();
  const shape    = (params.get("shape") || "straight").toLowerCase();
  const lengthA  = parseFloat(params.get("lengthA")) || 0;
  const lengthB  = parseFloat(params.get("lengthB")) || 0;
  const lights   = params.getJSON("lights");

  // Данные из ambrela.html
  const PRODUCTS = {
    black: {
      surface: {
        lengthOptions: [
          { min: 0,   max: 100, items: ["GL7102 BK"] },
          { min: 101, max: 200, items: ["GL7104 BK"] },
          { min: 201, max: 300, items: ["GL7106 BK"] }
        ],
        connectors: { straight: ["GL7066 BK"], "L-shape": ["GL7071 BK"], "T-shape": ["GL7078 BK"], x: [] },
        components: {
          "GL7102 BK": { name: "Шинопровод накладной черный 1м", price: 870,  image:"images/ambrela/GL7102 BK.jpg" },
          "GL7104 BK": { name: "Шинопровод накладной черный 2м", price:1740,  image:"images/ambrela/GL7104 BK.jpg" },
          "GL7106 BK": { name: "Шинопровод накладной черный 3м", price:2600,  image:"images/ambrela/GL7106 BK.jpg" },
          "GL7066 BK": { name: "Коннектор прямой черный",         price:295,  image:"images/ambrela/GL7066 BK.jpg" },
          "GL7071 BK": { name: "Коннектор угловой черный",        price:295,  image:"images/ambrela/GL7071 BK.jpg" },
          "GL7078 BK": { name: "Коннектор T-образный черный",    price:510,  image:"images/ambrela/GL7078 BK.jpg" }
        }
      },
      recessed: {
        lengthOptions: [
          { min: 0,   max: 100, items: ["GL7122 BK"] },
          { min: 101, max: 200, items: ["GL7124 BK"] }
        ],
        connectors: { straight: ["GL7160 BK"], "L-shape": ["GL7164 BK"], "T-shape": ["GL7168 BK"], x: [] },
        components: {
          "GL7122 BK": { name: "Шинопровод встраиваемый черный 1м", price:1190, image:"images/ambrela/GL7122 BK.jpg" },
          "GL7124 BK": { name: "Шинопровод встраиваемый черный 2м", price:2380, image:"images/ambrela/GL7124 BK.jpg" },
          "GL7160 BK": { name: "Коннектор прямой черный (встраиваемый)", price:205, image:"images/ambrela/GL7160 BK.jpg" },
          "GL7164 BK": { name: "Коннектор угловой черный (встраиваемый)", price:225, image:"images/ambrela/GL7164 BK.jpg" },
          "GL7168 BK": { name: "Коннектор T-образный черный (встраиваемый)", price:410, image:"images/ambrela/GL7168 BK.jpg" }
        }
      }
    },
    white: {
      surface: {
        lengthOptions: [
          { min: 0,   max: 100, items: ["GL7101 WH"] },
          { min: 101, max: 200, items: ["GL7103 WH"] },
          { min: 201, max: 300, items: ["GL7105 WH"] }
        ],
        connectors: { straight: ["GL7065 WH"], "L-shape": ["GL7070 WH"], "T-shape": ["GL7077 WH"], x: [] },
        components: {
          "GL7101 WH": { name: "Шинопровод накладной белый 1м", price:870,  image:"images/ambrela/GL7101 WH.jpg" },
          "GL7103 WH": { name: "Шинопровод накладной белый 2м", price:1740, image:"images/ambrela/GL7103 WH.jpg" },
          "GL7105 WH": { name: "Шинопровод накладной белый 3м", price:2600, image:"images/ambrela/GL7105 WH.jpg" },
          "GL7065 WH": { name: "Коннектор прямой белый",         price:235,  image:"images/ambrela/GL7065 WH.jpg" },
          "GL7070 WH": { name: "Коннектор угловой белый",        price:295,  image:"images/ambrela/GL7070 WH.jpg" },
          "GL7077 WH": { name: "Коннектор T-образный белый",     price:480,  image:"images/ambrela/GL7077 WH.jpg" }
        }
      },
      recessed: {
        lengthOptions: [{ min: 0, max: 100, items: ["358090"] }],
        connectors:    { straight: [], L-shape: [], "T-shape": [], x: [] },
        components: {
          "358090": { name: "Встраиваемый профиль 1м", price:1000, image:"images/ambrela/358090.jpg" },
          "358233": { name: "Соединитель для встраиваемого профиля", price:99, image:"images/ambrela/358233.jpg" }
        }
      }
    }
  };

  // Дополнительные маппинги
  const suspensionMap = {
    "GL7192 BK": { name:"Подвес черный AMBRELA", price:310, image:"images/ambrela/GL7192 BK.jpg" },
    "GL7191 WH": { name:"Подвес белый AMBRELA",  price:320, image:"images/ambrela/GL7191 WH.jpg" }
  };
  const additionalMap = {
    "GL7132 BK": { name:"Профиль 3м AMBRELA (черный)", price:4860, image:"images/ambrela/GL7132 BK.jpg" },
    "GL7131 BK": { name:"Профиль 2м AMBRELA (черный)", price:3230, image:"images/ambrela/GL7131 BK.jpg" },
    "GL7132 WH": { name:"Профиль 3м AMBRELA (белый)", price:4860, image:"images/ambrela/GL7132 WH.jpg" },
    "GL7131 WH": { name:"Профиль 2м AMBRELA (белый)", price:3230, image:"images/ambrela/GL7131 WH.jpg" }
  };

  // Новые X-коннекторы
  const xConnectors = {
    surface : { black:"GL7083 BK", white:"GL7082 WH" },
    recessed: { black:"GL7172 BK", white:"GL7171 WH" }
  };

  // вспомог: получаем сегменты по длине
  function getTracks(len, opts) {
    let parts = [];
    for (let o of opts) {
      if (len > o.min && len <= o.max) {
        parts.push({ id:o.items[0], pieceLength:o.max });
        return parts;
      }
    }
    // если длиннее max
    let max = opts[opts.length-1];
    let cnt = Math.floor(len / max.max);
    for (let i=0;i<cnt;i++) parts.push({ id:max.items[0], pieceLength:max.max });
    let rem = len - cnt*max.max;
    if (rem>0) parts.push(...getTracks(rem, opts));
    return parts;
  }

  // сборка всего
  function assembleItems() {
    if (!PRODUCTS[color] || !PRODUCTS[color][mounting]) {
      throw new Error("Неверный цвет или монтаж");
    }
    const cfg = PRODUCTS[color][mounting];
    let selected = [], used = [];

    if (shape === "straight") {
      selected = getTracks(lengthA, cfg.lengthOptions);
    }
    else if (shape === "L-shape") {
      selected = getTracks(lengthA, cfg.lengthOptions)
               .concat(getTracks(lengthB, cfg.lengthOptions));
      used.push({ id:cfg.connectors["L-shape"][0] });
    }
    else if (shape === "T-shape") {
      selected = getTracks(lengthA, cfg.lengthOptions)
               .concat(getTracks(lengthB, cfg.lengthOptions));
      used.push({ id:cfg.connectors["T-shape"][0] });
    }
    else if (shape === "P-shape") {
      const a = getTracks(lengthA, cfg.lengthOptions),
            b = getTracks(lengthB, cfg.lengthOptions);
      selected = a.concat(a, b);
      used.push({ id:cfg.connectors["L-shape"][0] }, { id:cfg.connectors["L-shape"][0] });
    }
    else if (shape === "rectangle") {
      const a = getTracks(lengthA, cfg.lengthOptions),
            b = getTracks(lengthB, cfg.lengthOptions);
      selected = a.concat(a, b, b);
      for (let i=0;i<4;i++) used.push({ id:cfg.connectors["L-shape"][0] });
    }
    else if (shape === "x") {
      selected = getTracks(lengthA, cfg.lengthOptions)
               .concat(getTracks(lengthB, cfg.lengthOptions));
      if (cfg.connectors.x[0]) used.push({ id:cfg.connectors.x[0] });
      selected.push({ id: xConnectors[mounting][color] });
    }

    // добавляем светильники (если есть mapping в коде Maytontech)
    lights.forEach(l => {
      // реализация аналогично: push({ id:..., pieceLength? })
    });

    // доп. по режимам hanging, recessed, stretch-ceiling
    if (mounting === "hanging") {
      const total = lengthA + lengthB;
      const cnt = Math.ceil(total/200);
      const suspId = color==="black"?"GL7192 BK":"GL7191 WH";
      for(let i=0;i<cnt;i++) selected.push({ id:suspId });
    }
    else if (mounting === "recessed") {
      // аналогично из ambrela.html
    }

    return selected.concat(used);
  }

  // финал
  function showSelection() {
    const all = assembleItems();
    const grouped = groupItems(all,
      PRODUCTS[color][mounting].components,
      suspensionMap,
      additionalMap
    );
    renderTable(grouped, "#resultsTable", "#totalPrice");
    document.getElementById("addToCartFromAmbrela")
      .onclick = () => saveToCart(grouped);
  }

  document.addEventListener("DOMContentLoaded", showSelection);

})();

