const Http = require('http');
const { Client } = require('pg');

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
	const tasks = (await db_connection.query('SELECT * from tasks;')).rows;
	//await db_connection.end();
	response.writeHead(200, { 'Content-Type' : 'text/json' });
	response.write(JSON.stringify(tasks));
	response.end();
}

function serverFunc(request, response)
{	
	console.log('Got request...');

	if (request.url === '/tasks') {
		// Return JSON of the tasks from the database
		if (request.method === 'GET') {
			respondWithTasksFromDB(response);
		} else {
			respondOnlyHTML(response, '<h1>Unsupported request method</h1>');
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
