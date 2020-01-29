mapboxgl.accessToken = 'pk.eyJ1IjoiaWNlcGFpbiIsImEiOiJjazVvMTA4Nm4xZ202M3BvNzRrcm9ycXhsIn0.rIipIw4fzjCoaNQcYQMBjw';
var map = new mapboxgl.Map({
container: 'mapa', // container id
style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
center: [-74.5, 40], // starting position [lng, lat]
zoom: 15 // starting zoom
});
map.on('mousemove',function(e){
    document.getElementById('coord').innerHTML = JSON.stringify(e.point)+
    "<br />"+ JSON.stringify(e.lngLat.wrap());
});
map.addControl(new mapboxgl.NavigationControl());

var size = 200;
 
// implementation of CustomLayerInterface to draw a pulsing dot icon on the map
// see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
var pulsingDot = {
width: size,
height: size,
data: new Uint8Array(size * size * 4),
 
// get rendering context for the map canvas when layer is added to the map
onAdd: function() {
var canvas = document.createElement('canvas');
canvas.width = this.width;
canvas.height = this.height;
this.context = canvas.getContext('2d');
},
 
// called once before every frame where the icon will be used
render: function() {
var duration = 1000;
var t = (performance.now() % duration) / duration;
 
var radius = (size / 2) * 0.3;
var outerRadius = (size / 2) * 0.7 * t + radius;
var context = this.context;
 
// draw outer circle
context.clearRect(0, 0, this.width, this.height);
context.beginPath();
context.arc(
this.width / 2,
this.height / 2,
outerRadius,
0,
Math.PI * 2
);
context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
context.fill();
 
// draw inner circle
context.beginPath();
context.arc(
this.width / 2,
this.height / 2,
radius,
0,
Math.PI * 2
);
context.fillStyle = 'rgba(255, 100, 100, 1)';
context.strokeStyle = 'white';
context.lineWidth = 2 + 4 * (1 - t);
context.fill();
context.stroke();
 
// update this image's data with data from the canvas
this.data = context.getImageData(
0,
0,
this.width,
this.height
).data;
 
// continuously repaint the map, resulting in the smooth animation of the dot
map.triggerRepaint();
 
// return `true` to let the map know that the image was updated
return true;
}
};

map.on('load', function() {
map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
 
map.addLayer({
'id': 'points',
'type': 'symbol',
'source': {
'type': 'geojson',
'data': {
'type': 'FeatureCollection',
'features': [
{
'type': 'Feature',
'geometry': {
'type': 'Point',
'coordinates': [202.3999,.291]
}
}
]
}
},
'layout': {
'icon-image': 'pulsing-dot'
}
});
})
map.addControl(
new MapboxGeocoder({
accessToken: mapboxgl.accessToken,
mapboxgl: mapboxgl
})
);
var mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });
mapboxClient.geocoding
.forwardGeocode({
query: 'Wellington, New Zealand',
autocomplete: false,
limit: 1
})
.send()
.then(function(response) {
if (
response &&
response.body &&
response.body.features &&
response.body.features.length
) {
var feature = response.body.features[0];
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v11',
center: feature.center,
zoom: 10
});
new mapboxgl.Marker().setLngLat(feature.center).addTo(map);
}
});
/*map.on "click" function(e){
    
} */
map.on('load', function() {
    map.addLayer({
    'id': 'room-extrusion',
    'type': 'fill-extrusion',
    'source': {
    // GeoJSON Data source used in vector tiles, documented at
    // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
    'type': 'geojson',
    'data':'../geojson/geojson.geojson'
    },
    'paint': {
    // See the Mapbox Style Specification for details on data expressions.
    // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions
     
    // Get the fill-extrusion-color from the source 'color' property.
    'fill-extrusion-color': ['get', 'color'],
     
    // Get fill-extrusion-height from the source 'height' property.
    'fill-extrusion-height': ['get', 'height'],
     
    // Get fill-extrusion-base from the source 'base_height' property.
    'fill-extrusion-base': ['get', 'base_height'],
     
    // Make extrusions slightly opaque for see through indoor walls.
    'fill-extrusion-opacity': 0.5
    }
    });
    });