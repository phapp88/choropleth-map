import * as d3 from 'd3';
import * as topojson from 'topojson';
import eduData from './eduData.json';
import mapData from './mapData.json';
import './index.css';

const eduMap = new Map();
const nameMap = new Map();
const path = d3.geoPath();
eduData.forEach((d) => {
  eduMap.set(d.fips.toString(), d.bachelorsOrHigher);
  nameMap.set(d.fips.toString(), `${d.area_name}, ${d.state}`);
});
const [eduMin, eduMax] = d3.extent(eduMap.values());
const x = d3.scaleLinear().domain([eduMin, eduMax]).rangeRound([570, 870]);

const color = d3
  .scaleThreshold()
  .domain(d3.range(eduMin, eduMax, (eduMax - eduMin) / 8))
  .range(d3.schemeBlues[9]);

const svg = d3.select('svg');
const tooltip = d3
  .select('main')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

svg
  .append('g')
  .selectAll('path')
  .data(topojson.feature(mapData, mapData.objects.counties).features)
  .enter()
  .append('path')
  .attr('class', 'county')
  .attr('fill', (d) => {
    d.properties = {
      'data-education': eduMap.get(d.id.toString()),
      'data-name': nameMap.get(d.id.toString()),
    };
    return color(d.properties['data-education']);
  })
  .attr('data-fips', (d) => d.id)
  .attr('data-education', (d) => d.properties['data-education'])
  .attr('d', path)
  .on('mouseover', (e, d) => {
    tooltip.transition().duration(200).style('opacity', 0.9);
    tooltip
      .html(`${d.properties['data-name']}: ${d.properties['data-education']}%`)
      .attr('data-education', d.properties['data-education'])
      .style('left', `${e.pageX + 12.5}px`)
      .style('top', `${e.pageY - 20}px`);
  })
  .on('mouseout', () => {
    tooltip.transition().duration(500).style('opacity', 0);
  });

svg
  .append('path')
  .datum(topojson.mesh(mapData, mapData.objects.states, (a, b) => a !== b))
  .attr('class', 'states')
  .attr('d', path);

const g = svg
  .append('g')
  .attr('id', 'legend')
  .attr('transform', 'translate(0, 40)');

g.selectAll('rect')
  .data(
    color.range().map((d) => {
      d = color.invertExtent(d);
      if (!d[0]) [d[0]] = x.domain();
      if (!d[1]) [, d[1]] = x.domain();
      return d;
    })
  )
  .enter()
  .append('rect')
  .attr('height', 8)
  .attr('x', (d) => x(d[0]))
  .attr('width', (d) => x(d[1]) - x(d[0]))
  .attr('fill', (d) => color(d[0]));

g.call(
  d3
    .axisBottom(x)
    .tickSize(13)
    .tickFormat((d, i) => (i === 0 ? `${Math.round(d)}%` : Math.round(d)))
    .tickValues(color.domain())
)
  .select('.domain')
  .remove();
