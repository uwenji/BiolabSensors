document.addEventListener('DOMContentLoaded', function () {
    // Theme switcher
    const themeToggleButton = document.getElementById('theme-toggle');
    const body = document.body;
    const header = document.querySelector('header');
    const chartContainer = document.getElementById('chart-container');

    themeToggleButton.addEventListener('click', () => {
        if (body.classList.contains('light')) {
            body.classList.replace('light', 'dark');
            header.classList.replace('light', 'dark');
            chartContainer.classList.replace('light', 'dark');
            themeToggleButton.textContent = 'Light';
        } else {
            body.classList.replace('dark', 'light');
            header.classList.replace('dark', 'light');
            chartContainer.classList.replace('dark', 'light');
            themeToggleButton.textContent = 'Dark';
        }
    });

    // Load CSV data and render chart
    d3.csv('data/electronphoresis_data2.csv').then(data => {
        const parseTime = d3.timeParse("%a %b %d %H:%M:%S %Y");

        data.forEach(d => {
            d["Local Time"] = parseTime(d["Local Time"]);
            d["CO2_1"] = d["electronphoresis"] === "None" ? null : +d["electronphoresis"];
            d["CO2_2"] = d["reservoir"] === "None" ? null : +d["reservoir"];
        });

        const margin = { top: 20, right: 20, bottom: 30, left: 50 };
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

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

        const svgMain = d3.select("#main-chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const svgZoomed = d3.select("#zoomed-chart").append("svg")
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
            .style("stroke", "red")
            .style("stroke-width", 1.5)
            .style("fill", "none");

        svgMain.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svgMain.append("g")
            .call(d3.axisLeft(y));

        // Add brushing
        const brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on("brush end", brushed);

        svgMain.append("g")
            .attr("class", "brush")
            .call(brush);

        // Preselect last 4 hours
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
                    .style("stroke", "red")
                    .style("stroke-width", 1.5)
                    .style("fill", "none");

                svgZoomed.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(zoomedX));

                svgZoomed.append("g")
                    .call(d3.axisLeft(zoomedY));
            }
        }
    }).catch(error => {
        console.error('Error loading CSV file:', error);
    });
});
