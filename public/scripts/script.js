// READY Document actions -- DOM manipulations
$(document).ready(function () {
    // turn off AJAX caching. IE does it tooooo much
    $.ajaxSetup({ cache: false });

    // unhide Add Book button if we have a cookie
    if (VerifyCookie()) {
        $('#add-book-button').show();
    }

    // get all filters 1 time
    $filters = $('.filter');

    // Initialize the datatable
    var $datatable = $('#datatable').DataTable({
        "processing": true,
        "autoWidth": false,
        "sAjaxDataProp": "",
        "ajax": "/api/books",
        "order": [[1, "asc"]],
        "columnDefs": [
            { "visible": false, "targets": 0 },
            { "width": "37%", "targets": [1] },
            { "width": "23%", "targets": [2] },
            { "width": "15%", "targets": [3, 4] },
            { "width": "20%", "targets": [5] },
            { "className": "dt-center", "targets": [2, 3, 4, 5] },
            { "sTitle": '<select multiple class="author-list filter form-control" data-title="Author"><option value=""></option></select>', "targets": 2 },
            { "sTitle": '<select multiple class="core-value-list filter form-control" data-title="Core Value"><option value=""></option></select>', "targets": 3 },
            { "sTitle": '<select class="status-list filter form-control" data-title="Status"><option value=""></option></select>', "targets": 4 },
            { "sTitle": '<select class="current-reader-list filter form-control" data-title="Reader"><option value=""></option></select>', "targets": 5 },
        ],
        "columns": [
            { "data": "bookid" },
            { "data": "title" },
            { "data": "authors" },
            { "data": "corevalue" },
            { "data": "status" },
            { "data": "currentreader" }
            // , 
            //     "defaultContent": "<button class='btn'>Click!</button>"}
        ],
        "paging": false,
        //"ordering": false,
        //"dom": 'lrtip',
        "searching": true,
        "dom": '<"top">t<"bottom"lp><"clear">',
        "initComplete": function (settings, json) {
            // Update the listbox on the form for author filtering
            UpdateFilterListBoxes(json);

            // make datatable unclickable -- not an option for some reason
            $('#datatable').find("th").off("click.DT").removeAttr('tabindex').css('background-image', '');

            // show page contents when datatable rendering is complete, solve animation jumps
            $('.container-fluid > .left').show().addClass('animated fadeInLeft');
        }
    });

    // when selectlist value is changed, filter the datatable
    $('.filter').change(function () {
        var selectedValue = $('.select-list option:selected').text();
        var $filterButton = $('#filter-button');

        // filter the table with the selected value
        $datatable.search(selectedValue).draw();
        
        $filters.each(function() { 
            console.log( $(this).selectpicker('val') );

            if ($(this).selectpicker('val') != null) {
                // make sure filter button is shown
                if ($($filterButton).is(':hidden')) {
                    $($filterButton).show();
                    AnimateSelector($filterButton, "slideInLeft");
                } 
            }
        });
    });

    // Set add button width match upper 2 buttons total width
    // $('#add-book-button').css('width', parseFloat($('#filter-button').css("width")) + parseFloat($('#search-button').css('width')));    

    /**
      * Click Listeners
      *
      **/
    $('#datatable').on('click', 'tr td:first-child', function () {
        var clickedBookId = $datatable.row(this).data().bookid;
        PopulateModal(clickedBookId);
    });

    $('#bookDetails').on('hidden.bs.modal', function () {
        // reset form controls        
        $('.details-output').show().text('');
        $(this).find('input.author-input').remove();
        $(this).find('.remove-author-button').hide();
        $('.details-control').hide().val('');
        $('#bookDetailsForm').find('.author-input').remove();
        $('#details-modal-save-button').css('display', 'hidden');
    });
    
    $('#addBooks').on('hidden.bs.modal', function () {
        // reset form controls                
        var authorInputs = $(this).find('input.author-input');
        
        // get back to 1 author input 
        while (authorInputs.length > 1) {
            authorInputs.last().remove();
            authorInputs = $(this).find('input.author-input');
        }
        
        $(this).find('.remove-author-button').hide();
    });

    $('.btn-lg, .btn').click(function () {
        AnimateSelector($(this), 'jello');
    });

    $('#details-modal-edit-button').click(function () {
        // don't use $() 3 times to get the same element
        var addAuthorButton = $('#bookDetailsForm').find('.add-author-button');

        AnimateSelector($('#details-output'), 'slideOutUp');
        AnimateSelector($('.details-control'), 'slideInUp');
        AnimateSelector(addAuthorButton, 'slideInUp');
        AnimateSelector($('#details-modal-save-button'), 'slideInUp');

        $('.details-output').stop(true, true).fadeToggle('fast', 'swing');
        $('.details-control').stop(true, true).fadeToggle('fast', 'swing');
        $('#details-modal-save-button').fadeToggle('fast', 'swing');
        addAuthorButton.fadeToggle('fast', 'swing');
    });

    $('#filter-button').click(function () {
        $('.filter').selectpicker('deselectAll');
    });

    $('#search-button').click(function () {
        $datatable.search('').draw();
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
            function (inputValue) {
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

    $('#login-button').click(function () {        
        swal({
            title: "Login",
            text: "What's the password?",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false,      // change when done testing
            inputPlaceholder: "Password",
            allowOutsideClick: true,
            confirmButtonText: "Search",
            cancelButtonText: "Close"
        },
            function (inputValue) {
                if (inputValue === false) return false;

                else if (inputValue === "") {
                    swal.showInputError("You need to write something!");
                    return false;
                }
                else if (inputValue.toUpperCase() === "SWORDFISH") {
                    swal({
                        html: true,
                        title: "Swordfish!",
                        text: 'Here is your swordfish video.<br/><br/><iframe width="400" height="315" src="https://www.youtube.com/embed/IOxpPJYUTDM" frameborder="0" allowfullscreen></iframe>',
                        type: "success",
                    });
                }
                else {
                    event.preventDefault();                    
                    var ajaxURL = '/login';
                    var ajaxData = { password: inputValue };
                    var ajaxPost = $.post(ajaxURL, ajaxData);

                    ajaxPost.done(function (data) {
                        // refresh datatable since we'll get different results now
                        $datatable.ajax.reload().draw();

                        // confirm login
                        swal("Login successful.", "Welcome to the inner circle.", "success");

                        // change login button to logout
                        $(this).attr('url', '/login/logout');

                        // show add book button
                        $('#add-book-button').fadeIn();

                    });

                    ajaxPost.fail(function (data) {
                        // Nope
                        swal("Invalid login.", "That password did not work. How embarassing for you.", "error");
                    });
                }                
            });
    });

    $('.filter.author-list').on('changed.bs.select', function (event, clickedIndex, newValue, oldValue) {
        FilterSearchDatatable($datatable, event, 2);
    });

    $('.filter.core-value-list').on('changed.bs.select', function (event, clickedIndex, newValue, oldValue) {
        FilterSearchDatatable($datatable, event, 3);
    });

    $('.filter.status-list').on('changed.bs.select', function (event, clickedIndex, newValue, oldValue) {
        FilterSearchDatatable($datatable, event, 4);
    });

    $('.filter.current-reader-list').on('changed.bs.select', function (event, clickedIndex, newValue, oldValue) {
        FilterSearchDatatable($datatable, event, 5);
    });

    $('#addbook-modal-save-button').click(function (event) {
        // prevent form submission
        event.preventDefault();
        var $form = $('#addBooksForm');
        var ajaxURL = $form.attr('action');
        var ajaxData = $form.serializeArray();
        var ajaxPost = $.post(ajaxURL, ajaxData);

        ajaxPost.done(function (data) {
            $datatable.ajax.reload().draw();
            $('#addBooksForm').each(function () {
                this.reset();
            });

            swal("Book saved!", "Book has been added to the library.", "success");
        });

        ajaxPost.fail(function () {
            swal("Save error.", "There was an error submitting the form.", "error");
        });
    });

    $('#details-modal-save-button').click(function (event) {
        // prevent form submission
        event.preventDefault();
        var $form = $('#bookDetailsForm');
        var serializedForm = $form.serialize();
        var ajaxURL = $form.attr('action') + $('.details-book-id').val();

        var ajaxPut = $.ajax({
            url: ajaxURL,
            type: 'PUT',
            data: serializedForm,
        });

        ajaxPut.done(function (data) {
            $('.details-output').show().text('');
            $('input.details-author').remove();
            $('.details-control').hide().val('');
            $('#details-modal-save-button').hide();
            $('#addBooksForm').each(function () {
                this.reset();
            });
            swal("Book saved!", "Book information has been updated.", "success");

            // datatable was loading too fast, before PUT data was available in table
            setTimeout(function () { $datatable.ajax.reload().draw(); }, 500);

        });

        ajaxPut.fail(function (jqXHR, textStatus, errorThrown) {
            $('.details-output').show().text('');
            $('input.details-author').remove();
            $('.details-control').hide().val('');
            $('#details-modal-save-button').hide();
            $('#addBooksForm').each(function () {
                this.reset();
            });
            swal("Save error.", "There was an error submitting the form.  " + errorThrown, "error");
            console.log(jqXHR);
            console.log(textStatus);

        });
    });

    $('#details-modal-delete-button').click(function (event) {
        // prevent form submission
        event.preventDefault();
        var $form = $('#bookDetailsForm');
        var ajaxURL = $form.attr('action') + $('.details-book-id').val();

        var ajaxPut = $.ajax({
            url: ajaxURL,
            type: 'DELETE',
            contentType: "application/json; charset=utf-8",
        });

        ajaxPut.done(function (data) {
            $datatable.ajax.reload().draw();
            $('#bookDetails').modal('hide');

            swal("Book deleted!", "Book has been deleted from the system.", "success");
        });

        ajaxPut.fail(function (jqXHR, textStatus, errorThrown) {
            swal("Delete error.", "There was an error submitting the form.  " + errorThrown, "error");
            console.log(jqXHR);
            console.log(textStatus);

        });
    });

    $('.add-author-button').click(function () {
        AnimateSelector($('.add-author-button'), 'pulse');

        if ($('.author-input:visible').length <= 1) {
            $('.remove-author-button').fadeIn();
        }

        $(this).before('<input name="author" type="text" class="author-input form-control" placeholder="Author" style="margin;top: 2%; display: none;">');
        $(this).prev().css('opacity', 0)
            .slideDown('fast').animate(
            { opacity: 1 },
            { queue: false, duration: 'slow' }
            );
    });

    $('.remove-author-button').click(function () {
        var authorBoxes = $('.author-input');

        $(authorBoxes[authorBoxes.length - 1]).css('opacity', 1)
            .slideUp('fast').animate(
            { opacity: 0 },
            {
                queue: false, duration: 'fast', easing: "swing", complete: function () {
                    $(this).remove();

                    if ($('.author-input:visible').length <= 1) {
                        $('.remove-author-button').fadeOut('fast');
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
    $('#bookDetailsForm').find('.add-author-button').hide();
    $('#details-modal-save-button').hide();

    // if we don't have a cookie hide the buttons
    if (!VerifyCookie()) {
        $('#details-modal-edit-button').hide();
        $('#details-modal-delete-button').hide();
    }

    var ajaxRequest = $.ajax({
        url: "api/books/" + clickedBookId,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
            SetOutput($('.details-book-id'), clickedBookId);
            SetOutput($('.details-title'), data[0].title);
            SetOutput($('.details-status'), data[0].status);
            SetOutput($('p.details-author'), data[0].authors);
            SetOutput($('.details-reader'), data[0].currentreader);
            SetOutput($('.details-core-value'), data[0].corevalue);

            var ajaxRequest = $.ajax({
                url: "api/authors/" + clickedBookId,
                type: "GET",
                contentType: "application/json",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    var addAuthorButton = $('#bookDetailsForm').find('.add-author-button');
                    for (var i = 0; i < data.length; i++) {
                        //addAuthorButton.before('<input name="author" type="text" class="form-control details-control author-input details-author" id="details-author-input-' + i + '" placeholder="Author" style="display: none;">');
                        addAuthorButton.before('<input name="author" type="text" class="form-control details-control details-author author-input" id="details-author-input-' + i + '" placeholder="Author" style="display: none;">');
                        $('input.details-author').last().val(data[i].author);
                    }
                    $('#bookDetails').modal("show");
                },
                error: function (data, textStatus, jqXHR) {
                    console.log('error: ' + jqXHR);
                    return 'error';
                }
            });
        }
    });
}

function SetOutput($object, textValue) {
    $.each($object, function (index, item) {
        if ($(item).is('input')) {
            $(item).val(textValue || '');
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
    coreValueList = coreValueList.filter(function (itm, i, a) {
        return i == a.indexOf(itm);
    });
    statusList = statusList.filter(function (itm, i, a) {
        return i == a.indexOf(itm);
    });
    currentReaderList = currentReaderList.filter(function (itm, i, a) {
        return i == a.indexOf(itm);
    });

    coreValueList = coreValueList.filter(TrimNullAndEmpty);
    statusList = statusList.filter(TrimNullAndEmpty);
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
        for (var i = 0; i < selectionsArray.length; i++) {
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
        success: function (data, textStatus, jqXHR) {
            for (var i = 0; i < data.length; i++) {
                $('.author-list').append('<option>' + data[i].author + '</option>');
            }

            // use selectpicker a lot so after population, refresh ALL of them
            $('select').addClass('selectpicker').attr('data-selected-text-format', 'count > 1');
            $('.author-list').attr('data-selected-text-format', 'count > 2');
            $('.selectpicker').selectpicker('refresh');
            $('.filter-row').hide();
        },
        error: function (data, textStatus, jqXHR) {
            console.log('error: ' + jqXHR);
            return 'error';
        }
    });
}

function AnimateSelector($element, animationString) {
    var animationend = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

    $element.addClass('animated ' + animationString).one(animationend, function () {
        $element.removeClass('animated ' + animationString);
    });

    return $element;
}

function VerifyCookie() {
    // No cookie
    if (document.cookie === ""){
        return false;
    } 
    // Can has cookie
    else {
        return true;
    }

    return false;
}
