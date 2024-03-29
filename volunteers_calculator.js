#!/usr/bin/env node

var fs = require("fs");

var VolunteersCalculator = (module.exports = function() {
  return {
    bagsStillNeeded: null,
    bagsStockedPerVolunteer: null,
    volunteersNeeded: null,
    daysCount: null,
    data: null,
    results: null,

    processFile: function(f, done) {
      var self = this;
      fs.readFile(f, "utf8", function(err, data) {
        // splits each row into a new line/row
        var lines = data.split("\n");
        this.volunteerData = [];
        // splits each new line into seperate cells based on the commas in the txt file
        for (var line = 0; line < lines.length; line++) {
          this.volunteerData.push(lines[line].split(","));
        }

        // counts how many lines there are to output days
        var daysCount = this.volunteerData.length - 1;
        var data = this.volunteerData.splice(1);
        self.daysCount = daysCount;
        self.data = data;
        done(daysCount, data);
      });
    },

    dayCount: function() {
      var dayCount = this.data.length;
      return this.dayCount;
    },

    // if not null divides actual bags by volunteers to get the bags stocked by the amount of volunteers
    getBagsStockedPerVolunteer: function() {
      if (this.bagsStockedPerVolunteer !== null) {
        return this.bagsStockedPerVolunteer;
      }

      this.bagsStockedPerVolunteer = [];
      for (var i = 0; i < this.daysCount; i++) {
        var bagsStocked = this.data[i][2];
        var volunteers = this.data[i][0];

        this.bagsStockedPerVolunteer.push(bagsStocked / volunteers);
      }

      return this.bagsStockedPerVolunteer;
    },

    // if not null subracts actual bags from goal bags to resukt in bags needed
    getBagsStillNeeded: function() {
      if (this.bagsStillNeeded !== null) {
        return this.bagsStillNeeded;
      }

      this.bagsStillNeeded = [];
      for (var i = 0; i < this.daysCount; i++) {
        var bags = this.data[i][1] - this.data[i][2];
        this.bagsStillNeeded.push(bags);
      }
      return this.bagsStillNeeded;
    },

    /* if not null divides bags still needed by the bags stocked per volunteer to get
    the number of volunteers needed on each day */
    getVolunteersNeeded: function() {
      if (this.volunteersNeeded !== null) {
        return this.volunteersNeeded;
      }
      var volunteersNeeded = [];
      for (var j = 0; j < this.daysCount; j++) {
        var v =
          this.getBagsStillNeeded()[j] / this.getBagsStockedPerVolunteer()[j];
        volunteersNeeded.push(v.toFixed(2));
      }
      return volunteersNeeded;
    },

    // assigns the string(day_name) to the day number then displays the result on the console
    getResults: function(volunteers) {

      this.results = [];
      for (var i = 0; i < volunteers.length; i++) {
        // gets the day name if there is none returns empty string
        var dayNames = this.data[i][3] || " ";
        var result = {
          'value':volunteers[i] , 
          'name' : volunteers[i] + " additional volunteers are needed on day " + i +" " +dayNames
          }
          this.results.push(result);
        }

      this.results.sort(function(a, b) {
        return a.value - b.value;
      }).reverse();
      
      // maps result array converts to string then splits into new lines from each comma
      var result = this.results.map(a => a.name).toString().split(",").join("\n");

      console.log(result);
    }
  };
});

if (require.main === module) {
  var calculator = new VolunteersCalculator();
  var readAndPrint = function(arg) {

    // processes the file using the process file function necessary to read from the .txt
    calculator.processFile(arg, function() {

      // gets volunteers needed based on numbers passed through the math functions
      var volunteers = calculator.getVolunteersNeeded();

      // inserts the volunteers needed into getResults function
      calculator.getResults(volunteers);
    });
  };

  if (process.argv.length === 3) {
    readAndPrint(process.argv[2]);
  } else {
    console.log("Please follow the README instructions to run the program.");
  }
}
