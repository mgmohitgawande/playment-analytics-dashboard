console.log('in model');
module.exports = {
	users: playmentconnection.model('', {}, 'users'),
    tasks: playmentconnection.model('', {}, 'tasks'),
    task_submission: playmentconnection.model('', {}, 'task_submissions'),

}