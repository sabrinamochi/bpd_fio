import scrollama from 'scrollama'
import Stickyfill from 'stickyfilljs'

const imgPath = 'assets/images'

const $section = d3.select('#warren-scroll')
const $scrollImg = $section.select('.scroll__img')
const $step = $section.selectAll('.step')
const $img = $scrollImg.select('.warren-img')
const $intro = $section.select('.intro')
const scroller = scrollama()

let isMobile;

let currentStep = 'cold-night'

const STEP = {
    'cold-night': () => {
        $img.attr('src', `${imgPath}/cold-night.jpg`)
            .transition().duration(1000)
            .style('transform', 'scale(1)')  
        if(!isMobile){
            $intro
            .transition().duration(2000)
            .style('opacity', 0)
        }
    },
    'chase': () => {
        $img
            .attr('src', `${imgPath}/chase.jpg`)
            .style('transform', 'scale(1)')  
    },
    'arrest': () => {
        $img.attr('src', `${imgPath}/arrest.jpg`)
            .style('transform', 'scale(1)')  
    }
}

function handleStepEnter({index, element, direction}){
    currentStep = d3.select(element).attr('data-step')
    STEP[currentStep]()
}

function handleStepExit({index, element, direction}){
    if(index == 0 && direction == 'up' && !isMobile){
        $intro
            .transition().duration(1000)
            .style('opacity', 1)
        $img
            .transition().duration(2000)
            .style('transform', 'scale(2.5)')  
    }
}


function setupScroller(){
    Stickyfill.add($scrollImg.node());
    const h = window.innerHeight;
    const w = window.innerWidth;
    isMobile = w <= 600 ? true : false
    scroller.setup({
        step: $step.nodes(),
        offset: isMobile ? Math.floor(window.innerHeight * 0.8) + "px" : 0.8
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit)
}

function resize(){
    // console.log('resized')
}

function init(){
    $img.attr('src', `${imgPath}/cold-night.jpg`)
    setupScroller()
}

export default { init, resize };