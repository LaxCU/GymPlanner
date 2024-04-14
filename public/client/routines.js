let createRoutine = document.getElementById("createRoutine");
let overlay = document.getElementById("routineOverlay");
let cancelButton = document.getElementById("cancelButton");

let routineForm = document.getElementById("routineForm");
let routineName = document.getElementById("routine_name");
let routineDesc = document.getElementById("routine_description");
let routineTitle = document.getElementById("routineTitle");

let editButtons = document.querySelectorAll(
  ".card-actions > button.button:not(.button-cancel)"
);

let deleteButtons = document.querySelectorAll(".card-actions .button-cancel");

deleteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const routine_id = button.id;

    fetch(`/routines/${routine_id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          alert("Routine deleted successfully");
          location.reload();
        } else {
          throw new Error("Failed to delete routine");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});

editButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const routine_id = button.id;
    const routine = routinesData.find((item) => item.routine_id == routine_id);

    //Prefill the form
    routineTitle.innerText = "Update Routine";
    routineName.value = routine.routine_name;
    routineDesc.innerText = routine.routine_description;

    //Update the form action
    routineForm.action = `/routine/${routine_id}`;

    overlay.style.display = "block";
  });
});

cancelButton.addEventListener("click", function () {
  overlay.style.display = "none";
});

createRoutine.addEventListener("click", toggleOverlay);

function toggleOverlay() {
  routineTitle.innerText = "Create Routine";
  routineName.value = "";
  routineDesc.innerText = "";
  routineForm.action = "/routines";

  overlay.style.display = "block";
}

window.addEventListener("click", function (event) {
  if (event.target == overlay) {
    overlay.style.display = "none";
  }
});
