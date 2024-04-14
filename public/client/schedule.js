let updateSchedule = document.getElementById("updateAvailability");
let overlay = document.getElementById("scheduleOverlay");
let cancelButton = document.getElementById("cancelButton");

let scheduleForm = document.getElementById("scheduleForm");
let dayChange = document.getElementById("day_of_week");

// let routineName = document.getElementById("routine_name");
// let routineDesc = document.getElementById("routine_description");
// let routineTitle = document.getElementById("routineTitle");

const bookingStartTime = document.getElementById("start_time");
const bookingEndTime = document.getElementById("end_time");

// let editButtons = document.querySelectorAll(
//   ".card-actions > button.button:not(.button-cancel)"
// );

// let deleteButtons = document.querySelectorAll(".card-actions .button-cancel");

// deleteButtons.forEach((button) => {
//   button.addEventListener("click", () => {
//     const routine_id = button.id;
//     console.log(routine_id);

//     fetch(`/routines/${routine_id}`, {
//       method: "DELETE",
//     })
//       .then((response) => {
//         if (response.ok) {
//           alert("Routine deleted successfully");
//           location.reload();
//         } else {
//           throw new Error("Failed to delete routine");
//         }
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   });
// });

// editButtons.forEach((button) => {
//   button.addEventListener("click", () => {
//     const routine_id = button.id;
//     const routine = routinesData.find((item) => item.routine_id == routine_id);

//     //Prefill the form
//     routineTitle.innerText = "Update Routine";
//     routineName.value = routine.routine_name;
//     routineDesc.innerText = routine.routine_description;

//     //Update the form action
//     routineForm.action = `/routines/${routine_id}`;

//     overlay.style.display = "block";
//   });
// });

scheduleForm.addEventListener("submit", validateTime);

dayChange.addEventListener("change", updateTime);

cancelButton.addEventListener("click", function () {
  overlay.style.display = "none";
});

updateSchedule.addEventListener("click", toggleOverlay);

function toggleOverlay() {
  //   routineTitle.innerText = "Create Routine";
  //   routineName.value = "";
  //   routineDesc.innerText = "";
  //   routineForm.action = "/routines";

  //Call updateTime
  updateTime();

  overlay.style.display = "block";
}

function updateTime() {
  let selectedDay = dayChange.value;
  const dayOfWeek = scheduleData.find(
    (item) => item.day_of_week == selectedDay
  );

  if (dayOfWeek) {
    bookingStartTime.value = dayOfWeek.start_time;
    bookingEndTime.value = dayOfWeek.end_time;
  } else {
    bookingStartTime.value = "";
    bookingEndTime.value = "";
  }
}

//Functions
function validateTime(event) {
  console.log("Validating time");
  //Check if the end time is greater than the start time
  console.log(bookingStartTime.value, bookingEndTime.value);
  let startTime = bookingStartTime.value;
  let endTime = bookingEndTime.value;

  if (startTime >= endTime) {
    event.preventDefault();
    alert("End time must be greater than start time");
  }
}

window.addEventListener("click", function (event) {
  if (event.target == overlay) {
    overlay.style.display = "none";
  }
});
