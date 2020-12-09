import loadData from './load-data';
import scrollama from 'scrollama'
import Stickyfill from 'stickyfilljs'

const $div = d3.select('#large-black')
const $paragraph = $div.select('.select-person-intro').select('.paragraph')
const $buttonG = $div.select('.select-person-intro').select('.button-group')
const $personA = $buttonG.select('.left-person')
const $personB = $buttonG.select('.right-person')
const $assignedPerson = $div.select('.select-person-intro').select('.assigned-person')
const $scrollGraphic = $div.select('.scroll__graphic')
const $graphic = $scrollGraphic.select('.graphic');
const $widthRef = d3.select('#declined .graphic')
const $svg = $graphic.select('svg')
const $gVis = $svg.select('.chart')
const $scrollText = $div.select('.scroll__text')
const $step = $scrollText.selectAll('.step')
const $overallBoston = $step.select('.overall-boston')
const $yourNeighborhoodChance = $step.select('.your-neighborhood-chance')
const $tooltip = $graphic.select('.tool-tip')

// by race
const $raceDiv = d3.select('#stop-by-race')
const $raceParagraph = $raceDiv.select('.stop-by-race-intro').select('.paragraph p')
const $raceScrollText = $raceDiv.select('.scroll__text')
const $raceStep = $raceScrollText.selectAll('.step')
const $remindRace = $raceStep.select('.remind-race')
const $yourRace = $raceStep.select('.your-race-in-boston')
const $ifAnother = $raceStep.select('.if-another')
const $raceGraphic = $raceDiv.select('.scroll__graphic').select('.graphic')
const $raceSvg = $raceGraphic.select('svg')
const $raceGVis = $raceSvg.select('.chart')


let height = 0,
  width = 0
const MARGIN = {
  top: 10,
  right: 10,
  bottom: 30,
  left: 10
}
let boundedHeight, boundedWidth;
let race, switchedRace, selNeighborhood, black_pop, white_pop, stop_black, stop_white
let dataset, selData;

const scroller = scrollama();
const raceScroller = scrollama();
let currentStep = 'assigned-person', currentRaceStep = 'remind-race';

const STEP = {
  'assigned-person': () => {},
  'overall-boston': () => {
    $gVis.selectAll('.stop-bar')
      .attr('opacity', 0.05)
    $gVis.selectAll('.boston-avg')
      .attr('opacity', 1)
  },
  'black-pop': () => {},
  'your-neighborhood-chance': () => {
    $gVis.selectAll('.stop-bar')
    .attr('opacity', 0.05)
    $gVis.selectAll('.boston-avg')
      .attr('opacity', 0)
    if (race == 'black') {
      $gVis.select('#stop-bar-2119')
        .attr('opacity', 1)
    } else {
      $gVis.select('#stop-bar-2134')
        .attr('opacity', 1)
    }
    $tooltip
    .style('visibility', 'hidden')
  },
  'explain': () => {
    $gVis.selectAll('.stop-bar')
      .attr('opacity', 0.05)
      .on('mouseover', () => {
          return;
      })
    $gVis.select('#stop-bar-2119')
        .attr('opacity', 1)
    $gVis.select('#stop-bar-2121')
        .attr('opacity', 1)
  },
  'explore': () => {
    $gVis.selectAll('.stop-bar')
      .attr('opacity', 1)
    $gVis.selectAll('.stop-bar')
        .on('mouseover', d => {
            $tooltip
            .style('left', `${d.clientX}px`)
            .style('top', `${d.clientY}px`)
            .style('visibility', 'visible')
            const sel = d.target.id === 'boston' ? 'boston' : d.target.id.split("-")[2]
            if (sel === 'boston'){
                $tooltip.html(`Boston: ${1}%`)
            } else {
                const selCircle = dataset.filter(d => d.zip == sel)[0]
                $tooltip.html(`${selCircle.neighborhood}: ${Math.round(selCircle.stopped_per * 100)/100}%`)
            }
        })

  }
}

