queue()
    .defer(d3.json, "/api/users")
    .defer(d3.json, "/api/tasks")
    .defer(d3.json, "/api/task_submission")
    
    .await(makeGraphs);

function makeGraphs(error, usersData, tasksData, task_submissionData) {
    
//user_id => gender association
    var genderHash={};
    usersData.forEach(function(d){
        genderHash[d.id]=d.gender;
    });

//Transformation of date and binding to gender
    var dateFrmt=d3.time.format("%Y-%m-%d %H:%M:%S.%L%Z");
    
    //for tasks
    tasksData.forEach(function(d){
        d.gender=genderHash[d.user_id];
        if(d.gender==undefined)   console.log(d);
        d.created_at=d.created_at.substring(0, d.created_at.length-3)+d.created_at.substring(d.created_at.length-2, d.created_at.length)
        
        var abc = dateFrmt.parse(d.created_at);
        if(abc){
            d.created_at=abc;
        }
        else{
            var dateFrmt1 = d3.time.format("%Y-%m-%d %H:%M:%S%Z");
            abc = dateFrmt1.parse(d.created_at);
        }
        
        if(abc){
            d.created_at=abc;
        }
        else{
            console.log(d.created_at);
        }
    });
    
    //for task_submissions
    task_submissionData.forEach(function(d){
        d.gender=genderHash[d.user_id];
        d.created_at=d.created_at.substring(0, d.created_at.length-3)+d.created_at.substring(d.created_at.length-2, d.created_at.length)
        
        var abc = dateFrmt.parse(d.created_at);
        if(abc){
            d.created_at=abc;
        }
        else{
            console.log(d.created_at);
            var dateFrmt1 = d3.time.format("%Y-%m-%d %H:%M:%S%Z");
            abc = dateFrmt1.parse(d.created_at);
        }
        
        if(abc){
            d.created_at=abc;
        }
        else{
            console.log(d.created_at);
        }
    })
    
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
    var taskCreated = tasks.dimension(function(d){ return d.created_at;});
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
		.dimension(taskCreated)
		.group(taskByCreatedDate)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([task_minDate, task_maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Year")
		.yAxis().ticks(6);
    
    //tasks picked => 1. define gender dimension, 2. group tasks based on gender    
    var taskGender = tasks.dimension(function(d){ return d.gender; });
    var taskGenderGroup = taskGender.group();
    
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
    var taskSubmitted = submissions.dimension(function(d){ return d.created_at;});
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
		.dimension(taskSubmitted)
		.group(taskBySubmittedDate)
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