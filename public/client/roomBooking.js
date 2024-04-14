const createBooking = document.getElementById("createBooking");
const bookingOverlay = document.getElementById("bookingOverlay");

const bookingForm = document.getElementById("bookingForm");

const bookingDate = document.getElementById("booking_date");
const bookingStartTime = document.getElementById("start_time");
const bookingEndTime = document.getElementById("end_time");
const bookingRoom = document.getElementById("room_id");
const bookingComments = document.getElementById("booking_comment");

const editButtons = document.querySelectorAll(
  ".card-actions > button.button:not(.button-cancel)"
);

const deleteButtons = document.querySelectorAll(".card-actions .button-cancel");
editButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const bookingId = button.id;
    const booking = bookingsData.find(
      (booking) => booking.booking_id == bookingId
    );

    //Prefill the form
    const dateObj = new Date(booking.booking_date);
    bookingDate.value = dateObj.toISOString().split("T")[0];
    bookingStartTime.value = booking.start_time;
    bookingEndTime.value = booking.end_time;
    bookingRoom.value = booking.room_id;
    bookingComments.value = booking.booking_comment;

    //UPdate the form action
    bookingForm.action = `/bookings/${bookingId}`;

    bookingOverlay.style.display = "block";
  });
});

deleteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const bookingId = button.id;

    fetch(`/bookings/${bookingId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          alert("Booking deleted successfully");
          location.reload();
        } else {
          throw new Error("Failed to delete booking");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});

createBooking.addEventListener("click", toggleOverlay);

bookingForm.addEventListener("submit", validateTime);

//Functions
function validateTime(event) {
  const startTime = bookingStartTime.value;
  const endTime = bookingEndTime.value;
  const dateString = bookingDate.value;

  //Check if the selected date is today or in the past
  const [year, month, day] = dateString.split("-");
  const [hours, minutes] = startTime.split(":");

  const selectedDate = new Date(year, month - 1, day);
  selectedDate.setHours(hours);
  selectedDate.setMinutes(minutes);

  const today = new Date();

  if (selectedDate.getDate() < today.getDate()) {
    event.preventDefault();
    alert("Booking date must be today or in the future");
    console.log("1  ");
  }
  //Check if the start time is in the past if the date is today
  if (
    selectedDate.getDate() === today.getDate() && // Check if the selected date is today
    (selectedDate.getHours() < today.getHours() || // Check if the selected hour is before the current hour
      (selectedDate.getHours() === today.getHours() &&
        selectedDate.getMinutes() < today.getMinutes())) // Check if the selected minutes is before the current minutes
  ) {
    event.preventDefault();
    alert("Start time can't be in the past");
  }

  //Check if the end time is greater than the start time
  if (startTime >= endTime) {
    event.preventDefault();
    alert("End time must be greater than start time");
  }
}

function toggleOverlay() {
  //Clear the form values
  bookingDate.value = "";
  bookingStartTime.value = "";
  bookingEndTime.value = "";
  bookingRoom.value = "";
  bookingComments.value = "";

  //Reset the form action
  bookingForm.action = "/bookings";
  bookingOverlay.style.display = "block";
}

function editBooking(booking) {
  console.log(booking);
  return function () {
    bookingDate.value = booking.booking_date;
    bookingStartTime.value = booking.start_time;
    bookingEndTime.value = booking.end_time;
    bookingRoom.value = booking.room_id;
    bookingComments.value = booking.comments;

    bookingOverlay.style.display = "block";
  };
}

window.addEventListener("click", function (event) {
  if (event.target == bookingOverlay) {
    bookingOverlay.style.display = "none";
  }
});
