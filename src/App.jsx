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
import './main.css'

const countries = topoFeature( countriesTopo, 'countries' )

const center = [120.2,23.7]

var lambda = -center[0] // yaw
var phi = -center[1] // pitch
var gamma = 0 // roll

const initialWidth = window.innerWidth-5
const initialHeight = window.innerHeight-5

export default function(){
	const [ dimensions, setDimensions ] = useState([initialWidth,initialHeight])
	useEffect(()=>{ // resize to window
		window.addEventListener('resize',resizeMap)
	},[])
	
	const width = dimensions[0]
	const height = dimensions[1]
	
	const proj = geoMercator()
		.rotate( [ lambda, phi, gamma ] )
		.translate( [ width/2, height/2 ] )
		.scale(1000)
	const pathGen = geoPath().projection( proj )
	
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
		</svg>
	)
	function resizeMap(event){
		let win = event.target
		setDimensions([win.innerWidth-5,win.innerHeight-5])
	}
}
