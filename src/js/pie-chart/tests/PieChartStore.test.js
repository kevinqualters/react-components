define(function(require) {
    var PieChartStore = require('drc/pie-chart/PieChartStore');
    var Utils = require('drc/utils/Utils');

    describe('PieChartStore', function() {
        var definition = {
            url: '/test',
            label: 'TEST'
        };
        var id = 'pie-chart' + Utils.guid();
        var pieChart;
        var data = [
            {
                percent: 40,
                value: 1999
            },
            {
                percent: 35.8,
                value: 1789
            },
            {
                percent: 24.2,
                value: 1211
            }
        ];

        beforeEach(function() {
            pieChart = new PieChartStore.PieChart(id, definition);
        });

        describe('PieChart constructor', function() {
            it('should construct the pie chart with all of the expected properties.', function() {
                expect(pieChart.id).toEqual(id);
                expect(pieChart.label).toEqual(definition.label);
            });
        });

        describe('onDataReceived', function() {
            it('should copy the data received to the pie chart data.', function() {
                pieChart.onDataReceived(_.clone(data));

                expect(pieChart.data).toEqual(data);
            });
        });

        describe('error function', function() {
            it('should set the data to null.', function() {
                pieChart.data = 'testing';
                pieChart.errorFunction();

                expect(pieChart.data).not.toEqual('testing');
                expect(pieChart.data).toBeNull();
            });
        });

        describe('getData function', function() {
            it('should retrieve the data for the pie chart.', function() {
                pieChart.onDataReceived(_.clone(data));
                var instanceData = pieChart.getData();
                expect(instanceData).toEqual(data);
            });
        });

        describe('getLabel function', function() {
            it('should retrieve the label for the pie chart.', function() {
                expect(pieChart.getLabel()).toEqual(definition.label);
            });
        });
    });
});
