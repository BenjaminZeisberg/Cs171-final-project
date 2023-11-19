// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

// Declaring global variables
let diagramVis;

// Step 1 Load data using promises

let promises = [
    d3.csv("data/games.csv"),

    // To spead up development we only include the games promise
    // d3.csv("data/players.csv"),
    // d3.csv("data/plays.csv"),
    // d3.csv("data/tackles.csv"),
    // d3.csv('data/tracking_week_1.csv'),
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// Creating the Vis
function createVis(data) {
    let games = data[0]
    // let players = data[1]
    // let plays = data[2]
    // let teams = data[3]
    // let trackingWeek1 = data[4]

    // console.log(games)
    // It's faster to give as an array as supposed to looping through the lists each time the website is opened
    let teamsAbbr = ['LA', 'BUF', 'ATL', 'NO', 'CAR', 'CLE', 'CHI', 'SF', 'CIN', 'PIT', 'DET', 'PHI', 'HOU', 'IND', 'MIA', 'NE', 'NYJ', 'BAL', 'WAS', 'JAX', 'ARI', 'KC', 'LAC', 'LV', 'MIN', 'GB', 'TEN', 'NYG', 'DAL', 'TB', 'SEA', 'DEN']

    // Creating positional Game Visualization.
    let logosVis = new LogosVis("logosVis", games, teamsAbbr);
    diagramVis = new DiagramVis("diagramVis", games, teamsAbbr);
}

function handleLogoClick() {
    // Highlighting the selected team
    console.log(diagramVis)
    let teamAbbr = 'LA'
    // diagramVis.highlightTeam(teamAbbr);
    diagramVis.highlightTeam(teamAbbr);
    // diagramVis.updateVis();
}
