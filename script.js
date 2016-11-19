// READY Document actions -- DOM manipulations
$(document).ready( function () {    
        // Initialize the datatable
    $('#datatable').DataTable( {
            "processing": true,
            "ajax": "./Library.json",
            "columnDefs": [
                {"className": "dt-center", "targets": [ 2, 3, 4 ]}
            ],
            "columns": [                 
                { "data": "Title" },
                { "data": "Authors" },
                { "data": "CoreValue" },
                { "data": "Status" },
                { "data": "CurrentReader"}                
            ],
			"paging": false,
            "ordering": false,
			"searching": true,
            "sDom": '<"top"i>rt<"bottom"lp><"clear">'                        
		});
    
    // Update the listbox on the form for author filtering
    UpdateFilterListBoxes();

    // add another column
    $('#datatable').DataTable();

    // when selectlist value is changed, filter the datatable
    $('.filter').change(function() {
        var datatable = $('#datatable').DataTable();
        var selectedValue = $('.select-list option:selected').text();

        // filter the table with the selected value
        datatable.search(selectedValue).draw();        
    });

    //
    // Click Listeners
    //
    $('#filter-button').click(function() {
        JelloButton('#filter-button');

        $(".filter").animate({
            height: "toggle",
            opacity: "toggle"
        }, "slow");
    });

    $('#search-button').click(function() { JelloButton('#search-button') });
    $('#add-book-button').click(function() { JelloButton('#add-book-button') });
} );




//
// Function Definitions
//
function UpdateFilterListBoxes() {        
    $.getJSON("Library.json", function(json) {         
        var data = json.data;
        var authorList = ProcessAuthorsList(json.data);
        var masterList = ProcessAllLists(json.data);  

        // Append all unique authors from our list to the selectlist
        for (i = 0; i < authorList.length; i++) {
            $('#author-list').append('<option>' + authorList[i].toString() + '</option>');
        }

        // Process & append other lists too
        for (i = 0; i < masterList[0].length; i++) {
            $('.core-value-list').append('<option>' + masterList[0][i].toString() + '</option>');
        }
        for (i = 0; i < masterList[1].length; i++) {
            $('.current-reader-list').append('<option>' + masterList[1][i].toString() + '</option>');
        }
        for (i = 0; i < masterList[2].length; i++) {
            $('.status-list').append('<option>' + masterList[2][i].toString() + '</option>');
        }            
    });
};

function ProcessAllLists(jsonData) {
    var coreValueList = [];
    var statusList = [];
    var currentReaderList = [];
    var returnList = [];

    for(var i=0; i < jsonData.length; i++) {           
        coreValueList.push(jsonData[i].CoreValue.toString());
        statusList.push(jsonData[i].Status.toString());
        currentReaderList.push(jsonData[i].CurrentReader.toString());
    }
        
    // remove duplicates
    var coreValueList = coreValueList.filter(function(itm,i,a){
        return i==a.indexOf(itm);
    });
    var statusList = statusList.filter(function(itm,i,a){
        return i==a.indexOf(itm);
    });
    var currentReaderList = currentReaderList.filter(function(itm,i,a){
        return i==a.indexOf(itm);
    });
    
    coreValueList.sort();
    statusList.sort();
    currentReaderList.sort();

    returnList.push(coreValueList);
    returnList.push(currentReaderList);
    returnList.push(statusList);

    return returnList;
};

function ProcessAuthorsList(jsonData) { 
    var authorList = [];   
    for(var i=0; i < jsonData.length; i++) {                
        if (Array.isArray(jsonData[i].Authors)) {
            for (var j=0; j < jsonData[i].Authors.length; j++) {
                authorList.push(jsonData[i].Authors[j].toString());
            }
        }
        else {
            authorList.push(jsonData[i].Authors.toString());
        }
    }
        
    // remove duplicates
    var uniqueAuthors = authorList.filter(function(itm,i,a){
        return i==a.indexOf(itm);
    });
    
    uniqueAuthors.sort();

    return uniqueAuthors;
};    

function toggleFilter($elements) {
    $elements.toggle();
}

function JelloButton(selectorString) {
    var animationend = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';    
    
    $(selectorString).addClass('animated jello').one(animationend,function() {
          $(selectorString).removeClass('animated jello');
        });
}