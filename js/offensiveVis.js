class OffensiveVis {
    constructor(_parentElement, _data, _teamAbbr) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.teams = _teamAbbr;
        this.filteredData = this.data;


        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 400, right: 50, bottom: 1000, left: 50};

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
                "Pass Result": "",
                possessionTeam: possessionTeam,
                size: passingAccuracy * 100,
            });
        });

        // Debugging: Log the contents of vis.displayData
        console.log("vis.displayData", vis.displayData);

        vis.updateVis();
    }




    updateVis() {
        let vis = this;


        let teams = Array.from(new Set(vis.data.map(d => d.team)));
        let colorScale = d3.scaleOrdinal().domain(teams).range(d3.schemeCategory10);

        console.log(colorScale);

        console.log("todisp");
        console.log(vis.displayData);

        vis.svg.selectAll(".small-circle").remove();

        // Apply force simulation to bring small circles together
        vis.simulation = d3.forceSimulation(vis.displayData)
            .force("x", d3.forceX(vis.width / 2).strength(0.1))
            .force("y", d3.forceY(vis.height / 2).strength(0.1))
            .force("collide", d3.forceCollide().radius(d => d.size + 1).strength(3))
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
            .attr("fill", d => colorScale(d.possessionTeam))
            .attr("class", "small-circle")
            .on("mouseover", function (event, d) {
                // Change circle color to white on mouseover
                d3.select(this)
                    .attr("fill", "white");

                // Show tooltip on hover
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                vis.tooltip.html(`${d.possessionTeam}<br>Passing Accuracy: ${Math.round(d.size)}%`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {

                d3.select(this)
                    .attr("fill", d => colorScale(d.possessionTeam));


                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        vis.simulation.nodes(vis.displayData);
        vis.simulation.alpha(0.5).restart();

    }


}
