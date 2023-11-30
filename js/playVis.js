class PlayVis {

    constructor(_parentElement, _data, _teamAbbr, _plays, _testPlay) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.play = _plays;
        this.teams = _teamAbbr;
        this.testPlay = _testPlay;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 40, right: 0, bottom: 60, left: 60};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Numbers are from the standard length of a football field :)
        vis.xScale = d3.scaleLinear()
            .domain([0, 120]) // 0 to 120 yards
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain([0, 53.3]) // 0 to 53.3 yards for y-axis
            .range([0, vis.height]);
        vis.wrangleData();
    }

    updateVis() {
        let vis = this;

        // Draw the field
        vis.svg.append('rect')
            .attr('x', vis.xScale(0))
            .attr('y', vis.yScale(0))
            .attr('width', vis.xScale(120))
            .attr('height', vis.yScale(53.3))
            .attr('fill', '#828c23');

        // Draw the end zones
        vis.svg.append('rect')
            .attr('x', vis.xScale(0))
            .attr('y', vis.yScale(0))
            .attr('width', vis.xScale(10)) // End zones are 10 yards deep
            .attr('height', vis.yScale(53.3))
            .attr('fill', '#1B4079');

        vis.svg.append('rect')
            .attr('x', vis.xScale(110)) // Start at 110 yards for the other end zone
            .attr('y', vis.yScale(0))
            .attr('width', vis.xScale(10))
            .attr('height', vis.yScale(53.3))
            .attr('fill', '#1B4079');

        // Draw yard lines
        for (let i = 10; i <= 110; i += 10) {
            vis.svg.append('line')
                .attr('x1', vis.xScale(i))
                .attr('y1', vis.yScale(0))
                .attr('x2', vis.xScale(i))
                .attr('y2', vis.yScale(53.3))
                .attr('stroke', 'white')
                .attr('stroke-width', 2);
        }

        for (let i = 10; i <= 110; i += 10) {
            vis.svg.append('text')
                .attr('x', vis.xScale(i))
                .attr('y', vis.yScale(53.3 / 2)) // Position at the middle of the field
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')
                .text(`${i}`);
        }

        // Draw a circle for each unique ID
        vis.uniqueIds.forEach(nflId => {
            // Find the initial position for each ID
            let initialPos = vis.testPlay.find(d => d.nflId === nflId);
            vis.svg.append('circle')
                .attr('cx', vis.xScale(initialPos.x)) // Use a scale function for x
                .attr('cy', vis.yScale(initialPos.y)) // Use a scale function for y
                .attr('r', 5)
                .attr('fill', nflId === 'football' ? 'brown' : 'red')
                .attr('class', 'player-circle')
                .attr('data-nflid', nflId);
        });
    }

    wrangleData(teamAbbr) {
        let vis = this

        // Map each team to its game IDs
        let gamesTeam = vis.teams.map(team => {
            let gameIds = vis.data.filter(game =>
                game.homeTeamAbbr === team || game.visitorTeamAbbr === team
            ).map(game => game.gameId);
            return [team, gameIds];
        });

        vis.uniqueIds = new Set(vis.testPlay.map(d => d.nflId));
        vis.updateVis();
    }
}