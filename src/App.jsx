import React, { useState, useEffect } from 'react'
import { 
	geoMercator, 
	geoPath,
	geoGraticule
} from 'd3-geo'
import { feature as topoFeature } from 'topojson-client'
import countriesTopo from './countries.json'
import './map.css'

const width = 1000
const height = 1000

const center = [122,25]

var lambda = -center[0] // yaw
var phi = -center[1] // pitch
var gamma = 0 // roll

const proj = geoMercator()
	.rotate( [ lambda, phi, gamma ] )
	.translate( [ width/2, height/2 ] )
	.scale(1000)

const pathGen = geoPath().projection( proj )

export default function(){
	const [ countries, setCountries ] = useState(null)
	useEffect(()=>{
		setCountries( topoFeature( countriesTopo, 'countries' ) )
	},[])
	console.log(countries)
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
