import loadData from "./load-data"
import scrollama from 'scrollama'
import Stickyfill from 'stickyfilljs'

// select person 
const $div = d3.select('#select-person')
const $paragraph = $div.select('.select-person-intro').select('.paragraph')
const $buttonG = $div.select('.select-person-intro').select('.button-group')
const $personA = $buttonG.select('.left-person')
const $personB = $buttonG.select('.right-person')
const $assignedPerson = $div.select('.select-person-intro').select('.assigned-person')
const $result = $div.select('.result')
const $step = $result.selectAll('.step')
const $overallBoston = $step.select('.overall-boston')
const $blackPop = $step.select('.black-pop')
const $yourNeighborhoodChance = $step.select('.your-neighborhood-chance')
const $graphic = $div.select('.sticky-div').select('.graphic')
const $svg = $graphic.select('svg')
const $gVis = $svg.select('g')

// by race
const $raceDiv = d3.select('#stop-by-race')
const $raceParagraph = $raceDiv.select('.stop-by-race-intro').select('.paragraph p')
const $raceResult = $raceDiv.select('.result')
const $raceStep = $raceResult.selectAll('.step')
const $yourWhitePop = $raceStep.select('.your-white-pop')
const $yourRace = $raceStep.select('.your-race-in-boston')
const $ifAnother = $raceStep.select('.if-another')
const $raceGraphic = $raceDiv.select('.sticky-div').select('.graphic')
const $raceSvg = $raceGraphic.select('svg')
const $raceGVis = $raceSvg.select('g')

// following divs
const $largeBlack = d3.select('#large-black')
const $byRaceConclusion = d3.select('#by-race-conclusion')

let dataset, selData, stoppedChance;
let race, switchedRace, neighborhood, black_pop, white_pop, stop_black, stop_white

let height = 0, width = 0;
const MARGIN = {
    top: 10,
    right: 10,
    bottom: 20,
    left: 20
}
let boundedWidth, boundedHeight

const scroller = scrollama();
const raceScroller = scrollama();

let currentStep = 'assigned-person';
let currentRaceStep = 'your-race-in-boston';

function getRScale(){
    return d3.scaleSqrt()
    .domain(d3.extent(dataset, d => d.stopped_per))
    .range([10, 80])
}
const STEP = {
    'assigned-person': () => {
    }, 
    'overall-boston': () => {
        
        const rScale = getRScale()            
       
        $gVis.select('.boston-circle')
            .attr('opacity', 1)
            .transition()
            .duration(500)
            .attr('r', rScale(1))
            
        $gVis.select('.your-neighborhood-circle')
            .attr('opacity', 0)

        $gVis.select('.pop-rect')
            .attr('opacity', 0)
    },
    'black-pop': () => {
        $gVis.select('.pop-rect')
            .transition()
            .duration(1000)
            .attr('opacity', 1)
    },
    'your-neighborhood-chance': () => {
        const rScale = getRScale()            
        $gVis.select('.your-neighborhood-circle')
            .attr('opacity', 1)
            .transition()
            .duration(1000)
            .attr('r', rScale(selData[0].stopped_per))
    }
}

const RACE_STEP = {
    'your-white-pop': () => {
        $raceGVis.select('.pop-rect')
        .transition()
        .duration(1000)
        .attr('opacity', 1)
    }, 
    'your-race-in-boston': () => {
        const rScale = getRScale()    
        const rColumn = race === "black" ? +selData[0].per_black_stopped_within_blacks : +selData[0].per_white_stopped_within_whites        
       
        $raceGVis.select(`.${race}-circle`)
            .attr('opacity', 1)
            .transition()
            .duration(1000)
            .attr('r', rScale(rColumn))
            
        $raceGVis.select(`.${switchedRace}-circle`)
            .attr('opacity', 0)

    },
    'if-another': () => {
        const rScale = getRScale()      
        const rColumn = race === "black" ? +selData[0].per_white_stopped_within_whites : +selData[0].per_black_stopped_within_blacks
        $raceGVis.select(`.${switchedRace}-circle`)
            .attr('opacity', 1)
            .transition()
            .duration(1000)
            .attr('r', rScale(rColumn))
    }
}

