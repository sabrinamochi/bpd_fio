/* global d3 */
import loadData from './load-data'
import scrollama from 'scrollama'
import * as ss from 'simple-statistics'

const $div = d3.select('#scatter');
const $graphic = $div.select('.scroll__graphic');
var $tip = $div.append("div").attr("class", "tip");
const $text = $div.select('.scroll__text');
const $step = $text.selectAll('.step')
const $svg = $graphic.select('svg')
const $gVis = $svg.select('.vis')
const $xAxis = $svg.select('.x-axis')
const $yAxis = $svg.select('.y-axis')

let height = 0, width = 0;
const MARGIN = {
    top: 20,
    right: 10,
    bottom: 30,
    left: 60
}
let boundedWidth, boundedHeight;

let dataset;


// function getLinearRegression(){
//     return ss.linearRegression(dataset.map(d => [d.crime, d.stopped_per]))
// }

// function getLineGen(x, y){
//     return d3.line()
//         .x(d => x(d.x))
//         .y(d => y(d.y))
// }

function getColor(){
    return d3.scaleOrdinal()
    .domain(dataset.map(d => d.Name))
    // color generator: http://jnnnnn.github.io/category-colors-constrained.html
    .range(["#3957ff", "#c9080a", "#fec7f8", "#0b7b3e", "#0bf0e9", "#c203c8", "#fd9b39", "#888593", "#906407", "#98ba7f", "#fe6794", "#10b0ff", "#ac7bff", "#fee7c0", "#964c63", "#1da49c", "#0ad811", "#bbd9fd", "#fe6cfe", "#297192", "#d1a09c", "#78579e", "#81ffad", "#739400", "#ca6949", "#d9bf01", "#646a58", "#d5097e", "#bb73a9"])
}

