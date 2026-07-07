// Initialize Telegram WebApp
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.ready();
    tg.expand();
}

// Helper to get URL query parameters
function getQueryParam(name, defaultValue) {
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(name);
    return value !== null ? value : defaultValue;
}

// User Stats Data loaded from URL parameters or defaults
const userStats = {
    uid: getQueryParam('uid', '123456789'),
    username: getQueryParam('username', 'MafiaPlayer'),
    first_name: getQueryParam('first_name', 'Mafia Player'),
    dollars: parseInt(getQueryParam('dollars', '200')),
    diamonds: parseInt(getQueryParam('diamonds', '5')),
    games: parseInt(getQueryParam('games', '12')),
    wins: parseInt(getQueryParam('wins', '8')),
    losses: parseInt(getQueryParam('losses', '4')),

    // Inventory quantities
    himoya: parseInt(getQueryParam('himoya', '1')),
    qotil_himoya: parseInt(getQueryParam('qotil_himoya', '0')),
    ovoz_himoya: parseInt(getQueryParam('ovoz_himoya', '2')),
    miltiq: parseInt(getQueryParam('miltiq', '1')),
    maska: parseInt(getQueryParam('maska', '0')),
    soxta_hujjat: parseInt(getQueryParam('soxta_hujjat', '3')),

    // Active toggles
    himoya_active: getQueryParam('himoya_active', 'true') === 'true',
    qotil_himoya_active: getQueryParam('qotil_himoya_active', 'true') === 'true',
    ovoz_himoya_active: getQueryParam('ovoz_himoya_active', 'true') === 'true',
    miltiq_active: getQueryParam('miltiq_active', 'true') === 'true',
    maska_active: getQueryParam('maska_active', 'true') === 'true',
    soxta_hujjat_active: getQueryParam('soxta_hujjat_active', 'true') === 'true'
};

// Global Stats parsed from URL query parameters
const globalStats = {
    active_games: parseInt(getQueryParam('active_games', '0')),
    total_users: parseInt(getQueryParam('total_users', '0'))
};

// Item configurations
const itemsConfig = {
    himoya: { name: "🛡 Himoya", emoji: "🛡", description: "Mafiyadan tun davomida himoyalanish", price: 190, currency: "dollar" },
    qotil_himoya: { name: "⛑️ Qotildan himoya", emoji: "⛑️", description: "Maniakdan tun davomida himoyalanish", price: 2, currency: "diamond" },
    ovoz_himoya: { name: "⚖️ Ovoz berish himoyasi", emoji: "⚖️", description: "Kunduzgi ovoz berishda himoya", price: 1, currency: "diamond" },
    miltiq: { name: "🔫 Miltiq", emoji: "🔫", description: "Tungi otishda foydalanish", price: 1, currency: "diamond" },
    maska: { name: "🎭 Maska", emoji: "🎭", description: "Dondan shaxsingizni yashirish", price: 100, currency: "dollar" },
    soxta_hujjat: { name: "📁 Soxta hujjat", emoji: "📁", description: "Komissardan shaxsingizni yashirish", price: 190, currency: "dollar" }
};

// Calculate Rank and Level Progress
function calculateRankAndLevel() {
    const wins = userStats.wins;
    const games = userStats.games;
    let rank = "Novice";
    let levelTitle = "Daraja: Oddiy o'yinchi";

    if (wins >= 15) {
        rank = "DON 👑";
        levelTitle = "Daraja: Boss (Don)";
    } else if (wins >= 10) {
        rank = "MANIAK 🔪";
        levelTitle = "Daraja: Professional qotil";
    } else if (wins >= 5) {
        rank = "KOMISSAR 👮";
        levelTitle = "Daraja: Tajribali izquvar";
    } else if (wins >= 2) {
        rank = "SHERIK 🤝";
        levelTitle = "Daraja: Shaharlik";
    }

    const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;

    return { rank, levelTitle, winRate };
}

