document.addEventListener('DOMContentLoaded', function () {
    d3.csv('data/co2.csv').then(data => {
        const parseTime = d3.timeParse("%a %b %d %H:%M:%S %Y");

        data.forEach(d => {
            d["Local Time"] = parseTime(d["Local Time"]);
            d["CO2_1"] = d["CO2_1"] === "None" ? null : +d["CO2_1"];
            d["CO2_2"] = d["CO2_2"] === "None" ? null : +d["CO2_2"];
        });

        const margin = { top: 20, right: 20, bottom: 30, left: 50 };
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        const line1 = d3.line()
            .defined(d => d["CO2_1"] !== null)
            .x(d => x(d["Local Time"]))
            .y(d => y(d["CO2_1"]));

        const line2 = d3.line()
            .defined(d => d["CO2_2"] !== null)
            .x(d => x(d["Local Time"]))
            .y(d => y(d["CO2_2"]));

        const svg = d3.select("#chart-container").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(d3.extent(data, d => d["Local Time"]));
        y.domain([0, d3.max(data, d => Math.max(d["CO2_1"], d["CO2_2"]))]);

        svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", line1)
            .style("stroke", "yellow")
            .style("fill", "none");

        svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", line2)
            .style("stroke", "red")
            .style("fill", "none");

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));
    });
});
