"use-strict";

let data = "";
let svgContainer = ""; // keep SVG reference in global scope
let popChartContainer = "";
const msm = {
    width: 1000,
    height: 800,
    marginAll: 50,
    marginLeft: 50,
}
const small_msm = {
    width: 500,
    height: 500,
    marginAll: 50,
    marginLeft: 80
}


window.onload = function () {
    svgContainer = d3.select("#chart")
        .append('svg')
        .attr('width', msm.width)
        .attr('height', msm.height);
    popChartContainer = d3.select("#popChart")
        .append('svg')
        .attr('width', 1)
        .attr('height', 1);
    legendContainer = d3.select("#legend")
        .append('svg')
        .attr('width', msm.width)
        .attr('height', msm.height);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./pokemon.csv")
    .then((d) => makeScatterPlot(d))
}

function makeScatterPlot(data) {
console.log("hello");
let def = data.map((row) => parseInt(row["Sp. Def"]));
let total = data.map((row) =>  parseFloat(row["Total"]));


let dropDownG = d3.select("#filter").append("select")
    .attr("name", "Generation");

let dropDownL = d3.select("#Legendfilter").append("select")
    .attr("name", "Legendary");

const axesLimits = findMinMax(def, total);
console.log(axesLimits);
let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total", svgContainer, msm);

plotData(mapFunctions, data);

// draw title and axes labels
makeLabels(svgContainer, msm, "Pokemon: Special Defense vs Total Stats", 'Sp. Def', 'Total');

let generation = [...new Set(data.map(d => d["Generation"]))];
generation.push("All");

let legendary = [...new Set(data.map(d => d["Legendary"]))];
legendary.push("All");
console.log(legendary);
let defaultGeneration = 1;

let Goptions = dropDownG.selectAll("option")
    .data(generation)
    .enter()
    .append("option")
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; })
    .attr("selected", function(d){ return d == defaultGeneration; });

let Loptions = dropDownL.selectAll("option")
    .data(legendary)
    .enter()
    .append("option")
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; })
    .attr("selected", function(d){ return d == "True"; });


var currL = "All";
var currG = "All";

dropDownG.on("change", function() {
    currG = this.value;
    showCirclesG(this, data, currL);
});



dropDownL.on("change", function() {
    currL = this.value;
    showCirclesL(this, data, currG);
});



}

function showCirclesG(me, data, currL) {
    let selected = me.value;
    displayOthers = me.checked ? "inline" : "none";
    display = me.checked ? "none" : "inline";
    console.log(selected, currL);
    svgContainer.selectAll(".circles")
        .data(data)
        .filter(function(d) {
            if(currL != "All")
            {
                return selected != d["Generation"] || currL != d["Legendary"];
            }
            else
            return selected != d["Generation"] ;
        })
        .attr("display", displayOthers);
        
    svgContainer.selectAll(".circles")
        .data(data)
        .filter(function(d) {
            if(currL != "All")
            {
                return selected == d["Generation"] && currL == d["Legendary"];
            }
            else
            return selected == d["Generation"] ;
        })
        .attr("display", display);

    if(selected == "All" && currL != "All") 
    {
        svgContainer.selectAll(".circles")
        .data(data)
        .filter(function(d) {return currL == d["Legendary"];})
        .attr("display", display);
    }
    if(selected == "All" && currL == "All")
    {
        svgContainer.selectAll(".circles")
        .data(data)
        .attr("display", display);
    }
}

function showCirclesL(me, data, currG) {
    console.log(me.value, currG);
    let selected = me.value;
    displayOthers = me.checked ? "inline" : "none";
    display = me.checked ? "none" : "inline";
    svgContainer.selectAll(".circles")
        .data(data)
        .attr("display", display);
    svgContainer.selectAll(".circles")
        .data(data)
        .filter(function(d) {
            if(currG != "All")
            {
                return selected != d["Legendary"] || currG != d["Generation"];
            }
            
            else
            return selected != d["Legendary"];
        })
        .attr("display", displayOthers);
        
    svgContainer.selectAll(".circles")
        .data(data)
        .filter(function(d) {
            if(currG != "All")
            return selected == d["Legendary"] && currG == d["Generation"];
            else
            return selected == d["Legendary"];
        })
        .attr("display", display);
    if(selected == "All" && currG != "All") 
    {
        svgContainer.selectAll(".circles")
        .data(data)
        .filter(function(d) {
                return currG == d["Generation"];
        })
        .attr("display", display);
    }
    if(selected == "All" && currG == "All")
    {
        svgContainer.selectAll(".circles")
        .data(data)
        .attr("display", display);
    }
}

