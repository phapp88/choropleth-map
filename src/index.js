import * as d3 from 'd3';
import * as topojson from 'topojson';
import './index.css';

const dataUrl = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const mapUrl = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

Promise.all([d3.json(dataUrl), d3.json(mapUrl)])
  .then((data) => {
    const [eduData, mapData] = data;
    const eduMap = d3.map();
    const nameMap = d3.map();
    const path = d3.geoPath();
    eduData.forEach((d) => {
      eduMap.set(d.fips, d.bachelorsOrHigher);
      nameMap.set(d.fips, `${d.area_name}, ${d.state}`);
    });
    const [eduMin, eduMax] = d3.extent(Object.values(eduMap));
    const x = d3.scaleLinear()
      .domain([eduMin, eduMax])
      .rangeRound([600, 900]);
    const color = d3.scaleThreshold()
      .domain(d3.range(eduMin, eduMax, (eduMax - eduMin) / 8))
      .range(d3.schemeBlues[9]);

    const svg = d3.select('svg');
    const tooltip = d3.select('main')
      .append('div').attr('id', 'tooltip').style('opacity', 0);

    svg.append('g')
      .selectAll('path')
      .data(topojson.feature(mapData, mapData.objects.counties).features)
      .enter()
      .append('path')
      .attr('class', 'county')
      .attr('fill', (d) => {
        d.properties = {
          'data-education': eduMap.get(d.id),
          'data-name': nameMap.get(d.id),
        };
        return color(d.properties['data-education']);
      })
      .attr('data-fips', d => d.id)
      .attr('data-education', d => d.properties['data-education'])
      .attr('d', path)
      .on('mouseover', (d) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(`${d.properties['data-name']}: ${d.properties['data-education']}%`)
          .attr('data-education', d.properties['data-education'])
          .style('left', `${d3.event.pageX + 12.5}px`)
          .style('top', `${d3.event.pageY - 20}px`);
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });

    svg.append('path')
      .datum(topojson.mesh(mapData, mapData.objects.states, (a, b) => a !== b))
      .attr('class', 'states')
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