// Populate HTML elements
document.addEventListener('DOMContentLoaded', () => {
    // Set Profile Header Info
    const userNameEl = document.getElementById('user-name');
    const userUsernameEl = document.getElementById('user-username');
    const avatarImgEl = document.getElementById('user-avatar');

    const isVip = userStats.sub_type === 'vip';
    let displayName = "";
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const tgUser = tg.initDataUnsafe.user;
        displayName = tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '');
        userUsernameEl.textContent = tgUser.username ? '@' + tgUser.username : '';
        if (tgUser.photo_url) {
            avatarImgEl.src = tgUser.photo_url;
        }
    } else {
        displayName = userStats.first_name;
        userUsernameEl.textContent = '@' + userStats.username;
    }

    if (isVip) {
        userNameEl.innerHTML = `${displayName} <span class="vip-text-badge">👑 VIP</span>`;
    } else {
        userNameEl.textContent = displayName;
    }

    // Set Rank & XP
    const rankInfo = calculateRankAndLevel();
    document.getElementById('rank-badge').textContent = rankInfo.rank;
    document.getElementById('xp-level-title').textContent = rankInfo.levelTitle;
    document.getElementById('xp-pct-val').textContent = rankInfo.winRate + '% WR';
    document.getElementById('xp-bar-fill').style.width = rankInfo.winRate + '%';

    // Set Global Stats
    document.getElementById('global-active-games').textContent = globalStats.active_games;
    document.getElementById('global-total-users').textContent = globalStats.total_users;

    // Apply profile frame based on subscription
    const headerEl = document.querySelector('.profile-header');
    if (userStats.sub_type === 'vip') {
        headerEl.classList.add('vip-active');
    }

    // Set Balances
    document.getElementById('bal-dollars').textContent = userStats.dollars + ' $';
    document.getElementById('bal-diamonds').textContent = userStats.diamonds + ' 💎';

    // Set Stats
    document.getElementById('stat-games').textContent = userStats.games;
    document.getElementById('stat-wins').textContent = userStats.wins;
    document.getElementById('stat-losses').textContent = userStats.losses;

    // Render Subscriptions Upgrade
    renderSubUpgrades();

    // Render Inventory
    renderInventory();

    // Render Shop
    renderShop();
});

// Render Inventory function
function renderInventory() {
    const container = document.getElementById('inventory-container');
    container.innerHTML = '';

    Object.keys(itemsConfig).forEach(key => {
        const item = itemsConfig[key];
        const qty = userStats[key];
        const isActive = userStats[key + '_active'];

        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        itemDiv.innerHTML = `
            <div class="item-left">
                <span class="item-icon">${item.emoji}</span>
                <div class="item-name-qty">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">Soni: ${qty} ta</span>
                </div>
            </div>
            <label class="switch">
                <input type="checkbox" id="toggle-${key}" ${isActive ? 'checked' : ''} ${qty === 0 ? 'disabled' : ''}>
                <span class="slider"></span>
            </label>
        `;
        container.appendChild(itemDiv);

        // Toggle Event Listener
        const toggleInput = itemDiv.querySelector('input');
        toggleInput.addEventListener('change', () => {
            handleToggle(key);
        });
    });
}

