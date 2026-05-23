// 1. Додавання товару. Користувач має мати можливість ввести назву товара в поле вводу та натиснути кнопку Додати. Після натискання кнопки додати (або клавіші Enter) товар має бути доданим в кінець списку. Поле вводу має стати порожнім, а курсор залишитись в полі вводу.
// 2. Налаштування. Додаток має запускатися з уже 3-ьома товарами, які додані в список.
// 3. Кнопка видалити. У кожного НЕ купленого товара має бути кнопка видалення. Після натискання кнопки товар має зникати зі списка. (В товара який відмічений як купление кнопки видалення не має бути)
// 4. Кнопка відмітити товар як куплений. У кожного НЕ купленого товара має бути кнопка зробити товар купленим. Після натискання на неї товар відмічається як куплений: Назва товару стає перекресленою, зникають кнопки редагування кількості та кнопка видалення. Якщо користувач натисне кнопку "Зробити не купленим" товар має повернутися в попередній стан.
// 5. Редагування назви. В не купленого товару має бути можливість редагувати назву. Коли користувач натискає на назву товара, вона має замінятися полем вводу в якому стоїть активний курсор. Після того, як користувач знімає фокус з поля, поле редагування має зникнути (input), а замість нього має з’явитися відредагована назва.
// 6. Редагування кількості товарів. В будь-якого не купленого товару можна редагувати кількість за допомогою кнопок + та -. Якщо кількість товарів 1, то кнопка - має бути не активною. Новий товар має створюватися з кількістю 1.
// 7. Статистика в правій панелі. При зміні, назви, кількості, видаленні, зміни статусу куплено/не-куплено має оновлюватися статистика. В першій секції мають виводитися товар+кількість тих товарів, які ще необхідно купити. В другій секції мають виводитися товар+кількість тих які вже були куплені.


//1. Додавання товару.
const adderForm = document.querySelector('.adder');
const addInput = document.querySelector('.add-input');
const productList = document.querySelector('.product-list');
const remainingList = document.querySelector('.remaining');
const purchasedList = document.querySelector('.purchased');
const STORAGE_KEY = 'shoppingCartState';

function serializeCart() {
    const items = [];
    const productItems = productList.querySelectorAll('.product');

    productItems.forEach((item) => {
        const name = item.querySelector('.name-display').textContent.trim();
        const quantity = parseInt(item.querySelector('.num').textContent, 10);
        const bought = item.classList.contains('bought');

        items.push({
            name,
            quantity: Number.isNaN(quantity) ? 1 : quantity,
            bought
        });
    });

    return items;
}

function saveCart() {
    const items = serializeCart();

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        // Ignore storage errors (e.g., private mode or quota exceeded).
    }
}

function loadCart() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return null;
        }

        const items = JSON.parse(raw);

        return Array.isArray(items) ? items : null;
    } catch (error) {
        return null;
    }
}

function renderCart(items) {
    productList.innerHTML = '';

    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
        const name = (item && item.name) ? String(item.name) : '';
        const quantity = item && Number.isFinite(item.quantity) ? item.quantity : 1;
        const newProduct = createProductElement(name, quantity);

        if (item && item.bought) {
            setBoughtState(newProduct, true);
        }

        fragment.appendChild(newProduct);
    });

    productList.appendChild(fragment);
    updateSummary();
}

function setQuantityState(productItem, quantity) {
    const numButton = productItem.querySelector('.num');
    const minusBtn = productItem.querySelector('button.minus, button.minus-faint');

    numButton.textContent = quantity;
    minusBtn.disabled = quantity === 1;

    if (quantity === 1) {
        minusBtn.classList.add('minus-faint');
        minusBtn.classList.remove('minus');
    } else {
        minusBtn.classList.remove('minus-faint');
        minusBtn.classList.add('minus');
    }
}

function setBoughtState(productItem, isBought) {
    productItem.classList.toggle('bought', isBought);

    const boughtBtn = productItem.querySelector('.bought-status');
    const nameInput = productItem.querySelector('.name-input');

    boughtBtn.textContent = isBought ? 'Не куплено' : 'Куплено';
    nameInput.disabled = isBought;

    if (isBought) {
        productItem.classList.remove('editing');
    }
}

