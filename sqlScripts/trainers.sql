-- Table for Users
CREATE TABLE Users(
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(9),
    address VARCHAR(50),
    user_type INT DEFAULT 1
);

-- Insertion for users with sample data



-- Table for Trainers
CREATE TABLE Trainers(
    trainer_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE,
    trainer_cost DECIMAL,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

-- Insertion for trainers with sample data


-- Table for Admins
CREATE TABLE Admins(
    admin_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

-- Insertion for admins with sample data


-- Table for Metric 
CREATE TABLE Health_Metrics(
    metric_id SERIAL PRIMARY KEY,
    user_id INT,
    weight DECIMAL,
    body_fat DECIMAL,
    muscle_mass DECIMAL,
    heart_rate INT,
    blood_pressure VARCHAR(10),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

-- Insertion for health metrics with sample data


-- Table for MetricGoal
CREATE TABLE MetricGoals(
    goal_id SERIAL PRIMARY KEY,
    target_weight DECIMAL,
    target_body_fat DECIMAL,
    target_muscle_mass DECIMAL,
    target_heart_rate INT,
    user_id INT,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

-- Insertion for metric goals with sample data

-- Table for Fitness Goal
CREATE TABLE FitnessGoals(
    goal_id SERIAL PRIMARY KEY,
    user_id INT,
	goal_title VARCHAR(255),
    goal_description TEXT,
    status INT DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

-- Insertion for fitness goals with sample data


-- Table for Routies
CREATE TABLE Routines(
    routine_id SERIAL PRIMARY KEY,
    user_id INT,
    routine_name VARCHAR(50),
    routine_description TEXT,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

-- Insertion for routines with sample data
INSERT INTO Routines(user_id, routine_name, routine_description) VALUES(1, 'Cardio Routine', 'Cardio Routine for 30 minutes');
INSERT INTO Routines(user_id, routine_name, routine_description) VALUES(1, 'Strength Routine', 'Strength Routine for 30 minutes');
INSERT INTO Routines(user_id, routine_name, routine_description) VALUES(1, 'Full Body Routine', 'Full Body Routine for 30 minutes');
INSERT INTO Routines(user_id, routine_name, routine_description) VALUES(1, 'Leg Day Routine', 'Leg Day Routine for 30 minutes');
INSERT INTO Routines(user_id, routine_name, routine_description) VALUES(1, 'Upper Body Routine', 'Upper Body Routine for 30 minutes');




-- PostgreSQL table for trainers availability
CREATE TABLE TrainerAvailability(
    trainer_id INT,
    day_of_week INT,
    start_time TIME,
    end_time TIME,
    FOREIGN KEY(trainer_id) REFERENCES Trainers(trainer_id)
);
-- Insertion for trainers availability with sample data
INSERT INTO TrainerAvailability(trainer_id, day_of_week, start_time, end_time) VALUES(1, 1, '09:00:00', '17:00:00');


-- Table for Private Training
CREATE TABLE TrainerBookings(
    training_id SERIAL PRIMARY KEY,
    training_date DATE,
    start_time TIME,
    end_time TIME,
    duration INT,
    trainer_id INT,
    user_id INT,
    training_comment TEXT,
    billing_id INT,
    FOREIGN KEY(trainer_id) REFERENCES Trainers(trainer_id),
    FOREIGN KEY(user_id) REFERENCES Users(user_id),
    FOREIGN KEY(billing_id) REFERENCES Billings(billing_id)
);

-- Insertion for private training with sample data
INSERT INTO TrainerBookings(training_date, start_time, duration, trainer_id, user_id, training_comment) VALUES('2024-04-18', '10:00:00', 60, 1, 2, 'PT Session');

-- Table for Group Fitness
CREATE TABLE GroupFitness(
    group_id SERIAL PRIMARY KEY,
    group_date DATE,
    start_time TIME,
    end_time TIME,
    trainer_id INT,
    duration INT,
    group_cost DECIMAL,
    group_comment TEXT,
    FOREIGN KEY(trainer_id) REFERENCES Trainers(trainer_id),
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

-- Insertion for group fitness with sample data
INSERT INTO GroupFitness(group_date, start_time, end_time, trainer_id, duration, group_cost, group_comment) VALUES('2024-04-18', '10:00:00', '11:00:00', 1, 60, 20, 'Group Fitness Session');

-- Table for UserGroupClass
CREATE TABLE GroupFitnessBookings(
    user_id INT,
    group_id INT,
    billing_id INT,
    FOREIGN KEY(user_id) REFERENCES Users(user_id),
    FOREIGN KEY(group_id) REFERENCES GroupFitness(group_id),
    FOREIGN KEY(billing_id) REFERENCES Billings(billing_id)
);

-- Insertion for user group class with sample data
INSERT INTO GroupFitnessBookings(user_id, group_id) VALUES(1, 1);


-- Table for Rooms 
CREATE TABLE Rooms(
    room_id SERIAL PRIMARY KEY,
    room_name VARCHAR(50),
    room_capacity INT
);

-- Insertion for rooms with sample data
INSERT INTO Rooms(room_name, room_capacity) VALUES('Lanark', 66);
INSERT INTO Rooms(room_name, room_capacity) VALUES('River Building', 1);
INSERT INTO Rooms(room_name, room_capacity) VALUES('UC Center', 30);
INSERT INTO Rooms(room_name, room_capacity) VALUES('Herzerberg Labs', 40);


-- Table for Room Availability
CREATE TABLE RoomBookings(
    booking_id SERIAL PRIMARY KEY,
    booking_date DATE,
    start_time TIME,
    end_time TIME,
    booking_comment TEXT,
	room_id INT,
    FOREIGN KEY(room_id) REFERENCES rooms (room_id)
);

-- Insertion for bookings with sample data
INSERT INTO Bookings(booking_date, start_time, end_time, booking_comment, room_id) VALUES('2021-03-01', '09:00:00', '10:00:00', 'Meeting with the team', 1);
INSERT INTO Bookings(booking_date, start_time, end_time, booking_comment, room_id) VALUES('2021-03-01', '10:00:00', '11:00:00', 'Meeting with the team', 2);
INSERT INTO Bookings(booking_date, start_time, end_time, booking_comment, room_id) VALUES('2021-03-01', '11:00:00', '12:00:00', 'Meeting with the team', 3);
INSERT INTO Bookings(booking_date, start_time, end_time, booking_comment, room_id) VALUES('2021-03-01', '12:00:00', '13:00:00', 'Meeting with the team', 4);


-- Table for Training Sessions
CREATE TABLE TrainingSessions(
    session_id SERIAL PRIMARY KEY,
    session_date DATE,
    start_time TIME,
    end_time TIME,
    trainer_id INT,
    user_id INT,
    session_comment TEXT,
    FOREIGN KEY(trainer_id) REFERENCES Trainers(trainer_id),
    FOREIGN KEY(room_id) REFERENCES Rooms(room_id)
);

-- Insertion for training sessions with sample data with present or future time
INSERT INTO TrainingSessions(session_date, start_time, end_time, trainer_id, user_id, session_comment) VALUES('2024-04-18', '09:00:00', '10:00:00', 1, 1, 'PT Session');
INSERT INTO TrainingSessions(session_date, start_time, end_time, trainer_id, user_id, session_comment) VALUES('2024-04-18', '10:00:00', '11:00:00', 1, 1, 'PT Session');
INSERT INTO TrainingSessions(session_date, start_time, end_time, trainer_id, user_id, session_comment) VALUES('2024-04-18', '11:00:00', '12:00:00', 1, 1, 'PT Session');
INSERT INTO TrainingSessions(session_date, start_time, end_time, trainer_id, user_id, session_comment) VALUES('2024-04-18', '12:00:00', '13:00:00', 1, 1, 'PT Session');


-- Table for Equipment
CREATE TABLE Equipment(
    equipment_id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(50),
    equipment_description TEXT,
);

-- Insertion for equipment with sample data
INSERT INTO Equipment(equipment_name, equipment_description) VALUES('Treadmill', 'Cardio Equipment');
INSERT INTO Equipment(equipment_name, equipment_description) VALUES('Dumbbells', 'Strength Equipment');
INSERT INTO Equipment(equipment_name, equipment_description) VALUES('Bench Press', 'Strength Equipment');
INSERT INTO Equipment(equipment_name, equipment_description) VALUES('Leg Press', 'Strength Equipment');
INSERT INTO Equipment(equipment_name, equipment_description) VALUES('Elliptical', 'Cardio Equipment');
INSERT INTO Equipment(equipment_name, equipment_description) VALUES('Rowing Machine', 'Cardio Equipment');
INSERT INTO Equipment(equipment_name, equipment_description) VALUES('Cable Machine', 'Strength Equipment');
INSERT INTO Equipment(equipment_name, equipment_description) VALUES('Smith Machine', 'Strength Equipment');
INSERT INTO Equipment(equipment_name, equipment_description) VALUES('Stairmaster', 'Cardio Equipment');
INSERT INTO Equipment(equipment_name, equipment_description) VALUES('Spin Bike', 'Cardio Equipment');


--  Table for Equipment Maintainance
CREATE TABLE EquipmentMaintainance(
    maintainance_id SERIAL PRIMARY KEY,
    admin_id INT,
    equipment_id INT,
    isUsable BOOLEAN,
    maintainance_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    maintainance_comment TEXT,
    FOREIGN KEY(equipment_id) REFERENCES Equipment(equipment_id),
    FOREIGN KEY(admin_id) REFERENCES Admins(admin_id)
);


-- Billing Table
CREATE TABLE Billing(
    billing_id SERIAL PRIMARY KEY,
    user_id INT,
    billing_date DATE DEFAULT CURRENT_DATE,
    billing_amount DECIMAL,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

