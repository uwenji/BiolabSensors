document.addEventListener('DOMContentLoaded', function () {
    const margin = { top: 10, right: 10, bottom: 100, left: 40 },
          margin2 = { top: 10, right: 10, bottom: 20, left: 40 },
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom,
          height2 = 150 - margin2.top - margin2.bottom;

    const parseDate = d3.timeParse("%a %b %d %H:%M:%S %Y");

    const x = d3.scaleTime().range([0, width]),
          x2 = d3.scaleTime().range([0, width]),
          y = d3.scaleLinear().range([height, 0]),
          y2 = d3.scaleLinear().range([height2, 0]);

    const xAxis = d3.axisBottom(x),
          xAxis2 = d3.axisBottom(x2),
          yAxis = d3.axisLeft(y);

    const brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    const zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    const area = d3.area()
        .curve(d3.curveMonotoneX)
        .x(d => x(d.date))
        .y0(height)
        .y1(d => y(d.value));

    const area2 = d3.area()
        .curve(d3.curveMonotoneX)
        .x(d => x2(d.date))
        .y0(height2)
        .y1(d => y2(d.value));

    const line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => x(d.date))
        .y(d => y(d.value));

    const line2 = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => x2(d.date))
        .y(d => y2(d.value));

    const svg1 = d3.select("#chart1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const svg2 = d3.select("#chart2").append("svg")
        .attr("width", width + margin2.left + margin2.right)
        .attr("height", height2 + margin2.top + margin2.bottom);

    const focus = svg1.append("g")
        .attr("class", "focus")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const context = svg2.append("g")
        .attr("class", "context")
        .attr("transform", `translate(${margin2.left},${margin2.top})`);

    d3.csv("data/co2.csv", type).then(data => {
        x.domain(d3.extent(data, d => d.date));
        y.domain([0, d3.max(data, d => d.value)]);
        x2.domain(x.domain());
        y2.domain(y.domain());

        focus.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area);

        focus.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        context.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area2);

        context.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line2);

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0,${height2})`)
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());

        svg1.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .call(zoom);
    });

    function brushed(event) {
        if (event.selection) {
            const s = event.selection || x2.range();
            x.domain(s.map(x2.invert, x2));
            focus.select(".area").attr("d", area);
            focus.select(".line").attr("d", line);
            focus.select(".axis--x").call(xAxis);
            svg1.select(".zoom").call(zoom.transform, d3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));
        }
    }

    function zoomed(event) {
        if (event.transform) {
            const t = event.transform;
            x.domain(t.rescaleX(x2).domain());
            focus.select(".area").attr("d", area);
            focus.select(".line").attr("d", line);
            focus.select(".axis--x").call(xAxis);
            context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
        }
    }

    function type(d) {
        d.date = parseDate(d['Local Time']);
        d.value = +d.CO2_1;
        return d;
    }
});
