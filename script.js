console.log('Manipulating data, this time with nest')

d3.csv('./data/hubway_trips_reduced.csv',parse,dataLoaded);

function dataLoaded(err,rows){

    //Step 1: start with the basics: nest, or group, trips with the same starting stations
    //Using d3.nest()...entries()
    var step1 = d3.nest()
        .key(function(d){return d.startStation;})
        .entries(rows);
    console.log('Step 1: ');
    console.log(step1);

    //Step 2: do the same as above, but instead of .entries(), use .map()
    //How does this compare?

    var step2 = d3.nest()
        .key(function(d){return d.startStation;})
        .map(rows,d3.map);
    console.log('Step 2: ');
    console.log(step2);

    //Step 3: simple two level nest
    //Nest trips with the same starting stations
    //Under each station, further nest trips into two groups: those by registered vs. casual users
    //Hint: casual users are those with no birth date, gender, or zip code information
    var step3 = d3.nest()
        .key(function(d){return d.startStation;})
        .key(function(d){return d.type;})
        .entries(rows);
    console.log('Step 3: ');
    console.log(step3);


    //Step 4: simple two level nest
    //Same as above, but instead of returning nested trips as sub-arrays, return two numbers:
    //total count of registered trips, vs. casual trips

    var step4 = d3.nest()
        .key(function(d){return d.startStation;})
        .key(function(d){return d.type;})
        .rollup(function(sum){return sum.length;})
        .entries(rows);
    console.log('Step 4: ');
    console.log(step4);

    //Step 5: group trips with the same starting stations, BUT only for 2012
    //Do this without crossfilter
    //Hint: first you have to use array.filter() to reduce all trips to a smaller subset
    //Then you nest the smaller array
    var filterData = rows.filter(function(d){return d.startTime.getFullYear()==2012;});
    var step5 = d3.nest()
        .key(function(d){return d.startStation;})
        .entries(filterData);
    console.log('Step 5: ');
    console.log(step5);


    //Step 6: do the same, but with crossfilter
    //How does this compare to step 5?
    var trips = crossfilter(rows);

    var tripsByTime = trips.dimension(function(row){return row.startTime;});

    var tripsBySStation = trips.dimension(function(row){return row.startStation;});

    var stationGroup = tripsBySStation.group(function(d){return d;});

    tripsByTime.filter([new Date(2012,0,1,0,0,0),new Date(2012,11,31,11,59,59)]);//(2012,0,1),(2012,11,31)

    console.log('Step 6: ');
    console.log(stationGroup.all());






}

function parse(d){
    if(+d.duration<0) return;

    return {
        duration: +d.duration,
        startTime: parseDate(d.start_date),
        endTime: parseDate(d.end_date),
        startStation: d.strt_statn,
        endStation: d.end_statn,
        userAge: d.birth_date?parseDate(d.start_date).getFullYear()- (+d.birth_date):0,
        gender:d.gender? d.gender:"Unknown",
        type: d.subsc_type
    }
}

function parseDate(date){
    var day = date.split(' ')[0].split('/'),
        time = date.split(' ')[1].split(':');

    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
}

