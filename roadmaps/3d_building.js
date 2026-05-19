const general_trias_lat_long = [120.8872, 14.3828];

        // 1. Initialize the map in General Trias
        const map = new maplibregl.Map({
            container: 'map',
            style: 'https://tiles.openfreemap.org/styles/bright', 
            center: general_trias_lat_long, 
            zoom: 17, // Zoomed in tight so we can see the buildings clearly
            pitch: 60,
            bearing: -17.6,
            canvasContextAttributes: { antialias: true }
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-right');

        // 2. Here is our completely custom GeoJSON data!
        // We define the color, base_height, and height, and draw the shape using General Trias coordinates.
        const myCustom3DBoxes = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "color": "#ffaa00", // Orange
                        "height": 20,       // 20 meters tall
                        "base_height": 0    // Starts on the ground
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [120.8870, 14.3826],
                            [120.8874, 14.3826],
                            [120.8874, 14.3830],
                            [120.8870, 14.3830],
                            [120.8870, 14.3826] // Close the loop
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "color": "#00aaff", // Blue
                        "height": 60,       // 60 meters tall
                        "base_height": 20   // Starts 20 meters in the air (sitting on top of the orange box!)
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [120.8871, 14.3827],
                            [120.8873, 14.3827],
                            [120.8873, 14.3829],
                            [120.8871, 14.3829],
                            [120.8871, 14.3827] // Close the loop
                        ]]
                    }
                }
            ]
        };

        // 3. Load both sets of data at the same time
        map.on('load', () => {
            
            // --- PART A: The Existing City Buildings ---
            map.addSource('openfreemap', {
                url: 'https://tiles.openfreemap.org/planet',
                type: 'vector',
            });

            map.addLayer({
                'id': 'real-city-buildings',
                'source': 'openfreemap',
                'source-layer': 'building',
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#d3d3d3', // Standard gray for the rest of the city
                    'fill-extrusion-height': ['get', 'render_height'],
                    'fill-extrusion-base': ['get', 'render_min_height'],
                    'fill-extrusion-opacity': 0.8
                }
            }); 

            // --- PART B: Your Custom 3D Boxes ---
            map.addSource('my-custom-boxes', {
                'type': 'geojson',
                'data': myCustom3DBoxes // We pass our JavaScript object from Step 2 directly in here!
            });

            map.addLayer({
                'id': 'custom-box-layer',
                'type': 'fill-extrusion',
                'source': 'my-custom-boxes',
                'paint': {
                    // Tell MapLibre to read the styling directly from the properties we wrote in our GeoJSON
                    'fill-extrusion-color': ['get', 'color'],
                    'fill-extrusion-height': ['get', 'height'],
                    'fill-extrusion-base': ['get', 'base_height'],
                    'fill-extrusion-opacity': 0.9
                }
            });
        });



function findMebutton() {

    const geolocate = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true // If true, the map follows the user as they move
    });
    map.addControl(geolocate, 'top-right');

}


findMebutton(map)