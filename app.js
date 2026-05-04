const tg = window.Telegram.WebApp;
let cart = [];
let selectedVolumes = {};

const products = [
    { id: 1, name: "Bleu de Chanel", desc: "Универсальный древесно-фужерный аромат. Свежесть цитрусов, мята и глубокая древесная база.", img: "bleu.jpg", prices: {10: 45, 15: 65, 30: 110, 50: 160} },
    { id: 2, name: "Paco Rabanne Invictus", desc: "Бодрый морской аромат. Грейпфрут, лавровый лист и гваяковое дерево.", img: "invictus.jpg", prices: {10: 45, 15: 65, 30: 110, 50: 160} },
    { id: 3, name: "Creed Aventus Standart", desc: "Легендарный шипровый аромат. Фруктовая свежесть и дымная глубина.", img: "aventus_std.jpg", prices: {10: 40, 15: 60, 30: 100, 50: 150} },
    { id: 4, name: "Escentric Molecules 02", desc: "Минималистичный аромат на основе амброксана. Чистый, теплый и сексуальный.", img: "molecules02.jpg", prices: {10: 50, 15: 75, 30: 130, 50: 180} },
    { id: 5, name: "Louis Vuitton Imagination", desc: "Роскошный цитрусовый аромат с нотами чая, имбиря и амброксана.", img: "imagination.jpg", prices: {10: 60, 15: 90, 30: 160, 50: 240} },
    { id: 6, name: "Kilian Angels' Share", desc: "Гурманский шедевр: ноты коньяка, корицы, дуба и сладкой ванили.", img: "img/angels_share.jpg", prices: {10: 65, 15: 95, 30: 180, 50: 260} },
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

window.showCart = function() { document.getElementById('cart-overlay').classList.add('active'); };
window.hideCart = function() { document.getElementById('cart-overlay').classList.remove('active'); };

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
    
    const btn = document.getElementById('process-order-btn');
    if (btn) btn.style.display = total > 0 ? 'block' : 'none';
}

window.sendOrder = function() {
    if (cart.length === 0) return;

    const user = tg.initDataUnsafe?.user;
    const userRef = user ? (user.username ? `@${user.username}` : user.first_name) : "Клиент";

    const orderDetails = cart.map(i => `${i.name} (${i.vol}ml) x${i.qty}`).join(', ');
    const finalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const result = {
        customer: userRef,
        order: orderDetails,
        total: finalPrice + " zł"
    };

    try {
        tg.sendData(JSON.stringify(result));
        tg.close();
    } catch (e) {
        console.error("Ошибка TG SDK:", e);
        alert("Пожалуйста, запустите магазин через кнопку в меню бота, чтобы оформить заказ.");
    }
};
init();
