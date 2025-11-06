// --- Data Permainan (Ikan & Joran) ---

const fishData = [
    { name: "Ikan Mas", level: 1, rankName: "Common", minWeight: 0.1, maxWeight: 0.5, chance: 40, basePrice: 10 }, 
    { name: "Ikan Nila", level: 1, rankName: "Common", minWeight: 0.2, maxWeight: 0.6, chance: 30, basePrice: 12 },
    { name: "Ikan Lele", level: 2, rankName: "Rare", minWeight: 0.5, maxWeight: 1.5, chance: 20, basePrice: 30 },
    { name: "Belut Listrik", level: 2, rankName: "Rare", minWeight: 0.8, maxWeight: 2.0, chance: 7, basePrice: 45 },
    { name: "Arapaima Raksasa", level: 3, rankName: "Legendary", minWeight: 5.0, maxWeight: 20.0, chance: 3, basePrice: 150 }
];

const rodData = [
    { id: 0, name: "Joran Tua", colorClass: "rod-1", price: 0, commonBonus: 0, rareBonus: 0, legendaryBonus: 0, baseCatchChance: 50 }, 
    { id: 1, name: "Joran Bagus", colorClass: "rod-2", price: 500, commonBonus: 5, rareBonus: 5, legendaryBonus: 0, baseCatchChance: 60 },
    { id: 2, name: "Joran Super", colorClass: "rod-3", price: 1500, commonBonus: 10, rareBonus: 10, legendaryBonus: 5, baseCatchChance: 75 }
];

// --- Status Permainan & Variabel Global ---
let isCasting = false;
let catchTimer = null;
let totalCatch = 0; 
let playerMoney = 0; 
let inventory = []; 
let ownedRods = [rodData[0]]; 
let equippedRodId = 0; 
let currentUsername = null; 

// --- Elemen DOM ---
const loginView = document.getElementById('loginView');
const gameView = document.getElementById('gameView');
const usernameInput = document.getElementById('usernameInput');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');
const welcomeMessage = document.getElementById('welcomeMessage');
const logoutButton = document.getElementById('logoutButton');

const castButton = document.getElementById('castButton');
const gameStatus = document.getElementById('gameStatus');
const playerMoneyElement = document.getElementById('playerMoney');
const equippedRodNameElement = document.getElementById('equippedRodName');

const toggleInventoryButton = document.getElementById('toggleInventoryButton');
const inventoryContainer = document.getElementById('inventoryContainer');
const inventoryList = document.getElementById('inventoryList');
const inventorySummary = document.getElementById('inventorySummary');
const sellAllButton = document.getElementById('sellAllButton');

const toggleShopButton = document.getElementById('toggleShopButton');
const shopContainer = document.getElementById('shopContainer');
const shopList = document.getElementById('shopList');

// --- PETA WARNA RANK ---
const rankColorMap = {
    1: '#495057', 
    2: '#28a745', 
    3: '#ffc107'  
};

// =========================================================================
// === FUNGSI UTILITAS & RNG ===
// =========================================================================

function getRandomFloat(min, max) {
    return (Math.random() * (max - min) + min);
}

function selectRandomFish(equippedRod) {
    let modifiedFishData = fishData.map(fish => {
        let chanceModifier = 0;
        
        if (fish.level === 1) chanceModifier = equippedRod.commonBonus;
        else if (fish.level === 2) chanceModifier = equippedRod.rareBonus;
        else if (fish.level === 3) chanceModifier = equippedRod.legendaryBonus;
        
        const finalChance = Math.max(0, fish.chance + chanceModifier); 
        
        return { 
            ...fish, 
            finalChance: finalChance 
        };
    });

    const totalModifiedChance = modifiedFishData.reduce((sum, fish) => sum + fish.finalChance, 0);
    
    if (totalModifiedChance === 0) return null;

    let randomNum = getRandomFloat(0, totalModifiedChance);

    for (const fish of modifiedFishData) {
        if (randomNum < fish.finalChance) {
            return fish;
        }
        randomNum -= fish.finalChance;
    }
    
    return null;
}

