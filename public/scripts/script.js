// READY Document actions -- DOM manipulations
$(document).ready( function () {    
    // Initialize the datatable
    var $datatable = $('#datatable').DataTable( {
            "processing": true,
            "sAjaxDataProp": "",
            "ajax": "/api/books",
            "columnDefs": [
                { "visible": false, "targets": 0 },
                { "className": "dt-center", "targets": [ 2, 3, 4 ] }
            ],
            "columns": [
                { "data": "bookid"},
                { "data": "title" },
                { "data": "authors" },
                { "data": "corevalue" },
                { "data": "status" },
                { "data": "currentreader"}                
            ],
			"paging": false,            
            "ordering": false,            
			"searching": true,
            "sDom": '<"top"i>rt<"bottom"lp><"clear">',
            "initComplete":function(settings, json) {
                // Update the listbox on the form for author filtering
                UpdateFilterListBoxes(json);
            } 
		});    
    
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
    $('#datatable').on('click', 'tr td:first-child', function() { 
        var clickedBookId = $datatable.row(this).data().bookid;
        PopulateModal(clickedBookId);
    });

    $('#bookDetails').on('hidden.bs.modal', function () {
        // reset form controls
        $('.details-output').show().text('');
        $('.details-control').hide().val('');
        $('details-modal-save-button').hide();
    })
    $('.btn-lg').click(function() {
        AnimateSelector('#' + $(this).attr('id'), 'jello');        
    });
    $('#details-modal-edit-button').click(function() {         
        AnimateSelector('#details-output', 'slideOutUp');
        $('.details-output').fadeToggle('fast', 'swing', function() {
            $('.details-control').fadeToggle();
        });
        
        // $('.details-output').fadeOut(1000, function() {
        //     AnimateSelector('.details-output', 'slideOutUp');
        // });

        // $('.details-control').fadeIn(1000, function() {
        //     AnimateSelector('.details-control', 'slideInUp');
        // });
        
        
        $('#details-modal-save-button').fadeToggle();        
        AnimateSelector('#details-modal-save-button', 'slideInUp');
        
    });
    
    $('#filter-button').click(function() {
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

    $('.filter.author-list').on('changed.bs.select', function(event, clickedIndex, newValue, oldValue) {        
        FilterSearchDatatable($datatable, event, 2);
    });

    $('.filter.core-value-list').on('changed.bs.select', function(event, clickedIndex, newValue, oldValue) {        
        FilterSearchDatatable($datatable, event, 3);
    });

    $('.filter.status-list').on('changed.bs.select', function(event, clickedIndex, newValue, oldValue) {
        FilterSearchDatatable($datatable, event, 4);
    });

    $('.filter.current-reader-list').on('changed.bs.select', function(event, clickedIndex, newValue, oldValue) {
        FilterSearchDatatable($datatable, event, 5);
    });    
    
    $('#addbook-modal-save-button').click(function(event) {
        // prevent form submission
        event.preventDefault();
        var $form = $('#addBooksForm');        
        var ajaxURL = $form.attr('action');
        var ajaxData = $form.serializeArray();        
        var ajaxPost = $.post( ajaxURL, ajaxData );
       
        ajaxPost.done(function( data ) {
            $datatable.ajax.reload();

            swal("Book saved!", "Book has been added to the library.", "success");
        });

        ajaxPost.fail(function() {
            swal("Save error.", "There was an error submitting the form.", "error");
        });    
     });

     $('#details-modal-save-button').click(function(event) {
        // prevent form submission
        event.preventDefault();        
        var $form = $('#bookDetailsForm');
        
        var inputValues = {};        
        var ajaxURL = $form.attr('action') + $('.details-book-id').val();
        $('.details-book-id').remove();
        var ajaxData = $form.serializeArray();
        var serialize = $form.serialize();        
        var json = $form;

        console.log($form);
        console.log(ajaxData);
        console.log(serialize);

        console.log('ajaxUrl: ' + ajaxURL);        
        var ajaxPut = $.ajax({ 
            url: ajaxURL, 
            type: 'PUT',
            //headers: {"X-HTTP-Method-Override": "PUT"}, // X-HTTP-Method-Override set to PUT.
            data: JSON.stringify(ajaxData),
            contentType: "application/json; charset=utf-8",            
        });
        
        ajaxPut.done(function( data ) {
            $datatable.ajax.reload();

            swal("Book saved!", "Book information has been updated.", "success");
        });

        ajaxPut.fail(function( jqXHR, textStatus, errorThrown ) {
            swal("Save error.", "There was an error submitting the form.  " + errorThrown, "error");
            console.log(jqXHR);
            console.log(textStatus);

        });    
     });

    $('#details-modal-delete-button').click(function(event) {
        // prevent form submission
        event.preventDefault();        
        var $form = $('#bookDetailsForm');                
        var ajaxURL = $form.attr('action') + $('.details-book-id').val();        
               
        var ajaxPut = $.ajax({ 
            url: ajaxURL, 
            type: 'DELETE',
            //headers: {"X-HTTP-Method-Override": "PUT"}, // X-HTTP-Method-Override set to PUT.
            //data: JSON.stringify(ajaxData),
            contentType: "application/json; charset=utf-8",            
        });
        
        ajaxPut.done(function( data ) {
            $datatable.ajax.reload();

            swal("Book deleted!", "Book has been deleted from the system.", "success");
        });

        ajaxPut.fail(function( jqXHR, textStatus, errorThrown ) {
            swal("Delete error.", "There was an error submitting the form.  " + errorThrown, "error");
            console.log(jqXHR);
            console.log(textStatus);

        });    
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
// gets book details from API and loads to modal.
function PopulateModal(clickedBookId) {
    $('.details-control').hide();
    var ajaxRequest = $.ajax({
        url: "api/books/" + clickedBookId,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        success: function(data, textStatus, jqXHR) {
            SetOutput($('.details-book-id'), clickedBookId);
            SetOutput($('.details-title'), data[0].title);
            SetOutput($('.details-author'), data[0].authors);            
            SetOutput($('.details-status'), data[0].status);
            SetOutput($('.details-reader'), data[0].currentreader);
            SetOutput($('.details-core-value'), data[0].corevalue);            
            $('#bookDetails').modal("show");
        },
        error: function(data, textStatus, jqXHR) {
            console.log('error: ' + jqXHR);
            return 'error';
        }
    });
}

function SetOutput ($object, textValue) {
    $.each($object, function(index, item) {
        if ($(item).is('input')) {
            $(item).attr('value', textValue || 'None');
        }
        else if ($(item).is('p')) {
            $(item).text(textValue || 'None');
        }
        else if ($(item).is('select')) {
            $(item).selectpicker('val', textValue);
        }
    });
    
    return $object;
}

// function for array.filter() method -- remove null, ""
function TrimNullAndEmpty(obj) {
    if (obj !== null && obj.id !== "" && obj.id !== null) {
        return true;
    }
    else {
        return false;
    }
}

function UpdateFilterListBoxes(json) {    
    var coreValueList = [];
    var statusList = [];
    var currentReaderList = [];
    
    ProcessAuthorsList();
    // populate
    for (var i = 0; i < json.length; i++) {
        coreValueList.push(json[i].corevalue);
        statusList.push(json[i].status);
        currentReaderList.push(json[i].currentreader);
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
    
    coreValueList = coreValueList.filter(TrimNullAndEmpty);
    statusList= statusList.filter(TrimNullAndEmpty);
    currentReaderList = currentReaderList.filter(TrimNullAndEmpty);
    
    // sort each specific list
    coreValueList.sort();
    statusList.sort();
    currentReaderList.sort();

    // append
    for (var i = 0; i < coreValueList.length; i++) {
        $('.core-value-list').append('<option>' + coreValueList[i] + '</option>');                        
    }
    for (var i = 0; i < statusList.length; i++) {
        $('.status-list').append('<option>' + statusList[i] + '</option>');
    }

    for (var i = 0; i < currentReaderList.length; i++) {
        $('.current-reader-list').append('<option>' + currentReaderList[i] + '</option>');
    }


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

function ProcessAuthorsList() {    
    var ajaxRequest = $.ajax({
        url: "api/authors/",
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        success: function(data, textStatus, jqXHR) {            
            for (var i = 0; i < data.length; i++) {
                $('.author-list').append('<option>' + data[i].author + '</option>');                
            }
            
            // use selectpicker a lot so after population, refresh ALL of them and hide the filters
            $('select').addClass('selectpicker').attr('data-selected-text-format','count > 1');    
            $('.author-list').attr('data-selected-text-format', 'count > 2');
            $('.selectpicker').selectpicker('refresh');
            $('.filter').selectpicker('hide');    
        },
        error: function(data, textStatus, jqXHR) {
            console.log('error: ' + jqXHR);
            return 'error';            
        }
    });    
}

function toggleFilter($elements) {
    $elements.slideToggle();
}

function AnimateSelector(selectorString, animationString) {
    var animationend = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';    
    
    $(selectorString).addClass('animated ' + animationString).one(animationend,function() {
          $(selectorString).removeClass('animated ' + animationString);
        });
}