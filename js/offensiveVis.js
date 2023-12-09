class OffensiveVis {
    constructor(_parentElement, _data, _tackles, _teamAbbr) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.tackles = _tackles;
        this.teams = _teamAbbr;
        this.filteredData = this.data;


        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 150, right: 50, bottom: 200, left: 0};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;

        vis.height = 300

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        console.log("check");
        console.log(vis.data);

        vis.circlesGroup = vis.svg.append("g")
            .attr("class", "circles")
            .attr("transform", "translate(0, 60)")

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 1);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = [];

        // Create a map to store aggregated data for each possession team
        let teamDataMap = new Map();

        vis.data.forEach((d) => {
            let possessionTeam = d.possessionTeam;

            // Initialize teamData if it doesn't exist in the map
            if (!teamDataMap.has(possessionTeam)) {
                teamDataMap.set(possessionTeam, {
                    completedPasses: 0,
                    allPasses: 0,
                });
            }

            // Update teamData based on the current observation
            let teamData = teamDataMap.get(possessionTeam);
            teamData.allPasses += 1;

            if (d.passResult === "C") {
                teamData.completedPasses += 1;
            }
        });

        // Iterate over the aggregated data for each team
        teamDataMap.forEach((teamData, possessionTeam) => {
            let passingAccuracy = teamData.completedPasses / teamData.allPasses;

            // Push a single entry for the team into displayData
            vis.displayData.push({
                name: possessionTeam,
                group: "Team",
                team: possessionTeam,
                passingAccuracy: passingAccuracy * 100,
                size: passingAccuracy * 85,
            });
        });

        // Debugging: Log the contents of vis.displayData
        console.log("vis.displayData", vis.displayData);

        console.log("here")
        console.log(vis.tackles)
        console.log(vis.data)

        vis.displayDataDefense = [];

        let teamTackleMap = new Map();

// Iterate through tacklesData to cross-reference play IDs
        vis.tackles.forEach((tackle) => {
            let playId = tackle.playId;

            // Find the corresponding play in vis.plays
            let play = vis.data.find((play) => play.playId === playId);

            if (play) {
                let defensiveTeam = play.defensiveTeam;

                // Initialize teamTackleData if it doesn't exist in the map
                if (!teamTackleMap.has(defensiveTeam)) {
                    teamTackleMap.set(defensiveTeam, {
                        totalTackles: 0,
                        totalMissedTackles: 0,
                    });
                }

                // Update teamTackleData based on the current observation
                let teamTackleData = teamTackleMap.get(defensiveTeam);
                teamTackleData.totalTackles += parseInt(tackle.tackle);
                teamTackleData.totalMissedTackles += parseInt(tackle.pff_missedTackle);

                // Update the map with the new total
                teamTackleMap.set(defensiveTeam, teamTackleData);
            }
        });

        teamTackleMap.forEach((teamTackleData, team) => {
            let tackleAccuracy = teamTackleData.totalTackles / ( teamTackleData.totalTackles + teamTackleData.totalMissedTackles);

            // Push a single entry for the team into displayData
            vis.displayDataDefense.push({
                name: team,
                group: "Team",
                team: team,
                tackleAccuracy : tackleAccuracy,
                size: (tackleAccuracy - 0.5) * 120,
            });
        });

        console.log("Defensive Stats Array:", vis.displayDataDefense);

        // ADDED -- to make sure the bubbles aren't flying in from the side
        vis.updateDefensiveVisualization();
        vis.updateVis();


    }




    updateVis() {
        let vis = this;

        vis.svg.selectAll(".small-circle").remove();

        let teams = Array.from(new Set(vis.data.map(d => d.team)));
        //let colorScale = d3.scaleOrdinal().domain(teams).range(d3.schemeCategory10);

        //console.log(colorScale);

        console.log("todisp");
        console.log(vis.displayData);

        vis.svg.selectAll(".small-circle").remove();

        // Apply force simulation to bring small circles together
        vis.simulation = d3.forceSimulation(vis.displayData)
            .force("x", d3.forceX(vis.width / 2).strength(0.1))
            .force("y", d3.forceY(vis.height / 2).strength(0.1))
            .force("collide", d3.forceCollide().radius(d => d.size + 1).strength(1))
            .on("tick", function () {
                vis.svg.selectAll(".small-circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });

        const smallCircles = vis.svg.selectAll(".small-circle")
            .data(vis.displayData)
            .enter().append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.size)
            .attr("fill", d => colorScale(d.team))
            .attr("class", "small-circle")
            .on("mouseover", function (event, d) {
                // Change circle color to white on mouseover
                d3.select(this)
                    .attr("fill", "white");

                // Show tooltip on hover
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", .8);
                vis.tooltip.html(`<h3>${d.team}<br><img src="data/logosWeb/${d.team}.webp" width="50" height="50" alt="${d.team} logo"><br>Passing Accuracy: ${Math.round(d.passingAccuracy)}%</h3>`)
                    .style("left", (event.pageX + 100) + "px")
                    .style("top", (event.pageY - 100) + "px");
            })
            .on("mouseout", function (d) {

                d3.select(this)
                    .attr("fill", d => colorScale(d.team));


                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        vis.simulation.nodes(vis.displayData);
        vis.simulation.alpha(0.5).restart();

    }

    updateDefensiveVisualization() {
        let vis = this;

        vis.svg.selectAll(".small-circle").remove();

        let teams = Array.from(new Set(vis.data.map(d => d.team)));
        //let colorScale = d3.scaleOrdinal().domain(teams).range(d3.schemeCategory10);

        vis.svg.selectAll(".small-circle").remove();

        // Apply force simulation to bring small circles together
        vis.simulation = d3.forceSimulation(vis.displayDataDefense)
            .force("x", d3.forceX(vis.width / 2).strength(0.1))
            .force("y", d3.forceY(vis.height / 2).strength(0.1))
            .force("collide", d3.forceCollide().radius(d => d.size + 1).strength(1))
            .on("tick", function () {
                vis.svg.selectAll(".small-circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });

        const smallCircles = vis.svg.selectAll(".small-circle")
            .data(vis.displayDataDefense)
            .enter().append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.size)
            .attr("fill", d => colorScale(d.team))
            .attr("class", "small-circle")
            .on("mouseover", function (event, d) {
                // Change circle color to white on mouseover
                d3.select(this)
                    .attr("fill", "white");

                // Show tooltip on hover
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", .8);
                vis.tooltip.html(`<h3>${d.team}<br><img src="data/logosWeb/${d.team}.webp" width="50" height="50" alt="${d.team} logo"><br> Tackle Accuracy: ${Math.round(d.tackleAccuracy * 100)}%\</h3>`)
                    .style("left", (event.pageX + 100) + "px")
                    .style("top", (event.pageY - 100) + "px");
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .attr("fill", d => colorScale(d.team));

                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        vis.simulation.nodes(vis.displayDataDefense);
        vis.simulation.alpha(0.5).restart();
    }



}
