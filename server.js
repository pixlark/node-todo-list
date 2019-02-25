const Http = require('http');
const { Client } = require('pg');
const generateUuid = require('uuid');

const db_connection = new Client({
	user: 'pixlark',
	host: '127.0.0.1',
	database: 'todolist',
	port: 5432,
})

function respondOnlyHTML(response, code, html)
{
	response.writeHead(code, { 'Content-Type' : 'text/html' });
	response.write(html);
	response.end();
}

async function respondWithTasksFromDB(response)
{
	//await db_connection.connect();
	var tasks = (await db_connection.query('SELECT * from tasks;')).rows;
	//await db_connection.end();
	response.writeHead(200, { 'Content-Type' : 'text/json' });
	response.write(JSON.stringify(tasks));
	response.end();
}

async function addTaskToTable(task)
{
	var fmt = 'insert into tasks(ident, completed, name, description) values ($1, $2, $3, $4);';
	var values = [task.ident, task.completed, task.name, task.description];
	await db_connection.query(fmt, values);
}

function addTaskFromPost(request, response)
{
	request.on('data', function(data) {
		var task = JSON.parse(data);
		task.ident = generateUuid();
		task.completed = false;
		addTaskToTable(task);
		response.writeHead(201);
		response.end();
	});
}

async function deleteTaskFromTable(ident)
{
	var fmt = 'delete from tasks where tasks.ident = $1;';
	var values = [ident];
	await db_connection.query(fmt, values);
}

function deleteTaskFromPost(request, response)
{
	request.on('data', function(data) {
		var ident = String(data);
		deleteTaskFromTable(ident);
		response.writeHead(201);
		response.end();
	});
}

function serverFunc(request, response)
{
	function unsupportedRequest() {
		respondOnlyHTML(response, 400, '<h1>Unsupported request method</h1>');
	}
	
	console.log('Got request...');

	if (request.url === '/tasks') {
		// Return JSON of the tasks from the database
		if (request.method === 'GET') {
			respondWithTasksFromDB(response);
		} else {
			unsupportedRequest();
		}
	} else if (request.url === '/addtask') {
		// Add task from request data
		if (request.method === 'POST') {
			addTaskFromPost(request, response);
		} else {
			unsupportedRequest();
		}
	} else if (request.url === '/deletetask') {
		// Delete task via UUID
		if (request.method === 'POST') {
			deleteTaskFromPost(request, response);
		} else {
			unsupportedRequest();
		}
	} else {
		console.log('404\'d');
		respondOnlyHTML(response, 404, '<h1>Error 404: Page not found</h1>');
	}
}

async function main()
{
	await db_connection.connect();
	const server = Http.createServer(serverFunc);
	server.listen(3000);
	console.log('Server running on 127.0.0.1:3000');
}

main();
