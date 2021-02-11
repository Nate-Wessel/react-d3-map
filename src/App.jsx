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

const width = 1000
const height = 1000

const center = [122,25]

var lambda = -center[0] // yaw
var phi = -center[1] // pitch
var gamma = 0 // roll

const proj = geoMercator()
	.rotate( [ lambda, phi, gamma ] )
	.translate( [ width/2, height/2 ] )
	.scale(6000)

const pathGen = geoPath().projection( proj )

export default function(){
	const [ countries, setCountries ] = useState(null)
	const [ points, setPoints ] = useState([])
	useEffect(()=>{
		setCountries( topoFeature( countriesTopo, 'countries' ) )
		csv(coordinates).then(response=>{
			setPoints(response)
		})
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
					return (
						<circle key={i} className="point"
							cx={pp[0]} cy={pp[1]} r="2"/>
					)
				})}
			</g>
		</svg>
	)
}
