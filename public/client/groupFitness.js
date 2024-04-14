let createBooking = document.getElementById("createBooking");
let overlay = document.getElementById("Overlay");
let cancelButton = document.getElementById("cancelButton");

let scheduleForm = document.getElementById("trainingForm");
let durationChange = document.getElementById("duration");
let trainingDate = document.getElementById("training_date");
let trainer = document.getElementById("trainer_id");
let trainingComment = document.getElementById("training_comment");

let overlayTitle = document.getElementById("overlaytitle");

let bookingStartTime = document.getElementById("start_time");

const deleteButtons = document.querySelectorAll('[id*="deleteButton"]');
const editButtons = document.querySelectorAll('[id*="editButton"]');
const removeButtons = document.querySelectorAll('[id*="removeButton"]');
const bookButtons = document.querySelectorAll('[id*="bookButton"]');

// Event Listners
bookButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const training_id = button.id.split("_")[1];
    console.log(training_id);

    fetch(`/groupFitness/${training_id}`, {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          alert("Training Session booked successfully");
          location.reload();
        }
      })
      .catch((error) => {
        alert("Failed to book training session");
        console.error("Error:", error);
      });
  });
});

removeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const training_id = button.id.split("_")[1];

    fetch(`/groupFitness/${training_id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          alert("Training Session removed successfully");
          location.reload();
        }
      })
      .catch((error) => {
        alert("Failed to remove training session");
        console.error("Error:", error);
      });
  });
});

// editButtons.forEach((button) => {
//   button.addEventListener("click", () => {
//     const training_id = button.id;
//     const trainingBooking = bookingsData.find(
//       (item) => item.training_id == training_id
//     );

//     let isoDate = new Date(trainingBooking.training_date);
//     let formattedDate = isoDate.toISOString().split("T")[0];
//     //Prefill the form
//     overlayTitle.innerText = "Update PT Booking";
//     trainingDate.value = formattedDate;
//     bookingStartTime.value = trainingBooking.start_time;
//     durationChange.value = trainingBooking.duration;
//     trainer.value = trainingBooking.trainer_id;
//     trainingComment.value = trainingBooking.training_comment;

//     //Update the form action
//     scheduleForm.action = `/training/${training_id}`;

//     overlay.style.display = "block";
//   });
// });

// deleteButtons.forEach((button) => {
//   button.addEventListener("click", () => {
//     const training_id = button.id;

//     fetch(`/training/${training_id}`, {
//       method: "DELETE",
//     })
//       .then((response) => {
//         if (response.ok) {
//           alert("Training Session deleted successfully");
//           location.reload();
//         } else {
//           alert("Failed to delete booking");
//           throw new Error("Failed to delete booking");
//         }
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   });
// });




scheduleForm.addEventListener("submit", validateInput);
cancelButton.addEventListener("click", function () {
  overlay.style.display = "none";
});

createBooking.addEventListener("click", toggleOverlay);

function toggleOverlay() {
  overlayTitle.innerText = "Create Routine";
  scheduleForm.action = "/training";

  //Clear the form
  trainingDate.value = "";
  bookingStartTime.value = "";
  durationChange.value = "";
  trainer.value = "";
  trainingComment.value = "";

  overlay.style.display = "block";
}

function validateInput(event) {
  event.preventDefault();

  const formData = new FormData(scheduleForm);

  // Whole stuff for end_time calculation
  let startTimeParts = bookingStartTime.value.split(":");
  let duration = parseInt(durationChange.value, 10);
  let startHours = parseInt(startTimeParts[0], 10);
  let startMinutes = parseInt(startTimeParts[1], 10);

  let endHour = startHours + Math.floor((startMinutes + duration) / 60);
  let endMinute = (startMinutes + duration) % 60;

  if (endHour >= 24) {
    endHour = endHour - 24;
  }

  let formattedEndTime = `${endHour.toString().padStart(2, "0")}:${endMinute
    .toString()
    .padStart(2, "0")}`;

  let dateObj = new Date(formData.get("training_date"));

  let serverData = {
    day_of_week: dateObj.getDay() + 1,
    training_date: formData.get("training_date"),
    start_time: formData.get("start_time"),
    end_time: formattedEndTime,
    trainer_id: formData.get("trainer_id"),
    duration: durationChange.value,
    comments: formData.get("training_comment"),
  };

  let path = scheduleForm.action;

  fetch(path, {
    method: "POST",
    body: JSON.stringify(serverData),
    headers: {
      "Content-Type": "application/json", // Set the content type to form-urlencoded
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return response.text();
      }
    })
    .then((data) => {
      if (typeof data === "string") {
        alert(data); // Display the error message
      } else {
        alert("Training session created successfully");
        location.reload();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

window.addEventListener("click", function (event) {
  if (event.target == overlay) {
    overlay.style.display = "none";
  }
});
