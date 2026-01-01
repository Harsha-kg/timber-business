// Product data with tree/material images
const products = [
  {
    id: 1,
    name: 'Teak Plank (per ft)',
    price: 5000,
    image: 'teak.jpg' // Teak Tree
  },
  {
    id: 2,
    name: 'Sal Wood Plank (per ft)',
    price: 320,
    image: 'https://5.imimg.com/data5/SELLER/Default/2021/2/LR/KL/ER/38482797/indian-sal-wood-1000x1000.jpg' // Sal Tree
  },
  {
    id: 3,
    name: 'Rose Wood (per ft)',
    price: 800,
    image: 'https://harshatimbers.com/wp-content/uploads/2025/04/11-17-11-EastIndianRosewood.jpg' // Rosewood Tree
  },
  {
    id: 4,
    name: 'Neem Wood (per ft)',
    price: 300,
    image: 'https://5.imimg.com/data5/GLADMIN/Default/2022/7/MI/QW/WZ/92368/neem-wood-500x500.jpg' // Neem Tree
  },
  {
    id: 5,
    name: 'Mahogany plank ',
    price: 400,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnK4SG1BDBE77OJT8-_HY416_-8LM63q91Dw&s' // Plywood texture
  },
   {
    id: 6,
    name: 'Silver Wood',
    price: 350,
    image: 'https://tiimg.tistatic.com/fp/1/006/259/silver-oak-525.jpg' // Plywood texture
  },
  {
    id: 7,
    name: 'Plywood Sheet (4x8 ft)',
    price: 1500,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTup8YMrwyyt2foMltFkri2dT6-EJ3Zn5oVEw&s' // Plywood texture
  },

];

// State
const cart = {}; // {productId: qty}

// Helpers
const $ = sel => document.querySelector(sel);
function formatINR(n) { return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }); }
function escapeHtml(s) { return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }

// Render products - Updated to show images
const productsGrid = document.getElementById('productsGrid');
function renderProducts() {
  productsGrid.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:12px; display:block;">
      <h3>${escapeHtml(p.name)}</h3>
      <div class="price">${formatINR(p.price)}</div>
      <div style="margin-top:8px;color:var(--muted);font-size:13px">Enter quantity (units/ft/sheets)</div>
      <div class="product-controls">
        <input type="number" min="0" value="0" data-id="${p.id}" class="qty" />
        <button class="btn addBtn" data-id="${p.id}">Add</button>
      </div>
    `;
    productsGrid.appendChild(div);
  });
}
renderProducts();

// Add to cart
document.addEventListener('click', e => {
  if (e.target.matches('.addBtn')) {
    const id = +e.target.dataset.id;
    const input = document.querySelector(`input.qty[data-id="${id}"]`);
    const qty = Math.max(0, Math.floor(Number(input.value) || 0));
    if (qty <= 0) { alert('Enter a quantity greater than 0'); return; }
    cart[id] = (cart[id] || 0) + qty;
    input.value = 0;
    showAddedFeedback(e.target);
    updateUI();
  }
});

function showAddedFeedback(btn) {
  const prev = btn.textContent;
  btn.textContent = 'Added';
  setTimeout(() => btn.textContent = prev, 900);
}

// Update subtotal and UI
function computeSubtotal() {
  let subtotal = 0;
  for (const idStr in cart) {
    const id = +idStr; const p = products.find(x => x.id === id);
    subtotal += (p.price * cart[id]);
  }
  return subtotal;
}

function updateUI() {
  const subtotal = computeSubtotal();
  const subtotalEl = $('#subtotal');
  if (subtotalEl) subtotalEl.textContent = 'Subtotal: ' + formatINR(subtotal);

  // update selected items box
  const selBox = $('#selectedItems');
  if (selBox) {
    selBox.innerHTML = '';
    if (Object.keys(cart).length === 0) { selBox.innerHTML = '<p class="muted">No items selected yet.</p>'; }
    else {
      const ul = document.createElement('div');
      for (const idStr of Object.keys(cart)) {
        const id = +idStr; const p = products.find(x => x.id === id);
        const line = document.createElement('div');
        const lineTotal = p.price * cart[id];
        line.innerHTML = `<div>${escapeHtml(p.name)} — Qty: ${cart[id]} — <strong>${formatINR(lineTotal)}</strong></div>`;
        ul.appendChild(line);
      }
      selBox.appendChild(ul);
    }
  }

  // update "what to take" panel
  const take = $('#whatToTake');
  if (take) {
    take.innerHTML = '';
    if (Object.keys(cart).length === 0) { take.innerHTML = '<p class="muted">No items yet.</p>'; }
    else {
      const table = document.createElement('div');
      for (const idStr of Object.keys(cart)) {
        const id = +idStr; const p = products.find(x => x.id === id);
        const row = document.createElement('div');
        row.style.marginBottom = '8px';
        row.innerHTML = `<strong>${escapeHtml(p.name)}</strong><div class="muted small">Take: ${cart[id]} unit(s) — Line: ${formatINR(p.price * cart[id])}</div>`;
        table.appendChild(row);
      }
      const totalQty = Object.values(cart).reduce((a, b) => a + b, 0);
      const summary = document.createElement('div'); summary.style.marginTop = '12px'; summary.innerHTML = `<em class="muted">Total items to take: ${totalQty}</em>`;
      take.appendChild(table); take.appendChild(summary);
    }
  }
}

// Calculate total
const calcBtn = document.getElementById('calculateBtn');
if (calcBtn) {
  calcBtn.addEventListener('click', () => {
    const subtotal = computeSubtotal();
    const transport = Number(document.getElementById('transport').value || 0);
    let total = subtotal + transport;
    if (document.getElementById('gst').checked) total = total * 1.18;
    document.getElementById('grandTotal').textContent = formatINR(total);
  });
}

// Clear cart
const clearBtn = document.getElementById('clearCart');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    for (const k in cart) delete cart[k]; updateUI(); document.getElementById('grandTotal').textContent = formatINR(0);
  });
}

const contactF = document.getElementById('contactForm');
if (contactF) {
  contactF.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const rating = document.getElementById('rating').value;
    const output = document.getElementById('contactMsg');

    if (!name || !phone || !email || !message || !rating) {
      output.textContent = 'Please fill all required fields.';
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      output.textContent = 'Enter a valid 10-digit phone number.';
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      output.textContent = 'Enter a valid email.';
      return;
    }

    let data =
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Phone: " + phone + "\n" +
      "Rating: " + rating + "\n" +
      "Message: " + message + "\n" +
      "--------------------------\n";

    let file = new Blob([data], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = "feedback.txt";
    a.click();

    output.textContent = "Message sent successfully!";
    output.classList.add("success");

    contactF.reset();
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'c' && document.getElementById('subtotal')) alert(document.getElementById('subtotal').textContent);
});

// Init
updateUI();
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();