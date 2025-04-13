document.addEventListener("DOMContentLoaded", function () {
  let currentPlantId = "";
  const API_BASE = "http://localhost:3000";

  function showPage(pageId) {
    const pages = ["loginPage", "menuPage", "plantInfoPage", "recordsPage", "graphPage", "advicePage"];
    pages.forEach(id => {
      const page = document.getElementById(id);
      if (page) {
        page.style.display = (id === pageId) ? "block" : "none";
      }
    });
  }

  // Login
  document.getElementById("btnLogin").addEventListener("click", () => {
    const plantId = document.getElementById("uniqueID").value.trim();
    const passcode = document.getElementById("passcode").value.trim();
    const msg = document.getElementById("loginMessage");

    if (!plantId || !passcode) {
      msg.textContent = "Please enter both Plant ID and Passcode.";
      msg.style.color = "red";
      return;
    }

    fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantId, passcode })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          currentPlantId = plantId;
          msg.textContent = "Login successful!";
          msg.style.color = "green";
          showPage("menuPage");
        } else {
          msg.textContent = data.message || "Invalid ID or Passcode.";
          msg.style.color = "red";
        }
      })
      .catch(() => {
        msg.textContent = "Login failed. Please try again.";
        msg.style.color = "red";
      });
  });

  // Register
  document.getElementById("btnCreateID").addEventListener("click", () => {
    const plantId = document.getElementById("uniqueID").value.trim();
    const passcode = document.getElementById("passcode").value.trim();
    const msg = document.getElementById("loginMessage");

    if (!plantId || !passcode) {
      msg.textContent = "Please enter both Plant ID and Passcode.";
      msg.style.color = "red";
      return;
    }

    fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantId, passcode })
    })
      .then(res => res.json())
      .then(data => {
        msg.textContent = data.success
          ? "New ID created! You can now log in."
          : data.message || "Failed to create ID.";
        msg.style.color = data.success ? "green" : "red";
      })
      .catch(() => {
        msg.textContent = "Something went wrong. Try again.";
        msg.style.color = "red";
      });
  });

  // Save Plant Info
  document.getElementById("btnSavePlant").addEventListener("click", () => {
    const name = document.getElementById("plantName").value.trim();
    const location = document.getElementById("location").value.trim();
    const capacity = parseFloat(document.getElementById("capacity").value.trim());

    if (!name || !location || isNaN(capacity)) {
      alert("Please fill out all plant information fields.");
      return;
    }

    fetch(`${API_BASE}/api/savePlantInfo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantId: currentPlantId, name, location, capacity })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.success ? "Plant information saved." : "Failed to save plant information.");
        showPage("menuPage");
      });
  });

  // Save Power Record
  document.getElementById("btnSaveRecord").addEventListener("click", () => {
    const date = document.getElementById("recordDate").value;
    const usage = parseFloat(document.getElementById("powerUsage").value.trim());

    if (!date || isNaN(usage)) {
      alert("Please enter both date and power usage.");
      return;
    }

    fetch(`${API_BASE}/api/saveRecord`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantId: currentPlantId, date, usage })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.success ? "Record saved successfully." : "Failed to save record.");
        showPage("menuPage");
      });
  });

  // Load Plant Info
  document.getElementById("btnPlantInfo").addEventListener("click", () => {
    fetch(`${API_BASE}/api/getPlantInfo?plantId=${currentPlantId}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("plantName").value = data.name || "";
        document.getElementById("location").value = data.location || "";
        document.getElementById("capacity").value = data.capacity || "";
        showPage("plantInfoPage");
      });
  });

  // Load Records
  document.getElementById("btnRecords").addEventListener("click", () => {
    fetch(`${API_BASE}/api/getRecords?plantId=${currentPlantId}`)
      .then(res => res.json())
      .then(data => {
        displayRecords(data.records);
        showPage("recordsPage");
      });
  });

  // Load Graph
  document.getElementById("btnGraph").addEventListener("click", () => {
    fetch(`${API_BASE}/api/getRecords?plantId=${currentPlantId}`)
      .then(res => res.json())
      .then(data => {
        renderGraph(data.records);
        showPage("graphPage");
      });
  });

  // Load Advice
  document.getElementById("btnAdvice").addEventListener("click", () => {
    fetch(`${API_BASE}/api/getRecords?plantId=${currentPlantId}`)
      .then(res => res.json())
      .then(data => {
        generateAdvice(data.records);
        showPage("advicePage");
      });
  });

  // Back buttons
  document.getElementById("btnBackFromPlant").addEventListener("click", () => showPage("menuPage"));
  document.getElementById("btnBackFromRecords").addEventListener("click", () => showPage("menuPage"));
  document.getElementById("btnBackFromGraph").addEventListener("click", () => showPage("menuPage"));
  document.getElementById("btnBackFromAdvice").addEventListener("click", () => showPage("menuPage"));

  // Display Records
  function displayRecords(records) {
    const table = document.getElementById("recordsTable");
    table.innerHTML = "";

    records.forEach(record => {
      const row = document.createElement("tr");

      const dateCell = document.createElement("td");
      dateCell.textContent = record.date;

      const usageCell = document.createElement("td");
      usageCell.textContent = record.usage;

      const deleteCell = document.createElement("td");
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        row.remove(); // purely frontend demo
      });
      deleteCell.appendChild(deleteBtn);

      row.appendChild(dateCell);
      row.appendChild(usageCell);
      row.appendChild(deleteCell);

      table.appendChild(row);
    });
  }

  // Render Graph
  function renderGraph(records) {
    const ctx = document.getElementById("powerChart").getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: records.map(r => r.date),
        datasets: [{
          label: "Power Usage (kWh)",
          data: records.map(r => r.usage),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Generate Advice
  function generateAdvice(records) {
    const avg = records.length
      ? records.reduce((sum, r) => sum + r.usage, 0) / records.length
      : 0;

    const msg = avg > 5000
      ? "High usage! Consider reviewing efficiency."
      : avg > 2000
        ? "Moderate usage. You’re doing okay."
        : "Excellent efficiency! Keep it up.";

    document.getElementById("adviceContent").textContent = msg;
  }
});