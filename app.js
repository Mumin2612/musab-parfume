// База данных товаров (8 видов духов)
const products = [
    { id: 1, name: "MU #01 Inspiration", desc: "Свежий цитрусовый взрыв и морская прохлада.", img: "https://via.placeholder.com/300", prices: {10: 45, 15: 65, 30: 110, 50: 160} },
    { id: 2, name: "MU #02 Tobacco Vanille", desc: "Богатый табак, сладкая ваниль и специи.", img: "https://via.placeholder.com/300", prices: {10: 50, 15: 75, 30: 130, 50: 180} },
    { id: 3, name: "MU #03 Kirke Tiziana", desc: "Тропические фрукты и мускусный шлейф.", img: "https://via.placeholder.com/300", prices: {10: 45, 15: 70, 30: 110, 50: 170} },
    { id: 4, name: "MU #04 Molecule 02", desc: "Чистая амбра, раскрывающаяся на коже.", img: "https://via.placeholder.com/300", prices: {10: 55, 15: 80, 30: 140, 50: 200} },
    { id: 5, name: "MU #05 Baccarat 540", desc: "Шафран, жасмин и древесный янтарь.", img: "https://via.placeholder.com/300", prices: {10: 60, 15: 90, 30: 160, 50: 240} },
    { id: 6, name: "MU #06 Sauvage Elixir", desc: "Мощный, пряный и глубокий мужской аромат.", img: "https://via.placeholder.com/300", prices: {10: 50, 15: 75, 30: 130, 50: 190} },
    { id: 7, name: "MU #07 Black Phantom", desc: "Кофе, ром и темный шоколад. Гурманский хит.", img: "https://via.placeholder.com/300", prices: {10: 55, 15: 85, 30: 150, 50: 220} },
    { id: 8, name: "MU #08 Wood Sage", desc: "Морская соль и древесный шалфей. Легкость.", img: "https://via.placeholder.com/300", prices: {10: 45, 15: 65, 30: 110, 50: 160} }
];

let cart = [];
let selectedVolumes = {};

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
                    ${Object.keys(p.prices).map(v => `
                        <button class="vol-btn ${v==10?'active':''}" onclick="setVolume(${p.id}, ${v})">${v}ml</button>
                    `).join('')}
                </div>
                <div class="price-tag" id="price-${p.id}">${p.prices[10]} zł</div>
                <button class="buy-btn" onclick="addToCart(${p.id})">В корзину</button>
            </div>
        `;
    }).join('');

    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
}

function setVolume(id, vol) {
    selectedVolumes[id] = vol;
    const p = products.find(x => x.id === id);
    const priceElem = document.getElementById(`price-${id}`);
    if (priceElem) priceElem.innerText = `${p.prices[vol]} zł`;
    
    const container = document.getElementById(`vol-sel-${id}`);
    if (container) {
        const btns = container.querySelectorAll('.vol-btn');
        btns.forEach(b => b.classList.remove('active'));
        btns.forEach(b => { if(b.innerText.includes(vol)) b.classList.add('active'); });
    }
}

function addToCart(id) {
    const p = products.find(x => x.id === id);
    const vol = selectedVolumes[id];
    const price = p.prices[vol];
    
    const existing = cart.find(item => item.id === id && item.vol === vol);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, name: p.name, vol, price, qty: 1 });
    }
    
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light'); 
    updateUI();
}

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
        `).join('') || '<p style="text-align:center; padding:20px; color:#666;">Корзина пуста</p>';
    }

    const overTotal = document.getElementById('overlay-total');
    if (overTotal) overTotal.innerText = `${total} zł`;

    const mainBtn = window.Telegram.WebApp.MainButton;
    if (total > 0) {
        mainBtn.setParams({
            text: `ОФОРМИТЬ ЗАКАЗ (${total} zł)`,
            color: '#d4af37',
            text_color: '#000000',
            is_visible: true,
            is_active: true
        });
    } else {
        mainBtn.hide();
    }
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    updateUI();
}

function showCart() { document.getElementById('cart-overlay').classList.add('active'); }
function hideCart() { document.getElementById('cart-overlay').classList.remove('active'); }

window.Telegram.WebApp.onEvent('mainButtonClicked', () => {
    if (cart.length === 0) return;

    const orderData = {
        products: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
    };
    
    window.Telegram.WebApp.sendData(JSON.stringify(orderData));
});

// Запуск
init();
