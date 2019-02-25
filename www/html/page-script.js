var identifiers = [];

function getAPI(subdomain, callback)
{
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'api/' + subdomain);
	xhr.onload = function () {
		callback(null, xhr.response);
	};
	xhr.onerror = function () {
		callback(xhr.response, null);
	};
	xhr.send();
}

function postAPI(subdomain, data, callback)
{
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/' + subdomain);
	xhr.onload = function () {
		callback(null, xhr.response);
	};
	xhr.onerror = function() {
		callback(xhr.response, null);
	};
	xhr.send(data);
}

function addTask()
{
	var data = {
		name : $('#name-input').val(),
		description : $('#description-input').val()
	};
	postAPI('addtask', JSON.stringify(data), function() {
		window.location.reload();
	});
}

function deleteTask(i)
{
	var ident = identifiers[i];
	console.log(ident);
	postAPI('deletetask', ident, function() {
		window.location.reload();
	});
}

function updateCompleted()
{
	var rows = $('#tasks-table > tbody').children();
	var checks = {};
	for (var i = 0; i < rows.length - 1; i++) {
		checks[identifiers[i]] = rows[i].children[0].children[0].checked;
	}
	//console.log(JSON.stringify(checks));
	postAPI('updatecompleted', JSON.stringify(checks), function() {
		window.location.reload();
	});
}

// Button callback
function click_addTask()
{
	addTask();
	return false;
}

// Button callback
function click_deleteTask(i)
{
	deleteTask(i);
	return false;
}

// Button callback
function click_updateCompleted()
{
	updateCompleted();
	return false;
}

function main()
{
	getAPI('tasks', function(error, data) {
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
				//html_row.append('<td>' + row.ident +'</td>');
				identifiers.push(row.ident);
				html_row.append(`<td><input type="checkbox" class="table-input" class="checkbox"
                                            ${row.completed ? 'checked' : ''}></input></td>`);
				html_row.append('<td>' + row.name +'</td>');
				html_row.append('<td>' + row.description +'</td>');
				html_row.append(`<td class="unbordered"><button id="delete-button__${ i }" 
                                             class="table-input"
                                             type="button" 
                                             onclick="click_deleteTask(${ i });">
                                 Delete</button></td>`);
			}
		}
	});
}

main();