const RACE_STEP = {
    'remind-race':() => {
        $raceGVis.selectAll('.slope-circle')
            .attr('opacity', 1)
            .attr('r', 5)
            .style('stroke-width', 1)

        $raceGVis.selectAll('.slope-line')
            .attr('opacity', 1)
        $raceGVis.selectAll('.byside-circle-legend')
          .attr('opacity', 1)
    },
    'your-race-in-boston': () => {
        $raceGVis.selectAll('.slope-circle')
            .attr('opacity', 0.1)
        $raceGVis.selectAll('.slope-line')
            .attr('opacity', 0.1)
        $raceGVis.selectAll('.byside-circle-legend')
          .attr('opacity', 0)

        if (race === 'black'){
            $raceGVis.select('#black-circle-2119')
                .attr('opacity', 1)
                .attr('r', 8)
                .style('stroke-width', 2)
        } else {
            $raceGVis.select('#white-circle-2134')
                .attr('opacity', 1)
                .attr('r', 8)
                .style('stroke-width', 2)
        }
    }, 
    'if-another':() => {
        $raceGVis.selectAll('.slope-circle')
            .attr('opacity', 0.1)
            .attr('r', 5)
            .style('stroke-width', 1)
        $raceGVis.selectAll('.slope-line')
            .attr('opacity', 0.1)

        $raceGVis.selectAll('.byside-circle-legend')
          .attr('opacity', 0)

        if (race === 'black'){
            $raceGVis.select('#slope-line-2119')
            .attr('opacity', 1)
            $raceGVis.select('#black-circle-2119')
            .attr('opacity', 1)
            $raceGVis.select('#white-circle-2119')
            .attr('opacity', 1)
                .attr('r', 8)
                .style('stroke-width', 2)
        } else {
            $raceGVis.select('#slope-line-2134')
            .attr('opacity', 1)
            $raceGVis.select('#white-circle-2134')
            .attr('opacity', 1)
            $raceGVis.select('#black-circle-2134')
            .attr('opacity', 1)
                .attr('r', 8)
                .style('stroke-width', 2)
        }
    }, 
    'more-black-area': () => {
        $raceGVis.selectAll('.slope-circle')
            .attr('opacity', 0.1)
            .attr('r', 5)
            .style('stroke-width', 1)
        $raceGVis.selectAll('.slope-line')
            .attr('opacity', 0.1)
        $raceGVis.select('#slope-line-2119').attr('opacity', 1)
        $raceGVis.select('#white-circle-2119').attr('opacity', 1)
        $raceGVis.select('#black-circle-2119').attr('opacity', 1)
        $raceGVis.select('#slope-line-2121').attr('opacity', 1)
        $raceGVis.select('#white-circle-2121').attr('opacity', 1)
        $raceGVis.select('#black-circle-2121').attr('opacity', 1)

        $raceGVis.selectAll('.byside-circle-legend')
          .attr('opacity', 0)
    },
    'mattapan':() => {
      $raceGVis.selectAll('.slope-circle')
            .attr('opacity', 0.1)
            .attr('r', 5)
            .style('stroke-width', 1)
      $raceGVis.selectAll('.slope-line')
            .attr('opacity', 0.1)
      $raceGVis.select('#slope-line-2126').attr('opacity', 1)
      $raceGVis.select('#white-circle-2126').attr('opacity', 1)
      $raceGVis.select('#black-circle-2126').attr('opacity', 1)

      $raceGVis.selectAll('.byside-circle-legend')
          .attr('opacity', 0)
    },
    'more-white-area': () => {
        $raceGVis.selectAll('.slope-circle')
            .attr('opacity', 0.1)
            .attr('r', 5)
            .style('stroke-width', 1)
        $raceGVis.selectAll('.slope-line')
            .attr('opacity', 0.1)
        $raceGVis.select('#slope-line-2134').attr('opacity', 1)
        $raceGVis.select('#white-circle-2134').attr('opacity', 1)
        $raceGVis.select('#black-circle-2134').attr('opacity', 1)
        $raceGVis.select('#slope-line-2135').attr('opacity', 1)
        $raceGVis.select('#white-circle-2135').attr('opacity', 1)
        $raceGVis.select('#black-circle-2135').attr('opacity', 1)
        $raceGVis.select('#slope-line-2129').attr('opacity', 1)
        $raceGVis.select('#white-circle-2129').attr('opacity', 1)
        $raceGVis.select('#black-circle-2129').attr('opacity', 1)

        $raceGVis.selectAll('.byside-circle-legend')
          .attr('opacity', 0)
    },
    'explore-race':() => {
        $raceGVis.selectAll('.slope-circle')
            .attr('opacity', 1)
            .attr('r', 5)
            .style('stroke-width', 1)
        $raceGVis.selectAll('.slope-line')
            .attr('opacity', 1)
        $raceGVis.selectAll('.byside-circle-legend')
          .attr('opacity', 1)
    }
}

