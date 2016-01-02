var Playment = require('./models/playmentDB');

module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes	
	// sample api route
 app.get('/api/users', function(req, res){
     Playment.users.find({}, function(err, data){
         if (err) 
            res.send(err);
            
         res.json(data);
     });
 });
 
 app.get('/api/tasks', function(req, res){
     Playment.tasks.find({}, function(err, data){
         if (err) 
            res.send(err);
            
         res.json(data);
     });
 });
 
 app.get('/api/task_submission', function(req, res){
     Playment.task_submission.find({}, function(err, data){
         if (err) 
            res.send(err);
            
         res.json(data);
     });
 });

 



 // frontend routes =========================================================
 app.get('*', function(req, res) {
  res.sendfile('./public/dash.html');
 });
}