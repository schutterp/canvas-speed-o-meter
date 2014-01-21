(function (global) {
    global.initMap = function () {
        var gmaps = google.maps;
        var lat_lng = new gmaps.LatLng(30.246571, -97.774307);
        var map_options = {
            center: lat_lng,
            zoom: 12
        };
        var map = new gmaps.Map(document.getElementById('map-canvas'), map_options);
        var marker = new gmaps.Marker({
            position: lat_lng,
            visible: true
        });
        marker.setMap(map);

        return {
            // for now ts must be an array of pos objects
            // [{time: 1, {lat: 30, lng: -97}}, ...]
            addPolyLine: function (ts) {
                var bounds = new gmaps.LatLngBounds();
                var coords = _.chain(ts.slice(0))
                    .filter(function (point) {
                        return point.length && point[1] && point[1].lat && point[1].lng;
                    })
                    .map(function (point) {
                        var lat_lng = new gmaps.LatLng(point[1].lat, point[1].lng);
                        bounds.extend(lat_lng);
                        return lat_lng;
                    })
                    .value();

                map.fitBounds(bounds);

                var path = new google.maps.Polyline({
                    path: coords,
                    geodesic: true,
                    strokeColor: '#ee0000',
                    strokeOpacity: 0.75,
                    strokeWeight: 2
                });

                path.setMap(map);
            },
            centerOn: function (lat, lng) {
                map.setCenter(new gmaps.LatLng(lat, lng));
            },
            updatePosition: function (lat, lng) {
                var lat_lng = new gmaps.LatLng(lat, lng);
                marker.setPosition(lat_lng);
            }
        };
    };
})(window);