function calculateStoppedChance() {
  switchedRace = race === "black" ? "white" : "black"
  d3.selectAll(".graphic").style('display', 'block')
  d3.selectAll(".scroll__text").style('display', 'block')
  d3.selectAll(".conclusion").style('display', 'block')
  $raceDiv.style('display', 'block')
  $paragraph.style('display', 'block')
  d3.select('#by-race-conclusion').style('display', 'block')
  d3.select('#conclude').style('display', 'block')
  d3.select("#method").style('display', 'block')
  resize()
  const raceName = race == "black" ? "Black" : "white"
  $assignedPerson.html(`You are a <span class="white-underscore">${raceName}</span> resident living in <span class="white-underscore">${selNeighborhood.split(", ")[0]}, ${selNeighborhood.split(", ")[1]}</span>`)
  $overallBoston.style('opacity', 1)
  selData = dataset.filter(d => d.Name === selNeighborhood)
  black_pop = selData[0]["%black"]
  white_pop = selData[0]["%white"]
  stop_black = selData[0]["per_black_stopped_within_blacks"]
  stop_white = selData[0]["per_white_stopped_within_whites"]

  // drawExplanationChart(race, 'boston', "%black", black_pop, $gVis, 'boston-circle', 'your-neighborhood-circle')
  // STEP[currentStep]()

  const higherOrLower = selData[0].stopped_per - 1 > 0 ? 'increase' : 'decrease'
  $yourNeighborhoodChance
    .html(`However, since you live in ${selNeighborhood}, where ${Math.round(black_pop)}% of population is Black and ${Math.round(white_pop)}% of population is white, your chances of getting stopped by the police ${higherOrLower} to <span class='selected-neighborhood'>${Math.round(selData[0].stopped_per* 100) / 100}%</span>.`)
  $raceParagraph
    .html(`Now, let’s take your race into consideration. In some areas, being ${raceName} does affect your chance of being stopped by the police. `)
  $remindRace
    .html(`As a ${raceName} person living in ${selNeighborhood}...`)
  const chanceWithRace = race == "black" ? Math.round(selData[0]["per_black_stopped_within_blacks"] * 100) / 100 : Math.round(selData[0]["per_white_stopped_within_whites"] * 100) / 100
  $yourRace
    .html(`...you have a <span class=${race}-color>${chanceWithRace}%</span> chance of being stopped by the police.`)
  const switchedChance = race == "black" ? Math.round(selData[0]["per_white_stopped_within_whites"] * 100) / 100 : Math.round(selData[0]["per_black_stopped_within_blacks"] * 100 / 100)
  $ifAnother
    .html(`That number changes to <span class=${switchedRace}-color>${Math.round(switchedChance*100)/100}% </span> if you’re <span class=${switchedRace}-color>${switchedRace}</span>.`)

  // drawExplanationChart(race, 'white', "%white", white_pop, $raceGVis, `white-circle`, `black-circle`)
  // RACE_STEP[currentRaceStep]()
}

function choosePerson() {
  $personA.on('click', () => {
    race = "black"
    selNeighborhood = "02119, Roxbury, MA"
    calculateStoppedChance()
    $personA.classed("selected-person", true)
    $personB.classed("selected-person", false)
  })

  $personB.on('click', () => {
    race = 'white'
    selNeighborhood = "02134, Allston, MA"
    calculateStoppedChance()
    $personA.classed("selected-person", false)
    $personB.classed("selected-person", true)

  })

  //   drawChart(dataset)

}


function handleRaceStepEnter({
    index,
    element,
    direction
  }) {
    currentRaceStep = d3.select(element).attr('data-step')
    RACE_STEP[currentRaceStep]()
  
  }

function handleStepEnter({
  index,
  element,
  direction
}) {
  currentStep = d3.select(element).attr('data-step')
  STEP[currentStep]()

}


function setupScroller() {
  Stickyfill.add($graphic.node());
  Stickyfill.add($raceGraphic.node());
  scroller.setup({
      step: $step.nodes(),
      offset: 0.5
    })
    .onStepEnter(handleStepEnter)
  raceScroller.setup({
        step: $raceStep.nodes(),
        offset: 0.5
      })
      .onStepEnter(handleRaceStepEnter)
}


function updateDimensions() {
  //   const h = window.innerHeight,
  //     w = window.innerWidth
  //   height = Math.floor(h * 0.5)
  //   width = $widthRef.node().offsetWidth + 100
  //   boundedHeight = height - MARGIN.top - MARGIN.bottom
  //   boundedWidth = width - MARGIN.left - MARGIN.right
}

function resize() {
  updateDimensions()
  //   $svg.attr('width', width)
  //     .attr('height', height)
  //   $gVis.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
  // drawChart(dataset)
}

function init() {
  loadData('shape_with_stops.csv').then(result => {
    dataset = result.filter(d => +d.resident_employee_ratio >= 1)
    dataset.map(d => {
      if (d.Name.split(", ")[1] === "Dorchester") {
        d.neighborhood = `${d.Name.split(", ")[1]}(${d.Name.split(", ")[0]})`
      } else {
        d.neighborhood = `${d.Name.split(", ")[1]}`
      }
      d.crime = +d.crime
      d.stopped_per = +d.stopped_per
    })

    dataset.sort((a, b) => +b["stopped_per"] - (+a["stopped_per"]))
    resize()
    setupScroller()
    choosePerson()
  })
}

export default {
  init,
  resize
}
