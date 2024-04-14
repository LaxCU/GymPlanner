//Find the elements
let metricOverlay = document.getElementById("metricOverlay");
let freeFormOverlay = document.getElementById("freeFormOverlay");

let metricButton = document.getElementById("createMetricGoals");
let freeFormButton = document.getElementById("createFreeformGoals");

let goalItems = document.querySelectorAll(".goal-item");

console.log(goalItems.length);

metricButton.addEventListener("click", toggleMetricOverlay);
freeFormButton.addEventListener("click", toggleFreeFormOverlay);

goalItems.forEach(function (goalItem) {
  goalItem.addEventListener("click", function () {
    const goalId = goalItem.dataset.goalId;
    // Fetch goal details using goalId and populate form inputs
    // For example:
    // fetch(`/getGoalDetails/${goalId}`)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     goalIdInput.value = data.id;
    //     goalTitleInput.value = data.goal_title;
    //     goalDescriptionInput.value = data.goal_description;
    //   })
    //   .catch((error) => console.error("Error fetching goal details:", error));

    // Show the overlay
    goalOverlay.style.display = "block";
  });
});

function toggleMetricOverlay() {
  metricOverlay.style.display = "block";
}

function toggleFreeFormOverlay() {
  freeFormOverlay.style.display = "block";
}

window.addEventListener("click", function (event) {
  if (event.target == metricOverlay) {
    metricOverlay.style.display = "none";
  }

  if (event.target == freeFormOverlay) {
    freeFormOverlay.style.display = "none";
  }
});
