/* global d3 */
import debounce from "lodash.debounce";
import isMobile from "./utils/is-mobile";
import linkFix from "./utils/link-fix";
import images from "./images";
import graphic from "./graphic";
import graphicDeclined from "./graphic-declined";
import graphicStackedBars from "./graphic-stackedbars";
import graphicScatter from "./graphic-scatter";
import graphicMap1 from "./graphic-map1";
import graphicMap2 from "./graphic-map2";
import selectPerson from "./select-person";
import graphicBlackstop from "./graphic-blackstop";
import graphicByRace from "./graphic-byRace";
import footer from "./footer";

const $body = d3.select("body");
let previousWidth = 0;

function resize() {
  // only do resize on width changes, not height
  // (remove the conditional if you want to trigger on height change)
  const width = $body.node().offsetWidth;
  if (previousWidth !== width) {
    previousWidth = width;
    graphicDeclined.resize();
    graphicStackedBars.resize();
    graphicScatter.resize();
    graphicMap1.resize();
    graphicMap2.resize();
    selectPerson.resize();
    graphicBlackstop.resize();
    graphicByRace.resize()

  }
}

function setupStickyHeader() {
  const $header = $body.select("header");
  if ($header.classed("is-sticky")) {
    const $menu = $body.select(".header__menu");
    const $toggle = $body.select(".header__toggle");
    $toggle.on("click", () => {
      const visible = $menu.classed("is-visible");
      $menu.classed("is-visible", !visible);
      $toggle.classed("is-visible", !visible);
    });
  }
}

function init() {
  // adds rel="noopener" to all target="_blank" links
  linkFix();
  // add mobile class to body tag
  $body.classed("is-mobile", isMobile.any());
  // setup resize event
  window.addEventListener("resize", debounce(resize, 150));
  // setup sticky header menu
  setupStickyHeader();
  // kick off images code
  images.init();
  // kick off graphic code
  graphicDeclined.init();
  graphicStackedBars.init();
  graphicScatter.init();
  graphicMap1.init();
  graphicMap2.init();
  selectPerson.init();
  graphicBlackstop.init();
  graphicByRace.init()
  // load footer stories
  footer.init();
}

init();