function drawExplanationChart(selRace, compareTgt = 'boston', populationColumn, populationData, canvas, comparisonTgtCircleName, stopRateCircleName){
    canvas.selectAll('.pop-rect').remove()
    canvas.selectAll('.popu-circle').remove()
    canvas.selectAll('.boston-circle').remove()
    canvas.selectAll('.your-neighborhood-circle').remove()
    canvas.selectAll('.black-circle').remove()
    canvas.selectAll('.white-circle').remove()
    const rScale = getRScale()
    let comparisonTgtChance, stoppedChance, comparisonTgtColor, stopColor, rectColor
    if (compareTgt == 'boston'){
        comparisonTgtChance = 1
        stoppedChance = selData[0].stopped_per
        comparisonTgtColor = 'black'
        stopColor = '#D01E11'
        rectColor ='rgba(0,0,0,0.8)'
    } else {
        comparisonTgtChance = selData[0].per_white_stopped_within_whites
        stoppedChance = +selData[0].per_black_stopped_within_blacks
        comparisonTgtColor = '#9650A9'
        stopColor = '#8DB77D'
        rectColor = 'rgba(0,0,0,0.5)'
    }
    // else {
    //     comparisonTgtChance = +selData[0].per_white_stopped_within_whites
    //     stoppedChance = selData[0].per_black_stopped_within_blacks
    //     comparisonTgtColor = '#9650A9'
    //     stopColor = '#8DB77D'
    //     rectColor = 'rgba(0,0,0,0.5)'
    // }
    const centerR = rScale(comparisonTgtChance)
    const rectWidth = boundedWidth/4
    const populationXRange = [boundedWidth/2.5, boundedWidth/2.5+rectWidth]
    const populationYRange = [centerR + boundedHeight/3, centerR + boundedHeight/3+rectWidth]
    const populationScale = d3.scaleLinear()
        .domain(d3.extent(dataset, d => +d[populationColumn]))
        .range([10, 200])
   
    canvas.append('rect')
        .attr('class', 'pop-rect')
        .attr('width', rectWidth)
        .attr('height', rectWidth)
        .attr('transform', `translate(${boundedWidth/2.5}, ${centerR + boundedHeight/3})`)
        .attr('fill', rectColor)
        .attr('opacity', 0)

     const numOfCircle = Math.floor(populationScale(populationData))
     const numOfCircleList = [...Array(numOfCircle).keys()];
     canvas.selectAll('.popu-circle')
        .data(numOfCircleList)
        .enter()
        .append('circle')
        .attr('r', 2)
        .attr('fill', 'rgba(255,255,255,1)')
        .attr('cx', d => Math.random() * (populationXRange[1] - populationXRange[0]) + populationXRange[0])
        .attr('cy', d => Math.random() * (populationYRange[1] - populationYRange[0]) + populationYRange[0])
    if(stoppedChance < comparisonTgtChance){
        canvas.append('circle')
            .attr('class', comparisonTgtCircleName)
            .attr('stroke', comparisonTgtColor)
            .attr('stroke-dasharray', '3,3')
            .attr('stroke-width', 3)
            .attr('r', 0)
            .attr('cx', boundedWidth/2.5)
            .attr('cy', centerR + boundedHeight/3)
            .attr('fill', 'white')
            .attr('opacity', 0)
        canvas.append('circle')
            .attr('class', stopRateCircleName)
            .attr('stroke',  stopColor)
            .attr('stroke-width', 1)
            .style('mix-blend-mode', 'multiply')  
            .attr('fill', stopColor)
            .attr('r', 0)
            .attr('cx', boundedWidth/2.5)
            .attr('cy', rScale(stoppedChance)+ boundedHeight/3)
            .attr('opacity', 0)
    } else {
        canvas.append('circle')
            .attr('class', stopRateCircleName)
            .attr('stroke',  stopColor)
            .attr('stroke-width', 1)
            .attr('fill',  stopColor)
            .attr('r', 0)
            .attr('cx', boundedWidth/2.5)
            .attr('cy', rScale(stoppedChance)+ boundedHeight/3)
            .attr('opacity', 0)
        canvas.append('circle')
            .attr('class', comparisonTgtCircleName)
            .attr('r', 0)
            .attr('cx', boundedWidth/2.5)
            .attr('cy', centerR + boundedHeight/3)
            .attr('stroke', comparisonTgtColor)
            .attr('stroke-dasharray', '3,3')
            .attr('stroke-width', 3)
            .attr('fill', 'none')
            .attr('opacity', 0)
    }
}

