let tg = window.Telegram.WebApp;
let cart = [];
let selectedVolumes = {};

const products = [
    { id: 1, name: "MU #01 Inspiration", desc: "Свежий цитрусовый взрыв.", prices: {10: 45, 15: 65, 30: 110, 50: 160} },
    { id: 2, name: "MU #02 Tobacco Vanille", desc: "Богатый табак и ваниль.", prices: {10: 50, 15: 75, 30: 130, 50: 180} },
    { id: 3, name: "MU #03 Kirke Tiziana", desc: "Тропические фрукты.", prices: {10: 45, 15: 70, 30: 110, 50: 170} },
    { id: 4, name: "MU #04 Molecule 02", desc: "Чистая амбра.", prices: {10: 55, 15: 80, 30: 140, 50: 200} },
    { id: 5, name: "MU #05 Baccarat 540", desc: "Шафран и жасмин.", prices: {10: 60, 15: 90, 30: 160, 50: 240} },
    { id: 6, name: "MU #06 Sauvage Elixir", desc: "Пряный мужской аромат.", prices: {10: 50, 15: 75, 30: 130, 50: 190} },
    { id: 7, name: "MU #07 Black Phantom", desc: "Кофе и ром.", prices: {10: 55, 15: 85, 30: 150, 50: 220} },
    { id: 8, name: "MU #08 Wood Sage", desc: "Морская соль и шалфей.", prices: {10: 45, 15: 65, 30: 110, 50: 160} }
];

function init() {
    const catalog = document.getElementById('catalog');
    if (!catalog) return;

    catalog.innerHTML = products.map(p => {
        selectedVolumes[p.id] = 10;
        return `
            <div class="card">
                <h3>${p.name}</h3>
                <p>${p.desc}</p>
                <div class="volume-selector" id="vol-sel-${p.id}">
                    <button class="vol-btn active" onclick="setVolume(${p.id}, 10)">10ml</button>
                    <button class="vol-btn" onclick="setVolume(${p.id}, 15)">15ml</button>
                    <button class="vol-btn" onclick="setVolume(${p.id}, 30)">30ml</button>
                    <button class="vol-btn" onclick="setVolume(${p.id}, 50)">50ml</button>
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
    document.getElementById(`price-${id}`).innerText = p.prices[vol] + " zł";
    
    const btns = document.getElementById(`vol-sel-${id}`).querySelectorAll('.vol-btn');
    btns.forEach(b => {
        b.classList.remove('active');
        if (parseInt(b.innerText) === vol) b.classList.add('active');
    });
}

function addToCart(id) {
    const p = products.find(x => x.id === id);
    const vol = selectedVolumes[id];
    const item = { id, name: p.name, vol, price: p.prices[vol] };
    cart.push(item);
    
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    updateUI();
}

function updateUI() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    const bar = document.getElementById('cart-bar');
    if (bar) {
        bar.style.display = total > 0 ? 'flex' : 'none';
        document.getElementById('bar-total').innerText = total + " zł";
        document.getElementById('bar-count').innerText = cart.length + " шт.";
    }

    const list = document.getElementById('cart-list');
    if (list) {
        list.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <span>${item.name} (${item.vol}ml)</span>
                <b>${item.price} zł</b>
                <button onclick="removeItem(${index})" style="background:red; color:#fff; border:none; border-radius:5px; padding:2px 8px;">✕</button>
            </div>
        `).join('');
    }

    if (total > 0) {
        tg.MainButton.setText("ОФОРМИТЬ ЗАКАЗ (" + total + " zł)");
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

function removeItem(index) {
    cart.splice(index, 1);
    updateUI();
}

function showCart() { document.getElementById('cart-overlay').classList.add('active'); }
function hideCart() { document.getElementById('cart-overlay').classList.remove('active'); }

tg.onEvent('mainButtonClicked', function() {
    const text = cart.map(i => i.name + " " + i.vol + "ml").join('\n');
    tg.sendData("Новый заказ:\n" + text);
});

init();
