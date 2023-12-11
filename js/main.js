// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

// Declaring global variables
let diagramVis, winsTime, playVis, xScale, offensiveVis, superVis,  selectionDomain, timelineVis, clickedTeam, colorScale, storePoints, storeGames, storeDefenseData, storeOffenseData, teamVs, lastLogo;

// declaring data variables as global for later

let games, plays, trackingWeek1

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
    d3.csv('data/timeline-text.csv'),
    d3.csv("data/superbowl.csv")
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

    games = data[0]
    plays = data[1]
    let testPlay = data[2]
    let players = data[2]
    let teams = data[3]
    trackingWeek1 = data[4]
    let timelineText = data[7]
    let tackles = data[5]
    let superbowlWin = data[8]
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


    // Universal colorscale so all vis are linked
    colorScale = d3.scaleOrdinal()
        .domain(teams)
        .range(["#a452b7",
            "#6e60e0",
            "#e7c83a",
            "#8e61e9",
            "#3c9976",
            "#b254c9",
            "#74935f",
            "#db53be",
            "#e06555",
            "#a4b5f2",
            "#8943c2",
            "#e5714f",
            "#d34228",
            "#d73f50",
            "#41c4ce",
            "#70e198",
            "#ab5f30",
            "#cc5c33",
            "#ae4e97",
            "#da417f",
            "#815be0",
            "#81d02d",
            "#50a481",
            "#e5c316",
            "#a2b95d",
            "#2c7ea9",
            "#e18425",
            "#236ead",
            "#bb79c5",
            "#4a73a3",
            "#35618f",
            "#65c1f0",
            "#b05054",
            "#e3cd2e",
            "#e8d325",
            "#e495d1",
            "#df6e96",
            "#3ba1d2",
            "#a45d82",
            "#6d67a0"]);

    navBarFunctionality();

    diagramVis = new DiagramVis("diagramVis", games, teamsAbbr);
    winsTime = new WinsVis("winsTime", games, teamsAbbr);
    playVis = new PlayVis("playVis", games, teamsAbbr, plays, testPlay);
    timelineVis = new TimelineVis("timeLine", timelineText, teamsAbbr);
    offensiveVis = new OffensiveVis("offensiveVis", plays, tackles, teamsAbbr);
    superVis = new SuperVis("superBowl", superbowlWin, teamsAbbr);
    teamVs = new TeamsVs('teamVs', ['LA', 'BUF'])

    // d3.xml("data/images/stadium.svg").then(function (xml) {
    //     var svg = d3.select(".stadium-graphic").node();
    //     svg.appendChild(xml.documentElement);
    // });

    d3.xml("data/images/helmet.svg").then(function (xml) {
        var svg = d3.select(".helmet-graphic").node();
        svg.appendChild(xml.documentElement);
    });

    titleStyle();

    document.body.classList.add('loaded');
}

// to begin with lastLogo is 'LA'
lastLogo = 'LA'
function handleLogoClick(teamAbbr) {

    // Adjust window pos if above logo element, otherwise want the graphs to be updated and displayed immediately for the user (instead of scrolling back to logo display)
    let scrollTarget = document.querySelector(".logo-display");

    let scrollThreshold = document.querySelector(".scroll-threshold");

    if (window.scrollY < scrollThreshold.getBoundingClientRect().top) {

        // If above, scroll to the logo
        scrollTarget.scrollIntoView({ behavior: "smooth" });
    }

    superVis.updateVis();

    handleUserSelection();

    // Highlighting the selected team
    winsTime.highlightTeam(teamAbbr);
    diagramVis.highlightTeam(teamAbbr);

    // on logo click update what teams to display for the play visualization
    teamVs.updateTeams([lastLogo, teamAbbr])

    // the last clicked team will become the other team
    lastLogo = teamAbbr

    // on the selection of two teams send to wrangle data to find all plays for that game

    // first find game ID

    let filteredGames = games.filter(game =>
        (game.homeTeamAbbr === 'LA' && game.visitorTeamAbbr === 'BUF') ||
        (game.homeTeamAbbr === 'BUF' && game.visitorTeamAbbr === 'LA')
    );

    console.log(filteredGames);


}


/* Set the width of the side navigation to 250px */
function openNavLeft() {
    document.getElementById("sidenavLeft").style.width = "150px";
}

/* Set the width of the side navigation to 0 */
function closeNavLeft() {
    document.getElementById("sidenavLeft").style.width = "0";
}

function openNavRight() {
    document.getElementById("sidenavRight").style.width = "150px";
}

/* Set the width of the side navigation to 0 */
function closeNavRight() {
    document.getElementById("sidenavRight").style.width = "0";
}

// Use this to call either offensive or defensive view
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

// Functionality for navbar
function navBarFunctionality() {
    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', function () {
            const sectionId = dot.getAttribute('data-section');
            document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        });
    });


}


// Append the image and title
function titleStyle() {

    d3.select("#section1").append("img")
        .attr("src", "data/images/nflfootball.jpg")
        .style("width", "100vw")
        .style("overflow", "hidden")
        .style("position", "absolute")
        .style("left", 0)
        .style("top", 0);

    d3.select("#section1").append("h1")
        .text("Superbowl Predictions")
        .style("font-size", "3em")
        .style("position", "absolute")
        .style("left", "50%")
        .style("top", "50%")
        .style("transform", "translate(-50%, -50%)")
        .style("opacity", "85%");
}