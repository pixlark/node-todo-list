function requestFromAPI(method, subdomain, callback)
{
	var xhr = new XMLHttpRequest();
	xhr.open(method, 'api/' + subdomain);
	xhr.onload = function () {
		callback(null, xhr.response);
	};
	xhr.onerror = function () {
		callback(xhr.response, null);
	};
	xhr.send();
}

function main()
{
	requestFromAPI('GET', 'tasks', function(error, data) {
		if (error) {
			console.log(error);
			$('#tasks-table').append('Failed to load tasks from server');
		} else {
			var rows = JSON.parse(data);
			for (var i = 0; i < rows.length; i++) {
				$('#tasks-table > tbody')
					.children()
					.last()
					.before('<tr></tr>');
				var html_row = $('#tasks-table > tbody')
					.children()
					.last()
					.prev();
				var row = rows[i];
				html_row.append('<td>' + row.ident +'</td>');
				html_row.append('<td>' + row.completed +'</td>');
				html_row.append('<td>' + row.name +'</td>');
				html_row.append('<td>' + row.description +'</td>');
			}
		}
	});
}

main()
