import * as d3 from 'd3';
import moment from 'moment';

const setTimeIntervals = (data, view, prices) => {
  let start = new Date(Date.now());
  let now = moment(start).add(3, 'h').toDate();
  let mostRecentPrice = prices[prices.length - 1];
  let mostRecentDate;
  switch (view) {
    case '1D':
      start.setHours(9, 0, 0, 0);
      let once = false;
      for (let i = 0; i < prices.length; i++) {
        if (start > now) {
          data[i] = { date: start, price: undefined }
          if (!once) {
            mostRecentPrice = prices[i - 1];
            mostRecentDate = new Date(moment(start).subtract(5, 'm'));
            once = true;
          }
        } else {
          data[i] = { date: start, price: prices[i] }
        }
        start = moment(start).add(5, 'm').toDate();
      }
      break;
    case '1W':
      start = moment(start).subtract(5, 'd').toDate();
      start.setHours(9, 30, 0, 0);
      for (let i = 0; i < prices.length; i++) {
        data[i] = { date: start, price: prices[i] }
        start = moment(start).add(10, 'm').toDate();
      }
      // pastTime = 16;
      // for (let i = 0; i < prices.length; i++) {
      //   data[i] = {date: start, price: prices[i]}
      //   start = moment(start).add(5, 'm').toDate();
      //   if(pastTime <= start.getHours()) {
      //     console.log(start.getHours());
      //     start = moment(start).add(1, 'd').toDate();
      //     start.setHours(9, 0, 0, 0);
      //   }
      // }
      break;
    case '1M':
      start = moment(start).subtract(1, 'm').toDate();
      start.setHours(10, 0, 0, 0);
      for (let i = 0; i < prices.length; i++) {
        data[i] = { date: start, price: prices[i] }
        start = moment(start).add(1, 'h').toDate();
      }
      break;
    case '3M':
      start = moment(start).subtract(3, 'm').toDate();
      start.setHours(10, 0, 0, 0);
      for (let i = 0; i < prices.length; i++) {
        data[i] = { date: start, price: prices[i] }
        start = moment(start).add(1, 'h').toDate();
      }
      break;
    case '1Y':
      start = moment(start).subtract(1, 'y').toDate();
      start.setHours(10, 0, 0, 0);
      for (let i = 0; i < prices.length; i++) {
        data[i] = { date: start, price: prices[i] }
        start = moment(start).add(1, 'd').toDate();
      }
      break;
    case '5Y':
      start = moment(start).subtract(5, 'Y').toDate();
      start.setHours(10, 0, 0, 0);
      for (let i = 0; i < prices.length; i++) {
        data[i] = { date: start, price: prices[i] }
        start = moment(start).add(1, 'd').toDate();
      }
      break;
  }
  return [mostRecentDate, mostRecentPrice];
}

const bisectDate = (data, matcher) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].date > matcher) {
      return i;
    }
  }
  return 1;
}

const updateLegend = (currentData, prices, svg, view) => {
  d3.selectAll('.lineLegend').remove();
  let offset, xRate;
  const formatDate = (date) => {
    switch (view) {
      case '1D': offset = 33; xRate = 6.315; return (`${moment(date).format('h:mm a')} ET`);
      case '1W': offset = 56; xRate = 4.38; return (`${moment(date).format('h:mm a, MMM D')} ET`);
      case '1M': offset = 56; xRate = 5.68; return (`${moment(date).format('h:mm a, MMM D')} ET`);
      case '3M': offset = 56; xRate = 1.88; return (`${moment(date).format('h:mm a, MMM D')} ET`);
      case '1Y': offset = 47; xRate = 2.71; return (`${moment(date).format('MMM D, YYYY')} ET`);
      case '5Y': offset = 47; xRate = 2.605; return (`${moment(date).format('MMM D, YYYY')} ET`);
    }
  }

  const lineLegend = svg
    .selectAll('.lineLegend')
    .data(['date'])
    .enter()
    .append('g')
    .attr('class', 'lineLegend')
    .attr('transform', (d, i) => {
      return `translate(0, ${i * 20})`;
    });
  lineLegend
    .append('text')
    .text(d => {
      if (d === 'date') {
        return formatDate(currentData[d]);
      }
    })
    .style('fill', '#cbcbcd')
    .attr('transform', `translate(${prices.indexOf(currentData.price) * xRate - offset},-5)`);
}

