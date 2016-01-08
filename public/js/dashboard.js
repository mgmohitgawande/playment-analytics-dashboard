queue()
    .defer(d3.json, "/api/users")
    .defer(d3.json, "/api/tasks")
    .defer(d3.json, "/api/task_submission")
    
    .await(makeGraphs);

function makeGraphs(error, usersData, tasksData, task_submissionData) {
    
//user_id => gender association
    var userHash={};
    usersData.forEach(function(d){
        userHash[d.id]=d;
        userHash[d.id].tasks=[];
    });
    
    var tasksHash={};
    tasksData.forEach(function(d){
        tasksHash[d.id]=d;
    });
    
    task_submissionData.forEach(function(d){
        if(!tasksHash[d.task_id]){
            tasksHash[d.task_id]={id: d.task_id, user_id: d.user_id, created_at: new Date("2015-12-24 19:31:30.853+05:30"), submitted_at : d.created_at, submission_id : d.id};
            if(!userHash[d.user_id]){
                userHash[d.user_id]={id: d.user_id, gender: 'other', tasks:[]};
            }
        }
        else{
            tasksHash[d.task_id].submitted_at=new Date (d.created_at);
            tasksHash[d.task_id].submission_id=d.id;
        } 
    });
        
    for(var key in tasksHash){
        userHash[tasksHash[key].user_id].tasks.push(tasksHash[key]);
    }
    
    var finalData=[];
    for(key in userHash){
        var obj =new Object;
        obj.user_id=userHash[key].id;
        obj.gender=userHash[key].gender;
        if(userHash[key].tasks.length>0){
            userHash[key].tasks.forEach(function(t){
                obj.task_id=t.id;
                obj.created_at=t.created_at;
                obj.submission_id=t.submission_id;
                obj.submitted_at=t.submitted_at;
                finalData.push(obj);
            })
        } else{
            finalData.push(obj);
        }
    }
    
    finalData.forEach(function(d){
        d.created_at=new Date(d.created_at);
        d.submitted_at=new Date(d.submitted_at);
    });
    
    
    var data = crossfilter(finalData);
    
    var createdAt=data.dimension(function(d){return d3.time.hour(d.created_at)});
    var byCreatedAt=createdAt.group();
    
    var submittedAt=data.dimension(function(d){return d3.time.hour(d.submitted_at)});
    var bySubmittedAt=createdAt.group();
    
    var taskGender = data.dimension(function(d){ if(d.task_id) {return gender;} })
    var taskGenderGroup = taskGender.group();
    
    //for tasks
    tasksData.forEach(function(d){
        d.gender=userHash[d.user_id]? (userHash[d.user_id].gender ? userHash[d.user_id].gender : 'other')  : 'other';
        d.created_at = new Date(d.created_at);
    });
    
    //for task_submissions
    task_submissionData.forEach(function(d){
        d.gender=userHash[d.user_id]? (userHash[d.user_id].gender ? userHash[d.user_id].gender : 'other')  : 'other';
        d.created_at = new Date(d.created_at);
    });
    
    //crossfilter instance for users
	var users = crossfilter(usersData);
    
    //user => 1. define gender dimension, 2. group users based on gender
    var gender = users.dimension(function(d){ return d.gender; })
    var genderGroup = gender.group();
    //gender distribution pie chart
    var genderDistributionChart = dc.pieChart("#chart-gender")
    
    genderDistributionChart
        .height(220)
        //.width(350)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1000)
        .dimension(gender)
        .group(genderGroup)
        .label(function(d) {
            return d.key + ' (' + d.value+')';
        });
    
    //crossfilter instance for tasks
    var tasks = crossfilter(tasksData);
    
    //tasks => 1. define created_at dimension, 2. group tasks based on gender
    var taskCreated = tasks.dimension(function(d){ return d3.time.hour(d.created_at);});
    var taskByCreatedDate = taskCreated.group();
    //tasks picked vs time line chart
    var taskDateChart = dc.lineChart("#date-task-chart");
    
    //define min-max for time axis
    var task_minDate = taskCreated.bottom(1)[0].created_at;
	var task_maxDate = taskCreated.top(1)[0].created_at;
    
    taskDateChart
		//.width(600)
		.height(300)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(createdAt)
		.group(byCreatedAt)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([task_minDate, task_maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Year")
		.yAxis().ticks(6);
    
    //tasks picked => 1. define gender dimension, 2. group tasks based on gender    
    // var taskGender = tasks.dimension(function(d){ return d.gender; });
    // var taskGenderGroup = taskGender.group();
    
    //gender distribution pie chart of tasks picked
    var taskGenderDistributionChart = dc.pieChart("#date-task-gender");
    
    taskGenderDistributionChart
        .height(300)
        //.width(350)
        .radius(120)
        .innerRadius(40)
        .transitionDuration(1000)
        .dimension(taskGender)
        .group(taskGenderGroup)
        .label(function(d) {
                return d.key + ' (' + d.value+')';
        });
    
    //crossfilter instance for tasks-submission
    var submissions = crossfilter(task_submissionData);
    
    //tasks-submission => 1. define created_at dimension, 2. group tasks based on gender
    var taskSubmitted = submissions.dimension(function(d){ return d3.time.hour(d.created_at);});
    var taskBySubmittedDate = taskSubmitted.group();
    
    //tasks-submission vs time line chart
    var taskSubmittedDateChart = dc.lineChart("#date-task-sub-chart");
    
    //define min-max for time axis
    var sub_minDate = taskSubmitted.bottom(1)[0].created_at;
	var sub_maxDate = taskSubmitted.top(1)[0].created_at;
    
    taskSubmittedDateChart
		//.width(600)
		.height(300)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(submittedAt)
		.group(bySubmittedAt)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([sub_minDate, sub_maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Year")
		.yAxis().ticks(6);
    
    //tasks-submission => 1. define gender dimension, 2. group tasks based on gender      
    var submissionGender = submissions.dimension(function(d){ return d.gender; });
    var submissionGroup = submissionGender.group();
    
    //gender distribution pie chart of tasks-submission
    var submissionGenderDistributionChart = dc.pieChart("#date-task-sub-gender");
    
    submissionGenderDistributionChart
        .height(300)
        //.width(350)
        .radius(120)
        .innerRadius(40)
        .transitionDuration(1000)
        .dimension(submissionGender)
        .group(submissionGroup)
        .label(function(d) {
                return d.key + ' (' + d.value+')';
        });
    
    dc.renderAll();

};