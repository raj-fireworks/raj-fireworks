// Firework prices (defined as before)
let fireworkPrices = {
  "Sparklers": 10,
  "Flower Pots": 30,
  "Rockets": 50,
  "Chakkars": 25,
  "Fountains": 40
};
let currentPage = 1;
const itemsPerPage = 5;
let fireworkRows = []; // stores all rows, not just visible ones

// Load custom fireworks from localStorage (overrides or adds to defaults)
const storedFireworks = JSON.parse(localStorage.getItem("fireworkPrices")) || {};
fireworkPrices = { ...fireworkPrices, ...storedFireworks };
function populateFireworkDatalist() {
  const datalist = document.getElementById("fireworkList");
  datalist.innerHTML = ""; // Clear old options

  for (const name in fireworkPrices) {
    const option = document.createElement("option");
    option.value = name;
    datalist.appendChild(option);
  }
}


// Initialize the page
function initializePage() {
  const customerName = localStorage.getItem("customerName");
  const customerMobile = localStorage.getItem("customerMobile");
  const customerAddress = localStorage.getItem("customerAddress");
  const billNumber = localStorage.getItem("billNumber");

  if (customerName && customerMobile && customerAddress) {
    document.getElementById('displayCustomerName').textContent = customerName;
    document.getElementById('displayCustomerMobile').textContent = customerMobile;
    document.getElementById('displayCustomerAddress').textContent = customerAddress;

    // Optional: display bill number
    const billDisplay = document.getElementById('billNumberDisplay');
    if (billDisplay) {
      billDisplay.textContent = `Bill Number: ${billNumber}`;
    }
  } else {
    document.getElementById('customerDetailsDisplay').innerHTML = "<p>No customer data found.</p>";
  }
    // 🔥 Merge default + stored fireworks into global fireworkPrices
  const defaultFireworks = {
    "Sparklers": 10,
    "Flower Pots": 30,
    "Rockets": 50,
    "Chakkars": 25,
    "Fountains": 40
  };

  const storedFireworks = JSON.parse(localStorage.getItem("fireworkPrices")) || {};
  fireworkPrices = { ...defaultFireworks, ...storedFireworks };

  updatePrintButton();
   populateFireworkDatalist();  
}



// Update total when fireworks are added
// Update total when fireworks are added or removed
function updateGrandTotal() {
   const total = fireworkRows.reduce((sum, item) => sum + item.total, 0);
  document.getElementById('grandTotal').textContent = `₹${total.toFixed(2)}`;
  updateDiscountedTotal();
}

// Delete the selected firework from the table
function deleteFirework(row) {
  row.remove(); // cleaner than row.parentNode.removeChild(row)
  updateGrandTotal();
  updatePrintButton(); // ✅ Add this line to fix your issue
}


