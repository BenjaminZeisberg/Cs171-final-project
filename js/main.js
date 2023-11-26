// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

// Declaring global variables
let diagramVis, winsTime, playVis;

// Step 1 Load data using promises

let promises = [
    d3.csv("data/games.csv"),

    // all the plays data
    d3.csv("data/plays.csv"),

    // Test data to visualize a play
    d3.csv('data/testPlay.csv'),

    // To spead up development we only include the games promise
    d3.csv("data/plays.csv"),
    d3.csv("data/players.csv"),
    d3.csv("data/tackles.csv"),
    d3.csv('data/tracking_week_1.csv'),
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
    let plays = data[1]
    let testPlay = data[2]
    let players = data[2]
    let teams = data[3]
    let trackingWeek1 = data[4]
    // console.log(players)
    // console.log(plays)
    // console.log(teams)
    // console.log(trackingWeek1)
    // console.log(games)
    // It's faster to give as an array as supposed to looping through the lists each time the website is opened
    let teamsAbbr = ['LA', 'BUF', 'ATL', 'NO', 'CAR', 'CLE', 'CHI', 'SF', 'CIN', 'PIT', 'DET', 'PHI', 'HOU', 'IND', 'MIA', 'NE', 'NYJ', 'BAL', 'WAS', 'JAX', 'ARI', 'KC', 'LAC', 'LV', 'MIN', 'GB', 'TEN', 'NYG', 'DAL', 'TB', 'SEA', 'DEN']

    // Creating positional Game Visualization.
    let logosVis = new LogosVis("logosVis", games, teamsAbbr);
    diagramVis = new DiagramVis("diagramVis", games, teamsAbbr);
    winsTime = new WinsVis("winsTime", games, teamsAbbr);
    playVis = new PlayVis("playVis", games, teamsAbbr, plays, testPlay);
}

function handleLogoClick(teamAbbr) {
    // Highlighting the selected team
    winsTime.highlightTeam(teamAbbr);
    diagramVis.highlightTeam(teamAbbr);

}