function plotData(map, data) {
    // get population data as array

    let pop_data = data.map((row) => +row["Sp. Def"]);
    let pop_limits = d3.extent(pop_data);
    // make size scaling function for population


    let type1 = data.map((row) => row["Type 1"]);
    console.log(type1);
    var color = d3.scaleOrdinal()
    .domain(Array.from(new Set(type1)))
    .range([ "#4E79A7", "#A0CBE8", "#F28E2B", "#FFBE&D", "#59A14F", "#8CD17D", "#B6992D", "#499894"
    , "#86BCB6", "#86BCB7", "#E15759", "#FF9D9A", "#79706E", "#BAB0AC", "#D37295"]);



    legendContainer.selectAll("mydots")
    .data(Array.from(new Set(type1)))
    .enter()
    .append("circle")
        .attr("cx", 100)
        .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return color(d)});

    legendContainer.selectAll("mylabels")
    .data(Array.from(new Set(type1)))
    .enter()
    .append("text")
    .attr("x", 120)
    .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", "black")
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

    console.log(color);
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;
    console.log("xMap");

    let div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // let toolTipChart = div.append("div").attr("id", "tipChart")
    let toolChart = div.append('svg')
        .attr('width', small_msm.width)
        .attr('height', small_msm.height)

    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        // .attr('stroke', "#69b3a2")
        .attr('stroke-width', 2)
        .attr("class", "circles")
        .attr('r', 7)
        .style("fill", function(d) { return color((d["Type 1"]));})
        // add tooltip functionality to points
        .on("mouseover", (d) => {
            toolChart.selectAll("*").remove()
            div.transition()
                .duration(200)
                .style("opacity", .9);
                div.html("" + "<b>" + d["Name"] + "</b>" + "<br/>" +
                        "" + d["Type 1"] + "<br/>" +
                        "" + d["Type 2"])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
            
        })
        .on("mouseout", (d) => {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

function makeLabels(svgContainer, msm, title, x, y) {
svgContainer.append('text')
    .attr('x', (msm.width - 2 * msm.marginAll) / 2 - 90)
    .attr('y', msm.marginAll / 2 + 10)
    .style('font-size', '10pt')
    .text(title);

svgContainer.append('text')
    .attr('x', (msm.width - 2 * msm.marginAll) / 2 - 30)
    .attr('y', msm.height - 10)
    .style('font-size', '10pt')
    .text(x);

svgContainer.append('text')
    .attr('transform', 'translate( 15,' + (msm.height / 2 + 30) + ') rotate(-90)')
    .style('font-size', '10pt')
    .text(y);
}

function drawAxes(limits, x, y, svgContainer, msm) {
    // return x value from a row of data
    let xValue = function (d) {
        return +d[x];
    }
    console.log(limits);

    // function to scale x value
    let xScale = d3.scaleLinear()
        .domain([limits.defMin - 5, limits.defMax + 5]) // give domain buffer room
        .range([0 + msm.marginAll, msm.width - msm.marginAll])

    // xMap returns a scaled x value from a row of data
    let xMap = function (d) {
        return xScale(xValue(d));
    };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
        .attr('transform', 'translate(0, ' + (msm.height - msm.marginAll) + ')')
        .call(xAxis);

    // return y value from a row of data
    let yValue = function (d) {
        return +d[y]
    }

    // function to scale y
    let yScale = d3.scaleLinear()
        .domain([limits.totalMax + 15, limits.totalMin - 15]) // give domain buffer
        .range([0 + msm.marginAll, msm.height - msm.marginAll])

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) {
        return yScale(yValue(d));
    };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
        .attr('transform', 'translate(' + msm.marginAll + ', 0)')
        .call(yAxis);

    // return mapping and scaling functions
    return {
        x: xMap,
        y: yMap,
        xScale: xScale,
        yScale: yScale
    };
}

function findMinMax(def, total) {
    return {
        defMin: d3.min(def),
        defMax: d3.max(def),
        totalMin: d3.min(total),
        totalMax: d3.max(total)
    }
}
