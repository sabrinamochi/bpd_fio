import loadData from './load-data';

const $div = d3.select('#large-black')
const $graphic = $div.select('.graphic');
const $widthRef = d3.select('#map .graphic-container .graphic')

let height = 0, width = 0
const MARGIN = {
    top: 10,
    right: 0,
    bottom: 10,
    left: 0
}
let boundedHeight, boundedWidth;

let dataset;

function drawChart(data){

    const stopRScale = d3.scaleSqrt()
        .domain(d3.extent(dataset, d => +d.stopped_per))
        .range([1, 25])

    const rectWidth = boundedWidth/2.5
    const populationXRange = [boundedWidth/3, boundedWidth/3+rectWidth]
    const populationYRange = [stopRScale(1), stopRScale(1)+rectWidth]
    const populationScale = d3.scaleLinear()
        .domain(d3.extent(dataset, d => +d["%black"]))
        .range([3, 150])

    const $container = $graphic
        .append('div')
            .attr('class', 'black-stop-container')
        
    const $title = $container.append('div')
        .attr('class', 'black-stop-chart-title')
        .html(`${data.Name.split(", ")[0]}, ${data.Name.split(", ")[1]}`)
            
    const $svg = $container.append('svg')
                    .attr('width', width)
                    .attr('height', height)
    const $gVis = $svg
        .append('g')
            .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
    
    const numOfCircle = Math.floor(populationScale(+data["%black"]))
    const numOfCircleList = [...Array(numOfCircle).keys()];
    $gVis.append('rect')
        .attr('width', rectWidth)
        .attr('height', rectWidth)
        .attr('transform', `translate(${boundedWidth/3}, ${stopRScale(1)})`)
        .attr('fill', '#81A8AD')
        .attr('fill', 'rgba(0,0,0,0.8)')


    $gVis.selectAll('.popu-circle')
        .data(numOfCircleList)
        .enter()
        .append('circle')
        .attr('r', 1)
        .attr('fill', 'rgba(255,255,255,1)')
        .attr('cx', d => Math.random() * (populationXRange[1] - populationXRange[0]) + populationXRange[0])
        .attr('cy', d => Math.random() * (populationYRange[1] - populationYRange[0]) + populationYRange[0])
    // $gVis.append('circle')
    //     .attr('class', 'black-circle')
    //     .attr('r', blackRScale(data["%black"]))
    //     .attr('transform', `translate(0, ${blackRScale(data["%black"])})`)
    //     .attr('stroke', '#81A8AD')
    //     // .attr('stroke-dasharray', '3,3')
    
    if(stopRScale(data["stopped_per"]) < stopRScale(1)){
        $gVis.append('circle')
        .attr('class', 'stop overall-boston')
        .attr('r', stopRScale(1))
        .attr('transform', `translate(0, ${stopRScale(1)})`)
        .attr('stroke', 'black')
        .attr('stroke-dasharray', '3,3')
        .attr('stroke-width', 2)
        .attr('fill', 'white')

        $gVis.append('circle')
            .attr('class', 'stop stop-circle')
            .attr('r', stopRScale(data["stopped_per"]))
            .attr('transform', `translate(0, ${stopRScale(data["stopped_per"])})`)
            .attr('stroke', '#FF9356')
            .attr('stroke-width', 1)
            .style('mix-blend-mode', 'multiply')  
            .attr('fill', '#FF9356')
            // .attr('fill', 'rgba(0,0,0,0.3)')
    
    } else {
        $gVis.append('circle')
            .attr('class', 'stop stop-circle')
            .attr('r', stopRScale(data["stopped_per"]))
            .attr('transform', `translate(0, ${stopRScale(data["stopped_per"])})`)
            .attr('stroke', '#FF9356')
            .attr('stroke-width', 1)
            .attr('fill', '#FF9356')
        $gVis.append('circle')
            .attr('class', 'stop overall-boston')
            .attr('r', stopRScale(1))
            .attr('transform', `translate(0, ${stopRScale(1)})`)
            .attr('stroke', 'black')
            .attr('stroke-dasharray', '3,3')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
    
    }
        
    
    d3.selectAll('.stop')
        .attr('cx', boundedWidth/3)
        // .attr('fill', 'rgba(255,255,255,1)')
        // .attr('fill', 'none')
              
    
}

function updateDimensions(){
    const h = window.innerHeight, w = window.innerWidth
    height = Math.floor(h*0.1)
    width = $widthRef.node().offsetWidth / 4
    boundedHeight = height - MARGIN.top - MARGIN.bottom
    boundedWidth = width - MARGIN.left - MARGIN.right
}

function resize(){
    updateDimensions()   
}

function init(){
    loadData('shape_with_stops.csv').then(result => {
        dataset = result.filter(d => +d.resident_employee_ratio >=1)
        dataset.sort((a, b) => +b["stopped_per"] - (+a["stopped_per"]))
        resize()
        dataset.forEach(d => drawChart(d))
    })
}

export default { init, resize }