// Render Subscriptions Upgrade cards
function renderSubUpgrades() {
    const container = document.getElementById('subs-container');
    const section = document.getElementById('subscription-upgrade-section');
    container.innerHTML = '';

    const sub = userStats.sub_type;

    if (sub === 'vip') {
        container.innerHTML = `
            <div class="sub-tier-card vip-card active-vip-card">
                <div class="sub-card-details">
                    <span class="sub-card-title">👑 VIP Status Faollashtirilgan</span>
                    <span class="sub-card-desc" style="color: #ffd700; margin-bottom: 8px;">Premium imtiyozlaringiz faol:</span>
                    <ul class="vip-perks-list" style="list-style: none; padding: 0; margin: 0 0 10px 0;">
                        <li style="margin-bottom: 4px; font-size: 0.85rem;"><i class="fa-solid fa-check-circle text-gold"></i> Rol tanlashda maksimal ustuvorlik</li>
                        <li style="margin-bottom: 4px; font-size: 0.85rem;"><i class="fa-solid fa-check-circle text-gold"></i> Do'kondagi barcha buyumlarga 25% chegirma</li>
                        <li style="margin-bottom: 4px; font-size: 0.85rem;"><i class="fa-solid fa-check-circle text-gold"></i> Guruhda ovoz berishda 2 ta ovoz</li>
                        <li style="margin-bottom: 4px; font-size: 0.85rem;"><i class="fa-solid fa-check-circle text-gold"></i> Profil uchun oltin neon ramkasi</li>
                    </ul>
                </div>
                <button class="buy-btn" style="background: linear-gradient(135deg, #ffd700, #ffa500); color: #000; font-weight: 700; cursor: default;">FAOLLASHTIRILGAN</button>
            </div>
        `;
        section.style.display = 'block';
        return;
    }

    section.style.display = 'block';

    const tiers = [];
    if (sub === 'free') {
        tiers.push({
            id: 'vip',
            name: '👑 VIP Status',
            desc: 'Rol tanlashda maksimal ustuvorlik • 25% chegirma • Ovoz berishda 2 ta ovoz • Neon profil ramkasi',
            price: '45 💎',
            btnText: 'Faollashtirish'
        });
    }

    tiers.forEach(tier => {
        const card = document.createElement('div');
        card.className = `sub-tier-card ${tier.id}-card`;
        card.innerHTML = `
            <div class="sub-card-details">
                <span class="sub-card-title">${tier.name}</span>
                <span class="sub-card-desc">${tier.desc}</span>
                <span class="sub-card-price">Narxi: ${tier.price}</span>
            </div>
            <button class="buy-btn" id="upgrade-${tier.id}">${tier.btnText}</button>
        `;
        container.appendChild(card);

        const btn = card.querySelector('button');
        btn.addEventListener('click', () => {
            handleUpgrade(tier.id);
        });
    });
}

// Render Shop function
function renderShop() {
    const container = document.getElementById('shop-container');
    container.innerHTML = '';

    Object.keys(itemsConfig).forEach(key => {
        const item = itemsConfig[key];

        const sub = userStats.sub_type;
        let finalPrice = item.price;
        let originalPriceHtml = '';
        let badgeHtml = '';

        if (sub === 'vip') {
            finalPrice = Math.round(item.price * 0.75);
            originalPriceHtml = `<span class="original-price">${item.price} ${item.currency === 'dollar' ? '$' : '💎'}</span>`;
            badgeHtml = `<span class="discount-badge">25% OFF</span>`;
        }

        const priceStr = item.currency === 'dollar' ? `${finalPrice} $` : `${finalPrice} 💎`;
        const priceClass = item.currency === 'diamond' ? 'diamond-price' : '';

        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `
            <div class="shop-card-left">
                <span class="item-icon">${item.emoji}</span>
                <div class="shop-card-info">
                    <span class="shop-card-title">${item.name} ${badgeHtml}</span>
                    <span class="shop-card-price ${priceClass}">Narxi: ${originalPriceHtml} ${priceStr}</span>
                </div>
            </div>
            <button class="buy-btn" id="buy-${key}">Sotib olish</button>
        `;
        container.appendChild(card);

        // Buy Event Listener
        const buyBtn = card.querySelector('button');
        buyBtn.addEventListener('click', () => {
            handleBuy(key);
        });
    });
}

// Action Handlers
function handleToggle(itemKey) {
    const nextState = !userStats[itemKey + '_active'];
    userStats[itemKey + '_active'] = nextState;

    const data = {
        action: "toggle",
        item: itemKey
    };

    if (tg) {
        tg.sendData(JSON.stringify(data));
    } else {
        alert(`Faqat Telegram ichida ishlaydi:\nToggle ${itemKey} ➡️ ${nextState}`);
    }
}

function handleBuy(itemKey) {
    const item = itemsConfig[itemKey];
    const data = {
        action: "buy",
        item: itemKey,
        price: item.price,
        currency: item.currency
    };

    if (tg) {
        tg.sendData(JSON.stringify(data));
    } else {
        const confirmBuy = confirm(`${item.name} sotib olishni tasdiqlaysizmi?\nNarxi: ${item.price} ${item.currency}`);
        if (confirmBuy) {
            alert(`Faqat Telegram ichida ishlaydi:\nXarid qilindi: ${item.name}`);
        }
    }
}

function handleUpgrade(tier) {
    const data = {
        action: "upgrade",
        tier: tier
    };

    if (tg) {
        tg.sendData(JSON.stringify(data));
    } else {
        alert(`Faqat Telegram ichida ishlaydi:\nUpgrade to ${tier.toUpperCase()}`);
    }
}
