const tg = window.Telegram.WebApp;
let cart = [];
let selectedVolumes = {};

const products = [
    { id: 1, name: "MU #01 Inspiration", desc: "Свежий цитрусовый аромат. Твой идеальный спутник.", img: "https://via.placeholder.com/300", prices: {10: 45, 15: 65, 30: 110, 50: 160} },
    { id: 2, name: "MU #02 Tobacco Vanille", desc: "Теплый табак и сладкая ваниль. Роскошь.", img: "https://via.placeholder.com/300", prices: {10: 50, 15: 75, 30: 130, 50: 180} },
    { id: 3, name: "MU #03 Kirke Tiziana", desc: "Фруктовый коктейль с невероятным шлейфом.", img: "https://via.placeholder.com/300", prices: {10: 45, 15: 70, 30: 110, 50: 170} },
    { id: 4, name: "MU #04 Molecule 02", desc: "Чистая амбра, раскрывается индивидуально.", img: "https://via.placeholder.com/300", prices: {10: 55, 15: 80, 30: 140, 50: 200} }
];

function init() {
    tg.ready();
    tg.expand();
    
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
                    ${[10, 15, 30, 50].map(v => `<button class="vol-btn ${v==10?'active':''}" onclick="setVolume(${p.id}, ${v}, event)">${v}ml</button>`).join('')}
                </div>
                <div class="price-tag" id="price-${p.id}">${p.prices[10]} zł</div>
                <button class="buy-btn" onclick="addToCart(${p.id})">Добавить</button>
            </div>
        `;
    }).join('');
}

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

window.showCart = function() {
    document.getElementById('cart-overlay').classList.add('active');
};

window.hideCart = function() {
    document.getElementById('cart-overlay').classList.remove('active');
};

window.changeQty = function(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    updateUI();
};

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
        `).join('') || '<p style="text-align:center; color:#666; padding-top:20px;">Корзина пуста</p>';
    }

    document.getElementById('overlay-total').innerText = `${total} zł`;

    if (total > 0) {
        tg.MainButton.text = `ОФОРМИТЬ ЗАКАЗ (${total} zł)`;
        tg.MainButton.show();
        tg.MainButton.enable();
    } else {
        tg.MainButton.hide();
    }
}

// ИСПОЛЬЗУЕМ БОЛЕЕ НАДЕЖНЫЙ МЕТОД ОБРАБОТКИ КЛИКА
tg.MainButton.onClick(function() {
    if (cart.length === 0) return;

    const orderData = {
        items: cart.map(i => ({name: i.name, vol: i.vol, qty: i.qty})),
        total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
    };

    // Отправляем данные и ЗАКРЫВАЕМ приложение (это принудительно заставляет ТГ обработать данные)
    tg.sendData(JSON.stringify(orderData));
    
    // Если sendData все равно не пускает бот, можно использовать закрытие:
    // tg.close(); 
});

init();
