var map;
let infoWindow;
let markers = [];
let directionsService = null;
let directionsRenderer = null;

// Create the script tag, set the appropriate attributes
var script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.API_KEY}&callback=initMap`;
script.defer = true;


// Append the 'script' element to 'head'
document.head.appendChild(script);


function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    var chicago = new google.maps.LatLng(41.850033, -87.6500523);

    let losAngeles = { lat: 34.063380, lng: -118.358080 };
    map = new google.maps.Map(document.getElementById("map"), {
        center: losAngeles,
        zoom: 11
    });
    infoWindow = new google.maps.InfoWindow();
    directionsRenderer.setMap(map);
    // getStores();
    // createMarker(losAngeles);
    // calcRoute();
}

function calcRoute(lat, long) {
    console.log('calcRoute');
    let start = '90048';
    // let end = '90048'
    console.log(`${lat},${long}`)
    let end = new google.maps.LatLng(
        lat,
        long
    );
    var request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
    };
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            directionsRenderer.setDirections(result);
            showSteps(result);
        }
    });
}


function showSteps(directionResult) {
    // For each step, place a marker, and add the text to the marker's
    // info window. Also attach the marker to an array so we
    // can keep track of it and remove it when calculating new
    // routes.
    //TODO: show steps in a sidebar
    var myRoute = directionResult.routes[0].legs[0];

    for (var i = 0; i < myRoute.steps.length; i++) {
        var marker = new google.maps.Marker({
            position: myRoute.steps[i].start_point,
            map: map
        });
        attachInstructionText(marker, myRoute.steps[i].instructions);
        markers[i] = marker;
    }
}

function attachInstructionText(marker, text) {
    google.maps.event.addListener(marker, 'click', function () {
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
}

getStores = () => {
    const URL = process.env.API_URL;
    const zipCode = document.getElementById("zip-code").value;

    if (zipCode) {

        // console.log(zipCode);
        fetch(`${URL}?zip_code=${zipCode}`, {
            method: 'GET'
        }).then(response => {
            if (response.status == 200) {
                return response.json();
            } else {
                throw new Error(response.status);
            }
        }).then(data => {
            if (data.length > 0) {
                // console.log(data);
                clearLocations();
                searchLocationsNear(data);
                setStoresList(data);
                setOnClickListener();
            } else {
                clearLocations();
                noStoresFound();
            }
        })
    }
}

function clearLocations() {
    infoWindow.close();
    markers.forEach((marker) => {
        marker.setMap(null)
    });
    markers.length = 0;
}

const noStoresFound = () => {
    const html = `
        <div class="no-stores-found">
            No stores found
        </div>
    `;
    document.querySelector('.stores-list').innerHTML = html;
}


const setStoresList = (stores) => {
    let html = "";
    stores.forEach((store, index) => {
        html += `
        <div class="store-container">
                <div class="store-container-background">
                    <div class="store-info-container">
                        <div class="store-address">
                            <span>${store.addressLines[0]}</span>
                            <span>${store.addressLines[1]}</span>
                        </div>
                        <div class="store-phone-number">${store.phoneNumber}</div>
                    </div>
                    <div class="store-number-container">
                        <div class="store-number">${index + 1}</div>
                    </div>
                </div>
            </div>
        `;
    })
    document.querySelector(".stores-list").innerHTML = html;
}

const searchLocationsNear = (stores) => {
    let bounds = new google.maps.LatLngBounds();
    stores.forEach((store, index) => {
        let latLng = new google.maps.LatLng(
            store.location.coordinates[1],
            store.location.coordinates[0]
        );
        let name = store.storeName;
        let address = store.addressLines[0];
        let openStatusText = store.openStatusText;
        let phoneNumber = store.phoneNumber;
        createMarker(store, latLng, index + 1);
        bounds.extend(latLng);
    })
    map.fitBounds(bounds);
}

const createMarker = (store, latLng, storeNumber) => {
    // let html = "<b>" + name + "</b> <br/>" + address;
    // console.log(store);
    let lat = store.location.coordinates[1];
    let long = store.location.coordinates[0];
    let html = `
    <div class="store-info-window">
        <div class="store-info-name">
            ${store.storeName}
        </div>
        <div class="store-info-open-status">
            ${store.openStatusText}
        </div>
        <div class="store-info-address">
            <div class="icon">
                <i class="fas fa-location-arrow"></i>
            </div>
            <span onclick="calcRoute(${lat},${long});">
                ${store.addressLines[0]}
            </span>
        </div>
        <div class="store-info-phone">
            <div class="icon">
                <i class="fas fa-phone-alt"></i>
            </div>
            <span>
                <a href="tel:${store.phoneNumber}">${store.phoneNumber}</a>
            </span>
        </div>
    </div>
    `;
    var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        label: `${storeNumber}`
        // title: "Hello Los Angeles!"
    });
    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
    });
    markers.push(marker);
}

setOnClickListener = () => {
    let storeElements = document.querySelectorAll(".store-container");
    storeElements.forEach((storeElement, index) => {
        storeElement.addEventListener("click", () => {
            google.maps.event.trigger(markers[index], 'click');
        })
    })

}

const onEnter = (e) => {
    if ("Enter" === e.key) {
        getStores();
    }
}