// =========================================================================
// === LOGIKA AUTENTIKASI DAN PENYIMPANAN BARU (LOCAL STORAGE) ===
// =========================================================================

const DEFAULT_GAME_STATE = {
    money: 0,
    inventory: [],
    // Simpan hanya ID Joran Tua
    ownedRods: [rodData[0].id], 
    equippedRodId: 0,
    totalCatch: 0
};

// Fungsi untuk mendapatkan kunci Local Storage khusus pemain
function getPlayerStorageKey(username) {
    return `fishingApp_${username}`;
}

// Menyimpan status game pemain yang sedang aktif
function savePlayerGame() {
    if (!currentUsername) return;
    
    const playerData = {
        money: playerMoney,
        inventory: inventory,
        // Simpan hanya ID joran yang dimiliki
        ownedRods: ownedRods.map(r => r.id),
        equippedRodId: equippedRodId,
        totalCatch: totalCatch
    };
    
    localStorage.setItem(getPlayerStorageKey(currentUsername), JSON.stringify(playerData));
}

// Memuat status game pemain aktif
function loadPlayerGame(username) {
    const savedData = localStorage.getItem(getPlayerStorageKey(username));
    
    let accountData;
    if (savedData) {
        try {
            accountData = JSON.parse(savedData);
        } catch (e) {
            console.error("Gagal parse data pemain. Menggunakan default.", e);
            accountData = null;
        }
    }

    if (accountData) {
        // Muat data yang ada
        playerMoney = accountData.money || DEFAULT_GAME_STATE.money;
        inventory = accountData.inventory || DEFAULT_GAME_STATE.inventory;
        totalCatch = accountData.totalCatch || DEFAULT_GAME_STATE.totalCatch;
        equippedRodId = accountData.equippedRodId || DEFAULT_GAME_STATE.equippedRodId;
        
        const savedRodIds = accountData.ownedRods || DEFAULT_GAME_STATE.ownedRods;
        ownedRods = rodData.filter(rod => savedRodIds.includes(rod.id));
        
        inventory = inventory.map(fish => ({
            ...fish,
            isFavorite: fish.isFavorite === true
        }));
    } else {
        // Akun baru atau data corrupt, gunakan status default
        playerMoney = DEFAULT_GAME_STATE.money;
        inventory = DEFAULT_GAME_STATE.inventory;
        totalCatch = DEFAULT_GAME_STATE.totalCatch;
        equippedRodId = DEFAULT_GAME_STATE.equippedRodId;
        ownedRods = [rodData[0]];
    }
    
    // Perbarui UI
    playerMoneyElement.textContent = playerMoney;
    updateEquippedRodDisplay();
    welcomeMessage.textContent = `Selamat datang, ${username}!`;
}

function loginUser() {
    const username = usernameInput.value.trim();
    if (username.length < 3) {
        loginMessage.textContent = "Username minimal 3 karakter.";
        return;
    }
    
    currentUsername = username;
    
    // Cek apakah data pemain sudah ada di Local Storage
    const isNewUser = !localStorage.getItem(getPlayerStorageKey(username));
    
    if (isNewUser) {
        // Simpan status default untuk akun baru (opsional, loadPlayerGame sudah menangani ini)
        // Kita hanya perlu memastikan loadPlayerGame dipanggil
        loginMessage.textContent = `Akun ${username} berhasil dibuat!`;
    } else {
        loginMessage.textContent = `Selamat datang kembali, ${username}!`;
    }

    // Simpan status login sesi
    localStorage.setItem('currentUser', username);
    localStorage.setItem('loginTimestamp', Date.now());

    // Muat data (atau buat data baru jika tidak ada) dan masuk ke game
    loadPlayerGame(username);
    loginView.classList.add('hidden');
    gameView.classList.remove('hidden');
}

