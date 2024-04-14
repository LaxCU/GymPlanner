
-- Sample Data for Users Table
-- Password is 123 for all users
-- Sample data for Users table
-- Trainers: 3, 4
-- Admins: 5
INSERT INTO Users (first_name, last_name, email, password, phone, address)
VALUES
('John', 'Doe', 'john.doe@example.com', '$2b$10$ugiVR1S.GfAr3Dbj9TBZ1OzQl8oU78x7OIGQgru0QArtQNBVx53uG', '123456789', '123 Main St'),
('Jane', 'Smith', 'jane.smith@example.com', '$2b$10$ugiVR1S.GfAr3Dbj9TBZ1OzQl8oU78x7OIGQgru0QArtQNBVx53uG', '987654321', '456 Oak Ave'),
('Michael', 'Johnson', 'michael.johnson@example.com', '$2b$10$ugiVR1S.GfAr3Dbj9TBZ1OzQl8oU78x7OIGQgru0QArtQNBVx53uG', '456123789', '789 Elm St'),
('Emily', 'Brown', 'emily.brown@example.com', '$2b$10$ugiVR1S.GfAr3Dbj9TBZ1OzQl8oU78x7OIGQgru0QArtQNBVx53uG', '789456123', '987 Pine Ave'),
('David', 'Taylor', 'david.taylor@example.com', '$2b$10$ugiVR1S.GfAr3Dbj9TBZ1OzQl8oU78x7OIGQgru0QArtQNBVx53uG', '321654987', '654 Cedar St');


-- Sample data for Trainers table
INSERT INTO Trainers (user_id, trainer_cost)
VALUES
(3, 55), -- Michael Johnson
(4, 65); -- Emily Brown

-- Sample data for Admins table
INSERT INTO Admins (user_id)
VALUES
(5); -- David Taylor

-- Sample data for Health_Metrics table
INSERT INTO Health_Metrics (user_id, weight, body_fat, muscle_mass, heart_rate, blood_pressure)
VALUES
(1, 75.5, 20.0, 45.0, 70, '120/80'),
(2, 65.0, 18.5, 40.0, 65, '118/75'),
(3, 80.0, 22.0, 50.0, 75, '122/85'),
(4, 70.0, 19.0, 42.0, 68, '115/78'),
(5, 85.0, 24.0, 55.0, 80, '125/90');

-- Sample data for MetricGoals table
INSERT INTO MetricGoals (user_id, target_weight, target_body_fat, target_muscle_mass, target_heart_rate)
VALUES
(1, 70.0, 18.0, 50.0, 65),
(2, 60.0, 16.0, 45.0, 60),
(3, 75.0, 20.0, 55.0, 70),
(4, 65.0, 17.0, 48.0, 63),
(5, 80.0, 22.0, 60.0, 75);

-- Sample data for FitnessGoals table
INSERT INTO FitnessGoals (user_id, goal_title, goal_description, status)
VALUES
(1, 'Weight Loss', 'Lose 10 pounds in 3 months', 0),
(2, 'Muscle Gain', 'Gain 5 pounds of muscle in 2 months', 0),
(3, 'Cardio Improvement', 'Run 5 miles without stopping', 0),
(4, 'Strength Training', 'Squat 200 pounds', 0),
(5, 'Flexibility', 'Achieve full splits', 0);

-- Sample data for Routines table
INSERT INTO Routines (user_id, routine_name, routine_description)
VALUES
(1, 'Morning Workout', 'Cardio and stretching routine for the morning'),
(2, 'Evening Routine', 'Weightlifting and core workout for the evening'),
(3, 'Daily Walk', '30-minute walk around the neighborhood'),
(4, 'Yoga Practice', '60-minute yoga session for relaxation'),
(5, 'HIIT Workout', 'High-intensity interval training for fat burning');

-- Sample data for TrainerAvailability table
INSERT INTO TrainerAvailability (trainer_id, day_of_week, start_time, end_time)
VALUES
(1, 1, '09:00:00', '17:00:00'),
(2, 2, '10:00:00', '18:00:00'), 
(1, 3, '08:00:00', '16:00:00'),
(2, 4, '07:00:00', '15:00:00'), 
(1, 5, '11:00:00', '19:00:00'); 


INSERT INTO GroupFitness (group_date, start_time, end_time, trainer_id, duration, group_cost, group_comment)
VALUES
('2021-10-01', '10:00:00', '11:00:00', 1, 60, 20, 'Morning Group Fitness Class'),
('2021-10-02', '15:00:00', '16:00:00', 2, 60, 25, 'Afternoon Group Fitness Class'),
('2021-10-03', '18:00:00', '19:00:00', 1, 60, 20, 'Evening Group Fitness Class'),
('2021-10-04', '12:00:00', '13:00:00', 2, 60, 25, 'Lunchtime Group Fitness Class'),
('2021-10-05', '17:00:00', '18:00:00', 1, 60, 20, 'Evening Group Fitness Class');

INSERT INTO Rooms (room_name, room_capacity)
VALUES
('Room 1', 10),
('Room 2', 15),
('Room 3', 20);

-- Sample data for Equipment table
INSERT INTO Equipment (equipment_name, equipment_description)
VALUES
('Treadmill', 'Cardio machine for running or walking'),
('Dumbbells', 'Weights for strength training exercises'),
('Yoga Mat', 'Mat for yoga practice'),
('Resistance Bands', 'Bands for resistance training'),
('Jump Rope', 'Tool for cardiovascular exercise');

-- Sample data for EquipmentMaintainance table
INSERT INTO EquipmentMaintainance (admin_id, equipment_id, isUsable, maintainance_comment)
VALUES
(1, 1, true, 'Cleaned and lubricated treadmill'),
(1, 2, true, 'Checked and replaced damaged dumbbells'),
(1, 3, true, 'Washed and dried yoga mats'),
(1, 4, true, 'Inspected and replaced worn resistance bands'),
(1, 5, true, 'Adjusted and replaced worn jump rope');


-- Billing Sample Data
INSERT INTO Billings (user_id, billing_amount)
VALUES
(1, 60),
(2, 60),
(3, 60),
(4, 60),
(5, 60);

-- Group Fitness Bookings Sample Data
INSERT INTO GroupFitnessBookings (user_id, group_id, billing_id)
VALUES
(1, 1,1),
(2, 2,2),
(1, 3,3),
(2, 4,4),
(1, 5,5);



