export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWl0ZXZkaW1pdGFyIiwiYSI6ImNrbmp3N3RlZDA1YWMycW54eDVpN3VpdG0ifQ.ERCej3yTPR7NzFs-lgiTKg';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mitevdimitar/cknjwjuk11iu017qqntxp32hd',
        scrollZoom: false
        /* center: [-118.521637, 34.303109],
        zoom: 10 */
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // add marker
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        // add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 100,
            left: 100,
            right: 100
        }
    });
}