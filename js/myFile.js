
class WinsVis {
    constructor(_parentElement, _data, _teamAbbr) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.teams = _teamAbbr;
        this.filteredData = this.data;

        this.initVis();
    }

    initVis() {
        let vis = this;
        console.log(vis.data);

        vis.margin = {top: 50, right: 50, bottom: 1000, left: 50};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;

        vis.height = 300

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Init tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        vis.wrangleData();
    }

    wrangleData() {

        let vis = this;

        let pointsByTeamAndWeek = {};

        // Sum points scored by each team in each week
        vis.data.forEach(function(game) {
            let homeScore = parseInt(game.homeFinalScore, 10);
            let visitorScore = parseInt(game.visitorFinalScore, 10);

            if (!pointsByTeamAndWeek[game.week]) {
                pointsByTeamAndWeek[game.week] = {};
            }

            if (!pointsByTeamAndWeek[game.week][game.homeTeamAbbr]) {
                pointsByTeamAndWeek[game.week][game.homeTeamAbbr] = homeScore;
            } else {
                pointsByTeamAndWeek[game.week][game.homeTeamAbbr] += homeScore;
            }

            if (!pointsByTeamAndWeek[game.week][game.visitorTeamAbbr]) {
                pointsByTeamAndWeek[game.week][game.visitorTeamAbbr] = visitorScore;
            } else {
                pointsByTeamAndWeek[game.week][game.visitorTeamAbbr] += visitorScore;
            }
        });


        // Check
        //console.log("Total Points by Team and Week:", JSON.stringify(pointsByTeamAndWeek, null, 2));
        vis.pointsByTeamAndWeek = pointsByTeamAndWeek;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let dataForChart = [];
        let cumulativeData = {};

        // Convert to integers, sort
        let weeks = Object.keys(vis.pointsByTeamAndWeek).map(Number).sort((a, b) => a - b);

        weeks.forEach(function (week) {
            let teamsData = vis.pointsByTeamAndWeek[week];

            let teams = Object.keys(teamsData).sort();

            teams.forEach(function (team) {
                let points = teamsData[team];

                // Calc cumulative score
                cumulativeData[team] = (cumulativeData[team] || 0) + points;

                // Then push for current week
                dataForChart.push({week, team, points, cumulative: cumulativeData[team]});
            });
        });

        // Scales, axes
        let yScale = d3.scaleLinear()
            .domain([0, d3.max(dataForChart, d => d.points)])
            .range([vis.height, 0]);

        xScale = d3.scaleLinear()
            .domain([1, Object.keys(vis.pointsByTeamAndWeek).length])
            .range([0, vis.width]);

        // Exclude null obs, and used the filtered set to compute the Yscale for the cumulative dataset
        let filteredDataForChart = dataForChart.filter(d => d.cumulative !== null);

        let cumulativeYScale = d3.scaleLinear()
            .domain([0, d3.max(filteredDataForChart, d => d.cumulative)])
            .range([vis.height * 2, 0]);

        let xAxis = d3.axisBottom(xScale);
        let yAxis = d3.axisLeft(yScale);
        let yAxisCumulative = d3.axisLeft(cumulativeYScale);

        // Line function for the first chart (non cumulative)
        let line = d3.line()
            .x(d => xScale(d.week))
            .y(d => yScale(d.points));

        // Clear existing
        vis.svg.selectAll("*").remove();

        // Axes for first chart
        vis.svg.append("g")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(xAxis);

        vis.svg.append("g")
            .call(yAxis);

        // Make a line for each team and set color scale
        let teams = Array.from(new Set(dataForChart.map(d => d.team)));
        let colorScale = d3.scaleOrdinal().domain(teams).range(d3.schemeCategory10);

        teams.forEach(function (team) {
            let teamData = dataForChart.filter(d => d.team === team);

            vis.svg.append("path")
                .datum(teamData)
                .attr("fill", "none")
                .attr("stroke", colorScale(team))
                .attr("stroke-width", 2)
                .attr("d", line)
                .attr("class", team + ' ' + 'lineGame')
                // Grey out initially
                .style("stroke", "white")
                .on("mouseover", function (event, d) {

                    // Style on hover using color scale
                    d3.select(this).style("stroke", colorScale(team));

                    // Find closest data point using sep function
                    let mouseX = d3.pointer(event)[0];
                    let closestDataPoint = findClosestDataPoint(teamData, xScale.invert(mouseX));

                    // Show tooltip according to closest point, show logos
                    vis.tooltip.html(`
             <div style="border: thin solid grey; border-radius: 5px; background: white; padding: 5px">
                 <strong class="tooltip-title">${team}</strong><br>
                 Week: ${closestDataPoint.week}<br>
                 Points: ${closestDataPoint.points}<br>
                 <img src="data/logosWeb/${team}.webp" width="50" height="50" alt="${team} logo">
             </div>`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px")
                        .transition()
                        .duration(200)
                        .style("opacity", 0.9);
                })
                .on("mouseout", function () {

                    // Reset
                    d3.select(this).style("stroke", "white");
                    vis.tooltip.transition().duration(200).style("opacity", 0);
                });
        });

        // Logic to find the closest data point based on x value (called above)
        function findClosestDataPoint(data, xValue) {
            let closest = data.reduce((prev, curr) => Math.abs(curr.week - xValue) < Math.abs(prev.week - xValue) ? curr : prev);
            return closest;
        }

        // Line for cumulative chart (and make a new group)
        let cumulativeLine = d3.line()
            .x(d => xScale(d.week))
            .y(d => cumulativeYScale(d.cumulative));

        let cumulativeChartGroup = vis.svg.append("g")
            .attr("transform", "translate(0," + (vis.height + 200) + ")");

        // New axes
        cumulativeChartGroup.append("g")
            .attr("transform", "translate(0," + (vis.height * 2) + ")")
            .call(xAxis);

        cumulativeChartGroup.append("g")
            .call(yAxisCumulative);

        // Draw a new line for each team
        teams.forEach(function (team) {
            let teamData = dataForChart.filter(d => d.team === team);

            cumulativeChartGroup.append("path")
                .datum(teamData)
                .attr("fill", "none")
                .attr("stroke", colorScale(team))
                .attr("stroke-width", 2)
                .attr("d", cumulativeLine)
                .attr("class", team + ' ' + 'lineGame')

                // Same styling/hover functionality as the chart above
                .style("stroke", "white")
                .on("mouseover", function (event, d) {
                    d3.select(this).style("stroke", colorScale(team));

                    let mouseX = d3.pointer(event)[0];
                    let closestDataPoint = findClosestDataPoint(teamData, xScale.invert(mouseX));

                    vis.tooltip.html(`
                 <div style="border: thin solid grey; border-radius: 5px; background: white; padding: 5px">
                     <strong class="tooltip-title">${team}</strong><br>
                     Week: ${closestDataPoint.week}<br>
                     Cumulative Points: ${closestDataPoint.cumulative}<br>
                     <img src="data/logosWeb/${team}.webp" width="50" height="50" alt="${team} logo">
                 </div>`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px")
                        .transition()
                        .duration(200)
                        .style("opacity", 0.9);
                })
                .on("mouseout", function () {

                    // Reset and hide again on mouseout
                    d3.select(this).style("stroke", "white");
                    vis.tooltip.transition().duration(200).style("opacity", 0);
                });
        });

        // Add labels to both charts and their respective axes
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Points Scored Each Week, by Team");

        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.top)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Week");

        vis.svg.append("text")
            .attr("x", -10)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Points");

        cumulativeChartGroup.append("text")
            .attr("x", vis.width / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Cumulative Points Scored Each Week, by Team");

        cumulativeChartGroup.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height * 2 + vis.margin.top)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Week");

        cumulativeChartGroup.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Cumulative Points");

    }


    highlightTeam(teamAbbr) {
        console.log('fired myFile.js')
        let vis = this;
        let selectedLines = d3.selectAll(".lineGame")
        selectedLines.each(function () {
            let line = d3.select(this);
            line.style('stroke', 'white')
        });
        selectedLines = d3.selectAll("." + teamAbbr).each(function() {
            let line = d3.select(this);
            let lineClasses = line.attr('class').split(' ');
            if (lineClasses.length === 2) {
                line.style('stroke', 'red')
            }
        });

        let logoDisplayContainer = d3.select(".logo-display");

        logoDisplayContainer.selectAll("img").remove();

        let logoImage = logoDisplayContainer.append("img")
            .attr("src", "data/logosWeb/" + teamAbbr + ".webp")
            .attr("width", 500)
            .attr("height", 500);

    }

}
