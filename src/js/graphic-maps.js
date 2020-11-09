/* global d3 */
import loadData from './load-data'
import * as topojson from 'topojson';

const zipData = require('./ZIP_Codes')
const mapData = zipData.geoData;

const $div = d3.select('#map');
const $graphicContainer = $div.select('.graphic-container')
const $graphic = $graphicContainer.select('.graphic')
const $title = $graphic.select('.map-title')
const $svg = $graphic.select('svg')
const $gVis = $svg.select('g')
const $leftArrow = $graphicContainer.select('.left-arrow')
const $rightArrow = $graphicContainer.select('.right-arrow')

let height = 0, width = 0;
const MARGIN = {
    top: 10,
    right: 10,
    bottom: 20,
    left: 20
}
let boundedWidth, boundedHeight;
let stopData, geoData;

const columnNameList = ['crime', 'stopped_per', 'percent_black']
const colorList = ['#7F54C9', '#FF0016', '#81A8AD']
let count = 0;

$leftArrow.on('click', () => {
    count -= 1
    if (count < 0){
        count = 0
    }
    updateChart(columnNameList[count], colorList[count])
    $leftArrow.classed('arrow-bounce', false)
})

$rightArrow.on('click', () => {
    count +=1 
    if (count > 2){
        count = 2
    }
    updateChart(columnNameList[count], colorList[count])
    $rightArrow.classed('arrow-bounce', false)
})

const geoPath = d3.geoPath()

function updateChart(columnName, color){

    const colorScale = d3.scaleLinear()
        .domain(d3.extent(geoData.objects["ZIP_Codes (1)"].geometries, d => d.properties[columnName]))
        .range(['white', color])

    $gVis.selectAll( ".map-path" )
        .attr("fill", d => {
            if (d.properties.hasOwnProperty(columnName)){
                return colorScale(d.properties[columnName])
            } else {
                return "rgba(0,0,0,0.2)"
            }
        })

    let title = ''

    if (columnNameList[count] == 'crime'){
        title = 'Crime Index'
    } else if (columnNameList[count] == 'stopped_per'){
        title = 'Stops per 100 People'
    } else {
        title = 'Percentage of Blacks'
    }    

    $title.html(title)
    
}

function drawChart(){
    $gVis.selectAll( ".map-path" )
        .data(topojson.feature(geoData, geoData.objects["ZIP_Codes (1)"]).features) 
        .enter()
        .append( "path" )
        .attr('class', 'map-path')
        .attr( "d", d => geoPath(d))
        .attr( "stroke", "black")
}

function updateDimensions(){
    const h = window.innerHeight;
    const isMobile = h <= 600 ? true : false
    height = isMobile ? Math.floor(h * 0.5) : Math.floor(h*0.6);
    width = $graphic.node().offsetWidth
    boundedWidth = width - MARGIN.left - MARGIN.right;
    boundedHeight = height - MARGIN.top - MARGIN.bottom;
}

function resize() {
    updateDimensions();
    // $graphicContainer.style('height', `${height}px`)
    $svg.attr('width', boundedWidth)
        .attr('height', boundedHeight)
    $gVis.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
    const albersProjection = d3.geoAlbers()
        .scale( 120000 )
        .rotate( [71.057,0] )
        .center( [0, 42.313] )
        .translate( [boundedWidth/2, boundedHeight/2] )

    geoPath.projection( albersProjection );
    
}

function init() {
    loadData(['shape_with_stops.csv', 'ZIP_Codes.json']).then(result => {
        stopData = result[0].filter(d => +d.resident_employee_ratio >=1)
        geoData = result[1]
        
        geoData.objects["ZIP_Codes (1)"].geometries.forEach(g => {
            stopData.forEach(d => {
                if (d.zip.slice(-5) == g.properties.ZIP5){
                        g.properties.total_population = +d["population"]
                        g.properties.black_pop = +d["black_pop"]
                        g.properties.white_pop = +d["white_pop"]
                        g.properties.percent_black = +d["%black"]
                        g.properties.percent_white = +d["%white"]
                        g.properties.num_of_stop = +d["num_of_stops"]
                        g.properties.stopped_per = +d["stopped_per"]
                        g.properties.per_black_stopped_within_blacks = +d["per_black_stopped_within_blacks"]
                        g.properties.per_white_stopped_within_whites = +d["per_white_stopped_within_whites"]
                        g.properties.crime = +d["crime"]     
                }
            })
        })
        // console.log(geoData)
        resize()
        drawChart()
        updateChart(columnNameList[0], colorList[0])
	}).catch(console.error);

}

export default { init, resize };