const buildChart = (prices, view, updateTicker) => {
  d3.selectAll("svg").remove();
  let data = [];
  let [mostRecentDate, mostRecentPrice] = setTimeIntervals(data, view, prices);
  const margin = { top: 50, right: 60, bottom: 20, left: 60 };
  const width = 676;
  const height = 196;
  const xMin = d3.min(data, d => { return d['date']; });
  const xMax = d3.max(data, d => { return d['date']; });
  const yMin = d3.min(data, d => { return d['price']; });
  const yMax = d3.max(data, d => { return d['price']; });
  const xScale = d3
    .scaleTime()
    .domain([xMin, xMax])
    .range([0, width]);
  const yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);

  const svg = d3
    .select('#stockPriceHistoryChart')
    .append('svg')
    .attr('width', width + margin['left'] + margin['right'])
    .attr('height', height + margin['top'] + margin['bottom'])
    .append('g')
    .attr('transform', `translate(${margin['left']},  ${margin['top']})`);
  const line = d3
    .line()
    .x(d => { return xScale(d['date']); })
    .y(d => { return yScale(d['price']); });
  // Append the path and bind data
  svg
    .append('path')
    .data([data])
    .style('fill', 'none')
    .attr('id', 'priceChart')
    .attr('stroke', '#21ce99')
    .attr('stroke-width', '1.5')
    .attr('d', line);

    //fadsfadf
  if (view === '1D') {
    let ticks = [];
    for (let i = 0; i < data.length; i++) { ticks.push(data[i].date); }
  
    svg.append("g")
      .attr("class", "x axis")
      .attr('fill', 'none')
      .attr('stroke', '#cbcbcd')
      .attr('opacity', '50%')
      .attr('z-index', '-1')
      // .attr('shape-rendering', 'crispEdges')
      .attr('stroke-width', '1px')
      .attr("transform", "translate(0," + (height - (400 * Math.random(view))) + ")")
      .call(d3.axisBottom(xScale)
        .tickValues(ticks)
        .tickSize(2)
        .tickFormat("")
      )
  } else {
    d3.selectAll("x axis").remove();
  }

  function generateCrosshair() {
    const correspondingDate = xScale.invert(d3.mouse(this)[0]);
    const i = bisectDate(data, correspondingDate.getTime());
    let currentPoint;
    if (data[i].price) {
      updateTicker(data[i].price, '');
      currentPoint = data[i];
    } else {
      currentPoint = { date: mostRecentDate, price: mostRecentPrice };
    }

    focus.attr('transform', `translate(${xScale(currentPoint['date'])},${yScale(currentPoint['price'])})`);

    focus
      .select('line.y')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', height - height - yScale(currentPoint['price']))
      .attr('y2', height - yScale(currentPoint['price']));
    updateLegend(currentPoint, prices, svg, view);
  }
  const focus = svg
    .append('g')
    .attr('class', 'focus')
    .attr('fill', '#21ce99')
    .style('display', 'none');
  focus.append('circle').attr('r', 4.5);
  focus.append('line').classed('x', true);
  focus.append('line').classed('y', true);
  svg
    .append('rect')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', () => (focus.style('display', null)))
    .on('mouseout', () => { updateTicker(mostRecentPrice); d3.selectAll('.lineLegend').remove(); focus.style('display', 'none') })
    .on('mousemove', generateCrosshair)
  d3.select('.overlay').style('fill', 'none');
  d3.select('.overlay').style('pointer-events', 'all');
  d3.selectAll('.focus line').style('fill', 'none');
  d3.selectAll('.focus line').style('stroke', '#ababab');
  d3.selectAll('.focus line').style('stroke-width', '1.5px');
  return { mostRecentDate, mostRecentPrice };
}

export default buildChart;
