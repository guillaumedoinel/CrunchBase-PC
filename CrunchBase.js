(function() {
  var myConnector = tableau.makeConnector();

  myConnector.getSchema = function(schemaCallback) {

    var Organizations_cols = [{
      id: "uuid",
      alias: "Company UUID",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "name",
      alias: "Company Name",
      dataType: tableau.dataTypeEnum.string
    }];
    var Organizations_Schema = {
      id: "CrunchBase_Organizations",   // table.tableInfo.id
      alias: "Organizations",
      columns: Organizations_cols
    };




    schemaCallback([Organizations_Schema]);
  };

  // When you create multiple table schemas, the WDC API calls the getData function once for each schema.
  // As a result, you need a way to change the call to the API for each table. The easiest way to do this is to use the table.tableInfo.id value that we set in the table schemas.
  myConnector.getData = function(table, doneCallback) {

    // ORGANIZATIONS API
    if (table.tableInfo.id == "CrunchBase_Organizations") {

      // Calls the Organizations API for as many categories listed
      var CategoriesList = ["Auto Insurance","Automotive","Autonomous Vehicles","Battery","Car Sharing","Electric Vehicle","Last Mile Transportation","Limousine Service","Ride Sharing","Taxi Service"];

      for (var j = 0, len2 = CategoriesList.length; j < len2; j++) {
        var CategoryName = CategoriesList[j];

        // Organizations : MULTIPLE CALLS to a PAGED API
        var PageNo = 1;
        var Next_page_url = "init";
        do {
          $.ajax({
            url: "https://api.crunchbase.com/v3.1/organizations?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&categories=" + CategoryName + "&page=" + PageNo,
            async: false,
            success: function(response) { // response is a custom name
              var tableData = [];
              var itemsJSON = response.data.items; // data.items is the CrunchBase API JSON Structure
              for (var i = 0, len = itemsJSON.length; i < len; i++) {
                tableData.push({
                  "uuid": itemsJSON[i].uuid,
                  "name": itemsJSON[i].properties.name
                });
              }

              table.appendRows(tableData); // append data for each API call
              Next_page_url = response.data.paging.next_page_url;
            }
          });
          PageNo++;
        } while (Next_page_url != null); // while there are some data left
      }


      doneCallback();
    }

  };

  tableau.registerConnector(myConnector);

  $(document).ready(function() {
    $("#submitButton").click(function() {
      tableau.connectionName = "CrunchBase Feed";
      tableau.submit();
    });
  });
})();
