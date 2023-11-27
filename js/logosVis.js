class LogosVis {

    constructor(_parentElement, _data, _teamAbbr) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.teams = _teamAbbr;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right - 300;
        vis.height = 1000 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.wrangleData();
    }
    updateVis() {
        let vis = this;

        let logosStart = 300;
        let logoWidth = 50;
        let logoSpacing = 10;
        let logosPerRow = Math.ceil(vis.teams.length / 2);
        let rowHeight = logoWidth + logoSpacing;

        vis.teams.forEach(function(teamAbbr, index) {
            let rowIndex = Math.floor(index / logosPerRow);
            let columnIndex = index % logosPerRow;

            let xPosition;
            if (rowIndex === 0) {
                // First row (left side)
                xPosition = 0; // Adjust as needed for padding or margin
            } else {
                // Second row (right side)
                // Adjust this value based on the total width of the container
                xPosition = vis.width - logoWidth; // Positioning on the right side
            }

            let yPosition = columnIndex * rowHeight;

            // Append a circle for the hover effect
            vis.svg.append("circle")
                .attr("cx", xPosition)
                .attr("cy", yPosition)
                .attr("r", logoWidth / 2)
                .style("fill", "transparent")
                .style("cursor", "pointer")

            // Append the logo image
            let image = vis.svg.append("image")
                .attr("xlink:href", "data/logosWeb/" + teamAbbr + ".webp")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .attr("width", logoWidth)
                .attr("height", logoWidth);

            // Printing the team abbreviation on click
            image.on("click", function() {
                console.log(teamAbbr)
                handleLogoClick(teamAbbr);
            });
        });
    }

    wrangleData() {
        let vis = this;

        // // adding the winner and loser of the games as a variable per game
        // vis.data.forEach(function(game) {
        //     let homeScore = parseInt(game.homeFinalScore, 10);
        //     let visitorScore = parseInt(game.visitorFinalScore, 10);
        //
        //     if (homeScore > visitorScore) {
        //         game.winner = game.homeTeamAbbr;
        //         game.loser = game.visitorTeamAbbr;
        //     } else if (visitorScore > homeScore) {
        //         game.winner = game.visitorTeamAbbr;
        //         game.loser = game.homeTeamAbbr;
        //     } else {
        //         game.winner = 'Tie';
        //         game.loser = 'Tie';
        //     }
        // });
        vis.updateVis();
    }
}