function checkLoginStatus() {
    const lastUser = localStorage.getItem('currentUser');
    const timestamp = localStorage.getItem('loginTimestamp');
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    
    if (lastUser && timestamp && (Date.now() - parseInt(timestamp) < sevenDaysInMs)) {
        currentUsername = lastUser;
        loadPlayerGame(lastUser);
        loginView.classList.add('hidden');
        gameView.classList.remove('hidden');
    } else {
        loginView.classList.remove('hidden');
        gameView.classList.add('hidden');
        // Bersihkan token login lama
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loginTimestamp');
    }
}

function logoutUser() {
    savePlayerGame(); // Pastikan menyimpan data terakhir
    currentUsername = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTimestamp');
    
    loginView.classList.remove('hidden');
    gameView.classList.add('hidden');
    gameStatus.textContent = "Siap memancing.";
    usernameInput.value = '';
    loginMessage.textContent = '';
}

// =========================================================================
// === FUNGSI UTAMA GAME (Memastikan pemanggilan savePlayerGame) ===
// =========================================================================

function updateEquippedRodDisplay() {
    const equippedRod = rodData.find(r => r.id === equippedRodId);
    equippedRodNameElement.textContent = equippedRod ? equippedRod.name : "Joran Tua";
    savePlayerGame(); 
}

function renderShop() {
    // ... (Logika renderShop tetap sama)
    shopList.innerHTML = '';
    const isOwned = (rodId) => ownedRods.some(rod => rod.id === rodId);

    rodData.forEach(rod => {
        if (rod.id === 0) return; 

        const item = document.createElement('div');
        item.classList.add('rod-item', rod.colorClass);
        
        const owned = isOwned(rod.id);
        const canAfford = playerMoney >= rod.price;

        let buttonHTML;
        let buttonDisabled = false;

        if (owned) {
            buttonHTML = 'Sudah Dimiliki';
            buttonDisabled = true;
        } else if (!canAfford) {
            buttonHTML = `Beli (💰 ${rod.price}) - Uang Kurang`;
            buttonDisabled = true;
        } else {
            buttonHTML = `Beli (💰 ${rod.price})`;
        }
        
        item.innerHTML = `
            <div>
                <strong>${rod.name}</strong> 
                <p style="margin: 0; font-size: 0.85em;">
                    Peluang Dasar Angkat: ${rod.baseCatchChance}%, Common: +${rod.commonBonus}%, Rare: +${rod.rareBonus}%, Legendary: +${rod.legendaryBonus}%
                </p>
            </div>
            <button class="buy-button" data-rod-id="${rod.id}" ${buttonDisabled ? 'disabled' : ''}>${buttonHTML}</button>
        `;
        shopList.appendChild(item);
    });
}

function renderInventory() {
    // ... (Logika renderInventory tetap sama)
    inventoryList.innerHTML = '';
    
    // Render Joran Dimiliki
    inventoryList.innerHTML += '<h3>Joran Dimiliki</h3>';
    
    ownedRods.forEach(rod => {
        const isEquipped = rod.id === equippedRodId;
        const buttonText = isEquipped ? 'Di-Equip' : 'Equip';
        const buttonClass = isEquipped ? 'unequip-button' : 'equip-button';
        const buttonDisabled = isEquipped ? 'disabled' : ''; 

        inventoryList.innerHTML += `
            <div class="rod-item ${rod.colorClass}">
                <span>${rod.name}</span>
                <button class="${buttonClass}" data-rod-id="${rod.id}" ${buttonDisabled}>${buttonText}</button>
            </div>
        `;
    });
    
    // Render Ikan Tangkapan
    inventoryList.innerHTML += '<h3>Ikan Tangkapan</h3>';

    if (inventory.length === 0) {
        inventoryList.innerHTML += '<p style="text-align: center;">Inventori Ikan kosong.</p>';
        inventorySummary.textContent = `Total Ikan: 0. Total Uang: 💰 ${playerMoney}`;
        sellAllButton.disabled = true;
        return;
    }
    
    sellAllButton.disabled = false;

    inventory.forEach((fish, index) => {
        const weightFloat = parseFloat(fish.weight) || 0; 
        const sellPrice = Math.round(weightFloat * fish.basePrice); 
        const isFavorite = fish.isFavorite;
        
        const item = document.createElement('div');
        item.classList.add(`inventory-item`, `rank-${fish.level}`);
        
        item.innerHTML = `
            <span>
                ${isFavorite ? '⭐' : ''} [${fish.rankName}] ${fish.name} (${fish.weight} kg)
            </span>
            <div>
                <button class="fav-button" data-index="${index}" style="background-color: transparent; color: ${isFavorite ? '#FFD700' : '#ccc'}; border: 1px solid #ccc; margin-right: 5px;">
                    ${isFavorite ? '⭐ Favorit' : '☆ Favorit'}
                </button>
                <button class="sell-button" data-index="${index}" data-price="${sellPrice}" ${isFavorite ? 'disabled' : ''}>
                    Jual (💰 ${sellPrice})
                </button>
            </div>
        `;
        inventoryList.appendChild(item);
    });
    
    inventorySummary.textContent = `Total Ikan: ${inventory.length}. Total Uang: 💰 ${playerMoney}`;
}

