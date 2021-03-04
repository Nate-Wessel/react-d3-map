import React, { useState, useEffect, useRef } from 'react'

import { geoMercator, geoPath, geoGraticule } from 'd3-geo'
import { feature as topoFeature } from 'topojson-client'
import { csv } from 'd3-fetch'
import { contourDensity } from 'd3-contour'
import { select } from 'd3-selection'
import { drag } from 'd3-drag'

import countriesTopo from './countries.json'

import './map.css'
import './main.css'

const countries = topoFeature( countriesTopo, 'countries' )

const breathingRoom = 5

const initMapStatus = {
	width: window.innerWidth - breathingRoom, 
	height: window.innerHeight - breathingRoom,
	center: [112.2,29],
	zoom: 1000,
	drag: null,
	proj: null // to be set in a sec
}
setProj(initMapStatus)

function setProj(mapStatus){
	mapStatus.proj = geoMercator()
		.rotate( [ -mapStatus.center[0], -mapStatus.center[1] ] )
		.translate( [ mapStatus.width/2, mapStatus.height/2 ] )
		.scale(mapStatus.zoom)
}

export default function(){
	const [ mapStatus, setMapStatus ] = useState(initMapStatus)
	const svg = useRef(null)
	useEffect(()=>{
		window.addEventListener('resize',resizeMap)
	},[])
	useEffect(()=>{ // runs after SVG renders, adding listeners
		select(svg.current)
			.call( drag()
				.on('start',startDrag)
				.on('drag',updateDrag) 
				.on('end',endDrag)
			)
	},[svg])

	const pathGen = geoPath().projection( mapStatus.proj )
	
	let transX = mapStatus.drag ? -mapStatus.drag.delta[0] : 0
	let transY = mapStatus.drag ? -mapStatus.drag.delta[1] : 0
	
	return (
		<svg id="map" ref={svg}
			width={mapStatus.width} 
			height={mapStatus.height} 
			onWheel={updateZoom}>
			<g transform={`translate(${transX},${transY})`}>
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
			</g>
		</svg>
	)
	function resizeMap(e){
		setMapStatus( current => {
			current.width = window.innerWidth - breathingRoom
			current.height = window.innerHeight - breathingRoom
			return current
		} )
	}
	function updateZoom(e){
		const stepFactor = 1.5
		setMapStatus( current => {
			let changed = {}
			Object.assign(changed,current)
			if( e.deltaY < 0 ){
				changed.zoom *= stepFactor
			}else{
				changed.zoom /= stepFactor
			}
			setProj(changed)
			return changed
		} )
		
	}
	function startDrag(e){
		setMapStatus( current => {
			let changed = {}
			Object.assign(changed,current)
			changed.drag = { start: [e.x,e.y], delta: [0,0] }
			return changed
		})
	}
	function updateDrag(e){
		setMapStatus( current => {
			let changed = {}
			Object.assign(changed,current)
			changed.drag.delta = [
				current.drag.start[0] - e.x,
				current.drag.start[1] - e.y
			]
			return changed
		} )
	}
	function endDrag(e){
		setMapStatus( current => {
			let changed = {}
			Object.assign(changed,current)
			let centerPx = current.proj(current.center)
			let newCenter = current.proj.invert( [
				centerPx[0] + current.drag.start[0] - e.x,
				centerPx[1] + current.drag.start[1] - e.y
			] )
			changed.center = newCenter
			changed.drag = null
			setProj(changed)
			return changed
		})
	}
}

