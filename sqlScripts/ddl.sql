-- Drop all tables
DROP TABLE IF EXISTS EquipmentMaintainance;
DROP TABLE IF EXISTS Equipment;
DROP TABLE IF EXISTS RoomBookings;
DROP TABLE IF EXISTS Rooms;
DROP TABLE IF EXISTS GroupFitnessBookings;
DROP TABLE IF EXISTS GroupFitness;
DROP TABLE IF EXISTS TrainerBookings;
DROP TABLE IF EXISTS TrainerAvailability;
DROP TABLE IF EXISTS Routines;
DROP TABLE IF EXISTS FitnessGoals;
DROP TABLE IF EXISTS MetricGoals;
DROP TABLE IF EXISTS Health_Metrics;
DROP TABLE IF EXISTS Billings;
DROP TABLE IF EXISTS Admins;
DROP TABLE IF EXISTS Trainers;
DROP TABLE IF EXISTS Users;


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


-- Table for Trainers
CREATE TABLE Trainers(
    trainer_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE,
    trainer_cost DECIMAL DEFAULT 40,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

-- Table for Admins
CREATE TABLE Admins(
    admin_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

-- Billing Table
CREATE TABLE Billings(
    billing_id SERIAL PRIMARY KEY,
    user_id INT,
    billing_date DATE DEFAULT CURRENT_DATE,
    billing_amount DECIMAL,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

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

-- Table for Fitness Goal
CREATE TABLE FitnessGoals(
    goal_id SERIAL PRIMARY KEY,
    user_id INT,
	goal_title VARCHAR(255),
    goal_description TEXT,
    status INT DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);


-- Table for Routies
CREATE TABLE Routines(
    routine_id SERIAL PRIMARY KEY,
    user_id INT,
    routine_name VARCHAR(50),
    routine_description TEXT,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

-- Table for trainers availability
CREATE TABLE TrainerAvailability(
    trainer_id INT,
    day_of_week INT,
    start_time TIME,
    end_time TIME,
    FOREIGN KEY(trainer_id) REFERENCES Trainers(trainer_id)
);


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
    FOREIGN KEY(trainer_id) REFERENCES Trainers(trainer_id)
);

-- Sample for Group Fitness


-- Table for Group Fitness Bookings
CREATE TABLE GroupFitnessBookings(
    user_id INT,
    group_id INT,
    billing_id INT,
    FOREIGN KEY(user_id) REFERENCES Users(user_id),
    FOREIGN KEY(group_id) REFERENCES GroupFitness(group_id),
    FOREIGN KEY(billing_id) REFERENCES Billings(billing_id)
);

-- Table for Rooms 
CREATE TABLE Rooms(
    room_id SERIAL PRIMARY KEY,
    room_name VARCHAR(50),
    room_capacity INT
);




-- Table for Room Bookings
CREATE TABLE RoomBookings(
    booking_id SERIAL PRIMARY KEY,
    booking_date DATE,
    start_time TIME,
    end_time TIME,
    booking_comment TEXT,
	room_id INT,
    FOREIGN KEY(room_id) REFERENCES rooms (room_id)
);


-- Table for Equipment
CREATE TABLE Equipment(
    equipment_id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(50),
    equipment_description TEXT
);

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

