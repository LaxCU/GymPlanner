# **Installation Guide**

- Clone this repository: `https://github.com/LaxCU/GymPlanner.git`

### **[DataBase]**

- Create the database using pgAdmin 4.
- Run the DDL file in `sqlScript/DDL.sql` to create your tables
- Run the DML file in `sqlScripts/DML.sql` to populate it with sample data

### **[JavaScript]**

- Run `npm init` to install dependencies
- Modify the Client Config to connect to your database
- Run `node server.js`


### **[Design]**
- Uses a TWO Tiered Archieture with a front-end and backend
    - Front-End: Displays the UI & handles data validation and comminucates with backend to retrieve data to display.
    - Back-end: Retrieves requests from front-end to get data from database which is sent to front-end for UI to display. It also performs validation on request such as authentication.
- 
## **Video Link**
- Link: https://youtu.be/woqLRIgRKzY
