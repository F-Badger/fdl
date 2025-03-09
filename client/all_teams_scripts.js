document.addEventListener('DOMContentLoaded', async function() {
    try {
      const response = await fetch('/get-all-teams')
      if (!response.ok) {
        throw new Error('Failed to fetch teams')
      }
      
      const teams = await response.json()
      
      generateTeams(teams)
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
})

function generateTeams(teams) {
    const container = document.getElementById('teamsContainer')
    container.innerHTML = ''
  
    teams.forEach(team => {
        const div = document.createElement('div')
        div.className = 'd-flex justify-content-between align-items-center border p-3 rounded mb-2'
    
        div.innerHTML = `
            <div class="d-flex justify-content-between w-100">
                <span class="fw-bold">${team.user_name}'s Team</span>
                <span class="ms-auto me-3">${team.formatted_created_at}</span> <!-- Add margin-right -->
                <button class="btn btn-primary" onclick="view_team('${team.id}')">View</button>
            </div>
            `
    
        container.appendChild(div);
    })
}

function view_team(id) {
    fetch(`/get-team-details/${id}`)
    .then(response => response.json())
    .then(data => {
        displayTeamInModal(data);
    })
    .catch(error => {
        console.error('Error fetching team details:', error);
    });
}

function displayTeamInModal(teamData) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.innerText = `${teamData.user_name}'s Team`;
    
    modalBody.innerHTML = `
        <p><strong>W1 Player 1:</strong> ${teamData.w1_player1}</p>
        <p><strong>W1 Player 2:</strong> ${teamData.w1_player2}</p>
        <p><strong>W2 Player 1:</strong> ${teamData.w2_player1}</p>
        <p><strong>W2 Player 2:</strong> ${teamData.w2_player2}</p>
        <p><strong>M1 Player 1:</strong> ${teamData.m1_player1}</p>
        <p><strong>M1 Player 2:</strong> ${teamData.m1_player2}</p>
        <p><strong>M2 Player 1:</strong> ${teamData.m2_player1}</p>
        <p><strong>M2 Player 2:</strong> ${teamData.m2_player2}</p>
        <p><strong>Round 1 Captain:</strong> ${teamData.round1_captain}</p>
        <p><strong>Round 2 Captain:</strong> ${teamData.round2_captain}</p>
        <p><strong>Round 3 Captain:</strong> ${teamData.round3_captain}</p>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('teamModal'));
    modal.show();
}