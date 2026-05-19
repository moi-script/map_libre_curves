// initialize the map  :
const general_trias_lat_long = [120.8872, 14.3828]

// normal map 
const map = new maplibregl.Map({
    container: 'map', // This tells MapLibre to look for the <div id="map">
    style: 'https://tiles.openfreemap.org/styles/bright', // The visual design of the map
    center: general_trias_lat_long, // Starting position: General Trias, Philippines
    zoom: 12, // Starting zoom level
    // hash : true
});



function generateMapWithoutHash() {
    const map = new maplibregl.Map({
        container: 'map', // This tells MapLibre to look for the <div id="map">
        style: 'https://tiles.openfreemap.org/styles/bright', // The visual design of the map
        center: general_trias_lat_long, // Starting position: General Trias, Philippines
        zoom: 12 // Starting zoom level
    });
}

// generateMapWithoutHash()

// hash map 
function generateMapWithHashUrl() {

    const map = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.openfreemap.org/styles/bright',
        center: [120.8872, 14.3828],
        zoom: 12,
        hash: true // <-- Add this line!
    });
}

// generateMapWithHashUrl() // this is chaing the lat long of the url part
function controlZoomCompass() {
    // adds the + and - zoom buttons and the compass in the map 
    const nav = new maplibregl.NavigationControl();
    map.addControl(nav, 'top-right');

    const fullscreen = new maplibregl.FullscreenControl();
    map.addControl(fullscreen, 'top-right'); // Stacks automatically below the nav control


}

// // 3. Create a Popup
// // The 'offset' pushes the popup up slightly so it doesn't cover the tip of the marker pin
function addMyPopup() {
    const myPopup = new maplibregl.Popup({ closeOnClick: false })
        .setHTML('<h3>General Trias</h3><p>Welcome to Calabarzon!</p>')
        .setLngLat(general_trias_lat_long)
        .addTo(map)

}
// this adds the marker in the map 
function addMyMarker() {
    const marker = new maplibregl.Marker()
        .setLngLat([120.8872, 14.3828])
        .addTo(map);
}
function findMebutton() {

    const geolocate = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true // If true, the map follows the user as they move
    });
    map.addControl(geolocate, 'top-right');

}
function scaleValueZoom() {

    const scale = new maplibregl.ScaleControl({
        maxWidth: 150,
        unit: 'metric' // Options are 'imperial', 'metric', or 'nautical'
    });
    map.addControl(scale, 'bottom-left');

}
function addTerrainButton() {
    // We add the button to toggle 3D terrain
    const terrainControl = new maplibregl.TerrainControl({
        source: 'my-elevation-data', // We haven't created this yet!
        exaggeration: 1.5 // Makes mountains look 1.5x taller
    });
    map.addControl(terrainControl, 'top-right');
}



function drawPolygon(map) {

    map.addSource('my-custom-shape', {
        type: 'geojson',
        data: {
            "type": "Feature",
            "properties": {
                "name": "General Trias Triangle"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [120.88, 14.38], // Bottom left
                    [120.90, 14.38], // Bottom right
                    [120.89, 14.40], // Top center
                    [120.88, 14.38]  // You MUST repeat the first coordinate to close the loop!
                ]]
            }
        }
    });

    // 2. Add the Fill Layer (The Paint)
    map.addLayer({
        id: 'shape-fill',
        type: 'fill',
        source: 'my-custom-shape', // This tells the layer which source to draw
        paint: {
            'fill-color': '#55ef32', // Red
            'fill-opacity': 0.4      // Make it slightly transparent
        }
    });

    // 3. Add an Outline Layer (Optional, but looks nice)
    map.addLayer({
        id: 'shape-outline',
        type: 'line',
        source: 'my-custom-shape', // Notice we can reuse the same source for multiple layers!
        paint: {
            'line-color': '#69f930', // Darker red
            'line-width': 3
        }
    });

}
function clickablePoly(map) {
    // 1. The Click Event
    map.on('click', 'shape-fill', (e) => {
        // MapLibre gives us 'e.features', an array of everything we just clicked.
        // e.features[0] is the top-most shape.
        const clickedFeature = e.features[0];

        // Remember the "name" property we put in our GeoJSON earlier? Let's grab it!
        const shapeName = clickedFeature.properties.name;

        // e.lngLat gives us the exact [longitude, latitude] where the mouse clicked
        const clickCoordinates = e.lngLat;

        // Let's reuse the Popup concept we learned earlier!
        new maplibregl.Popup()
            .setLngLat(clickCoordinates)
            .setHTML(`<strong>You clicked the shape!</strong><br>Property Name: ${shapeName}`)
            .addTo(map);
    });

    // 2. The Hover Events (UX best practice)
    // When the mouse enters the shape, change the cursor to a pointer (hand icon)
    map.on('mouseenter', 'shape-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // When the mouse leaves the shape, change it back to the default cursor
    map.on('mouseleave', 'shape-fill', () => {
        map.getCanvas().style.cursor = '';
    });
}

function addGlobeSetUp() {

    map.addControl(new maplibregl.GlobeControl(), 'top-right')

    // Wait for the map to finish loading before adding data
    map.on('load', () => {
        // 1. Define the Source (The Data)
        map.addSource('my-elevation-data', {
            type: 'raster-dem',
            // This is a free elevation dataset provided by AWS / Mapzen
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            encoding: 'terrarium',
            tileSize: 256
        });

        // 2. Set the 3D Terrain
        // This connects the source we just made to the map's actual 3D engine
        map.setTerrain({
            source: 'my-elevation-data',
            exaggeration: 1.5 // Makes hills look 1.5x taller
        });

        drawPolygon(map)
        cameraButton()

        // clickablePoly(map)

    });
}

function cameraButton() {
    // 1. Grab the HTML button
    const zoomBtn = document.getElementById('zoom-btn');

    zoomBtn.addEventListener('click', () => {

        // 2. Create an empty LngLatBounds object
        const bounds = new maplibregl.LngLatBounds();

        // 3. The coordinates of our triangle
        const triangleCoords = [
            [120.88, 14.38],
            [120.90, 14.38],
            [120.89, 14.40]
        ];

        // 4. Loop through the coordinates and "extend" the box to fit them all
        for (const coord of triangleCoords) {
            bounds.extend(coord);
        }

        // 5. Fly the camera to fit the bounding box
        map.fitBounds(bounds, {
            padding: 20,      // <-- This is PaddingOptions! It leaves 50px of empty space around the shape
            duration: 5000,   // Makes the flight take 2 seconds (smooth animation)
            pitch: 1,         // Optional: Flatten the camera back to 2D
            bearing: -100      // Optional: Reset rotation to face North
        });
    });
}

addMyMarker();
controlZoomCompass();
findMebutton();
scaleValueZoom();
addTerrainButton();
addGlobeSetUp()