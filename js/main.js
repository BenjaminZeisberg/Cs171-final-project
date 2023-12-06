// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

// Declaring global variables
let diagramVis, winsTime, playVis, xScale, offensiveVis, selectionDomain, timelineVis, clickedTeam, colorScale;


window.onload = function () {
    window.scrollTo(0, 0);
};

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
    d3.csv('data/timeline-text.csv')
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
    let timelineText = data[7]
    let tackles = data[5]
    // console.log(players)
    // console.log(plays)
    // console.log(teams)
    // console.log(trackingWeek1)
    // console.log(games)
    // It's faster to give as an array as supposed to looping through the lists each time the website is opened
    let teamsAbbr = ['LA', 'BUF', 'ATL', 'NO', 'CAR', 'CLE', 'CHI', 'SF', 'CIN', 'PIT', 'DET', 'PHI', 'HOU', 'IND', 'MIA', 'NE', 'NYJ', 'BAL', 'WAS', 'JAX', 'ARI', 'KC', 'LAC', 'LV', 'MIN', 'GB', 'TEN', 'NYG', 'DAL', 'TB', 'SEA', 'DEN']

    // Creating positional Game Visualization.
    // let logosVis = new LogosVis("logosVis", games, teamsAbbr);
    // document.addEventListener('DOMContentLoaded', function() {
    //     // Your code goes here
    //     let logosVis = new LogosVis("sidenavLeft", games, teamsAbbr.slice(0, 16));
    // });
    let logosVisLeft = new LogosVis("sidenavLeft", games, teamsAbbr.slice(0, 16));
    let logosVisRight = new LogosVis("sidenavRight", games, teamsAbbr.slice(16, 32));


    // source: https://medialab.github.io/iwanthue/
    colorScale = d3.scaleOrdinal()
        .domain(teams)
        .range(["#e5714f",
            "#6e60e0",
            "#e7c83a",
            "#617ee9",
            "#e18425",
            "#b254c9",
            "#55e09f",
            "#db53be",
            "#b59e2e",
            "#845db9",
            "#d69b3e",
            "#5268b7",
            "#d34228",
            "#41c4ce",
            "#d73f50",
            "#70e1cb",
            "#da417f",
            "#3c9976",
            "#ae4e97",
            "#b7ab54",
            "#5b92e0",
            "#7f7321",
            "#b58fe0",
            "#e5cd85",
            "#236ead",
            "#ab5f30",
            "#65c1f0",
            "#b05054",
            "#3ba1d2",
            "#df9e6e",
            "#35618f",
            "#96753d",
            "#a4b5f2",
            "#e48793",
            "#2c7ea9",
            "#e495d1",
            "#4a73a3",
            "#a45d82",
            "#7990c5",
            "#6d67a0"]);

    // console.log("cols" + colorScale);


    diagramVis = new DiagramVis("diagramVis", games, teamsAbbr);
    winsTime = new WinsVis("winsTime", games, teamsAbbr);
    playVis = new PlayVis("playVis", games, teamsAbbr, plays, testPlay);
    timelineVis = new TimelineVis("timeLine", timelineText, teamsAbbr);
    offensiveVis = new OffensiveVis("offensiveVis", plays, tackles, teamsAbbr);

    d3.xml("data/images/stadium.svg").then(function (xml) {
        var svg = d3.select(".stadium-graphic").node();
        svg.appendChild(xml.documentElement);
    });

    d3.xml("data/images/helmet.svg").then(function (xml) {
        var svg = d3.select(".helmet-graphic").node();
        svg.appendChild(xml.documentElement);
    });

    document.body.classList.add('loaded');
}

function handleLogoClick(teamAbbr) {

    let scrollTarget = document.querySelector(".logo-display");
    if (scrollTarget) {
        scrollTarget.scrollIntoView({ behavior: "smooth" });
    }

    // Highlighting the selected team
    winsTime.highlightTeam(teamAbbr);
    diagramVis.highlightTeam(teamAbbr);

}


/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("sidenavLeft").style.width = "150px";
    // document.getElementById("sidenavRight").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("sidenavLeft").style.width = "0";
}

function handleUserSelection () {
    console.log("handleUserSelection called");

    let selectedData = document.getElementById('statsType').value;

    console.log("Selected Data:", selectedData);

    if (selectedData === "offensive") {
        offensiveVis.updateVis();
    } else {
        offensiveVis.updateDefensiveVisualization();
    }

}

// PlayVisualization
// Get the button element

let nextFrameButton = document.getElementById("playButton");

// Add event listener
nextFrameButton.addEventListener("click", function() {

    for (let i = 0; i < 40; i++) {
        // Update the visualization
        playVis.updatePlayersPosition(playVis.currentFrame);

        // Next frame to draw
        playVis.currentFrame++;
    }
});

let resetButton = document.getElementById("resetButton");

resetButton.addEventListener("click", function() {
    playVis.updatePlayersPosition(playVis.currentFrame = 1);
});