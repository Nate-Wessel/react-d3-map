import React, { useState, useEffect } from 'react'
import { 
	geoMercator, 
	geoPath,
	geoGraticule
} from 'd3-geo'
import { feature as topoFeature } from 'topojson-client'
import countriesTopo from './countries.json'
import './map.css'
import coordinates from './coordinates.csv'
import { csv } from 'd3-fetch'
import { contourDensity } from 'd3-contour'

const width = 600
const height = 600

const center = [120.2,23.7]

const log2thresholds = [0.05,0.1,0.2,0.4,0.8,1.6,3.2,6.4,12.8,25.6]

var lambda = -center[0] // yaw
var phi = -center[1] // pitch
var gamma = 0 // roll

const proj = geoMercator()
	.rotate( [ lambda, phi, gamma ] )
	.translate( [ width/2, height/2 ] )
	.scale(10000)

const pathGen = geoPath().projection( proj )

// returns projected contours
function density(points){
	return contourDensity()
		.x(d=>d[0]).y(d=>d[1])
		.size([width,height])
		// log base 2 scale
		.thresholds(log2thresholds)
		.bandwidth(10)
		( points.map(p=>proj([p.lon,p.lat])) )
}

let health = new Set(['pharma','health'])

export default function(){
	const [ countries, setCountries ] = useState(null)
	const [ points, setPoints ] = useState([])
	const [ contours, setContours ] = useState([])
	useEffect(()=>{
		setCountries( topoFeature( countriesTopo, 'countries' ) )
		csv(coordinates).then(coords=>{
			setPoints(coords)
			setContours(
				density(
					coords.filter(d=>health.has(d.category))
				)
			)
		} )
	},[])
	return (
		<svg width={width} height={height}> 
			<g id="countries">
				{countries && countries.features.map( (c,i) => {
					return <path key={i} className="country" d={pathGen(c)}/>
				})}
			</g>
			<g id="graticules">
				{geoGraticule().lines().map( (g,i) => {
					return <path key={i} className="graticule" d={pathGen(g)}/>
				})}
			</g>
			<g id="points">
				{points.map( (p,i) => {
					let pp = proj([p.lon,p.lat])
					//return (
					//	<circle key={i} className="point"
					//		cx={pp[0]} cy={pp[1]} r="2"/>
					//)
				})}
			</g>
			<g id="contours">
				{contours.map( (c,i) => {
					return <path key={i} className="contour" d={geoPath()(c)}/>
				})}
			</g>
		</svg>
	)
}
