document.addEventListener("DOMContentLoaded", function () {
  const editButtons = document.querySelectorAll(".edit-button");
  const editPopup = document.getElementById("editPopup");

  editButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const bookingId = button.closest(".booking-box").dataset.bookingId;
      fetchBookingDetails(bookingId);
    });
  });

  // Close the pop-up when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === editPopup) {
      editPopup.style.display = "none";
    }
  });
});

function fetchBookingDetails(bookingId) {
  fetch(`/bookings/${bookingId}`)
    .then((response) => response.json())
    .then((booking) => {
      document.getElementById("customerName").value = booking.customerName;
      document.getElementById("date").value = booking.date;
      document.getElementById("time").value = booking.time;
      document.getElementById("duration").value = booking.duration;
    })
    .catch((error) => console.error("Error loading booking details:", error));
}
