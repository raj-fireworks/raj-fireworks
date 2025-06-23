// Firework prices (defined as before)
let fireworkPrices = {
  "Sparklers": 10,
  "Flower Pots": 30,
  "Rockets": 50,
  "Chakkars": 25,
  "Fountains": 40
};

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
  let total = 0;
  const rows = document.querySelectorAll('#fireworkTable tbody tr');
  rows.forEach(row => {
    const value = row.cells[2].textContent.replace('₹', '');
    total += parseFloat(value);
  });

  document.getElementById('grandTotal').textContent = `₹${total.toFixed(2)}`;
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

}


function printList() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Get Customer Info
  const billNumber = localStorage.getItem("billNumber") || "N/A";
  const customerName = localStorage.getItem("customerName") || "N/A";
  const customerMobile = localStorage.getItem("customerMobile") || "N/A";
  const customerAddress = localStorage.getItem("customerAddress") || "N/A";

  // Title and customer details
  doc.setFontSize(16);
  doc.text("Firework Billing", 20, 20);
  doc.setFontSize(12);
  doc.text(`Bill Number: ${billNumber}`, 20, 30);
  doc.text(`Customer Name: ${customerName}`, 20, 38);
  doc.text(`Mobile Number: ${customerMobile}`, 20, 46);
  doc.text(`Address: ${customerAddress}`, 20, 54);

  // Table Data from DOM
  const rows = document.querySelectorAll('#fireworkTable tbody tr');
  const tableData = Array.from(rows).map(row => [
    row.cells[0].textContent, // Firework Name
    row.cells[1].textContent, // Quantity
    row.cells[2].textContent  // Total (₹)
  ]);

  // Add table using autoTable
  doc.autoTable({
    head: [['Firework Name', 'Quantity', 'Total (₹)']],
    body: tableData,
    startY: 65,
    styles: {
      cellPadding: 3,
      fontSize: 11
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 50, halign: 'center' }
    },
    theme: 'grid',
    tableWidth: 'auto'
  });

  // Grand Total
  // Grand Total (aligned left, no fill)
const grandTotal = document.getElementById('grandTotal').textContent.replace('₹', '');
const startX = 20;
const endY = doc.lastAutoTable.finalY + 15;

doc.setFontSize(13);
doc.setTextColor(0);
doc.text(`Grand Total: ₹${grandTotal}`, startX, endY);


  // Save the PDF
  const fileName = `Bill_${customerName.replace(/\s+/g, '_')}_${billNumber}.pdf`;
  doc.save(fileName);
      alert("Pdf file has been saved successfully in your downloads folder!");

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
  // Reset form inputs
  document.getElementById('name').value = '';
  document.getElementById('quantity').value = '';
  
  // Clear the table rows (except the header and footer)
  const tableBody = document.querySelector('#fireworkTable tbody');
  tableBody.innerHTML = '';

  // Reset the grand total
  document.getElementById('grandTotal').textContent = '₹0';

  // Optionally, clear customer data and bill number from localStorage
  // localStorage.removeItem("customerName");
  // localStorage.removeItem("customerMobile");
  // localStorage.removeItem("customerAddress");
  // localStorage.removeItem("billNumber");

  // You can also clear the bill number if you want to reset it, otherwise leave it as is
  // localStorage.setItem("billNumber", 1);  // Resetting bill number to 1, if desired

  alert('All products have been removed from the list.');
  updatePrintButton();

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


// Initialize the page when it's loaded
initializePage();
updatePrintButton();
