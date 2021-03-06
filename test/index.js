var radioactive = require('../radioactive.js'),
    _           = require('underscore');

describe('radioactive.js', function () {

    // Decay Chains
    // ------------

    describe('decay chains', function () {

        var searchDecayTree = function (isotope, searchIsotope, searchDecayTree) {
            var products = radioactive.decay.products(isotope);
            if (products) {
                for (var i = 0; i < products.length; i++) {
                    if (products[i].product === searchIsotope)
                        return searchIsotope;
                    else
                        return searchDecayTree(products[i].product, searchIsotope, searchDecayTree);
                }
            }
        };

        it('has a complete thorium series from Cf-252 to Pb-208', function () {
            var Pb208 = searchDecayTree('Cf-252', 'Pb-208', searchDecayTree);
            Pb208.should.equal('Pb-208');
        });
        it('has a complete actinium series from Pu-239 to Pb-207', function () {
            var Pb207 = searchDecayTree('Pu-239', 'Pb-207', searchDecayTree);
            Pb207.should.equal('Pb-207');
        });
        it('has a complete radium series from Pu-242 to Pb-206', function () {
            var Pb206 = searchDecayTree('Pu-242', 'Pb-206', searchDecayTree);
            Pb206.should.equal('Pb-206');
        });
        it('has a complete neptunium series from Cf-249 to Tl-205', function () {
            var Tl205 = searchDecayTree('Cf-249', 'Tl-205', searchDecayTree);
            Tl205.should.equal('Tl-205');
        });

        it('has a complete fission product light series from Y-99 to Ru-99', function () {
            var Ru99 = searchDecayTree('Y-99', 'Ru-99', searchDecayTree);
            Ru99.should.equal('Ru-99');
        });
        it('has a complete fission product heavy series from Te-135 to Ba-135', function () {
            var Ba135 = searchDecayTree('Te-135', 'Ba-135', searchDecayTree);
            Ba135.should.equal('Ba-135');
        });

    });



    // Decay Profile
    // -------------

    describe('decay profile', function () {

        it('has simple exponential decay for each single isotope', function () {

            _.each(_.keys(radioactive.isotopeData), function (isotopeName) {

                var charge = {};
                charge[isotopeName] = 1;

                var mass = radioactive.decay.mass(charge);

                var halflife = radioactive.isotopeData[isotopeName].halflife;
                for (var halflives = 0; halflives < 5; halflives++) {
                    var remaining = mass(halflife*halflives)[isotopeName];
                    var remainingExpected = Math.pow(0.5, halflives);

                    var error = Math.abs( (remaining - remainingExpected) / remainingExpected );
                    error.should.be.lessThan(0.0000001);
                }

            });
        });

        it('has expected decay rate with child isotope in chain', function () {

            // Po-216 (0.1 second halflife) decays to Pb-212 (11 hour halflife)
            // We expect the conversion to Pb-212 to be pretty complete after
            // 5 seconds but basically all of the Pb-212 should still be around

            // start with 1000 kg of Polonium-216
            var startingMass = 1000;
            var mass = radioactive.decay.mass({
                'Po-216' : startingMass
            });

            // 5 seconds later...
            var after5Seconds = 5 / (365.25 * 24 * 60 * 60);
            var remainingPolonium = mass(after5Seconds)['Po-216'];
            remainingPolonium.should.be.lessThan(0.0000001);

            var freshLead = mass(after5Seconds)['Pb-212'];
            var expectedLead = startingMass / radioactive.isotopeData['Po-216'].molarMass * radioactive.isotopeData['Pb-212'].molarMass;

            var error = Math.abs( (freshLead - expectedLead) / expectedLead );
            error.should.be.lessThan(0.0001);

        });
    });

});



