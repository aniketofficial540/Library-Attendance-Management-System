const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const fs = require('fs');
const app = express();
const moment = require('moment-timezone');


app.use(bodyParser.json());
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_Username',
    password: 'your_Password',
    database: 'library_db'
});

db.connect((err) => {
    if (err) {
        console.error('Failed to connect to the database:', err);
        process.exit(1);
    }
    console.log('Connected to the database');
});

const updateOutTimeForLateEntries = () => {
    const currentTime = new Date();
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();

    if (currentHours === 16 && currentMinutes === 30) {
        db.query('UPDATE logs SET outTime = "16:30:00", duration = TIMEDIFF("16:30:00", inTime) WHERE outTime IS NULL', (err, result) => {
            if (err) {
                console.error('Error updating outTime for late entries at 4:30 PM:', err);
            } else if (result.affectedRows > 0) {
                console.log(`Updated ${result.affectedRows} entries with default outTime of 4:30 PM`);
            }
        });

    }

    if (currentHours === 22) {
        db.query('UPDATE logs SET outTime = "22:00:00", duration = TIMEDIFF("22:00:00", inTime) WHERE outTime IS NULL', (err, result) => {
            if (err) {
                console.error('Error updating outTime for late entries at 10:00 PM:', err);
            } else if (result.affectedRows > 0) {
                console.log(`Updated ${result.affectedRows} entries with default outTime of 10:00 PM`);
            }
        });

    }
};

// run every minute
setInterval(updateOutTimeForLateEntries, 60000);

app.get("/", (req, res) => {
    res.render("index.html");
});



app.post('/logEntry', (req, res) => {
    const collegeId = req.body.collegeId;

    db.query('SELECT name FROM students WHERE collegeId = ?', [collegeId], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        if (result.length === 0) {
            return res.json({ success: false, message: 'Student not found' });
        }

        const studentName = result[0].name;
        const currentTime = moment().tz('Asia/Kolkata'); // Use your desired timezone

        const logDate = currentTime.toISOString().slice(0, 10); // Extract 'YYYY-MM-DD'
        const timeString = currentTime.format('HH:mm:ss'); // Format as 'HH:mm:ss'

        db.query('SELECT * FROM logs WHERE collegeId = ? AND outTime IS NULL', [collegeId], (err, result) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }
            if (result.length > 0) {
                db.query('UPDATE logs SET outTime = ?, duration = TIMEDIFF(?, inTime) WHERE collegeId = ? AND outTime IS NULL', [timeString, timeString, collegeId], (err, updateResult) => {
                    if (err) {
                        console.error('Database query error:', err);
                        return res.status(500).json({ success: false, message: 'Internal Server Error' });
                    }

                    db.query('SELECT * FROM logs WHERE collegeId = ? AND logDate = ? AND outTime = ?', [collegeId, logDate, timeString], (err, updatedLogResult) => {
                        if (err) {
                            console.error('Database query error:', err);
                            return res.status(500).json({ success: false, message: 'Internal Server Error' });
                        }

                        const updatedEntry = updatedLogResult[0];
                        return res.json({ success: true, entry: updatedEntry });
                    });
                });
            } else {
                const inTime = timeString;
                db.query('INSERT INTO logs (collegeId, studentName, logDate, inTime) VALUES (?, ?, ?, ?)', [collegeId, studentName, logDate, inTime], (err, insertResult) => {
                    if (err) {
                        console.error('Database query error:', err);
                        return res.status(500).json({ success: false, message: 'Internal Server Error' });
                    }
                    return res.json({ success: true, entry: { studentName, collegeId, logDate, inTime } });
                });
            }
        });
    });
});




app.get('/download-csv', (req, res) => {
    const logDate = req.query.date;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let query = 'SELECT * FROM logs';
    const queryParams = [];

    if (logDate) {
        query += ' WHERE logDate = ?';
        queryParams.push(logDate);
    } else if (startDate && endDate) {
        query += ' WHERE logDate BETWEEN ? AND ?';
        queryParams.push(startDate, endDate);
    }

    db.query(query, queryParams, (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal Server Error');
        }

        result = result.map(row => {
            row.logDate = new Date(row.logDate).toLocaleDateString('en-CA');
            return row;
        });

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(result);

        console.log('Executing Query:', query, queryParams);

        res.header('Content-Type', 'text/csv');
        res.attachment('log_data.csv');
        return res.send(csv);


    });
});


app.listen(5500, () => {
    console.log('Server running on port 5500');
});
