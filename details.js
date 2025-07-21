import { db, doc, getDoc, setDoc, onSnapshot } from "./firebase-config.js";

let fireworkPrices = {};
let fireworkRows = [];

function initializePage() {
  // Load firework prices from Firestore and update UI
  const docRef = doc(db, "raj-crackers", "fireworkPrices");

  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      fireworkPrices = docSnap.data();
      updateDatalist();
      updateTableFromFirestore();
    }
  });

  updateDiscountedTotal();
}

function updateDatalist() {
  const datalist = document.getElementById('fireworksList');
  datalist.innerHTML = '';
  for (const firework in fireworkPrices) {
    const option = document.createElement('option');
    option.value = firework;
    datalist.appendChild(option);
  }
}

function updateTableFromFirestore() {
  const table = document.getElementById("billingTable").getElementsByTagName('tbody')[0];
  table.innerHTML = '';
  fireworkRows = [];

  for (const firework in fireworkPrices) {
    const row = table.insertRow();
    const nameCell = row.insertCell(0);
    const quantityCell = row.insertCell(1);
    const priceCell = row.insertCell(2);
    const deleteCell = row.insertCell(3);

    const quantity = 0;
    const price = fireworkPrices[firework] * quantity;

    nameCell.textContent = firework;
    quantityCell.innerHTML = `<input type="number" min="0" value="${quantity}" onchange="updatePrice(this)">`;
    priceCell.textContent = price.toFixed(2);
    deleteCell.innerHTML = `<button onclick="deleteRow(this)">❌</button>`;

    fireworkRows.push({ name: firework, quantityInput: quantityCell.firstChild, priceCell });

    quantityCell.firstChild.addEventListener('input', updateDiscountedTotal);
  }

  updateDiscountedTotal();
}

function addFirework() {
  const name = document.getElementById('name').value.trim();
  const quantity = parseInt(document.getElementById('quantity').value);

  if (!name || isNaN(quantity) || quantity < 0) return;

  if (!fireworkPrices[name]) {
    const price = parseFloat(prompt(`Enter price for ${name}:`));
    if (!isNaN(price) && price > 0) {
      fireworkPrices[name] = price;

      const docRef = doc(db, "raj-crackers", "fireworkPrices");
      setDoc(docRef, fireworkPrices);
    } else {
      alert("Invalid price entered.");
      return;
    }
  }

  const table = document.getElementById("billingTable").getElementsByTagName('tbody')[0];
  const row = table.insertRow();
  const nameCell = row.insertCell(0);
  const quantityCell = row.insertCell(1);
  const priceCell = row.insertCell(2);
  const deleteCell = row.insertCell(3);

  nameCell.textContent = name;
  quantityCell.innerHTML = `<input type="number" min="0" value="${quantity}" onchange="updatePrice(this)">`;
  priceCell.textContent = (fireworkPrices[name] * quantity).toFixed(2);
  deleteCell.innerHTML = `<button onclick="deleteRow(this)">❌</button>`;

  fireworkRows.push({ name, quantityInput: quantityCell.firstChild, priceCell });

  quantityCell.firstChild.addEventListener('input', updateDiscountedTotal);

  updateDiscountedTotal();

  // ✅ Reset inputs (only once)
  document.getElementById('name').value = '';
  document.getElementById('quantity').value = '';
}

function updatePrice(input) {
  const row = input.closest("tr");
  const name = row.cells[0].textContent;
  const quantity = parseInt(input.value);
  const priceCell = row.cells[2];
  const price = fireworkPrices[name] * quantity;
  priceCell.textContent = price.toFixed(2);
  updateDiscountedTotal();
}

function deleteRow(button) {
  const row = button.closest("tr");
  const name = row.cells[0].textContent;

  fireworkRows = fireworkRows.filter(r => r.name !== name);
  row.remove();
  updateDiscountedTotal();
}

function updateDiscountedTotal() {
  let total = 0;
  fireworkRows.forEach(row => {
    const quantity = parseInt(row.quantityInput.value) || 0;
    const price = fireworkPrices[row.name] * quantity;
    row.priceCell.textContent = price.toFixed(2);
    total += price;
  });

  const discount = total > 1000 ? 0.1 : 0;
  const discountedTotal = total - (total * discount);

  document.getElementById("total").textContent = `₹${total.toFixed(2)}`;
  document.getElementById("discount").textContent = discount > 0 ? "10%" : "0%";
  document.getElementById("discountedTotal").textContent = `₹${discountedTotal.toFixed(2)}`;
}

function sendToWhatsApp() {
  const name = localStorage.getItem("customerName") || '';
  const phone = localStorage.getItem("customerPhone") || '';
  let message = `Name: ${name}\nPhone: ${phone}\n\nOrder Details:\n`;

  fireworkRows.forEach(row => {
    const quantity = row.quantityInput.value;
    if (quantity > 0) {
      message += `${row.name}: ${quantity} pcs @ ₹${fireworkPrices[row.name]} = ₹${(fireworkPrices[row.name] * quantity).toFixed(2)}\n`;
    }
  });

  message += `\nTotal: ${document.getElementById("total").textContent}`;
  message += `\nDiscount: ${document.getElementById("discount").textContent}`;
  message += `\nDiscounted Total: ${document.getElementById("discountedTotal").textContent}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

function printList() {
  const name = localStorage.getItem("customerName") || '';
  const phone = localStorage.getItem("customerPhone") || '';
  let listContent = `Name: ${name}\nPhone: ${phone}\n\nOrder Details:\n`;

  fireworkRows.forEach(row => {
    const quantity = row.quantityInput.value;
    if (quantity > 0) {
      listContent += `${row.name}: ${quantity} pcs @ ₹${fireworkPrices[row.name]} = ₹${(fireworkPrices[row.name] * quantity).toFixed(2)}\n`;
    }
  });

  listContent += `\nTotal: ${document.getElementById("total").textContent}`;
  listContent += `\nDiscount: ${document.getElementById("discount").textContent}`;
  listContent += `\nDiscounted Total: ${document.getElementById("discountedTotal").textContent}`;

  const blob = new Blob([listContent], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'firework_list.txt';
  link.click();
}

window.addEventListener('load', initializePage);
window.addFirework = addFirework;
window.updatePrice = updatePrice;
window.deleteRow = deleteRow;
window.sendToWhatsApp = sendToWhatsApp;
window.printList = printList;
