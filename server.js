const express = require("express")
const app = express()
const mysql = require('promise-mysql')
const path = require('path')
require('dotenv').config()

app.use(express.static("client", {index: "index.html"}))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const createTcpPool = async (config = {}) => {
    const isWindows = process.platform === 'win32';
    try {
      const dbConfig = {
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ...(isWindows
            ? { host: process.env.DB_HOST, port: process.env.DB_PORT }
            : { socketPath: process.env.INSTANCE_UNIX_SOCKET }), 
        ...config,
      }
  
      const pool = await mysql.createPool(dbConfig)
      return pool
    } catch (error) {
      console.error('Error creating MySQL pool:', error)
    }
}

const insertSubmission = async (submissionData) => {
    const pool = await createTcpPool()
  
    const sql = `
    INSERT INTO submissions (
        user_name, w1_player1, w1_player2, w2_player1, w2_player2,
        m1_player1, m1_player2, m2_player1, m2_player2,
        round1_captain, round2_captain, round3_captain
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  
    const values = [
        submissionData.userName,
        submissionData.w1.player1, submissionData.w1.player2,
        submissionData.w2.player1, submissionData.w2.player2,
        submissionData.m1.player1, submissionData.m1.player2,
        submissionData.m2.player1, submissionData.m2.player2,
        submissionData.captains.round1, submissionData.captains.round2, submissionData.captains.round3
    ]
  
    try {
      const results = await pool.query(sql, values)
      console.log('Data inserted successfully:', results)
    } catch (err) {
      console.error('Error inserting data:', err)
    } finally {
      await pool.end()
    }
}

app.get('/get-all-teams', async (req, res) => {
    const pool = await createTcpPool()
  
    try {
        let rows = await pool.query('SELECT id, user_name, DATE_FORMAT(created_at, "%d/%m %H:%i") AS formatted_created_at FROM submissions ORDER BY created_at DESC')
      
        rows = JSON.parse(JSON.stringify(rows))

        res.json(rows)
    } catch (err) {
        console.error('Error fetching teams:', err)
        res.status(500).send('Error fetching teams')
    } finally {
        await pool.end()
    }
})

app.get('/all-teams', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'all_teams.html'))
})

app.get('/get-team-details/:id', async (req, res) => {
    const teamId = req.params.id

    const pool = await createTcpPool()

    try {
        const sql = `
            SELECT 
                user_name, w1_player1, w1_player2, w2_player1, w2_player2,
                m1_player1, m1_player2, m2_player1, m2_player2,
                round1_captain, round2_captain, round3_captain
            FROM submissions
            WHERE id = ?
        `
        
        const rows = await pool.query(sql, [teamId])

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching team details:', err)
        res.status(500).json({ message: 'Error fetching team details' })
    } finally {
        await pool.end()
    }
})

app.get('/submission', (req, res) => {
    const submissionData = req.query

    const html = `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Submission</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-dark p-3 text-light">
        <div class="container">
            <h1 class="text-center">Your Submission</h1>

            <div class="text-center mt-4">
                <a href="/all-teams" class="btn btn-secondary">View Other Teams</a>
            </div>
    
            <!-- User Name -->
            <div class="row mb-3">
                <div class="col-md-2">
                    <strong>Your Name:</strong>
                </div>
                <div class="col-md-10">
                    <p id="userName">${submissionData.userName}</p>
                </div>
            </div>

            <!-- Women's 1s -->
            <div class="row mb-3">
                <div class="col-md-2">
                    <strong>Women's 1s:</strong>
                </div>
                <div class="col-md-10">
                    <ul class="list-unstyled">
                        <li>Player 1: ${submissionData.w1Player1}</li>
                        <li>Player 2: ${submissionData.w1Player2}</li>
                    </ul>
                </div>
            </div>

            <!-- Women's 2s -->
            <div class="row mb-3">
                <div class="col-md-2">
                    <strong>Women's 2s:</strong>
                </div>
                <div class="col-md-10">
                    <ul class="list-unstyled">
                        <li>Player 1: ${submissionData.w2Player1}</li>
                        <li>Player 2: ${submissionData.w2Player2}</li>
                    </ul>
                </div>
            </div>

            <!-- Men's 1s -->
            <div class="row mb-3">
                <div class="col-md-2">
                    <strong>Men's 1s:</strong>
                </div>
                <div class="col-md-10">
                    <ul class="list-unstyled">
                        <li>Player 1: ${submissionData.m1Player1}</li>
                        <li>Player 2: ${submissionData.m1Player2}</li>
                    </ul>
                </div>
            </div>

            <!-- Men's 2s -->
            <div class="row mb-3">
                <div class="col-md-2">
                    <strong>Men's 2s:</strong>
                </div>
                <div class="col-md-10">
                    <ul class="list-unstyled">
                        <li>Player 1: ${submissionData.m2Player1}</li>
                        <li>Player 2: ${submissionData.m2Player2}</li>
                    </ul>
                </div>
            </div>

            <!-- Captains -->
            <div class="row mb-3">
                <div class="col-md-2">
                    <strong>Captains:</strong>
                </div>
                <div class="col-md-10">
                    <ul class="list-unstyled">
                        <li>Round 1 Captain: ${submissionData.round1Captain}</li>
                        <li>Round 2 Captain: ${submissionData.round2Captain}</li>
                        <li>Round 3 Captain: ${submissionData.round3Captain}</li>
                    </ul>
                </div>
            </div>
    
        </div>
    
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
    `
    
    res.send(html)
})

app.post('/submit', (req, res) => {
    const submissionData = req.body

    insertSubmission(submissionData)

    res.redirect(`
        /submission?
        userName=${encodeURIComponent(submissionData.userName)}
        w1Player1=${encodeURIComponent(submissionData.w1.player1)}
        &w1Player2=${encodeURIComponent(submissionData.w1.player2)}
        &w2Player1=${encodeURIComponent(submissionData.w2.player1)}
        &w2Player2=${encodeURIComponent(submissionData.w2.player2)}
        &m1Player1=${encodeURIComponent(submissionData.m1.player1)}
        &m1Player2=${encodeURIComponent(submissionData.m1.player2)}
        &m2Player1=${encodeURIComponent(submissionData.m2.player1)}
        &m2Player2=${encodeURIComponent(submissionData.m2.player2)}
        &round1Captain=${encodeURIComponent(submissionData.captains.round1)}
        &round2Captain=${encodeURIComponent(submissionData.captains.round2)}
        &round3Captain=${encodeURIComponent(submissionData.captains.round3)}`)
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running at http://localhost:${3000}`)
})

