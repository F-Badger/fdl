const teams = {
  "w1": {
    "Emma B": 18,
    "Eva": 14,
    "Sasha": 14,
    "Gabi": 11.5,
    "Kitty": 11.5,
    "Ola": 9.5,
    "Libby": 9.5
  },
  "w2": {
    "Daisy": 14,
    "Belle": 14,
    "Emma S": 12,
    "Layla": 10.5,
    "Flora": 10.5,
    "Susanah": 9.5,
    "Yoyo": 9.5
  },
  "m1": {
    "Andrew": 15,
    "Josh": 13,
    "Charlie": 12,
    "Ed": 11.5,
    "Tom": 9,
    "Richard T": 9,
    "Jacob": 13,
    "Justin": 14,
    "Richard W": 9
  },
  "m2": {
    "Kian": 9,
    "Ben W": 13,
    "Francis": 17,
    "Daniel": 12,
    "Liam": 9,
    "Jace": 9,
    "Ish": 12,
    "Hen": 10
  }
};

let budget = 100

function populateSelects() {
  Object.keys(teams).forEach(team => {
    const players = teams[team]

    for (let i = 1; i <= 2; i++) {
      let select = document.getElementById(`${team}player${i}`)

      if (select) {
        select.onchange = function() {
          selectionMade(select.id)
        }
        Object.keys(players).forEach(player => {
        let option = document.createElement("option")
        option.value = players[player]
        option.textContent = `${player} (£${players[player]}M)`
        select.appendChild(option)
        })
      }
    }
  })
}
  
document.addEventListener("DOMContentLoaded", populateSelects)
  
function selectionMade(selectID) {
  const selectedPlayers = Array.from(document.querySelectorAll('select'))
  .filter(select => {
    const value = parseFloat(select.value);
    return !isNaN(value)
  })
  const budgetDisplay = document.getElementById("budget-remaining")
  const overbudgetAlert = document.getElementById("overbudget-alert")
  const choosePlayerAlert = document.getElementById("choose-player-alert")
  const overbudgetCaptainAlert = document.getElementById("overbudget-captain-alert")

  let total = 0
  for (player of selectedPlayers) {
      total += parseFloat(player.value)
  }
  budget = 100 - total
  budgetDisplay.textContent = `Budget Remaining: £${budget}M`
  if (budget < 0) {
    overbudgetAlert.classList.remove("d-none")
  }
  else {
    overbudgetAlert.classList.add("d-none")
  }
  
  let otherSelectID
  if (selectID.endsWith("1")) {
    otherSelectID = selectID.slice(0, -1) + "2"
  }
  else {
    otherSelectID = selectID.slice(0, -1) + "1"
  }

  const otherSelect = document.getElementById(otherSelectID)
  let otherSelectSelection = otherSelect.selectedOptions[0].text.replace(/\s?\(.*\)\s?/g, "").trim()
  if (otherSelectSelection == "Select a player") {
    otherSelectSelection = ""
  } 
  otherSelect.replaceChildren()

  const players = teams[otherSelectID.slice(0,2)]

  let defaultOption = document.createElement("option")
  defaultOption.value = ""
  defaultOption.selected = true
  defaultOption.disabled = true
  defaultOption.textContent = "Select a player"

  otherSelect.appendChild(defaultOption)

  let selectedPlayer = document.getElementById(selectID).selectedOptions[0].text.replace(/\s?\(.*\)\s?/g, "").trim()
  Object.keys(players).forEach(player => {
    if (player != selectedPlayer) {
      let option = document.createElement("option")
      option.value = players[player]
      option.textContent = `${player} (£${players[player]}M)`
      if (player == otherSelectSelection) {
        option.selected = true
      }
      otherSelect.appendChild(option);
    }
  })

  if (selectedPlayers.length == 8) {
    if (budget >= 0) {
      let selectedPlayersMap = {}

      for (selectedPlayer of selectedPlayers) {
        let selectedPlayerName = selectedPlayer.selectedOptions[0].text.replace(/\s?\(.*\)\s?/g, "").trim()
        selectedPlayersMap[selectedPlayerName] = selectedPlayer.value
      }

      for (let i = 1; i <= 3; i++) {
        let select = document.getElementById(`captainRound${i}`)
        select.replaceChildren()

        let defaultOption = document.createElement("option")
        defaultOption.value = ""
        defaultOption.selected = true
        defaultOption.disabled = true
        defaultOption.textContent = "Select a player"
      
        select.appendChild(defaultOption)

        if (select) {

          if (i === 3) {
            Object.keys(selectedPlayersMap).forEach(player => {
              if (teams.m1[player] || teams.m2[player]) {
                let option = document.createElement("option")
                option.value = player
                option.textContent = `${player}`
                select.appendChild(option)
              }
            })
          } 
          else {
            Object.keys(selectedPlayersMap).forEach(player => {
              let option = document.createElement("option")
              option.value = player
              option.textContent = `${player}`
              select.appendChild(option)
            })
          }
        }
      }
      overbudgetCaptainAlert.classList.add("d-none")
    }
    else {
      overbudgetCaptainAlert.classList.remove("d-none")
    }
    choosePlayerAlert.classList.add("d-none")
  }
  else {
    choosePlayerAlert.classList.remove("d-none")
    overbudgetCaptainAlert.classList.add("d-none")
  }
}

const submitButton = document.getElementById("submit-button")

submitButton.addEventListener("click", () => {
  const completeSelectionAlert = document.getElementById("complete-selection-alert")
  const enterNameAlert = document.getElementById("enter-name-alert")
  const selectedPlayers = Array.from(document.querySelectorAll('select'))
  const userName = document.getElementById("user-name")

  completeSelectionAlert.classList.add("d-none")
  enterNameAlert.classList.add("d-none")

  if (!selectedPlayers.every(select => select.value !== "")) {
    completeSelectionAlert.classList.remove("d-none")
    return
  }
  if (userName.value == "") {
    enterNameAlert.classList.remove("d-none")
    return 
  }

  submissionData = collectSubmissionData()

  fetch('/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(submissionData)
  })
  .then(response => response.text())
  .then(html => {
      document.open();
      document.write(html)
      document.close()
  })
  .catch(error => console.error('Error:', error))
})

function getSelectedPlayer(selectId) {
  const selectElement = document.getElementById(selectId);
  return selectElement.selectedOptions[0].text.replace(/\s?\(.*\)\s?/g, "").trim()
}

function getUserName() {
  const userNameInput = document.getElementById('user-name')
  return userNameInput ? userNameInput.value.trim() : ''
}

function collectSubmissionData() {
  const submissionData = {
    w1: {
      player1: getSelectedPlayer('w1player1'),
      player2: getSelectedPlayer('w1player2')
    },
    w2: {
      player1: getSelectedPlayer('w2player1'),
      player2: getSelectedPlayer('w2player2')
    },
    m1: {
      player1: getSelectedPlayer('m1player1'),
      player2: getSelectedPlayer('m1player2')
    },
    m2: {
      player1: getSelectedPlayer('m2player1'),
      player2: getSelectedPlayer('m2player2')
    },
    captains: {
      round1: getSelectedPlayer('captainRound1'),
      round2: getSelectedPlayer('captainRound2'),
      round3: getSelectedPlayer('captainRound3')
    },
    userName: getUserName()
  };

  return submissionData;
}