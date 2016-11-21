// READY Document actions -- DOM manipulations
$(document).ready( function () {    
    // Initialize the datatable
    var $datatable = $('#datatable').DataTable( {
            "processing": true,
            "ajax": "./assets/Library.json",
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
    
    // when selectlist value is changed, filter the datatable
    $('.filter').change(function() {        
        var selectedValue = $('.select-list option:selected').text();

        // filter the table with the selected value
        $datatable.search(selectedValue).draw();        
    });

    // Set add button width match upper 2 buttons total width
    // $('#add-book-button').css('width', parseFloat($('#filter-button').css("width")) + parseFloat($('#search-button').css('width')));    

    //
    // Click Listeners
    //
    $('#search-button').click(function() { AnimateSelector('#search-button', 'jello') });
    $('#add-book-button').click(function() { AnimateSelector('#add-book-button', 'jello') });

    $('#filter-button').click(function() {
        AnimateSelector('#filter-button', 'jello');

        $(".filter").animate({
            height: "toggle",
            opacity: "toggle"
        }, "slow");
    });

    $('#search-button').click(function() {
        swal({
            title: "Search", 
            text: "Search For:", 
            type: "input", 
            showCancelButton: true,
            closeOnConfirm: false,      // change when done testing
            inputPlaceholder: "Search Term",
            allowOutsideClick: true,            
            confirmButtonText: "Search",
            cancelButtonText: "Close"
        },            
            function(inputValue){
                if (inputValue === false) return false;
  
                if (inputValue === "") {
                    swal.showInputError("You need to write something!");
                    return false;
                }
                
                $datatable.search(inputValue).draw();

                swal({
                    title: "Searched!", 
                    text: "Search term " + inputValue + " applied.", 
                    type: "success",                    
                });
            });
    });

    $('.author-list').on('changed.bs.select', function(event, clickedIndex, newValue, oldValue) {        
        FilterSearchDatatable($datatable, event, 1);
    });

    $('.core-value-list').on('changed.bs.select', function(event, clickedIndex, newValue, oldValue) {        
        FilterSearchDatatable($datatable, event, 2);
    });

    $('.status-list').on('changed.bs.select', function(event, clickedIndex, newValue, oldValue) {
        FilterSearchDatatable($datatable, event, 3);
    });

    $('.current-reader-list').on('changed.bs.select', function(event, clickedIndex, newValue, oldValue) {
        FilterSearchDatatable($datatable, event, 4);
    });    
    
    $('#addbook-modal-save-button').click(function(event) {
        // prevent form submission
        event.preventDefault();
        var $form = $('#addBooksForm');        
        var inputValues = {};
        var ajaxURL = $form.attr('action');
        var ajaxData = $form.serializeArray();
        var serialize = $form.serialize();        
        // var ajaxPost = $.post( ajaxURL, ajaxData );

        var formTitle = ajaxData[0].value;
        var formAuthors = ajaxData[1].value;
        var formCoreValue = ajaxData[2].value;
        var formStatus = ajaxData[3].value;

        console.log(ajaxData);
        // Uncomment this when I'm ready to actually post the form
        // ajaxPost.done(function( data ) {
            // collapse authors to string for row
            var authorString = "";
            // for (var i = 0; i < ajaxData.Author.length; i++) {
            //     authorString += ajaxData.Author[i] + ', ';
            // }
            // authorString.slice(0, -2);

            $datatable.row.add({
            Title: formTitle,
            Authors: formAuthors,
            CoreValue: formCoreValue,            
            Status: formStatus,
            CurrentReader: ''
            }).draw( false );

        swal("Book saved!", "Book has been added to the library.", "success");
        // });
        // ajaxPost.fail(function() {
        //     swal("Save error.", "There was an error submitting the form.", "error");
        // });    
     });    

    $('#add-author-button').click(function() { 
        AnimateSelector('#add-author-button', 'pulse');
        
        if ($('.author-input').length <= 1) {            
            $('#remove-author-button').fadeIn();
        }

        $(this).before('<input name="Author" type="text" class="author-input form-control" placeholder="Author" style="margin;top: 2%; display: none;">');
        $(this).prev().css('opacity', 0)
        .slideDown('fast').animate(
            { opacity: 1 },
            { queue: false, duration: 'slow' }
            );
     });

     $('#remove-author-button').click(function() {
         var authorBoxes = $('.author-input');        

        $(authorBoxes[authorBoxes.length-1]).css('opacity', 1)
        .slideUp('fast').animate(
            { opacity: 0 },
            { queue: false, duration: 'fast', easing: "swing", complete: function() {
                $(this).remove();
         
                if ($('.author-input').length <= 1) {
                    $('#remove-author-button').fadeOut('fast');
                }                
            }
        });                
    })
});

//
// Function Definitions
//
function UpdateFilterListBoxes() {        
    $.getJSON("./assets/Library.json", function(json) {         
        var data = json.data;
        var authorList = ProcessAuthorsList(json.data);
        var masterList = ProcessAllLists(json.data);  

        // Append all unique authors from our list to the selectlist
        for (i = 0; i < authorList.length; i++) {
            $('.author-list').append('<option>' + authorList[i].toString() + '</option>');
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
    }).done(function() {
        // use selectpicker a lot so after population, refresh ALL of them and hide the filters
        $('select').addClass('selectpicker').attr('data-selected-text-format','count > 1');
        $('.author-list').attr('data-selected-text-format', 'count > 2');
        $('.selectpicker').selectpicker('refresh');
        $('.filter').selectpicker('hide');
    });     
};

function FilterSearchDatatable($datatable, event, columnNumber) {
    // all selected <option> elements
    var selections = event.currentTarget.selectedOptions;
    var selectionsArray = [].slice.call(selections);       

    // add ( for regex search, use slice.call() to convert HTMLCollection to array for processing
    var searchString = '(';        
    
    if (selectionsArray[0] != null) {            
        for (var i = 0; i < selectionsArray.length; i++){
            searchString += selectionsArray[i].value + '|';
        }

        // chop off last pipe, add closing ) for regex
        // replace all spaces with . -- . is regex for any character
        searchString = searchString.slice(0, -1);   
        searchString += ")";
        searchString = searchString.replace(/ /g, '.');

        $datatable.column(columnNumber).search(searchString, true).draw();            
    }
    else {
        // clear search on this column, show everything since nothing is selected            
        $datatable.column(columnNumber).search("").draw();
        return;
    }
}

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
    
    // sort each specific list, compile and return
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
    $elements.slideToggle();
}

function AnimateSelector(selectorString, animationString) {
    var animationend = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';    
    
    $(selectorString).addClass('animated ' + animationString).one(animationend,function() {
          $(selectorString).removeClass('animated ' + animationString);
        });
}