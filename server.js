const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg"); // PostgreSQL client library
const bcrypt = require("bcrypt"); // For password hashing
const session = require("express-session"); // For active session
const Sequelize = require("sequelize");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

//Session Configuration

const sequelize = new Sequelize("gymPlanner", "postgres", "cadmin", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

// Define session model
const Session = sequelize.define("Session", {
  sid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  expires: Sequelize.DATE,
  data: Sequelize.TEXT,
});

//Sysnc  Sequelize models with database
Session.sync()
  .then(() => {
    console.log("All models were synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error during synchronization:", error.message);
  });

//Create the session
const sessionStore = new SequelizeStore({
  db: sequelize,
  table: "Session",
});

app.use(
  session({
    secret: "comp3005-project-lax-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
  })
);

//Middleware
app.use(express.static("public")); //Serves static files from public folder
app.use(express.json()); //Parses JSON data from request body
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public/client")); //Serves static files from public folder
app.set("view engine", "pug"); //Sets view engine to pug

//=== Database Connection ===
const clientDB = new Client({
  host: "localhost",
  user: "postgres",
  database: "gymPlanner",
  password: "cadmin",
  port: 5432,
});

clientDB.connect((err) => {
  if (err) {
    console.error("Connection error", err.stack);
  } else {
    console.log("Connected to database");
  }
});

//Routes
app.get("/", sendHomePage);

// Auth Routes
app.get("/login", sendLoginPage);
app.get("/register", sendRegisterPage);
app.post("/register", registerUser);
app.post("/login", loginUser);
app.get("/logout", logoutUser);

//Dashboard Routes
app.get("/dashboard", sendDashboardPage);

//Profile Routes
app.get("/profile", sendProfilePage);
app.post("/profile", updateProfile);

//Metrics & Goals Routes
app.get("/metrics", sendMetricsPage);
app.post("/metrics", updateMetrics);

//Routines
app.get("/routines", sendRoutinesPage);
app.post("/routines", createRoutine);
app.post("/routine/:id", updateRoutine);
app.delete("/routines/:id", deleteRoutine);

//Goals
app.get("/goals", sendGoalsPage);
app.post("/goals", createFitnessGoals);
app.post("/metricGoal", updateMetricGoals);

//User Achievements
app.get("/achievements", sendUserAchievementsPage);

//Health Stat
app.get("/health", (req, res) => {
  res.render("healthStatPage");
});

app.get("/heathStatChart", sendHealthChart);

//Trainer Schedule
app.get("/schedule", sendTrainerSchedulePage);
app.post("/schedule", updateTrainerSchedule);

//Trainer Booking
app.get("/training", sendTrainingPage);
app.post("/training", createTrainingBooking);
app.post("/training/:id", updateTrainingBooking);
app.delete("/training/:id", deleteTrainingBooking);

//Group Fitness Bookings
app.get("/groupFitness", sendGroupFitnessPage);
// app.post("/groupFitness", createGroupFitnessBooking);
app.post("/groupFitness/:id", registerGroupFitnessBooking);
app.delete("/groupFitness/:id", deleteGroupFitnessBooking);
// app.delete("/groupFitness/:id", deleteGroupFitnessBooking);

//Room Booking
app.get("/bookings", sendRoomBookingPage);
app.post("/bookings", submitRoomBooking);
app.post("/bookings/:id", updateRoomBooking);
app.delete("/bookings/:id", deleteRoomBooking);

//Equipment Maintenance
app.get("/equipment", sendEquipmentPage);
app.post("/maintenance/:id", updateEquipmentMaintainance);

//Test Page
app.get("/test", sendTestPage);

function sendTestPage(req, res) {
  res.render("testPage");
}

//Member search stuff
app.get("/usersearch", (req, res) => {
  res.render("userSearchPage");
});

// app.post("/updateUser", updateUserProfile);

app.get("/search", async (req, res) => {
  if (!req.query.query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }
  const query = req.query.query.trim();

  try {
    // Query PostgreSQL database for members
    const queryText = `
      SELECT first_name, last_name 
      FROM users 
      WHERE LOWER(first_name) LIKE LOWER($1)
    `;
    const result = await clientDB.query(queryText, [`%${query}%`]);

    // Send search results as JSON response
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing database query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Functions
function sendHomePage(req, res) {
  res.render("homePage");
}

function sendLoginPage(req, res) {
  if (req.session.user) {
    return res.status(403).redirect("/dashboard");
  }

  const { error } = req.query; // Check if an error occurred during login
  res.render("loginPage", { error });
}

function sendRegisterPage(req, res) {
  if (req.session.user) {
    return res.status(403).send("Forbidden: You are already logged in.");
  }
  res.render("registerPage");
}

function sendDashboardPage(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }
  res.render("dashboardPage", { user: req.session.user });
}

function sendProfilePage(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }
  res.render("profilePage", { user: req.session.user });
}

function sendMetricsPage(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }
  res.render("metricsPage");
}

async function sendRoutinesPage(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }
  let sqlQuery = "SELECT * FROM routines WHERE user_id = $1";
  const result = await clientDB.query(sqlQuery, [req.session.user.user_id]);

  res.render("routinesPage", {
    routines: result.rows,
  });
}

