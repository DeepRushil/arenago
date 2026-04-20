export async function getISLMatches() {
  // In a full production app, this would query a backend proxy to api.football-data.org or sportmonks
  // For demo, we mock the latest real ISL data dynamically based on current date
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          status: 'FT',
          type: 'past',
          team1: { name: 'Mumbai City FC', shortName: 'MCFC', crest: '🔵' },
          team2: { name: 'Kerala Blasters', shortName: 'KBFC', crest: '🟡' },
          score1: 2,
          score2: 1,
          date: 'Yesterday',
          time: '7:30 PM',
          venue: 'Mumbai Football Arena',
        },
        {
          id: 2,
          status: 'LIVE',
          type: 'current',
          team1: { name: 'Mohun Bagan SG', shortName: 'MBSG', crest: '🟢' },
          team2: { name: 'Goa FC', shortName: 'FCG', crest: '🟠' },
          score1: 1,
          score2: 1,
          time: '68:12', // Match minute
          date: 'Today',
          venue: 'Salt Lake Stadium',
        },
        {
          id: 3,
          status: 'UPCOMING',
          type: 'future',
          team1: { name: 'Bengaluru FC', shortName: 'BFC', crest: '🔵' },
          team2: { name: 'Chennaiyin FC', shortName: 'CFC', crest: '🟦' },
          score1: 0,
          score2: 0,
          date: 'Tomorrow',
          time: '7:30 PM',
          venue: 'Sree Kanteerava Stadium',
        }
      ]);
    }, 400); // 400ms network delay simulation
  });
}
