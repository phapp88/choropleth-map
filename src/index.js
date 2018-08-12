import * as d3 from 'd3';
import * as topojson from 'topojson';
import './index.css';

const dataUrl = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const mapUrl = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

Promise.all([d3.json(dataUrl), d3.json(mapUrl)])
  .then((data) => {
    const [eduData, mapData] = data;
    const eduMap = d3.map();
    const path = d3.geoPath();
    eduData.forEach(d => eduMap.set(d.fips, d.bachelorsOrHigher));
    const [eduMin, eduMax] = d3.extent(Object.values(eduMap));
    const x = d3.scaleLinear()
      .domain([eduMin, eduMax])
      .rangeRound([600, 900]);
    const color = d3.scaleThreshold()
      .domain(d3.range(eduMin, eduMax, (eduMax - eduMin) / 9))
      .range(d3.schemeBlues[9]);

    const svg = d3.select('svg');

    svg.append('g')
      .attr('class', 'county')
      .selectAll('path')
      .data(topojson.feature(mapData, mapData.objects.counties).features)
      .enter()
      .append('path')
      .attr('fill', (d) => {
        d.bachelorsOrHigher = eduMap.get(d.id);
        return color(d.bachelorsOrHigher);
      })
      .attr('d', path)
      .append('title')
      .text(d => `${d.bachelorsOrHigher}%`);

    svg.append('path')
      .datum(topojson.mesh(mapData, mapData.objects.states, (a, b) => a !== b))
      .attr('class', 'state')
      .attr('d', path);

    const g = svg.append('g')
      .attr('id', 'legend')
      .attr('transform', 'translate(0, 40)');

    g.selectAll('rect')
      .data(color.range().map((d) => {
        d = color.invertExtent(d);
        if (!d[0]) [d[0]] = x.domain();
        if (!d[1]) [, d[1]] = x.domain();
        return d;
      }))
      .enter()
      .append('rect')
      .attr('height', 8)
      .attr('x', d => x(d[0]))
      .attr('width', d => x(d[1]) - x(d[0]))
      .attr('fill', d => color(d[0]));

    g.call(d3.axisBottom(x)
      .tickSize(13)
      .tickFormat((d, i) => (i === 0 ? `${Math.round(d)}%` : Math.round(d)))
      .tickValues(color.domain()))
      .select('.domain')
      .remove();
  })
  .catch((err) => { console.log(err); });