// Add firework to the table
// Add firework to the table
// Add firework to the table or update quantity if it already exists
function addFirework() {
  const name = document.getElementById('name').value;
  const quantity = parseInt(document.getElementById('quantity').value.trim());

  // Get the price of the selected firework
  const price = fireworkPrices[name] || 0;

  if (!name || isNaN(quantity) || quantity <= 0 || price <= 0) {
    alert("Please select a firework and enter a valid quantity.");
    return;
  }

  const total = quantity * price;

  // Check if the firework already exists in the table
  const existingRow = Array.from(document.querySelectorAll('#fireworkTable tbody tr'))
    .find(row => row.cells[0].textContent === name);

  if (existingRow) {
    // If the firework exists, update the quantity and total
    const existingQuantityCell = existingRow.cells[1];
    const existingTotalCell = existingRow.cells[2];

    // Update the quantity
    const newQuantity = parseInt(existingQuantityCell.textContent) + quantity;
    existingQuantityCell.textContent = newQuantity;

    // Update the total
    existingTotalCell.textContent = `₹${(newQuantity * price).toFixed(2)}`;
  } else {
    // If the firework doesn't exist, add a new row
    const table = document.getElementById('fireworkTable').getElementsByTagName('tbody')[0];
    const row = table.insertRow();
    row.insertCell(0).textContent = name;
    row.insertCell(1).textContent = quantity;
    row.insertCell(2).textContent = `₹${total.toFixed(2)}`;

    // Create a delete button
    const deleteCell = row.insertCell(3);
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';  // Delete icon
    deleteBtn.classList.add('delete-btn');
    deleteBtn.onclick = function () {
  deleteFirework(row);
};

    deleteCell.appendChild(deleteBtn);
  }

  // Reset inputs
  document.getElementById('name').value = '';
  document.getElementById('quantity').value = '';

  // Update grand total
  updateGrandTotal();
  updatePrintButton();
  // Check if firework already exists in stored data
  const existingIndex = fireworkRows.findIndex(row => row.name === name);
  if (existingIndex > -1) {
    fireworkRows[existingIndex].quantity += quantity;
    fireworkRows[existingIndex].total = fireworkRows[existingIndex].quantity * price;
  } else {
    fireworkRows.push({
      name,
      quantity,
      price,
      total
    });
  }

  // Reset form
  document.getElementById('name').value = '';
  document.getElementById('quantity').value = '';

  renderTable();
  updateGrandTotal();

}
function renderTable() {
  const tbody = document.querySelector('#fireworkTable tbody');
  tbody.innerHTML = '';

  fireworkRows.forEach(item => {
    const row = tbody.insertRow();
    row.insertCell(0).textContent = item.name;
    row.insertCell(1).textContent = item.quantity;
    row.insertCell(2).textContent = `₹${item.total.toFixed(2)}`;

    const deleteCell = row.insertCell(3);
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.onclick = () => {
      fireworkRows = fireworkRows.filter(f => f.name !== item.name);
      renderTable();
      updateGrandTotal();
      updatePrintButton();
    };
    deleteCell.appendChild(deleteBtn);
  });

  updatePrintButton();
}



function sendToWhatsApp() {
  const customerName = localStorage.getItem("customerName") || "Customer";
  const customerMobile = localStorage.getItem("customerMobile") || "";
  const customerAddress = localStorage.getItem("customerAddress") || "";

  let message = ` *Raj Crackers - Your Firework Bill*\n\n`;
  message += `*Customer:* ${customerName}\n`;
  message += `*Mobile:* ${customerMobile}\n`;
  message += `*Address:* ${customerAddress}\n\n`;
  message += `--------------------------\n`;
  message += ` *Firework | Qty | Total*\n`;
  message += `--------------------------\n`;

  const rows = document.querySelectorAll('#fireworkTable tbody tr');
  rows.forEach(row => {
    const name = row.cells[0].textContent;
    const qty = row.cells[1].textContent;
    const total = row.cells[2].textContent;
    message += `${name} | ${qty} | ${total}\n`;
  });

  const grandTotal = document.getElementById('grandTotal').textContent;
  const discount = parseFloat(document.getElementById('discountPercent').value) || 0;
  const discountedTotal = document.getElementById('discountedTotal').textContent;

  message += `\n *Grand Total:* ${grandTotal}\n`;
  message += ` *Discount (${discount}%):* ₹${(parseFloat(grandTotal.replace(/[^\d.]/g, '')) * discount / 100).toFixed(2)}\n`;
  message += ` *Total After Discount:* ${discountedTotal}\n`;
  message += `--------------------------\n\n`;
  message += `Thank you for shopping with us! `;
  message += ` *Happy Diwali!* \n`;
message += `"May your life be as bright and joyful as the festival of lights." \n`;


  const phone = customerMobile.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

function printList() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Customer Info
  const billNumber = localStorage.getItem("billNumber") || "N/A";
  const customerName = localStorage.getItem("customerName") || "N/A";
  const customerMobile = localStorage.getItem("customerMobile") || "N/A";
  const customerAddress = localStorage.getItem("customerAddress") || "N/A";

  // Header
  doc.setFontSize(16);

  doc.setFontSize(12);
doc.text(`Bill Number: ${billNumber}`, 20, 20);
doc.text(`Customer Name: ${customerName}`, 20, 28);
doc.text(`Mobile Number: ${customerMobile}`, 20, 36);
doc.text(`Address: ${customerAddress}`, 20, 44);

  doc.text("AJ Crackers", pageWidth - 20, 20, { align: "right" });
  doc.text("Your Trusted Firework Partner", pageWidth - 20, 26, { align: "right" });
  doc.text("Phone: +91 82967 72217", pageWidth - 20, 32, { align: "right" });
  doc.text("Email: support@rajcrackers.in", pageWidth - 20, 38, { align: "right" });

  // Prepare table data from DOM
  const rows = document.querySelectorAll('#fireworkTable tbody tr');
  let tableData = Array.from(rows).map(row => [
    row.cells[0].textContent, // Firework Name
    row.cells[1].textContent, // Quantity
    row.cells[2].textContent.replace('₹', '') // Total (₹) without symbol
  ]);

  // Calculate totals
  const grandTotal = parseFloat(document.getElementById('grandTotal').textContent.replace(/[^\d.]/g, '')) || 0;
  const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
  const discountAmount = (grandTotal * discountPercent) / 100;
  const discountedTotal = grandTotal - discountAmount;

  // Append totals rows inside the table, aligned right for amount column
  tableData.push(
    ['', 'Grand Total:', grandTotal.toFixed(2)],
    ['', `Discount (${discountPercent.toFixed(2)}%):`, discountAmount.toFixed(2)],
    ['', 'Total After Discount:', discountedTotal.toFixed(2)]
  );

  // Generate table with autotable
  doc.autoTable({
    head: [['Firework Name', 'Quantity', 'Total (Rs.)']],
    body: tableData,
    startY: 65,
    styles: {
      cellPadding: 3,
      fontSize: 11
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'right' },  // Label aligned right
      2: { cellWidth: 60, halign: 'right' }   // Amount aligned right
    },
    theme: 'grid',
    tableWidth: 'auto',
    didDrawCell: (data) => {
      // Make the totals rows bold
      if (data.row.index >= tableData.length - 3) {
        doc.setFont(undefined, 'bold');
      }
    }
  });

  // Save the PDF
  const fileName = `Bill_${customerName.replace(/\s+/g, '_')}_${billNumber}.pdf`;
  doc.save(fileName);
  alert("PDF file has been saved successfully in your downloads folder!");
}




