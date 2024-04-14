let overlay = document.getElementById("maintenanceOverlay");

let maintenanceForm = document.getElementById("maintenanceForm");
let equipmentTitle = document.getElementById("equipment_name");
let equipmentID = document.getElementById("equipment_id");

const updateButtons = document.querySelectorAll(
  ".card-actions > button.button:not(.button-cancel)"
);

updateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const equipment_id = button.id;
    const equipment = equipmentData.find(
      (item) => item.equipment_id == equipment_id
    );

    console.log(button.id);
    console.log(equipmentData);
    console.log(equipment);

    //Prefill the form
    console.log(equipmentTitle);
    equipmentTitle.innerText = "Equipment Name: " + equipment.equipment_name;
    equipmentID.innerText = "Equipment ID: " + equipment.equipment_id;

    //UPdate the form action
    maintenanceForm.action = `/maintenance/${equipment_id}`;

    overlay.style.display = "block";
  });
});

window.addEventListener("click", function (event) {
  if (event.target == overlay) {
    overlay.style.display = "none";
  }
});
