
/*
  Проект: Сайт по подбору трековых систем
  Технологии: HTML, CSS, JavaScript, jQuery, jQuery UI
  Структура проекта:
  - index.html        # Главная страница
  - styles.css        # Стили
  - utils.js          # Общие утилиты (парсинг, группировка, таблица, корзина)
  - ambrela.html      # Страница AMBRELA
  - ambrela.js        # Логика подбора для AMBRELA
  - maytoni.html      # Страница Maytoni
  - maytoni.js        # Логика подбора Maytoni
  // ... остальные производители аналогично
*/

// -- utils.js --
/**
 * Утилиты общего использования для трековых систем
 */

/**
 * Обёртка над URLSearchParams с дополнительными методами
 */
const parseParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    get: key => params.get(key),
    getJSON: key => {
      try {
        const v = params.get(key);
        return v ? JSON.parse(decodeURIComponent(v)) : [];
      } catch (e) {
        console.warn(`Не удалось распарсить JSON-параметр ${key}:`, e);
        return [];
      }
    }
  };
};

/**
 * Группировка элементов: массив объектов {id, pieceLength?} => сгруппированный словарь
 * groupedItems: { [id]: { component, count, totalLength } }
 */
const groupItems = (items, productData, suspensionMap = {}, additionalMap = {}) => {
  const grouped = {};
  items.forEach(obj => {
    const { id, pieceLength } = obj;
    if (!id) return;
    const isTrack = pieceLength !== undefined;
    if (!grouped[id]) {
      // Найти описание компонента в данных производителя
      const comp =
        (productData.components && productData.components[id]) ||
        suspensionMap[id] ||
        additionalMap[id] ||
        { name: id, price: 0, image: '' };
      grouped[id] = { component: comp, count: 0, totalLength: 0 };
    }
    grouped[id].count++;
    if (isTrack) grouped[id].totalLength += pieceLength;
  });
  return grouped;
};

/**
 * Отрисовка таблицы с результатами и вывод итоговой цены
 * @param {Object} groupedItems - результат работы groupItems
 * @param {string} tableSelector - селектор таблицы (<table>)
 * @param {string} totalSelector - селектор для вывода итоговой цены
 */
const renderTable = (groupedItems, tableSelector, totalSelector) => {
  const tbody = document.querySelector(`${tableSelector} tbody`);
  if (!tbody) return;
  tbody.innerHTML = '';
  let totalPrice = 0;
  Object.entries(groupedItems).forEach(([id, grp]) => {
    const { component, count, totalLength } = grp;
    if (!component || !component.name) return;
    let qty = totalLength > 0 ? Math.ceil(totalLength / 100) : count;
    const cost = qty * component.price;
    totalPrice += cost;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${component.image}" alt="${component.name}" style="width:50px;vertical-align:middle;margin-right:8px;">${component.name} (${id})</td>
      <td style="text-align:center;">${qty}</td>
      <td>${component.price}₽</td>
      <td>${cost}₽</td>
    `;
    tbody.appendChild(row);
  });
  const totalEl = document.querySelector(totalSelector);
  if (totalEl) {
    totalEl.innerHTML = `Итоговая стоимость: <strong>${totalPrice}₽</strong>`;
  }
};

/**
 * Сохранение сгруппированных товаров в localStorage под ключом 'cart'
 */
const saveToCart = groupedItems => {
  const existing = JSON.parse(localStorage.getItem('cart') || '[]');
  Object.entries(groupedItems).forEach(([id, grp]) => {
    existing.push({ article: id, component: grp.component, count: grp.count });
  });
  localStorage.setItem('cart', JSON.stringify(existing));
  alert('Товары добавлены в корзину.');
};

// Экспорт в глобальную область
window.parseParams = parseParams;
window.groupItems = groupItems;
window.renderTable = renderTable;
window.saveToCart = saveToCart;