function goBackToFirstPage() {
  // Optionally, clear the customer data and bill number from localStorage
  localStorage.removeItem("customerName");
  localStorage.removeItem("customerMobile");
  localStorage.removeItem("customerAddress");
  localStorage.removeItem("billNumber");

  // Navigate back to the first page (Customer Details)
  window.location.href = 'index.html';  // Change this to the correct path if necessary
}
function resetForm() {
  document.getElementById('name').value = '';
  document.getElementById('quantity').value = '';
  fireworkRows = [];
  currentPage = 1;
  renderTable();
  updateGrandTotal();
  alert('All products have been removed from the list.');
}

function updatePrintButton() {
  const tableBody = document.querySelector('#fireworkTable tbody');
  const printBtn = document.getElementById('printListBtn');
  
  // Check for existing rows
  if (tableBody && tableBody.children.length > 0) {
    printBtn.disabled = false;
  } else {
    printBtn.disabled = true;
  }
}
function updateDiscountedTotal() {
	  const discountInputElement = document.getElementById('discountPercent');

  const grandTotalText = document.getElementById('grandTotal').textContent.replace(/[^\d.]/g, '');
  const discountInput = parseFloat(document.getElementById('discountPercent').value) || 0;
  // Clamp discount to 0–100
  if (isNaN(discountInput)) {
    discountInput = 0;
  }
   if (discountInput > 100) {
    alert("Discount percentage cannot exceed 100%");
    discountInput = 100;
    discountInputElement.value = 100;
  } else if (discountInput < 0) {
    alert("Discount percentage cannot be negative");
    discountInput = 0;
    discountInputElement.value = 0;
  }
  const grandTotal = parseFloat(grandTotalText);
  const discountAmount = (grandTotal * discountInput) / 100;
  const finalTotal = grandTotal - discountAmount;

  document.getElementById('discountedTotal').textContent = `₹${finalTotal.toFixed(2)}`;
}


// Initialize the page when it's loaded
initializePage();
updatePrintButton();
