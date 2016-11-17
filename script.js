$(document).ready( function () {    
    function UpdateAuthorListBox() {        
        $.getJSON("Library.json", function(json) {         
            var data = json.data;
            var authorList = [];

            for(var i=0; i < data.length; i++) {                
                if (Array.isArray(data[i].Authors)) {
                    for (var j=0; j < data[i].Authors.length; j++) {
                        authorList.push(data[i].Authors[j].toString());
                    }
                }
                else {
                    authorList.push(data[i].Authors.toString());
                }
            }
           
           // remove duplicates
           var uniqueAuthors = authorList.filter(function(itm,i,a){
               return i==a.indexOf(itm);
            });
            
            uniqueAuthors.sort();

            // Append all unique authors from our list to the selectlist
           for (i = 0; i < uniqueAuthors.length; i++) {
                $('.select-list').append('<option>' + uniqueAuthors[i].toString() + '</option>');
            } 
        });
    };    

    // Initialize the datatable
    $('#datatable').DataTable( {
            "processing": true,
            "ajax": "./Library.json",
            "columns": [                 
                { "data": "Title" },
                { "data": "Authors" },
                { "data": "Core Value" },
                { "data": "Status" },
                { "data": "Current Reader"}
            ],
			"paging": false,
			"searching": true                        
		});
    
    // Update the listbox on the form for author filtering
    UpdateAuthorListBox();

    // when selectlist value is changed, filter the datatable
    $('.select-list').change(function() {
        var datatable = $('#datatable').DataTable();
        var selectedValue = $('.select-list option:selected').text();

        // filter the table with the selected value
        datatable.search(selectedValue).draw();        
    });
} );