function toggleFavorite(index) {
    if (inventory[index]) {
        inventory[index].isFavorite = !inventory[index].isFavorite;
        savePlayerGame();
        renderInventory();
    }
}

function sellFish(index, isSellAll = false) {
    const fishToSell = inventory[index];
    
    if (!fishToSell || fishToSell.isFavorite) {
        if (isSellAll) return 0;
        return;
    }

    const weightFloat = parseFloat(fishToSell.weight) || 0;
    const sellPrice = Math.round(weightFloat * fishToSell.basePrice); 
    
    playerMoney = parseInt(playerMoney) || 0;
    playerMoney += sellPrice;
    
    if (!isSellAll) {
        inventory.splice(index, 1);
        playerMoneyElement.textContent = playerMoney;
        savePlayerGame();
        renderInventory();
    }
    
    return sellPrice;
}

function sellAllFish() {
    const soldFish = [];
    let totalRevenue = 0;
    
    const fishToKeep = [];
    
    inventory.forEach((fish) => {
        if (!fish.isFavorite) {
            const weightFloat = parseFloat(fish.weight) || 0;
            const sellPrice = Math.round(weightFloat * fish.basePrice); 

            playerMoney = parseInt(playerMoney) || 0;
            playerMoney += sellPrice;
            totalRevenue += sellPrice;
            
            soldFish.push(fish);
        } else {
            fishToKeep.push(fish); 
        }
    });

    if (totalRevenue === 0 && soldFish.length === 0) {
        return;
    }

    inventory = fishToKeep;
    playerMoneyElement.textContent = playerMoney;
    
    savePlayerGame();
    renderInventory();
}

function buyRod(rodId) {
    const rod = rodData.find(r => r.id === rodId);
    if (!rod || ownedRods.some(r => r.id === rodId)) return;
    
    if (playerMoney >= rod.price) {
        playerMoney -= rod.price;
        ownedRods.push(rod);
        playerMoneyElement.textContent = playerMoney;
        
        equippedRodId = rodId; 
        updateEquippedRodDisplay();
        
        savePlayerGame();
        renderShop();
    } else {
        // Uang tidak cukup
    }
}

function equipRod(rodId) {
    const rod = ownedRods.find(r => r.id === rodId);
    if (!rod) return;
    
    equippedRodId = rodId;
    updateEquippedRodDisplay();
    renderInventory(); 
}

// --- Logika Pancing ---

function castFishingRod() {
    if (isCasting) return;
    
    isCasting = true;
    gameStatus.textContent = "Umpan sudah dilempar. Menunggu gigitan...";
    castButton.disabled = true;
    castButton.textContent = "Menunggu...";
    
    const waitTime = getRandomFloat(2000, 5000); 

    catchTimer = setTimeout(() => {
        gameStatus.textContent = "Ada gigitan! Tarik pancing sekarang!";
        castButton.disabled = false;
        castButton.textContent = "Angkat Pancing ⬆️"; 
    }, waitTime);
}

