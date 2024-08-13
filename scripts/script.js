document.addEventListener('DOMContentLoaded', function () {

    // Function to interpolate missing values
    function interpolateMissingValues(data, field) {
        let previousValidIndex = null;
        let nextValidIndex = null;

        data.forEach((d, i) => {
            if (d[field] !== null) {
                if (previousValidIndex !== null) {
                    let startValue = data[previousValidIndex][field];
                    let endValue = d[field];
                    let steps = i - previousValidIndex;
                    let stepValue = (endValue - startValue) / steps;
                    for (let j = previousValidIndex + 1; j < i; j++) {
                        data[j][field] = startValue + stepValue * (j - previousValidIndex);
                    }
                }
                previousValidIndex = i;
            }
        });

        // Handle trailing null values
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i][field] === null) {
                data[i][field] = data[previousValidIndex][field];
            } else {
                previousValidIndex = i;
            }
        }
    }


    // Load CSV data and render chart
    d3.csv('data/co2_cleaned.csv').then(data => {
        const parseTime = d3.timeParse("%a %b %d %H:%M:%S %Y"); //Thu Jul 11 18:20:11 2024
        const tbody = d3.select("#data-table tbody");
        const formatTime = d3.timeFormat("%Y-%m-%d %H:%M:%S");

        data.forEach(d => {
            d["Local Time"] = parseTime(d["Local Time"]);
            d["CO2_1"] = d["CO2_1"] === "None" ? null : +d["CO2_1"];
            d["CO2_2"] = d["CO2_2"] === "None" ? null : +d["CO2_2"];
            tbody.append("tr")
                .html(`
                    <td>${formatTime(d["Local Time"])}</td>
                    <td>${d["CO2_1"] !== null ? d["CO2_1"] : ''}</td>
                    <td>${d["CO2_2"] !== null ? d["CO2_2"] : ''}</td>
                `);
        });
        // Populate the table


        // Interpolate missing values for CO2_2
        interpolateMissingValues(data, "CO2_2");

        const margin = { top: 10, right: 10, bottom: 100, left: 40 },
        margin2 = { top: 430, right: 10, bottom: 20, left: 40 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        height2 = 500 - margin2.top - margin2.bottom;

        const x = d3.scaleTime().range([0, width]),
              x2 = d3.scaleTime().range([0, width]),
              y = d3.scaleLinear().range([height, 0]),
              y2 = d3.scaleLinear().range([height2, 0]);

        const line1 = d3.line()
            .defined(d => d["CO2_1"] !== null)
            .x(d => x(d["Local Time"]))
            .y(d => y(d["CO2_1"]))
            .curve(d3.curveLinear);

        const line2 = d3.line()
            .defined(d => d["CO2_2"] !== null)
            .x(d => x(d["Local Time"]))
            .y(d => y(d["CO2_2"]))
            .curve(d3.curveLinear);

        const svgMain = d3.select("#chart2").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const svgZoomed = d3.select("#chart1").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(d3.extent(data, d => d["Local Time"]));
        y.domain([0, d3.max(data, d => Math.max(d["CO2_1"], d["CO2_2"]))]);

   

        svgMain.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", line1)
            .style("stroke", "steelblue")
            .style("stroke-width", 1.5)
            .style("fill", "none");

        svgMain.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", line2)
            .style("stroke", "green")
            .style("stroke-width", 1.5)
            .style("fill", "none");

        svgMain.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svgMain.append("g")
            .call(d3.axisLeft(y));

        // Add the Y gridlines and label
        svgMain.append("g")
            .call(d3.axisLeft(y).ticks(height / 40))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width)
                .attr("stroke-opacity", 0.1));
            // .call(g => g.append("text")
            //     .attr("x", -margin.left)
            //     .attr("y", 10)
            //     .attr("fill", "currentColor")
            //     .attr("text-anchor", "start")
            //     .text("↑ CO2 (ppm)"));

        // Add brushing
        const brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on("brush end", brushed);

        svgMain.append("g")
            .attr("class", "brush")
            .call(brush);

        // Preselect last 1 hours
        const lastDate = x.domain()[1];
        const firstDate = new Date(lastDate.getTime() - 60 * 60 * 1000);
        const initialSelection = [x(firstDate), x(lastDate)];

        svgMain.select(".brush").call(brush.move, initialSelection);

        function brushed(event) {
            if (event.selection) {
                const [x0, x1] = event.selection.map(d => x.invert(d));
                const filteredData = data.filter(d => d["Local Time"] >= x0 && d["Local Time"] <= x1);

                // Update x domain for zoomed chart
                const zoomedX = d3.scaleTime()
                    .domain([x0, x1])
                    .range([0, width]);

                // Update y domain for zoomed chart
                const zoomedY = d3.scaleLinear()
                    .domain([0, d3.max(filteredData, d => Math.max(d["CO2_1"], d["CO2_2"]))])
                    .range([height, 0]);

                // Clear previous zoomed chart
                svgZoomed.selectAll("*").remove();

                // Add new paths to zoomed chart
                svgZoomed.append("path")
                    .data([filteredData])
                    .attr("class", "line")
                    .attr("d", line1.x(d => zoomedX(d["Local Time"])).y(d => zoomedY(d["CO2_1"])))
                    .style("stroke", "steelblue")
                    .style("stroke-width", 1.5)
                    .style("fill", "none");

                svgZoomed.append("path")
                    .data([filteredData])
                    .attr("class", "line")
                    .attr("d", line2.x(d => zoomedX(d["Local Time"])).y(d => zoomedY(d["CO2_2"])))
                    .style("stroke", "green")
                    .style("stroke-width", 1.5)
                    .style("fill", "none");

                svgZoomed.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(zoomedX));

                svgZoomed.append("g")
                    .call(d3.axisLeft(zoomedY));
                // Add the Y gridlines and label
                svgZoomed.append("g")
                    .call(d3.axisLeft(zoomedY).ticks(height / 40))
                    .call(g => g.select(".domain").remove())
                    .call(g => g.selectAll(".tick line").clone()
                        .attr("x2", width)
                        .attr("stroke-opacity", 0.1));
            }
        }
    
        

        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('keyup', function () {
            const searchTerm = searchInput.value.toLowerCase();
            const rows = tbody.selectAll("tr").nodes();
            rows.forEach(row => {
                const cells = row.querySelectorAll("td");
                const match = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(searchTerm));
                row.style.display = match ? '' : 'none';
            });
        });

    }).catch(error => {
        console.error('Error loading CSV file:', error);
    });
});
