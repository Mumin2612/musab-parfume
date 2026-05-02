// Ждем полной загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    let cart = [];
    let selectedVolumes = {};

    const products = [
        { id: 1, name: "MU #01 Inspiration", prices: {10: 45, 15: 65, 30: 110, 50: 160} },
        { id: 2, name: "MU #02 Tobacco Vanille", prices: {10: 50, 15: 75, 30: 130, 50: 180} },
        { id: 3, name: "MU #03 Kirke Tiziana", prices: {10: 45, 15: 70, 30: 110, 50: 170} },
        { id: 4, name: "MU #04 Molecule 02", prices: {10: 55, 15: 80, 30: 140, 50: 200} },
        { id: 5, name: "MU #05 Baccarat 540", prices: {10: 60, 15: 90, 30: 160, 50: 240} },
        { id: 6, name: "MU #06 Sauvage Elixir", prices: {10: 50, 15: 75, 30: 130, 50: 190} },
        { id: 7, name: "MU #07 Black Phantom", prices: {10: 55, 15: 85, 30: 150, 50: 220} },
        { id: 8, name: "MU #08 Wood Sage", prices: {10: 45, 15: 65, 30: 110, 50: 160} }
    ];

    const catalog = document.getElementById('catalog');

    // Функция отрисовки каталога
    function render() {
        catalog.innerHTML = products.map(p => {
            if (!selectedVolumes[p.id]) selectedVolumes[p.id] = 10;
            const currentPrice = p.prices[selectedVolumes[p.id]];
            
            return `
                <div class="card">
                    <h3>${p.name}</h3>
                    <div id="vols-${p.id}">
                        ${[10, 15, 30, 50].map(v => `
                            <button class="vol-btn ${selectedVolumes[p.id] == v ? 'active' : ''}" 
                                onclick="window.changeVol(${p.id}, ${v})">${v}ml</button>
                        `).join('')}
                    </div>
                    <div class="price-tag">${currentPrice} zł</div>
                    <button class="buy-btn" onclick="window.add(${p.id})">В корзину</button>
                </div>
            `;
        }).join('');
    }

    // Делаем функции глобальными, чтобы onclick их видел
    window.changeVol = (id, vol) => {
        selectedVolumes[id] = vol;
        render();
    };

    window.add = (id) => {
        const p = products.find(x => x.id === id);
        const vol = selectedVolumes[id];
        cart.push({ name: p.name, vol: vol, price: p.prices[vol] });
        
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
        updateUI();
    };

    function updateUI() {
        const total = cart.reduce((sum, i) => sum + i.price, 0);
        const bar = document.getElementById('cart-bar');
        
        if (total > 0) {
            bar.style.display = 'flex';
            document.getElementById('bar-total').innerText = total + " zł";
            document.getElementById('bar-count').innerText = cart.length + " шт.";
            
            tg.MainButton.text = "ОФОРМИТЬ ЗАКАЗ (" + total + " zł)";
            tg.MainButton.show();
        } else {
            bar.style.display = 'none';
            tg.MainButton.hide();
        }
    }

    // САМОЕ ВАЖНОЕ: Обработка кнопки ТГ
    tg.onEvent('mainButtonClicked', () => {
        const orderText = cart.map(i => i.name + " (" + i.vol + "ml)").join('\n');
        tg.sendData("Новый заказ:\n" + orderText);
    });

    render();
});