function reelFishingRod() {
    if (!isCasting) return;
    
    clearTimeout(catchTimer); 

    castButton.disabled = true; 
    castButton.textContent = "Memproses...";

    const equippedRod = rodData.find(r => r.id === equippedRodId);
    const successChance = getRandomFloat(0, 100); 

    if (successChance <= equippedRod.baseCatchChance) { 
        const caughtFishTemplate = selectRandomFish(equippedRod);

        if (caughtFishTemplate) {
            const weight = getRandomFloat(caughtFishTemplate.minWeight, caughtFishTemplate.maxWeight).toFixed(2);
            const basePrice = caughtFishTemplate.basePrice;
            
            const newFish = {
                name: caughtFishTemplate.name,
                level: caughtFishTemplate.level,
                rankName: caughtFishTemplate.rankName,
                weight: weight,
                basePrice: basePrice,
                isFavorite: false
            };

            inventory.push(newFish);
            totalCatch++;
            
            const rankColor = rankColorMap[newFish.level] || '#000000';
            
            gameStatus.innerHTML = `BERHASIL! Menangkap ${newFish.name} (<span style="color: ${rankColor}; font-weight: bold;">${newFish.rankName}</span>) dengan berat ${newFish.weight} kg.`;
            
            savePlayerGame();
            if (!inventoryContainer.classList.contains('hidden')) renderInventory();
        } else {
             gameStatus.textContent = "Sayang sekali, umpan hilang. Coba lagi!";
        }
    } else {
        gameStatus.textContent = "Terlambat! Ikan lolos dari pancing.";
    }

    isCasting = false;
    castButton.disabled = false;
    castButton.textContent = "Pancing 🎣";
}

function handleFishingAction() {
    if (!currentUsername) return; 
    
    if (isCasting && castButton.textContent.includes("Angkat Pancing")) {
        reelFishingRod();
    } 
    else if (!isCasting) {
        castFishingRod();
    }
}

// --- Event Listener & Inisialisasi ---

loginButton.addEventListener('click', loginUser);
logoutButton.addEventListener('click', logoutUser); 

usernameInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        loginUser();
    }
});

castButton.addEventListener('click', handleFishingAction);

function toggleMenuPanel(panelId) {
    const panels = [inventoryContainer, shopContainer];
    const targetPanel = document.getElementById(panelId);
    
    panels.filter(p => p.id !== panelId).forEach(p => p.classList.add('hidden'));

    const isHidden = targetPanel.classList.toggle('hidden');
    
    toggleInventoryButton.textContent = (panelId === 'inventoryContainer' && !isHidden) ? 'Tutup Inventori ❌' : 'Inventori 🎒';
    toggleShopButton.textContent = (panelId === 'shopContainer' && !isHidden) ? 'Tutup Toko ❌' : 'Toko 🛒';

    if (!isHidden) {
        if (panelId === 'inventoryContainer') renderInventory();
        if (panelId === 'shopContainer') renderShop();
    }
}

toggleInventoryButton.addEventListener('click', () => toggleMenuPanel('inventoryContainer'));
toggleShopButton.addEventListener('click', () => toggleMenuPanel('shopContainer'));
sellAllButton.addEventListener('click', sellAllFish);

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('sell-button')) {
        const sellButton = e.target;
        const index = Array.from(sellButton.closest('#inventoryList').querySelectorAll('.inventory-item .sell-button')).indexOf(sellButton);
        if (index > -1) sellFish(index, false);

    } else if (e.target.classList.contains('fav-button')) {
        const favButton = e.target;
        const fishItems = favButton.closest('#inventoryList').querySelectorAll('.inventory-item');
        const index = Array.from(fishItems).findIndex(item => item.contains(favButton));
        if (index > -1) toggleFavorite(index);

    } else if (e.target.classList.contains('buy-button')) {
        const rodId = parseInt(e.target.dataset.rodId);
        buyRod(rodId);
    } else if (e.target.classList.contains('equip-button') || e.target.classList.contains('unequip-button')) {
        const rodId = parseInt(e.target.dataset.rodId);
        equipRod(rodId);
    }
});

checkLoginStatus();
