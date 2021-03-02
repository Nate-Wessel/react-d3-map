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

const width = 600
const height = 600

const center = [120.2,23.7]

var lambda = -center[0] // yaw
var phi = -center[1] // pitch
var gamma = 0 // roll

const proj = geoMercator()
	.rotate( [ lambda, phi, gamma ] )
	.translate( [ width/2, height/2 ] )
	.scale(100)

const pathGen = geoPath().projection( proj )

export default function(){
	const [ countries, setCountries ] = useState(null)

	const [ contours, setContours ] = useState([])
	useEffect(()=>{
		setCountries( topoFeature( countriesTopo, 'countries' ) )
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
		</svg>
	)
}