async function sendTrainingPage(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  //Query to get the users bookings & trainer's name
  let sqlQuery =
    "SELECT tb.*, tu.first_name AS trainer_first_name, tu.last_name AS trainer_last_name FROM TrainerBookings tb INNER JOIN Trainers t on tb.trainer_id = t.trainer_id INNER JOIN Users tu ON t.user_id = tu.user_id  WHERE tb.user_id = $1 AND tb.training_date >= CURRENT_DATE ORDER BY tb.training_date ASC, tb.start_time ASC";

  // let query2 =
  //   "SELECT * FROM TrainerBookings WHERE user_id = $1 AND training_date >= CURRENT_DATE ORDER BY training_date ASC, start_time ASC";

  // let result2 = await clientDB.query(query2, [req.session.user.user_id]);

  let bookings = await clientDB.query(sqlQuery, [req.session.user.user_id]);
  let trainers = await clientDB.query(
    "SELECT trainers.*, users.first_name, users.last_name FROM trainers INNER JOIN users ON trainers.user_id = users.user_id"
  );

  res.render("trainingPage", {
    bookings: bookings.rows,
    trainers: trainers.rows,
  });
}

async function sendTrainerSchedulePage(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  if (!req.session.user.isTrainer) {
    return res.status(403).send("Forbidden: You are not a trainer.");
  }

  //Query to get the trainer's bookings & clients names
  let sqlQuery =
    "SELECT tb.*, u.first_name, u.last_name FROM TrainerBookings tb INNER JOIN users u on tb.user_id = u.user_id WHERE tb.trainer_id = $1 AND tb.training_date >= CURRENT_DATE ORDER BY tb.training_date ASC, tb.start_time ASC";

  let bookings = await clientDB.query(sqlQuery, [req.session.user.trainer_id]);

  //Get trainer's trainer id
  let sqlQuery2 = "SELECT trainer_id FROM trainers WHERE user_id = $1";
  let trainerId = await clientDB.query(sqlQuery2, [req.session.user.user_id]);

  let availability = await clientDB.query(
    "SELECT * FROM TrainerAvailability where trainer_id = $1",
    [trainerId.rows[0].trainer_id]
  );

  res.render("trainersSchedule", {
    bookings: bookings.rows,
    schedule: availability.rows,
  });
}

//TO DO: Check if user is admin
async function sendRoomBookingPage(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }
  const sqlQuery = "SELECT * FROM Rooms";
  const result = await clientDB.query(sqlQuery);
  const availableRooms = result.rows;

  const bookingsQuery =
    "SELECT * FROM RoomBookings WHERE booking_date > CURRENT_DATE ORDER BY booking_date ASC, start_time ASC";
  const bookingsResult = await clientDB.query(bookingsQuery);
  const bookings = bookingsResult.rows;

  res.render("roomBooking", { availableRooms, bookings });
}

async function sendGoalsPage(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const metricGoalsQuery = "SELECT * FROM MetricGoals WHERE user_id = $1";
  const metricGoalsResult = await clientDB.query(metricGoalsQuery, [
    req.session.user.user_id,
  ]);

  const fitnessGoalsQuery =
    "SELECT * FROM FitnessGoals WHERE user_id = $1 AND status = 0";
  const fitnessGoalsResult = await clientDB.query(fitnessGoalsQuery, [
    req.session.user.user_id,
  ]);

  // console.log(metricGoalsResult.rows[0]);

  res.render("goalsPage", {
    metricGoal: metricGoalsResult.rows[0],
    fitnessGoals: fitnessGoalsResult.rows,
  });
}

async function sendUserAchievementsPage(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  //Get the user metrics
  const userProgress = await getUserMetrics(req.session.user.user_id);

  res.render("userAchievementsPage", {
    progress: userProgress.progress,
    fitnessGoals: userProgress.fitnessGoals,
  });
}

async function sendEquipmentPage(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  let sqlQuery = "SELECT * FROM Equipment";
  const result = await clientDB.query(sqlQuery);
  res.render("equipmentPage", { equipments: result.rows });
}

