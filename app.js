const products = [
    { id: 1, name: "MU #01 Inspiration", desc: "Свежий цитрусовый взрыв.", img: "https://via.placeholder.com/300", prices: {10: 45, 15: 65, 30: 110, 50: 160} },
    { id: 2, name: "MU #02 Tobacco Vanille", desc: "Богатый табак и ваниль.", img: "https://via.placeholder.com/300", prices: {10: 50, 15: 75, 30: 130, 50: 180} },
    { id: 3, name: "MU #03 Kirke Tiziana", desc: "Тропические фрукты.", img: "https://via.placeholder.com/300", prices: {10: 45, 15: 70, 30: 110, 50: 170} },
    { id: 4, name: "MU #04 Molecule 02", desc: "Чистая амбра.", img: "https://via.placeholder.com/300", prices: {10: 55, 15: 80, 30: 140, 50: 200} },
    { id: 5, name: "MU #05 Baccarat 540", desc: "Шафран и жасмин.", img: "https://via.placeholder.com/300", prices: {10: 60, 15: 90, 30: 160, 50: 240} },
    { id: 6, name: "MU #06 Sauvage Elixir", desc: "Пряный мужской аромат.", img: "https://via.placeholder.com/300", prices: {10: 50, 15: 75, 30: 130, 50: 190} },
    { id: 7, name: "MU #07 Black Phantom", desc: "Кофе и ром.", img: "https://via.placeholder.com/300", prices: {10: 55, 15: 85, 30: 150, 50: 220} },
    { id: 8, name: "MU #08 Wood Sage", desc: "Морская соль и шалфей.", img: "https://via.placeholder.com/300", prices: {10: 45, 15: 65, 30: 110, 50: 160} }
];

let cart = [];
let selectedVolumes = {};
const tg = window.Telegram.WebApp;

function init() {
    const catalog = document.getElementById('catalog');
    if (!catalog) return;

    catalog.innerHTML = products.map(p => {
        selectedVolumes[p.id] = 10; 
        return `
            <div class="card">
                <img src="${p.img}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p class="desc">${p.desc}</p>
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

    tg.ready();
    tg.expand();
}

function setVolume(id, vol) {
    selectedVolumes[id] = vol;
    const p = products.find(x => x.id === id);
    document.getElementById(`price-${id}`).innerText = `${p.prices[vol]} zł`;
    const btns = document.getElementById(`vol-sel-${id}`).querySelectorAll('.vol-btn');
    btns.forEach(b => {
        b.classList.remove('active');
        if(parseInt(b.innerText) === vol) b.classList.add('active');
    });
}

function addToCart(id) {
    const p = products.find(x => x.id === id);
    const vol = selectedVolumes[id];
    const price = p.prices[vol];
    const existing = cart.find(item => item.id === id && item.vol === vol);
    if (existing) { existing.qty++; } else { cart.push({ id, name: p.name, vol, price, qty: 1 }); }
    tg.HapticFeedback.impactOccurred('light');
    updateUI();
}

function updateUI() {
    let total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const bar = document.getElementById('cart-bar');
    if (bar) {
        bar.style.display = total > 0 ? 'flex' : 'none';
        document.getElementById('bar-total').innerText = `${total} zł`;
        document.getElementById('bar-count').innerText = `${cart.reduce((s, i) => s + i.qty, 0)} шт.`;
    }
    
    // Настройка главной кнопки
    if (total > 0) {
        tg.MainButton.text = `ОФОРМИТЬ ЗАКАЗ (${total} zł)`;
        tg.MainButton.show();
        tg.MainButton.enable();
    } else {
        tg.MainButton.hide();
    }
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    updateUI();
}

function showCart() { document.getElementById('cart-overlay').classList.add('active'); }
function hideCart() { document.getElementById('cart-overlay').classList.remove('active'); }

// ПРЯМОЙ ОБРАБОТЧИК НАЖАТИЯ
tg.onEvent('mainButtonClicked', function(){
    const orderText = cart.map(i => `${i.name} (${i.vol}ml) x${i.qty}`).join('\n');
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const fullMessage = `Заказ:\n${orderText}\nИтого: ${total} zł`;
    
    tg.sendData(fullMessage); // Приложение ДОЛЖНО закрыться
});

init();
