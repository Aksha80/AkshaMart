const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const themeToggle = document.getElementById('themeToggle');
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const voiceBtn = document.getElementById('voice-btn');

let products = [];
let cart = [];
localStorage.removeItem('cart'); // clear cart on every fresh load

// Fetch products and display them + cart
// Always reset cart on fresh load
window.onload = () => {
  localStorage.removeItem('cart'); // Clear saved cart
  cart = []; // Reset cart array

  fetch('https://fakestoreapi.com/products')
    .then(res => res.json())
    .then(data => {
      products = data;
      displayProducts(products);
      updateCartCount();    // Set cart count to 0
      renderCartItems();    // Cart items will be blank
    });
};

// Display product cards
function displayProducts(items) {
  productList.innerHTML = '';
  items.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${product.image}" alt="${product.title}" />
      <h3>${product.title}</h3>
      <p>₹${product.price}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    productList.appendChild(div);
  });
}

// Add product ID to cart
function addToCart(id) {
  if (!cart.includes(id)) {
    cart.push(id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
  }
}

// Update cart item count
function updateCartCount() {
  cartCount.innerText = cart.length;
}

// Show cart modal
cartIcon.addEventListener('click', () => {
  cartModal.classList.remove('hidden');
  renderCartItems();
});

// Close cart modal
function closeCart() {
  cartModal.classList.add('hidden');
}

// Remove item from cart by index
function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}

// Render cart with image, title, price
function renderCartItems() {
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  cart.forEach((id, index) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.marginBottom = '10px';

    div.innerHTML = `
      <img src="${product.image}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: contain; margin-right: 10px;">
      <div style="flex: 1;">
        <p style="margin: 0;"><strong>${product.title}</strong></p>
        <p style="margin: 2px 0;">₹${product.price}</p>
      </div>
      <button onclick="removeFromCart(${index})">Remove</button>
    `;

    cartItems.appendChild(div);
  });
}

// Search products
searchInput.addEventListener('input', () => {
  const keyword = searchInput.value.toLowerCase().trim();
  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(keyword)
  );
  displayProducts(filtered);
});

// Sort products
sortSelect.addEventListener('change', () => {
  const value = sortSelect.value;
  let sorted = [...products];
  if (value === 'asc') sorted.sort((a, b) => a.price - b.price);
  else if (value === 'desc') sorted.sort((a, b) => b.price - a.price);
  displayProducts(sorted);
});

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.innerText = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// Voice Search
if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  let isListening = false;

  voiceBtn.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
      return;
    }
    recognition.start();
    isListening = true;
    voiceBtn.innerText = '⏹️';
  });

  recognition.onresult = (event) => {
    let transcript = event.results[0][0].transcript.toLowerCase().trim();
    transcript = transcript.replace(/[^\w\s]/gi, '');
    searchInput.value = transcript;
    searchInput.dispatchEvent(new Event('input'));
  };

  recognition.onend = () => {
    isListening = false;
    voiceBtn.innerText = '🎤';
  };
} else {
  voiceBtn.disabled = true;
  voiceBtn.title = 'Voice search not supported';
}
