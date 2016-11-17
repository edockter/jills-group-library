$(document).ready( function () {
    // var dataSet = [[ "Delivering Happiness: A Path to Profits, Passion and Purpose","Tony Hsieh","Other Development","Available","" ],
    //               [ "Encouraging The Heart: A Leader's guide to Rewarding and Recognizing Others", ", ", "Leadership", "Available","" ]];
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
           
           for (i = 0; i < authorList.length; i++) {
            $('.select-list').append('<option>' + authorList[i].toString() + '</option>');
            } 
        });
        };    

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

    UpdateAuthorListBox();
    
} );