function calculateStoppedChance(){
    // $paragraph.style('display', 'none')
    // $buttonG.style('display', 'none')
    switchedRace = race === "black" ? "white" : "black"
    console.log(switchedRace)
    $graphic.style('display', 'block')
    $result.style('display', 'block')
    $largeBlack.style('display', 'block')
    $raceDiv.style('display', 'block')
    $byRaceConclusion.style('display', 'block')
    d3.select('#conclude').style('display', 'block')
    resize()
    const raceName = race == "black" ? "Black" : "white"
    $assignedPerson.html(`You are a ${raceName} resident living in ${neighborhood.split(", ")[0]}, ${neighborhood.split(", ")[1]}`)
    $overallBoston.style('opacity', 1)
    selData = dataset.filter(d => d.Name === neighborhood)
    black_pop = selData[0]["%black"]
    white_pop = selData[0]["%white"]
    stop_black = selData[0]["per_black_stopped_within_blacks"]
    stop_white = selData[0]["per_white_stopped_within_whites"]
    
    drawExplanationChart(race, 'boston', "%black", black_pop, $gVis, 'boston-circle', 'your-neighborhood-circle')
    // STEP[currentStep]()
    
    const higherOrLower = selData[0].stopped_per - 1 > 0 ? 'higher' : 'lower'
    $blackPop
        .html(`However, since you live in ${neighborhood}, where ${Math.round(black_pop)}% of population is Black...`)
    $yourNeighborhoodChance
        .html(`...you have a ${higherOrLower} chance - <span class='selected-neighborhood'>${Math.round(selData[0].stopped_per* 100) / 100}%</span> - of being stopped by the police.`)
    $raceParagraph
        .html(`Now, let’s take your race into consideration. Being ${raceName} does affect your chance of being stopped by the police. `)
    $yourWhitePop
        .html(`As a ${raceName} person living in ${neighborhood}, where <span class=white-pop-color>${Math.round(selData[0]["%white"])}%</span> of residents are white...`)
    const chanceWithRace = race == "black" ? Math.round(selData[0]["per_black_stopped_within_blacks"]*100)/100 : Math.round(selData[0]["per_white_stopped_within_whites"]*100)/100 
    $yourRace  
        .html(`...you have a <span class=${race}-color>${chanceWithRace}%</span> chance of being stopped by the police.`)
    const switchedChance = race == "black" ? Math.round(selData[0]["per_white_stopped_within_whites"]*100)/100 : Math.round(selData[0]["per_black_stopped_within_blacks"]*100/100)
    $ifAnother
        .html(`That number changes to <span class=${switchedRace}-color>${Math.round(switchedChance*100)/100}% </span> if you’re <span class=${switchedRace}-color>${switchedRace}</span>.`)
    
    drawExplanationChart(race, 'white', "%white", white_pop, $raceGVis, `white-circle`, `black-circle`)
    // RACE_STEP[currentRaceStep]()
}

function chooseNeighborhood(items, chances) {
    var sum = chances.reduce((acc, el) => acc + el, 0);
    var acc = 0;
    chances = chances.map(el => (acc = el + acc));
    var rand = Math.random() * sum;
    return items[chances.filter(el => el <= rand).length];
}


function choosePerson(n, bc, wc){
    $personA.on('click', () => {
        race = "black"
        neighborhood = chooseNeighborhood(n, bc)
        calculateStoppedChance()
        $personA.classed("selected-person", true)
        $personB.classed("selected-person", false)
    })

    $personB.on('click', () => {
        race = 'white'
        neighborhood = chooseNeighborhood(n, wc)
        calculateStoppedChance()
        $personA.classed("selected-person", false)
        $personB.classed("selected-person", true)
        
        
    })

    

    
}

function handleStepEnter({index, element, direction}){
    currentStep = d3.select(element).attr('data-step')
    STEP[currentStep]()
}

function handleRaceStepEnter({index, element, direction}){
    currentRaceStep = d3.select(element).attr('data-step')
    RACE_STEP[currentRaceStep]()
}

function setupScroller(){
    Stickyfill.add($graphic.node());
    Stickyfill.add($raceGraphic.node());
    scroller.setup({
        step: $step.nodes(),
        offset: 0.95
    })
    .onStepEnter(handleStepEnter)

    raceScroller.setup({
        step: $raceStep.nodes(),
        offset: 0.95
    })
    .onStepEnter(handleRaceStepEnter)
}

function updateDimensions(){
    const h = window.innerHeight;
    height = Math.floor(h*0.5)
    width = $graphic.node().offsetWidth
    boundedWidth = width - MARGIN.left - MARGIN.right
    boundedHeight = height - MARGIN.top - MARGIN.bottom
}

function resize(){
    updateDimensions()
    $svg.attr('width', width)
        .attr('height', height)
    $gVis.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
    $raceSvg.attr('width', width)
        .attr('height', height)
    $raceGVis.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
}

function init(){
    loadData('shape_with_stops.csv').then(result => {
        dataset = result.filter(d => +d.resident_employee_ratio >= 1 && d.ZIP5 !== "")
        dataset.map(d => {
            d.crime = +d.crime
            d.stopped_per = +d.stopped_per
            d.neighborhood_chance_black = +d["%black_in_blacks"]
            d.neighborhood_chance_white = +d["%white_in_whites"]
        })
        console.log(dataset)
        resize()
        const neighborhoodOptions = dataset.map(d => d.Name)
        const blackNeighborhoodChances = dataset.map(d => d.neighborhood_chance_black)
        const whiteNeighborhoodChances = dataset.map(d => d.neighborhood_chance_white)
        choosePerson(neighborhoodOptions, blackNeighborhoodChances, whiteNeighborhoodChances)
        setupScroller()
    
    })
    
}


export default { init, resize }