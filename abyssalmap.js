Plotly.d3.csv('abyssalmapdata.csv', function (err, rows) {
    function unpack(rows, key) {
        return rows.map(function (row) {
            return row[key];
        });
    }
    var trace1 = {
        x: unpack(rows, 'x1'),
        y: unpack(rows, 'y1'),
        z: unpack(rows, 'z1'),
        text: unpack(rows, 'name'),
        hoverinfo: "text",
        mode: 'markers',
        marker: {
            size: 4,
            color: unpack(rows, 'color'),
            opacity: 0.8
        },
        type: 'scatter3d'
    };
    var data = [trace1];
    var layout = {
        dragmode: 'orbit',
        plot_bgcolor: "#F00",
        paper_bgcolor: "#000",
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        }
    };
    Plotly.newPlot('myDiv', data, layout);
});