//Function to render group fitness page & data
async function sendGroupFitnessPage(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  //Get list of group fitness classes & the trainer name associated with each class
  let sqlQuery =
    "SELECT gf.*, u.first_name as trainer_first_name, u.last_name as trainer_last_name FROM GroupFitness gf INNER JOIN Trainers t ON gf.trainer_id = t.trainer_id INNER JOIN Users u ON t.user_id = u.user_id ORDER BY gf.group_date ASC, gf.start_time ASC";
  const result = await clientDB.query(sqlQuery);

  // //Get users bookings for group fitness classes
  let bookingQuery = "SELECT * FROM GroupFitnessBookings WHERE user_id = $1";

  const userBookings = await clientDB.query(bookingQuery, [
    req.session.user.user_id,
  ]);

  let trainersQuery =
    "SELECT t.*, u.first_name, u.last_name FROM Trainers t INNER JOIN Users u on t.user_id = u.user_id";

  let trainersData = await clientDB.query(trainersQuery);

  console.log(result.rows);
  console.log(userBookings.rows);

  res.render("groupFitnessPage", {
    classes: result.rows,
    userBookings: userBookings.rows,
    isAdmin: req.session.user.isAdmin,
    trainers: trainersData.rows,
  });
}

async function registerUser(req, res) {
  console.log(req.body);
  const { first_name, last_name, email, password, phone, address } = req.body;
  try {
    // Check if user email already exists
    const result = await clientDB.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length > 0) {
      // return res.status(409).send("Email already exists");
      return res.redirect("/register?error=true");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    await clientDB.query(
      "INSERT INTO users (first_name,last_name, email, password, phone, address) VALUES ($1, $2, $3, $4, $5, $6)",
      [first_name, last_name, email, hashedPassword, phone, address]
    );

    console.log("User registered successfully");

    // Redirect to login page after successful registration
    res.redirect("/login");
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

// Function to handle user login
async function loginUser(req, res) {
  if (req.session.user) {
    console.log("Hello");
    return res.redirect("/dashboard");
  }

  const { email, password } = req.body;

  try {
    // Check if user exists in the database
    const result = await clientDB.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    // If user not found, redirect back to login page
    if (!result.rows[0]) {
      console.log("User not found");
      return res.redirect("/login?error=true");
    }

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(
      password,
      result.rows[0].password
    );

    // If passwords match, redirect to dashboard or homepage
    if (passwordMatch) {
      //Create user object
      const user = {
        user_id: result.rows[0].user_id,
        first_name: result.rows[0].first_name,
        last_name: result.rows[0].last_name,
        email: result.rows[0].email,
        phone: result.rows[0].phone,
        address: result.rows[0].address,
      };

      //Check if user is admin or a trainer in respective tables
      const adminResult = await clientDB.query(
        "SELECT * FROM admins WHERE user_id = $1",
        [user.user_id]
      );

      const trainerResult = await clientDB.query(
        "SELECT * FROM trainers WHERE user_id = $1",
        [user.user_id]
      );

      if (adminResult.rows.length > 0) {
        user.isAdmin = true;
        user.admin_id = adminResult.rows[0].admin_id;
      } else {
        user.isAdmin = false;
      }

      if (trainerResult.rows.length > 0) {
        user.isTrainer = true;
        user.trainer_id = trainerResult.rows[0].trainer_id;
      } else {
        user.isTrainer = false;
      }
      req.session.user = user;
      req.session.isLoggedIn = true;
      console.log(req.session.user.isAdmin);

      return res.redirect("/dashboard");
    } else {
      // If passwords don't match, redirect back to login page
      return res.redirect("/login?error=true");
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

//Function to logout user and destroy session
async function logoutUser(req, res) {
  try {
    req.session.destroy();

    await Session.destroy({ where: { sid: req.sessionID } });

    res.redirect("/");
  } catch (error) {
    console.error("Error during logout:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

//Function to update user profile
async function updateProfile(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const { first_name, last_name, password, email, address, phone } = req.body;
  const { user } = req.session;

  try {
    // Check if user email already exists
    const result = await clientDB.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length > 0 && result.rows[0].email !== user.email) {
      return res.status(409).send("Email already exists");
    }

    //Setup the sql query for update
    let sqlQuery = "UPDATE users SET";
    const values = [];
    let index = 1;

    //Check if username is provided
    if (first_name) {
      sqlQuery += ` first_name = $${index}`;
      values.push(first_name);
      index++;
    }

    //Check if last name is provided
    if (last_name) {
      sqlQuery += `, last_name = $${index}`;
      values.push(last_name);
      index++;
    }

    //Check if password is provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sqlQuery += `, password = $${index}`;
      values.push(hashedPassword);
      index++;
    }

    //Check if email is provided
    if (email) {
      sqlQuery += `, email = $${index}`;
      values.push(email);
      index++;
    }

    //Check if address is provided
    if (address) {
      sqlQuery += `, address = $${index}`;
      values.push(address);
      index++;
    }

    //Check if phone is provided
    if (phone) {
      sqlQuery += `, phone = $${index}`;
      values.push(phone);
      index++;
    }

    //Add the where clause
    sqlQuery += ` WHERE user_id = $${index}`;
    values.push(user.user_id);

    console.log(sqlQuery);
    console.log(values);

    //Update the user profile
    await clientDB.query(sqlQuery, values);
    console.log("User profile updated successfully");

    //Update the session user object
    req.session.user = {
      user_id: user.user_id,
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      email: email || user.email,
      phone: phone || user.phone,
      address: address || user.address,
    };

    // Redirect to profile page after successful update
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error during profile update:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

//Functions to update health metrics of users
async function updateMetrics(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const { weight, bodyFat, muscleMass, heartRate, bloodPressure } = req.body;
  console.log(bloodPressure);
  const { user } = req.session;

  try {
    // Setup the SQL query for INSERT
    let sqlQuery = "INSERT INTO health_metrics (";
    let placeholders = "";
    const values = [];

    // Check if weight is provided
    if (weight) {
      sqlQuery += "weight";
      placeholders += "$" + (values.length + 1) + ", ";
      values.push(weight);
    }

    // Check if body fat is provided
    if (bodyFat) {
      sqlQuery += ", body_fat";
      placeholders += "$" + (values.length + 1) + ", ";
      values.push(bodyFat);
    }

    // Check if muscle mass is provided
    if (muscleMass) {
      sqlQuery += ", muscle_mass";
      placeholders += "$" + (values.length + 1) + ", ";
      values.push(muscleMass);
    }

    // Check if heart rate is provided
    if (heartRate) {
      sqlQuery += ", heart_rate";
      placeholders += "$" + (values.length + 1) + ", ";
      values.push(heartRate);
    }

    // Check if blood pressure is provided
    if (bloodPressure) {
      sqlQuery += ", blood_pressure";
      placeholders += "$" + (values.length + 1) + ", ";
      values.push(bloodPressure);
    }

    // Remove trailing comma and space from the columns list
    // sqlQuery = sqlQuery.replace(/, $/, "");

    // Add the user_id column and VALUES placeholders
    sqlQuery +=
      ", user_id) VALUES (" + placeholders + "$" + (values.length + 1) + ")";
    values.push(user.user_id);

    console.log(sqlQuery);

    // Execute the INSERT query
    await clientDB.query(sqlQuery, values);

    console.log("Data inserted successfully.");

    // Redirect to metrics page after successful update
    res.status(200).redirect("/dashboard");
  } catch (error) {
    console.error("Error during metrics update:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

async function submitRoomBooking(req, res) {
  //Check if user is admin
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const { booking_date, start_time, end_time, room_id, booking_comment } =
    req.body;

  // We check if the room booked has already been booked for the same date and time
  const queryText = `
    SELECT * FROM RoomBookings WHERE room_id = $1 AND booking_date = $2 AND start_time < $3  AND end_time > $4
  `;
  const result = await clientDB.query(queryText, [
    room_id,
    booking_date,
    end_time,
    start_time,
  ]);
  console.log(result.rows.length);

  if (result.rows.length > 0) {
    return res.status(409).send("Room already booked for the selected time");
  } else {
    //Insert the booking into the database
    await clientDB.query(
      "INSERT INTO RoomBookings (booking_date, start_time, end_time, booking_comment, room_id) VALUES ($1, $2, $3, $4, $5)",
      [booking_date, start_time, end_time, booking_comment, room_id]
    );
  }
  res.status(200).redirect("/bookings");
}

//Function to delete room booking
async function deleteRoomBooking(req, res) {
  //Check if user is admin
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const bookingId = req.params.id;
  console.log(bookingId);
  //Delete the booking from the database
  await clientDB.query("DELETE FROM RoomBookings WHERE booking_id = $1", [
    bookingId,
  ]);

  res.status(200).send("Booking deleted successfully");
}

async function updateRoomBooking(req, res) {
  //Check if user is admin
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  console.log(req.body);

  const { booking_date, start_time, end_time, room_id, booking_comment } =
    req.body;
  const bookingId = req.params.id;

  //CHeck if the room is already booked for the selected time
  const queryText = `
    SELECT * FROM RoomBookings WHERE booking_id != $5 AND room_id = $1 AND booking_date = $2 AND start_time < $3  AND end_time > $4
  `;
  const result = await clientDB.query(queryText, [
    room_id,
    booking_date,
    end_time,
    start_time,
    bookingId,
  ]);

  if (result.rows.length > 0) {
    return res.status(409).send("Room already booked for the selected time");
  }

  //Update the booking in the database
  await clientDB.query(
    "UPDATE RoomBookings SET booking_date = $1, start_time = $2, end_time = $3, booking_comment = $4, room_id = $5 WHERE booking_id = $6",
    [booking_date, start_time, end_time, booking_comment, room_id, bookingId]
  );

  res.status(200).redirect("/bookings");
}

//Function to update user metric goals
async function updateMetricGoals(req, res) {
  // console.log(req.session.loggedIn);
  //Check if user is logged in
  if (!req.session.isLoggedIn) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const { weight, bodyFat, muscleMass, heartRate, bloodPressure } = req.body;

  //check if user has a goal already
  let goalQuery = "SELECT * FROM MetricGoals WHERE user_id = $1";
  let goalResult = await clientDB.query(goalQuery, [req.session.user.user_id]);

  if (goalResult.rows.length > 0) {
    //If user has a goal already, update the goal
    let sqlQuery = "UPDATE MetricGoals SET";
    const values = [];

    if (weight) {
      sqlQuery += " target_weight = $" + (values.length + 1);
      values.push(weight);
    }
    if (bodyFat) {
      sqlQuery += ", target_body_fat = $" + (values.length + 1);
      values.push(bodyFat);
    }

    if (muscleMass) {
      sqlQuery += ", target_muscle_mass = $" + (values.length + 1);
      values.push(muscleMass);
    }

    if (heartRate) {
      sqlQuery += ", target_heart_rate = $" + (values.length + 1);
      values.push(heartRate);
    }
    if (bloodPressure) {
      sqlQuery += ", target_blood_pressure = $" + (values.length + 1);
      values.push(bloodPressure);
    }

    sqlQuery += " WHERE user_id = $" + (values.length + 1);
    values.push(req.session.user.user_id);

    await clientDB.query(sqlQuery, values);

    res.status(200).send("Goal updated successfully");
  } else {
    let sqlQuery = "INSERT INTO MetricGoals (user_id";
    let placeholders = "VALUES ($1";
    const values = [req.session.user.user_id];

    if (weight) {
      sqlQuery += ", target_weight";
      placeholders += ", $" + (values.length + 1);
      values.push(weight);
    }
    if (bodyFat) {
      sqlQuery += ", target_body_fat";
      placeholders += ", $" + (values.length + 1);
      values.push(bodyFat);
    }
    if (muscleMass) {
      sqlQuery += ", target_muscle_mass";
      placeholders += ", $" + (values.length + 1);
      values.push(muscleMass);
    }
    if (heartRate) {
      sqlQuery += ", target_heart_rate";
      placeholders += ", $" + (values.length + 1);
      values.push(heartRate);
    }
    if (bloodPressure) {
      sqlQuery += ", target_blood_pressure";
      placeholders += ", $" + (values.length + 1);
      values.push(bloodPressure);
    }

    sqlQuery += ") " + placeholders + ")";
    await clientDB.query(sqlQuery, values);
    res.status(200).send("Goal created successfully");
  }
}

//Function to update user fitness goals{
async function createFitnessGoals(req, res) {
  if (!req.session.isLoggedIn) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const { goal_title, goal_description } = req.body;

  let sqlQuery =
    "INSERT INTO FitnessGoals (user_id, goal_title) VALUES ($1, $2)";
  const values = [req.session.user.user_id, goal_title];

  if (goal_description) {
    sqlQuery =
      "INSERT INTO FitnessGoals (user_id, goal_title, goal_description) VALUES ($1, $2, $3)";
    values.push(goal_description);
  }
  await clientDB.query(sqlQuery, values);
  res.status(200).send("Goal created successfully");

  //TO DO ====
  // console.log(req.body);

  // let goal_id = 1;

  //Check if user has a goal already
  // let goalQuery = "SELECT * FROM FitnessGoals WHERE goal_id = $1";
  // let goalResult = await clientDB.query(goalQuery, goal_id);

  // if (goalResult.rows.length > 0) {
  //   //If user has a goal already, update the goal
  //   let sqlQuery = "UPDATE FitnessGoals SET goal = $2 WHERE user_id = $1";
  //   const values = [];
  //   values.push(req.session.user.user_id);
  //   values.push(goal_title);
  //   if (goal_description) {
  //     sqlQuery =
  //       "UPDATE FitnessGoals SET goal = $2, goal_description = $3 WHERE user_id = $1";
  //     values.push(goal_description);
  //   }

  //   console.log(sqlQuery);
  //   // await clientDB.query(sqlQuery, [goal, req.session.user.user_id]);
  //   res.status(200).send("Goal updated successfully");
  // } else {
  //   console.log("Creating new goal");

  //   let sqlQuery =
  //     "INSERT INTO FitnessGoals (user_id, goal_title) VALUES ($1, $2)";
  //   const values = [];
  //   values.push(req.session.user.user_id);
  //   values.push(goal_title);

  //   console.log("222")

  //   if (goal_description) {
  //     sqlQuery =
  //       "INSERT INTO FitnessGoals (user_id, goal_title, goal_description) VALUES ($1, $2, $3)";
  //     values.push(goal_description);
  //   }
  //   console.log(sqlQuery);
  //   console.log(values);
  //   await clientDB.query(sqlQuery, values);
  //   res.status(200).send("Goal created successfully");
  // }
}

//Function to send health chart
async function sendHealthChart(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  try {
    let type = req.query.type;
    console.log(type);

    const user_id = req.session.user.user_id;
    const queryText = `SELECT * FROM health_metrics WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 7`;
    const result = await clientDB.query(queryText, [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).send("No data found");
    }
    const data = result.rows;

    let extractedData = extractDataByKey(data, [type, "recorded_at"]);

    const labels = extractedData.map((entry) => {
      var date = new Date(entry.recorded_at);
      return date.toLocaleDateString();
      // return entry.recorded_at;
    });

    const values = extractedData.map((entry) => {
      return entry[type];
    });

    console.log(labels);
    console.log(values);

    const dataLabel = getLabel(type);

    // res.json(data);
    res.render("healthStatChart", { labels, values, dataLabel });
  } catch (error) {
    console.error("Error during health chart generation:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

//Function to update equipment maintenance
async function updateEquipmentMaintainance(req, res) {
  //Check if user is admin
  // if (!req.session.user.isAdmin) {
  //   return res.status(403).send("Forbidden: You are not logged in.");
  // }

  const { equipment_status, maintainance_comment } = req.body;

  let actualStatus = equipment_status == 1 ? true : false;

  //Update the Equipment Maintencane
  let sqlQuery =
    "INSERT INTO EquipmentMaintainance (admin_id, equipment_id, isUsable, maintainance_comment) VALUES ($1, $2, $3, $4)";

  await clientDB.query(sqlQuery, [
    req.session.user.admin_id,
    req.params.id,
    actualStatus,
    maintainance_comment,
  ]);

  res.send("Equipment maintenance updated successfully");
}

async function createRoutine(req, res) {
  if (!req.session.isLoggedIn) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const { routine_name, routine_description } = req.body;
  console.log(req.body);
  let sqlQuery =
    "INSERT INTO routines (user_id, routine_name, routine_description) VALUES ($1, $2, $3)";

  let values = [req.session.user.user_id, routine_name, routine_description];

  await clientDB.query(sqlQuery, values);

  res.status(200).redirect("/routines");
}

async function updateRoutine(req, res) {
  if (!req.session.isLoggedIn) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const { routine_name, routine_description } = req.body;
  const routineId = req.params.id;

  //Check if the routine belongs to the user
  const checkQuery =
    "SELECT * FROM routines WHERE routine_id = $1 AND user_id = $2";
  const checkResult = await clientDB.query(checkQuery, [
    routineId,
    req.session.user.user_id,
  ]);

  if (checkResult.rows.length === 0) {
    return res
      .status(403)
      .send("Forbidden: You are not authorized to update this routine.");
  }

  //Update the routine
  let sqlQuery =
    "UPDATE routines SET routine_name = $1, routine_description = $2 WHERE routine_id = $3";
  await clientDB.query(sqlQuery, [
    routine_name,
    routine_description,
    routineId,
  ]);

  res.status(200).redirect("/routines");
}

async function deleteRoutine(req, res) {
  if (!req.session.isLoggedIn) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const routineId = req.params.id;

  await clientDB.query(
    "DELETE FROM routines WHERE routine_id = $1 AND user_id = $2",
    [routineId, req.session.user.user_id]
  );

  res.status(200).send("Routine deleted successfully");
}

async function updateTrainerSchedule(req, res) {
  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  if (!req.session.user.isTrainer) {
    return res.status(403).send("Forbidden: You are not a trainer.");
  }

  console.log(req.body);

  const { day_of_week, start_time, end_time } = req.body;

  //Check if the trainer has already set availability for the day
  const checkQuery =
    "SELECT * FROM TrainerAvailability WHERE trainer_id = $1 AND day_of_week = $2";
  const checkResult = await clientDB.query(checkQuery, [
    req.session.user.trainer_id,
    day_of_week,
  ]);

  if (checkResult.rows.length > 0) {
    //Update the availability
    await clientDB.query(
      "UPDATE TrainerAvailability SET start_time = $1, end_time = $2 WHERE trainer_id = $3 AND day_of_week = $4",
      [start_time, end_time, req.session.user.trainer_id, day_of_week]
    );
  } else {
    //Insert the availability
    await clientDB.query(
      "INSERT INTO TrainerAvailability (trainer_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)",
      [req.session.user.trainer_id, day_of_week, start_time, end_time]
    );
  }

  res.status(200).redirect("/schedule");
}

async function createTrainingBooking(req, res) {
  console.log("CHECK CECI");
  console.log(req.body);

  if (!req.session.user) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const {
    day_of_week,
    training_date,
    start_time,
    end_time,
    trainer_id,
    duration,
    comments,
  } = req.body;

  //Check if the trainer is available
  const checkQuery =
    "SELECT * FROM TrainerAvailability WHERE trainer_id = $1 AND day_of_week = $2 AND start_time <= $3 AND end_time >= $4";
  const checkResult = await clientDB.query(checkQuery, [
    trainer_id,
    day_of_week,
    end_time,
    start_time,
  ]);

  // console.log(checkResult.rows);

  if (checkResult.rows.length === 0) {
    return res
      .status(409)
      .send("Trainer is not available on the selected day/time");
  }

  //Check if the trainer is already booked for the selected time
  const bookingQuery =
    "SELECT * FROM TrainerBookings WHERE trainer_id = $1 AND training_date = $2 AND start_time < $3 AND end_time > $4";
  const bookingResult = await clientDB.query(bookingQuery, [
    trainer_id,
    training_date,
    end_time,
    start_time,
  ]);

  if (bookingResult.rows.length > 0) {
    return res.status(409).send("Trainer already booked for the selected time");
  }

  //Insert the booking into the database
  await clientDB.query(
    "INSERT INTO TrainerBookings (user_id, trainer_id, training_date, start_time, end_time, duration, training_comment) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      req.session.user.user_id,
      trainer_id,
      training_date,
      start_time,
      end_time,
      duration,
      comments,
    ]
  );

  res.send(200);
}

async function updateTrainingBooking(req, res) {
  if (!req.session.isLoggedIn) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  let training_id = req.params.id;
  console.log(training_id);

  //Check if the booking belongs to the user
  const checkQuery =
    "SELECT * FROM TrainerBookings WHERE training_id = $1 AND user_id = $2";

  const checkResult = await clientDB.query(checkQuery, [
    training_id,
    req.session.user.user_id,
  ]);

  if (checkResult.rows.length === 0) {
    return res
      .status(403)
      .send("Forbidden: You are not authorized to update this booking.");
  }

  const {
    day_of_week,
    training_date,
    start_time,
    end_time,
    trainer_id,
    duration,
    comments,
  } = req.body;

  //Check if the trainer is available
  const availabilityQuery =
    "SELECT * FROM TrainerAvailability WHERE trainer_id = $1 AND day_of_week = $2 AND start_time <= $3 AND end_time >= $4";
  const availabilityResult = await clientDB.query(availabilityQuery, [
    trainer_id,
    day_of_week,
    end_time,
    start_time,
  ]);

  if (availabilityResult.rows.length === 0) {
    return res
      .status(409)
      .send("Trainer is not available on the selected day/time");
  }

  //Check if the trainer is already booked and current booking is not considered
  const bookingQuery =
    "SELECT * FROM TrainerBookings WHERE trainer_id = $1 AND training_date = $2 AND start_time < $3 AND end_time > $4 AND training_id != $5";

  // const bookingQuery =
  //   "SELECT * FROM TrainerBookings WHERE trainer_id = $1 AND training_date = $2 AND start_time < $3 AND end_time > $4 AND training_id != $5";

  const bookingResult = await clientDB.query(bookingQuery, [
    trainer_id,
    training_date,
    end_time,
    start_time,
    training_id,
  ]);

  console.log(bookingResult.rows);
  if (bookingResult.rows.length > 0) {
    return res.status(409).send("Trainer already booked for the selected time");
  }

  //Update the booking in the database
  await clientDB.query(
    "UPDATE TrainerBookings SET training_date = $1, start_time = $2, end_time = $3, duration = $4, training_comment = $5 WHERE training_id = $6",
    [training_date, start_time, end_time, duration, comments, training_id]
  );

  res.send(200);
}

async function deleteTrainingBooking(req, res) {
  if (!req.session.isLoggedIn) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const training_id = req.params.id;
  //Check if the booking belongs to the user
  const checkQuery =
    "SELECT * FROM TrainerBookings WHERE training_id = $1 AND user_id = $2";

  const checkResult = await clientDB.query(checkQuery, [
    training_id,
    req.session.user.user_id,
  ]);

  if (checkResult.rows.length === 0) {
    return res
      .status(403)
      .send("Forbidden: You are not authorized to delete this booking.");
  }

  //Delete the booking from the database
  await clientDB.query(
    "DELETE FROM TrainerBookings WHERE training_id = $1 AND user_id = $2",
    [training_id, req.session.user.user_id]
  );

  res.status(200).send("Booking deleted successfully");
}

async function registerGroupFitnessBooking(req, res) {
  if (!req.session.isLoggedIn) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const group_id = req.params.id;
  const user_id = req.session.user.user_id;

  //get the group fitness class
  let groupQuery = "SELECT * FROM GroupFitness WHERE group_id = $1";
  let groupResult = await clientDB.query(groupQuery, [group_id]);

  let group = groupResult.rows[0];

  //Create Billing & return the billling_id
  let billingQuery =
    "INSERT INTO Billings (user_id, billing_amount) VALUES ($1, $2) RETURNING billing_id";
  let billingResult = await clientDB.query(billingQuery, [
    user_id,
    group.group_cost,
  ]);

  let billing_id = billingResult.rows[0].billing_id;

  let sqlQuery =
    "INSERT INTO GroupFitnessBookings (user_id, group_id, billing_id) VALUES ($1, $2, $3)";

  await clientDB.query(sqlQuery, [user_id, group_id, billing_id]);

  res.status(200).send("Booking created successfully");
}

async function deleteGroupFitnessBooking(req, res) {
  if (!req.session.isLoggedIn) {
    return res.status(403).send("Forbidden: You are not logged in.");
  }

  const group_id = req.params.id;
  const user_id = req.session.user.user_id;

  //Get billing_id for the booking
  let sqlQuery =
    "DELETE FROM GroupFitnessBookings WHERE user_id = $1 AND group_id = $2 RETURNING billing_id";

  let billing_id = await clientDB.query(sqlQuery, [user_id, group_id]);

  //Delete the billing record
  await clientDB.query("DELETE FROM Billings WHERE billing_id = $1", [
    billing_id.rows[0].billing_id,
  ]);

  res.status(200).send("Booking deleted successfully");
}

//Helper Functions

//FUnction to extract and send user's achievements
async function getUserMetrics(user_id) {
  const queryText = `
    SELECT * FROM health_metrics WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 1
  `;
  const curResults = await clientDB.query(queryText, [user_id]);

  //Get the goal metrics
  const goalQuery = "SELECT * FROM MetricGoals WHERE user_id = $1";
  const goalResult = await clientDB.query(goalQuery, [user_id]);

  //Get fitness goals
  const fitnessGoalQuery =
    "SELECT * FROM FitnessGoals WHERE user_id = $1 AND status = $2";
  const fitnessGoalResult = await clientDB.query(fitnessGoalQuery, [
    user_id,
    1,
  ]);

  let curStats = curResults.rows[0];
  let goalStats = goalResult.rows[0];
  let fitnessGoals = fitnessGoalResult.rows;

  //Format the actual progress for each metrics
  let progress = {};
  if (curStats && goalStats) {
    //Calculate the progress for each metric goal
    //For weight
    let curStat = curStats.weight;
    let targetStat = goalStats.target_weight;
    progress.weight = `You are ${((targetStat / curStat) * 100).toFixed(
      2
    )}% towards completing your weight goal.`;

    curStat = curStats.body_fat;
    targetStat = goalStats.target_body_fat;
    progress.body_fat = `You are ${((targetStat / curStat) * 100).toFixed(
      2
    )}% towards completeing your body fat goal.`;

    curStat = curStats.muscle_mass;
    targetStat = goalStats.target_muscle_mass;
    progress.muscle_mass = `You are ${((curStat / targetStat) * 100).toFixed(
      2
    )}% towards completing your muscle mass goal.`;

    curStat = curStats.heart_rate;
    targetStat = goalStats.target_heart_rate;
    progress.heart_rate = `You are ${((targetStat / curStat) * 100).toFixed(
      2
    )}% towards completing your heart rate goal.`;
  }

  return { progress, fitnessGoals };
}

//Function to help extract data for health statistic charts
function extractDataByKey(data, keys) {
  let extractedData = data.map((entry) => {
    const extractedEntry = {};
    keys.forEach((key) => {
      if (entry.hasOwnProperty(key)) {
        extractedEntry[key] = entry[key];
      }
    });
    return extractedEntry;
  });

  return extractedData.sort((a, b) => {
    return new Date(a.recorded_at) - new Date(b.recorded_at);
  });
}

function getLabel(type) {
  let label = "";
  switch (type) {
    case "weight":
      label = "Weight (kg)";
      break;
    case "body_fat":
      label = "Body Fat (%)";
      break;
    case "muscle_mass":
      label = "Muscle Mass (kg)";
      break;
    case "heart_rate":
      label = "Heart Rate (bpm)";
      break;
    case "blood_pressure":
      label = "Blood Pressure (mmHg)";
      break;
    default:
      label = "Health Stat";
  }

  return label;
}

// ===START THE SERVER ====
app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
