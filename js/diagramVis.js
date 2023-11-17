class DiagramVis {
    constructor(_parentElement, _data, _teamAbbr) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.teams = _teamAbbr;
        this.filteredData = this.data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 0, bottom: 200, left: 140};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        // vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        vis.height = 1000
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

        const logoRadius = 25; // Half of logoWidth
        const circleRadius = 300; // Radius of the whole circle layout
        const center = { x: vis.width / 2, y: vis.height / 2 }; // Assuming vis.width and vis.height are defined

        // Function to calculate the position of each logo on the circle
        function getLogoPosition(index, total) {
            const angle = (index / total) * 2 * Math.PI; // Angle for the circular position
            return {
                x: center.x + circleRadius * Math.cos(angle) - logoRadius,
                y: center.y + circleRadius * Math.sin(angle) - logoRadius
            };
        }

        // Draw connections first so they appear under the logos
        vis.data.forEach(function(game) {
            // Find the positions of the two teams
            let teamAIndex = vis.teams.indexOf(game.homeTeamAbbr);
            let teamBIndex = vis.teams.indexOf(game.visitorTeamAbbr);
            let teamAPos = getLogoPosition(teamAIndex, vis.teams.length);
            let teamBPos = getLogoPosition(teamBIndex, vis.teams.length);

            // Draw a line between the logos
            vis.svg.append("line")
                .attr("x1", teamAPos.x + logoRadius)
                .attr("y1", teamAPos.y + logoRadius)
                .attr("x2", teamBPos.x + logoRadius)
                .attr("y2", teamBPos.y + logoRadius)
                .style("stroke", "grey")
                .style("stroke-width", 2);
        });

        // Draw the logos in a circle
        vis.teams.forEach(function(teamAbbr, index) {
            let position = getLogoPosition(index, vis.teams.length);

            // Append a circle for the hover effect
            vis.svg.append("circle")
                .attr("cx", position.x + logoRadius)
                .attr("cy", position.y + logoRadius)
                .attr("r", logoRadius)
                .style("fill", "transparent")
                .style("cursor", "pointer");

            // Append the logo image
            let image = vis.svg.append("image")
                .attr("xlink:href", "data/logosWeb/" + teamAbbr + ".webp")
                .attr("x", position.x)
                .attr("y", position.y)
                .attr("width", logoRadius * 2)
                .attr("height", logoRadius * 2)
                .on("click", function() {
                    console.log(teamAbbr);
                    // Change color to gold on click
                    let selectedLines = d3.selectAll("." + teamAbbr);
                    console.log("Selected lines:", selectedLines.size()); // Log how many items are selected

                    selectedLines.style("stroke", "gold");

                    // If the lines still don't change color, check for issues with styles being overwritten
                    selectedLines.each(function() {
                        console.log("Current stroke color:", d3.select(this).style("stroke"));
                    });
                })
                // .on("mouseout", function() {
                //     // Revert the lines color back to grey when not hovering over the logo
                //     d3.selectAll("." + teamAbbr)
                //         .style("stroke", "grey");
                // });

        });
    }

    wrangleData() {
            let vis = this;

            // adding the winner and loser of the games as a variable per game
            vis.data.forEach(function(game) {
                let homeScore = parseInt(game.homeFinalScore, 10);
                let visitorScore = parseInt(game.visitorFinalScore, 10);

                if (homeScore > visitorScore) {
                    game.winner = game.homeTeamAbbr;
                    game.loser = game.visitorTeamAbbr;
                } else if (visitorScore > homeScore) {
                    game.winner = game.visitorTeamAbbr;
                    game.loser = game.homeTeamAbbr;
                } else {
                    game.winner = 'Tie';
                    game.loser = 'Tie';
                }
            });
            vis.updateVis();
    }
}