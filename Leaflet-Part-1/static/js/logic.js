// Gathering data for the US from 11/23/2023 to 11/30/2023
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Street tile layer for the map
let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create Leaflet map
let earthquakeMap = L.map("map", {
    center: [42.52, -102.67],
    zoom: 5,
    layers: [streetLayer]
});

// Function to determine circle color based on depth (Source: https://www.rapidtables.com/web/color/RGB_Color.html)
function getCircleColor(depth) {
    if (depth < 10) {
        return '#B2FF66'; // Green
    } else if (depth < 30) {
        return '#FFFF00'; // Yellow
    } else if (depth < 50) {
        return '#FFB266'; // Orange
    } else if (depth < 70) {
        return '#FF8000'; // Orange-Red
    } else if (depth < 90) {
        return '#FF6666'; // Red
    } else {
        return '#FF0000'; // Dark Red
    }
}

// Function to add earthquake markers to the map
function plotEarthquakeMarkers(earthquakeFeatures) {
    // Calculate depth extent using d3.extent (more efficient than iterations)
    const depthExtent = d3.extent(earthquakeFeatures, d => d.geometry.coordinates[2]);
    const [minDepth, maxDepth] = depthExtent;
    console.log("Depth Extent:", depthExtent);

    earthquakeFeatures.forEach(earthquake => {
        let earthquakeLocation = earthquake.geometry.coordinates;
        let earthquakeDepth = earthquakeLocation[2];
        let earthquakeMagnitude = earthquake.properties.mag;

        // Log for each earthquake
        console.log(`Earthquake - Location: [${earthquakeLocation}], Magnitude: ${earthquakeMagnitude}, Depth: ${earthquakeDepth}`);

        if (earthquakeLocation) {
            // Create circle marker formats
            let circleMarkerOptions = {
                radius: Math.max(earthquakeMagnitude * 7, 5),
                color: 'black', // Border color
                fillColor: getCircleColor(earthquakeDepth),
                fillOpacity: 0.8,
                weight: 1, // Border thickness
                dashArray: null // Set to null for a solid line
            };

            // Add circle marker to the map with popup
            L.circleMarker([earthquakeLocation[1], earthquakeLocation[0]], circleMarkerOptions)
                .bindPopup(`Location: [${earthquakeLocation[0]}, ${earthquakeLocation[1]}]<br />Magnitude: ${earthquakeMagnitude} <br /> Depth: ${earthquakeDepth} km`)
                .addTo(earthquakeMap);
        }
    });

    // Add depth legend to the map
    addDepthLegend(minDepth, maxDepth);
}

// Function to add depth legend to the map
function addDepthLegend(minDepth, maxDepth) {
    let legendControl = L.control({ position: "bottomright" });
    legendControl.onAdd = function () {
        let legendContainer = L.DomUtil.create("div", "info legend");
        let depthLimits = [-10, 10, 30, 50, 70, 90];
        let legendLabels = depthLimits.map((limit, i) => {
            return `<li style="background-color: ${getCircleColor(limit)}">${limit}${depthLimits[i + 1] ? `&ndash;${depthLimits[i + 1]}<br>` : '+'}</li>`;
        });

        legendContainer.innerHTML = legendLabels.join('');
        legendContainer.style.backgroundColor = "#fff"; // white background color
        return legendContainer;
    };

    legendControl.addTo(earthquakeMap);
}

// Fetch earthquake data and process it
d3.json(queryUrl).then(function (earthquakeData) {
    console.log("Fetched Earthquake Data:", earthquakeData);
    plotEarthquakeMarkers(earthquakeData.features);
});
