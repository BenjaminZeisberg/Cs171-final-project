class GameVis {

    constructor(_parentElement, _data, _teamAbbr) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.teams = _teamAbbr;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.updateVis();
    }
    updateVis() {
        let vis = this;

        let logoWidth = 50;
        let logoSpacing = 10;
        let logosPerRow = Math.ceil(vis.teams.length / 2);
        let rowHeight = logoWidth + logoSpacing;

        vis.teams.forEach(function(teamAbbr, index) {
            let rowIndex = Math.floor(index / logosPerRow);
            let columnIndex = index % logosPerRow;

            let xPosition = columnIndex * (logoWidth + logoSpacing);
            let yPosition = rowIndex * rowHeight;

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
                console.log(teamAbbr);
            });
        });
    }


    // updateVis() {
    //     let vis = this
    //
    //     let logoWidth = 250; // Adjust logo width as needed
    //     let logoSpacing = (vis.width - (logoWidth * vis.teams.length)) / (vis.teams.length + 1); // Dynamic spacing
    //
    //     vis.teams.forEach(function(teamAbbr, index) {
    //         let xPosition = logoSpacing + index * (logoWidth + logoSpacing); // Dynamically calculate x position
    //         let yPosition = 50; // Adjust vertical position as needed
    //
    //         // For the hover we create an underlying circle for the logo
    //         vis.svg.append("circle")
    //             .attr("cx", xPosition) // Center of the logo
    //             .attr("cy", yPosition) // Center of the logo
    //             .attr("r", logoWidth / 2) // Radius to cover the logo
    //             .style("fill", "transparent")
    //             .style("cursor", "pointer"); // Change cursor on hover to indicate interactivity
    //
    //         vis.svg.append("image")
    //             .attr("xlink:href", "data/logosWeb/" + teamAbbr + ".webp") // Assuming the logo files are named after the team abbreviations
    //             .attr("x", xPosition)
    //             .attr("y", yPosition)
    //             .attr("width", 50) // Set your desired width
    //             .attr("height", 50); // Set your desired height
    //     });
    // }

}