function drawChart(){
    const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, d => d.crime))
    .range([0, boundedWidth])
    const xAxis = $xAxis
            .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top + boundedHeight})`)
            .call(d3.axisBottom(xScale))
    const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, d => d.stopped_per))
        // .domain([0, 100])
        .range([boundedHeight, 0])
    const yAxis = $yAxis
            .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
            .call(d3.axisLeft(yScale))
    const yLabel = $svg.append('text')
            .attr('class', 'label y-label')
            .text('Stops per 100 People')
            .attr('transform', `rotate(-90)`)
            .attr('y', 12)
            .attr('x', -(height/2))
            .attr('text-anchor', 'middle')
    const xLabel = $svg.append('text')
            .attr('class', 'label', 'x-label')
            .text('Crime Index')
            .attr('transform', `translate(${MARGIN.left + boundedWidth/2}, ${MARGIN.top + boundedHeight + 30})`)
            .attr('text-anchor', 'middle')
          
    const colorScale = getColor()
    const $neighborhood = $gVis.selectAll('.neighborhood')
        .data(dataset)
    const $neighborhoodEnter = $neighborhood.enter()
            .append('circle')
            .attr('class', 'neighborhood')
            .attr('cx', d => xScale(d.crime))
            .attr('cy', d => yScale(d.stopped_per))
            .attr('r', 5)
            .attr('fill', d => colorScale(d.Name))
            // .on("mouseover", function() {
            //     $tip.style("display", null);
            //   })
            // .on("mouseout", function() {
            //     $tip.style("display", "none");
            // })
            // .on("mousemove", function(d) {
            //     console.log(d)
            //     return $tip
            //       .style("left", d3.event.pageX + "px")
            //       .style("top", d3.event.pageY + 10 + "px")
            //       .style("visibility", "visible")
            //       .html(function() {
            //         return '<div style="border:1px solid #ccc;">' +
            //           '<p style="font-weight:bold;">' + d.y + '</p>' +
            //           '</div>';
            //       })
            
            // })
    const $neighborhoodMerge = $neighborhoodEnter.merge($neighborhood);
    
    $gVis.selectAll('.neighborhood-text')
        .data(dataset)
        .enter()
        .append('text')
        .attr('class', d => {
            if (+d["%black"]/100 >= 0.5){
                return 'more-black-circle'
            } else if(d.neighborhood == 'Brighton' || d.neighborhood == 'Allston') {
                return 'more-white-circle'
            } else {
                return;
            }
        })
            .text( d => {
                if (+d["%black"]/100 >= 0.5 || (d.neighborhood == 'Brighton' || d.neighborhood == 'Allston')){
                    return d.neighborhood
                } else {
                    return;
                }
            })
            .attr('x', d => xScale(d.crime) - 40)
            .attr('y', d => yScale(d.stopped_per) - 6)
            .attr('font-size', 10)
            .attr('font-family', 'Helvetica')
            .attr('opacity', 0)
}

// const linearRegression = getLinearRegression()
// const linearRegressionLine = ss.linearRegressionLine(linearRegression)
// function regressionPoints() {
//         const firstX = dataset[1].crime;
//         const lastX = dataset.slice(-1)[0].crime;
//         const xCoordinates = [firstX, lastX];
            
//         return xCoordinates.map(d => ({
//             x: d,   // We pick x and y arbitrarily, just make sure they match d3.line accessors
//             y: linearRegressionLine(d)
//         }));
//         }
// const lineGen = getLineGen(xScale, yScale);
// $gVis.append('path')
//     // .classed('regressionLine', true)
    //     .datum(regressionPoints())
    //     .attr('d', lineGen)
    //     .attr('stroke', 'black')
    //     .attr('stroke-width', 5)


const scroller = scrollama()
let currentStep = 'high-crime'

const STEP = {
    'high-crime': () => {
        const colorScale = getColor()
        $gVis.selectAll('.neighborhood')
        .attr('fill', d => {
            if (+d["%black"]/100 >= 0.5){
                return colorScale(d.Name)
            } else {
                return 'rgba(0,0,0,0.1)'
            }
        })
        $gVis.selectAll('.more-black-circle')
            .attr('opacity', 1)

        $gVis.selectAll('.more-white-circle')
            .attr('opacity', 0)
        
    },
    'exceptions': () => {
        const colorScale = getColor()
        $gVis.selectAll('.neighborhood')
            .attr('fill', d => {
                if (d.neighborhood == 'Brighton' || d.neighborhood == 'Allston'){
                    return colorScale(d.Name)
                } else {
                    return 'rgba(0,0,0,0.1)'
                }
            })
        $gVis.selectAll('.more-black-circle')
            .attr('opacity', 0)
        $gVis.selectAll('.more-white-circle')
            .attr('opacity', 1)
    }
}

function handleStepEnter({index, element, direction}){
    currentStep = d3.select(element).attr('data-step')
    STEP[currentStep]();
}

function setupScroller(){
    scroller.setup({
        step: $step.nodes(),
        offset:0.6
    })
    .onStepEnter(handleStepEnter)
}

function updateDimensions(){
    const h = window.innerHeight;
    const isMobile = h <= 600 ? true : false
    height = isMobile ? Math.floor(h * 0.5) : Math.floor(h*0.5);
    width = $graphic.node().offsetWidth;
    boundedWidth = width - MARGIN.left - MARGIN.right
    boundedHeight = height - MARGIN.top - MARGIN.bottom
    $svg.attr('width', width)
        .attr('height', height)
    $gVis.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
}

function resize() {
    updateDimensions();
}

function init() {
    loadData('shape_with_stops.csv').then(result => {
        
        dataset = result.filter(d => +d.resident_employee_ratio >= 1 && d.ZIP5 !== "")
        dataset.map(d => {
            d.crime = +d.crime
            d.stopped_per = +d.stopped_per
            d.neighborhood = d.Name.split(', ')[1]
        })
        dataset.sort((a, b) => a.crime - b.crime)
        console.log(dataset)
        resize()
        drawChart()
        setupScroller()
        }).catch(console.error);
}

export default { init, resize };
