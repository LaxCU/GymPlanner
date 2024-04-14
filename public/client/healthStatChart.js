document.addEventListener("DOMContentLoaded", function () {
  var ctx = document.getElementById("routineChart").getContext("2d");

  // console.log(label);

  // // Function to generate timestamps
  // function generateTimestamps() {
  //   var timestamps = [];
  //   for (var i = 0; i < 7; i++) {
  //     var date = new Date();
  //     date.setDate(date.getDate() + i); // Increment date for each day
  //     timestamps.push(date.toLocaleDateString()); // Format timestamp to locale date string
  //   }
  //   return timestamps;
  // }

  // // Function to generate random numbers
  // function generateRandomData() {
  //   var data = [];
  //   for (var i = 0; i < 7; i++) {
  //     data.push(Math.floor(Math.random() * 100)); // Generate random number between 0 and 100
  //   }
  //   return data;
  // }

  var myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartLabels, // Replace labels with timestamps
      datasets: [
        {
          label: label,
          data: chartData, // Replace data with random numbers
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
});
