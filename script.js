// Input validation event listeners to restrict characters
document.getElementById('customerName').addEventListener('input', function () {
  this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // Letters and spaces only
});

document.getElementById('customerMobile').addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, ''); // Digits only
});

// Validate and proceed to next page
function goToNextPage() {
  const customerName = document.getElementById('customerName').value.trim();
  const customerMobile = document.getElementById('customerMobile').value.trim();
  const customerAddress = document.getElementById('customerAddress').value.trim();

  // Reset error messages
  document.getElementById('nameError').style.display = 'none';
  document.getElementById('mobileError').style.display = 'none';
  document.getElementById('addressError').style.display = 'none';

  let isValid = true;

  // Name validation: min 3 letters, letters and spaces only
  const nameRegex = /^[A-Za-z ]{3,}$/;
  if (!nameRegex.test(customerName)) {
    document.getElementById('nameError').textContent = "Enter a valid name (min 3 letters, only letters and spaces).";
    document.getElementById('nameError').style.display = 'block';
    isValid = false;
  }

  // Mobile validation: 10 digits starting with 6-9
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(customerMobile)) {
    document.getElementById('mobileError').textContent = "Enter a valid 10-digit mobile number starting with 6–9.";
    document.getElementById('mobileError').style.display = 'block';
    isValid = false;
  }

  // Address validation: not empty
  if (!customerAddress) {
    document.getElementById('addressError').textContent = "Address cannot be empty.";
    document.getElementById('addressError').style.display = 'block';
    isValid = false;
  }

  if (!isValid) return;

  // Save customer data with timestamp to localStorage
  const customerData = {
    name: customerName,
    mobile: customerMobile,
    address: customerAddress,
    timestamp: Date.now()
  };

  let existingData = JSON.parse(localStorage.getItem('customerData')) || [];
  existingData.push(customerData);
  localStorage.setItem('customerData', JSON.stringify(existingData));

  localStorage.setItem('customerName', customerName);
  localStorage.setItem('customerMobile', customerMobile);
  localStorage.setItem('customerAddress', customerAddress);

  let billNumber = parseInt(localStorage.getItem('billCounter') || '1000', 10);
  billNumber += 1;
  localStorage.setItem('billCounter', billNumber);
  localStorage.setItem('billNumber', billNumber);

  // Redirect to details page
  window.location.href = 'details.html';
}

// Live clock update
function generateExcel() {
  const customerData = JSON.parse(localStorage.getItem('customerData')) || [];

  const now = Date.now();
  const recentData = customerData.filter(data => now - data.timestamp < 86400000);

  const rows = [["Customer Name", "Mobile Number", "Address", "Timestamp"]];
  recentData.forEach(item => {
    rows.push([
      item.name,
      item.mobile,
      item.address,
      new Date(item.timestamp).toLocaleString()
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Customer Data");

  // This saves the file directly
  XLSX.writeFile(wb, "CustomerData.xlsx");
    alert("Excel file has been saved successfully in your downloads folder!");

}