function updateSummary() {
    remainingList.innerHTML = '';
    purchasedList.innerHTML = '';

    const items = productList.querySelectorAll('.product');

    items.forEach((item) => {
        const name = item.querySelector('.name-display').textContent.trim();
        const amount = item.querySelector('.num').textContent.trim();
        const summaryItem = document.createElement('span');

        summaryItem.className = 'product-item';
        summaryItem.innerHTML = `${name} <span class="amount">${amount}</span>`;

        if (item.classList.contains('bought')) {
            purchasedList.appendChild(summaryItem);
        } else {
            remainingList.appendChild(summaryItem);
        }
    });

    saveCart();
}

function createProductElement(productName, quantity = 1) {
    const newProduct = document.createElement('li');

    newProduct.className = 'product';
    newProduct.innerHTML = `
            <span class="name-display">${productName}</span>
            <input type="text" class="name-input" value="${productName}" aria-label="Назва товару">
            <div class="buttons">
                <button class="change-quantity minus-faint" data-tooltip="Зменшити кількість">-</button>
                <button class="num">${quantity}</button>
                <button class="change-quantity plus" data-tooltip="Збільшити кількість">+</button>
            </div>
            <div class="status">
                <button class="bought bought-status" data-tooltip="Товар не куплено">Куплено</button>
                <button class="remove" data-tooltip="Прибрати товар">x</button>
            </div>
        `;

    setQuantityState(newProduct, quantity);

    return newProduct;
}

adderForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const productName = addInput.value.trim();

    if (productName === '') {
        return;
    }

    const newProduct = createProductElement(productName, 1);

    productList.appendChild(newProduct);
    updateSummary();
    addInput.value = '';
    addInput.focus();
});

// 2. Налаштування. Додаток має запускатися з уже 3-ьома товарами, які додані в список.
document.addEventListener("DOMContentLoaded", function () {
    const savedItems = loadCart();

    if (savedItems && savedItems.length > 0) {
        renderCart(savedItems);
        return;
    }

    const defaults = [
        { name: "Помідори", quantity: 1, bought: false },
        { name: "Печиво", quantity: 1, bought: false },
        { name: "Сир", quantity: 1, bought: false }
    ];

    renderCart(defaults);
});



productList.addEventListener('click', function (event) {
    const productItem = event.target.closest('.product');

    if (!productItem) {
        return;
    }

    // Видалення товару
    if (event.target.classList.contains('remove')) {
        productItem.remove();
        updateSummary();
        return;
    }


    if (event.target.classList.contains('bought-status')) {
        const isBought = !productItem.classList.contains('bought');

        setBoughtState(productItem, isBought);
        updateSummary();
        return;
    }

    // Редагування назви
    if (event.target.classList.contains('name-display')) {
        if (productItem.classList.contains('bought')) {
            return;
        }

        const nameInput = productItem.querySelector('.name-input');
        const display = productItem.querySelector('.name-display');

        nameInput.dataset.previousName = display.textContent.trim();
        productItem.classList.add('editing');
        nameInput.focus();
        nameInput.select();
        return;
    }

    // Редагування кількості
    if (event.target.classList.contains('change-quantity')) {
        if (productItem.classList.contains('bought')) {
            return;
        }

        const numButton = productItem.querySelector('.num');
        const minusBtn = productItem.querySelector('button.minus, button.minus-faint');
        let quantity = parseInt(numButton.textContent);

        if (event.target.classList.contains('plus')) {
            quantity++;
        } else if ((event.target.classList.contains('minus') || event.target.classList.contains('minus-faint')) && quantity > 1) {
            quantity--;
        }

        numButton.textContent = quantity;
        setQuantityState(productItem, quantity);
        updateSummary();
        return;
    }
});

productList.addEventListener('focusout', function (event) {
    if (!event.target.classList.contains('name-input')) {
        return;
    }

    const productItem = event.target.closest('.product');

    if (!productItem) {
        return;
    }

    const nameInput = event.target;
    const display = productItem.querySelector('.name-display');
    const previousName = nameInput.dataset.previousName || display.textContent.trim();
    const newName = nameInput.value.trim() || previousName;

    display.textContent = newName;
    nameInput.value = newName;
    productItem.classList.remove('editing');
    updateSummary();
});

productList.addEventListener('keydown', function (event) {
    if (!event.target.classList.contains('name-input')) {
        return;
    }

    if (event.key === 'Enter') {
        event.preventDefault();
        event.target.blur();
    }
});