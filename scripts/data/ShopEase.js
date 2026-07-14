import { addToCart, calculateCartQuantity, cart, updateCartQuantityUI } from './cart.js';
import { products } from './products.js';
import { toggleFavorite, updateFavoriteButton, syncFavoriteUi } from './favorites.js';
import { createProductCard } from './components.js';
import { parseRatingValue, isOnSale, isInStock } from './product-utils.js';

function searchProducts() {
    const searchInput = document.querySelector('.search-box input');
    if (!searchInput) return;

    const searchText = searchInput.value.trim().toLowerCase();

    if (searchText === '') {
        renderProducts(products);
        return;
    }

    const searchedProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchText)
    );

    renderProducts(searchedProducts);
}//done

const searchInput = document.querySelector('.search-box input');//done
const searchButton = document.querySelector('.search-box button');//done

if (searchButton) {
    searchButton.addEventListener('click', searchProducts);
}//done

if (searchInput) {
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchProducts();
        }
    });
}//done

function updateFavoriteButtons() {
    document.querySelectorAll('.product-fav-button').forEach((button) => {
        const productId = button.dataset.productId;
        if (productId) {
            updateFavoriteButton(button, productId);
        }
    });
}//done

function productMatchesFilters(product, filters) {
    if (
        filters.minPrice !== null &&
        product.price < filters.minPrice
    ) {
        return false;
    }

    if (
        filters.maxPrice !== null &&
        product.price > filters.maxPrice
    ) {
        return false;
    }

    if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.category)
    ) {
        return false;
    }

    if (
        filters.rating > 0 &&
        parseRatingValue(product) < filters.rating
    ) {
        return false;
    }

    if (filters.color) {
        const colors = (product.colors || []).map((color) => color.toLowerCase());
        if (!colors.includes(filters.color.toLowerCase())) {
            return false;
        }
    }

    if (filters.inStock && !isInStock(product)) {
        return false;
    }

    if (filters.onSale && !isOnSale(product)) {
        return false;
    }

    return true;
}//done

function renderProducts(productList) {
    const productContainer = document.querySelector('.JS-products');
    if (!productContainer) return;

    if (productList.length === 0) {
        productContainer.innerHTML = '<div class="no-products">No products match these filters.</div>';
        return;
    }

    const renderedHTML = productList.map((product) => createProductCard(product)).join('');
    productContainer.innerHTML = renderedHTML;
    setupProductEventHandlers();
    updateFavoriteButtons();
}//done

function setupProductEventHandlers() {
    document.querySelectorAll('.add-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            const card = button.closest('.card');
            const quantitySelect = card.querySelector('.JS-quantity-select');
            const sizeInput = card.querySelector(`input[name="size-${productId}"]:checked`);
            const colorInput = card.querySelector(`input[name="color-${productId}"]:checked`);

            const quantity = quantitySelect ? Number(quantitySelect.value) : 1;
            const size = sizeInput ? sizeInput.value : '';
            const color = colorInput ? colorInput.value : '';

            addToCart(productId, { quantity, size, color });
            updateCartQuantityUI();
            const originalText = button.textContent;
            button.textContent = 'Added To Cart';
            button.style.background = '#28a745';
            const resetId = setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '#1a1a2e';
            }, 2000);
            button.dataset.resetTimeout = resetId;
        });
    });

    document.querySelectorAll('.product-fav-button').forEach((button) => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            toggleFavorite(productId);
            syncFavoriteUi();
        });
    });
} //done

updateCartQuantityUI();
syncFavoriteUi();

function getSelectedFilters() {
    const minPriceInput = document.getElementById('price-min');
    const maxPriceInput = document.getElementById('price-max');
    const categoryInputs = Array.from(document.querySelectorAll('input[data-category]'));
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const colorDot = document.querySelector('.color-dot.selected');
    const inStockInput = document.querySelector('input[data-availability="in-stock"]');
    const onSaleInput = document.querySelector('input[data-availability="on-sale"]');

    const selectedCategories = categoryInputs.filter((input) => input.checked).map((input) => input.dataset.category);
    const categories = selectedCategories.length === categoryInputs.length ? [] : selectedCategories;

    return {
        minPrice: minPriceInput && minPriceInput.value ? Number(minPriceInput.value) : null,
        maxPrice: maxPriceInput && maxPriceInput.value ? Number(maxPriceInput.value) : null,
        categories,
        rating: ratingInput ? Number(ratingInput.value) : 0,
        color: colorDot ? colorDot.dataset.color : null,
        inStock: inStockInput ? inStockInput.checked : false,
        onSale: onSaleInput ? onSaleInput.checked : false
    };
}//done

function applyFilters() {
    console.log("Apply button clicked");

    const filters = getSelectedFilters();
    const filteredProducts = products.filter(product => {

        return productMatchesFilters(product, filters);

    });

    renderProducts(filteredProducts);

}//done

const applyButton = document.getElementById('apply-filters');
if (applyButton) {
    applyButton.addEventListener('click', applyFilters);
}

const colorDots = document.querySelectorAll('.color-dot');
colorDots.forEach((dot) => {
    dot.addEventListener('click', () => {
        colorDots.forEach((item) => item.classList.remove('selected'));
        dot.classList.add('selected');
    });
});

window.addEventListener('favoritesUpdated', () => {
    syncFavoriteUi();
});
const filterToggle = document.getElementById('filter-toggle');
const sidebar = document.querySelector('.sidebar');

if (filterToggle && sidebar) {
    filterToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
}
const mobileSearchButton =
    document.getElementById('mobile-search-toggle');

const navbar = document.querySelector('.navbar');
const mobileSearchBtn = document.getElementById('mobile-search-btn');

mobileSearchBtn.addEventListener('click', () => {
    navbar.classList.add('search-active');
});
renderProducts(products);
