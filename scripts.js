$(document).ready(function () {
    const defaultPassword = "1234";

// Save record
$("#btnSaveRecord").click(function () {
    const record = {
      date: $("#recordDate").val(),
      usage: parseFloat($("#powerUsage").val())
    };
  
    let records = JSON.parse(localStorage.getItem("powerRecords")) || [];
    records.push(record);
    localStorage.setItem("powerRecords", JSON.stringify(records));
    alert("Record saved!");
    renderRecords();
  });
  
  // Load records when records page is shown
  $("#recordsPage").on("pageshow", renderRecords);
  
  // Display records in table
  function renderRecords() {
    const records = JSON.parse(localStorage.getItem("powerRecords")) || [];
    const table = $("#recordsTable");
    table.empty();
  
    records.forEach((rec, index) => {
      const row = `<tr>
        <td>${rec.date}</td>
        <td>${rec.usage}</td>
        <td><button onclick="deleteRecord(${index})">Delete</button></td>
      </tr>`;
      table.append(row);
    });
  }
  
  // Delete record
  function deleteRecord(index) {
    let records = JSON.parse(localStorage.getItem("powerRecords")) || [];
    records.splice(index, 1);
    localStorage.setItem("powerRecords", JSON.stringify(records));
    renderRecords();
  }    
  
  let powerChart; // global chart reference

  $("#btnGraph").click(function () {
      $("#menuPage").hide();
      $("#graphPage").show();
  
      const records = JSON.parse(localStorage.getItem("powerRecords")) || [];
      const dates = records.map(r => r.date);
      const usage = records.map(r => r.usage);
  
      if (powerChart) {
          powerChart.destroy();
      }
  
      const ctx = document.getElementById("powerChart").getContext("2d");
      powerChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: dates,
              datasets: [{
                  label: 'Power Usage (kWh)',
                  data: usage,
                  borderColor: 'blue',
                  fill: false
              }]
          }
      });
  });
  
  $("#btnBackFromGraph").click(function () {
      $("#graphPage").hide();
      $("#menuPage").show();
  });
  
  // Show advice
$("#btnAdvice").click(function () {
    const records = JSON.parse(localStorage.getItem("powerRecords")) || [];
    const usageValues = records.map(r => r.usage);
    
    let advice = "No records found.";

    if (usageValues.length > 0) {
        const avgUsage = usageValues.reduce((a, b) => a + b, 0) / usageValues.length;
        if (avgUsage < 100) {
            advice = "Power usage is efficient.";
        } else if (avgUsage < 500) {
            advice = "Power usage is moderate.";
        } else {
            advice = "Consider reducing power usage.";
        }
    }

    $("#adviceContent").text(advice);
    $("#menuPage").hide();
    $("#advicePage").show();
});

// Back from advice
$("#btnBackFromAdvice").click(function () {
    $("#advicePage").hide();
    $("#menuPage").show();
});

    // Save Plant Info
$("#btnSavePlant").click(function () {
    const plantInfo = {
      name: $("#plantName").val().trim(),
      location: $("#location").val().trim(),
      capacity: $("#capacity").val().trim()
    };
  
    localStorage.setItem("plantInfo", JSON.stringify(plantInfo));
    alert("Plant information saved!");
  });
  
  // Auto-load saved plant info
  $("#plantInfoPage").on("pageshow", function () {
    const saved = JSON.parse(localStorage.getItem("plantInfo"));
    if (saved) {
      $("#plantName").val(saved.name);
      $("#location").val(saved.location);
      $("#capacity").val(saved.capacity);
    }
  });
  
    // Login
    $("#btnLogin").click(function () {
      const enteredID = $("#uniqueID").val().trim();
      const enteredPass = $("#passcode").val().trim();
      const storedUser = JSON.parse(localStorage.getItem("user"));
  
      if (storedUser && storedUser.id === enteredID && storedUser.passcode === enteredPass) {
        sessionStorage.setItem("user", JSON.stringify(storedUser));
        $("#loginMessage").text("");
        $("#loginPage").hide();
        $("#menuPage").show();
      } else {
        $("#loginMessage").text("Login failed. Check your credentials.");
      }
    });
  
    // Create New ID
    $("#btnCreateID").click(function () {
      const newID = $("#uniqueID").val().trim();
      const newPass = $("#passcode").val().trim();
  
      if (!newID || !newPass) {
        alert("Both ID and passcode are required.");
        return;
      }
  
      const newUser = { id: newID, passcode: newPass };
      localStorage.setItem("user", JSON.stringify(newUser));
      alert("New ID created. You can now login.");
    });
  });

  const SERVER_URL = "http://127.0.0.1:3000"; // Simulated server

// Sync records to server
$("#btnSync").click(function () {
    const records = JSON.parse(localStorage.getItem("powerRecords")) || [];
    const plant = JSON.parse(localStorage.getItem("plantInfo")) || null;

    if (records.length === 0 || !plant) {
        alert("No records or plant info to sync.");
        return;
    }

    const requestBody = {
        plantId: $("#uniqueID").val(),
        password: $("#passcode").val(),
        plantInfo: plant,
        powerUsage: records
    };

    $.post(SERVER_URL + "/syncPower", requestBody, function (data) {
        alert("Data synced with server.");
    }).fail(function (error) {
        alert("Sync failed: " + error.responseText);
    });
});