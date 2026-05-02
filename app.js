const products = [
    { id: 1, name: "MU #01 Inspiration", desc: "Свежий цитрусовый аромат. Твой идеальный спутник на каждый день.", img: "https://via.placeholder.com/300", prices: {10: 45, 15: 65, 30: 110, 50: 160} },
    { id: 2, name: "MU #02 Tobacco Vanille", desc: "Теплый табак и сладкая ваниль. Аромат роскоши и уверенности.", img: "https://via.placeholder.com/300", prices: {10: 50, 15: 75, 30: 130, 50: 180} },
    { id: 3, name: "MU #03 Kirke Tiziana", desc: "Фруктовый коктейль с невероятным шлейфом. Хит сезона.", img: "https://via.placeholder.com/300", prices: {10: 45, 15: 70, 30: 110, 50: 170} },
    { id: 4, name: "MU #04 Molecule 02", desc: "Чистая амбра, которая раскрывается индивидуально на каждом.", img: "https://via.placeholder.com/300", prices: {10: 55, 15: 80, 30: 140, 50: 200} },
    { id: 5, name: "MU #05 Baccarat 540", desc: "Шафран, жасмин и древесный янтарь.", img: "https://via.placeholder.com/300", prices: {10: 60, 15: 90, 30: 160, 50: 240} },
    { id: 6, name: "MU #06 Sauvage Elixir", desc: "Мощный, пряный и глубокий мужской аромат.", img: "https://via.placeholder.com/300", prices: {10: 50, 15: 75, 30: 130, 50: 190} },
    { id: 7, name: "MU #07 Black Phantom", desc: "Кофе, ром и темный шоколад. Гурманский хит.", img: "https://via.placeholder.com/300", prices: {10: 55, 15: 85, 30: 150, 50: 220} },
    { id: 8, name: "MU #08 Wood Sage", desc: "Морская соль и древесный шалфей. Легкость.", img: "https://via.placeholder.com/300", prices: {10: 45, 15: 65, 30: 110, 50: 160} }
];

let cart = [];
let selectedVolumes = {};
const tg = window.Telegram.WebApp;

// Инициализация
function init() {
    const catalog = document.getElementById('catalog');
    if (!catalog) return;
    
    catalog.innerHTML = products.map(p => {
        selectedVolumes[p.id] = 10;
        return `
            <div class="card">
                <img src="${p.img}" alt="${p.name}">
                <h3>${p.name}</h3>
                <div class="desc">${p.desc}</div>
                <div class="volume-selector" id="vol-sel-${p.id}">
                    ${Object.keys(p.prices).map(v => `<button class="vol-btn ${v==10?'active':''}" onclick="setVolume(${p.id}, ${v}, event)">${v}ml</button>`).join('')}
                </div>
                <div class="price-tag" id="price-${p.id}">${p.prices[10]} zł</div>
                <button class="buy-btn" onclick="addToCart(${p.id})">Добавить</button>
            </div>
        `;
    }).join('');
    
    tg.ready();
    tg.expand();
}

// Глобальные функции, чтобы onclick их видел
window.setVolume = function(id, vol, event) {
    selectedVolumes[id] = vol;
    const p = products.find(x => x.id === id);
    document.getElementById(`price-${id}`).innerText = `${p.prices[vol]} zł`;
    
    const btns = document.getElementById(`vol-sel-${id}`).querySelectorAll('.vol-btn');
    btns.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
};

window.addToCart = function(id) {
    const p = products.find(x => x.id === id);
    const vol = selectedVolumes[id];
    const price = p.prices[vol];
    
    const existing = cart.find(item => item.id === id && item.vol === vol);
    if (existing) { existing.qty++; } 
    else { cart.push({ id, name: p.name, vol, price, qty: 1 }); }
    
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    updateUI();
};

window.changeQty = function(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    updateUI();
};

window.showCart = function() { document.getElementById('cart-overlay').classList.add('active'); };
window.hideCart = function() { document.getElementById('cart-overlay').classList.remove('active'); };

function updateUI() {
    let total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let count = cart.reduce((sum, item) => sum + item.qty, 0);

    const bar = document.getElementById('cart-bar');
    if (bar) {
        bar.style.display = total > 0 ? 'flex' : 'none';
        document.getElementById('bar-total').innerText = `${total} zł`;
        document.getElementById('bar-count').innerText = `${count} шт.`;
    }

    const list = document.getElementById('cart-list');
    if (list) {
        list.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <b>${item.name}</b>
                    <span>${item.vol}ml — ${item.price * item.qty} zł</span>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                </div>
            </div>
        `).join('') || '<p style="text-align:center; color:#666; margin-top:20px;">Корзина пуста</p>';
    }

    document.getElementById('overlay-total').innerText = `${total} zł`;

    if (total > 0) {
        tg.MainButton.setParams({ 
            text: `ОФОРМИТЬ ЗАКАЗ (${total} zł)`, 
            is_visible: true, 
            is_active: true,
            color: '#d4af37', 
            text_color: '#000000' 
        });
    } else {
        tg.MainButton.hide();
    }
}

// Отправка данных
tg.onEvent('mainButtonClicked', () => {
    const orderData = cart.map(i => `${i.name} (${i.vol}ml) x${i.qty}`).join('\n');
    tg.sendData("Новый заказ:\n" + orderData);
});

init();
