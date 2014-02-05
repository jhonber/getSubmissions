var cheerio = require('cheerio'),
    fs      = require('fs'),
    getter  = require('./getter.js'),
    mkdirp  = require('mkdirp'),
    async   = require('async'),

    handle = process.argv[2],
    url  = 'http://codeforces.com/submissions/' + handle + '/page/',
    url2 = 'http://codeforces.com/data/submitSource',
    dir = 'codes',
    cont = 1,
    tot = 0,
    rep = 0,
    allp = {},
    languages = {'GNUC++':'cpp', 'GNUC':'c' ,'Java': 'java', 'Haskell':'hs', 'Pascal':'p', 'Perl':'pl', 'PHP':'php', 'Python':'py', 'Ruby':'rb', 'JavaScript':'js'} ;

    mkdirp(dir, function (err) {
      if (err) console.error(err)
    });

getter.get(url + "1", function(err, data){
  var $ = cheerio.load(data),
      pages = parseInt($('span.page-index').children('a').last().text()),
      array = [];

  if( isNaN(pages) ) pages = 1;

  for(var i = 1; i<=pages ; i++)
    array[i] = i;

  async.each(array, function(item, callback){
    getter.get(url + item, function(err, data2){
      var $    = cheerio.load(data2),
          list = $('.verdict-accepted').parent(),
          array2 = [];

      tot += list.length;
      for(var i = 0; i<list.length; i++)
        array2[i] = i;

      async.each(array2, function(item, callback){
        var subid = list[item]['attribs']['submissionid'],
            s     = $('tr[data-submission-id=' + subid + ']').text().split('\n')

        getter.post(url2, { submissionId : subid }, function(error, data3){
          var tmp         = eval( '(' + data3 + ')' ),
              contestName = tmp['contestName'].replace(/[<>/\#]/g, ""),
              source      = tmp['source'],
              lang        = s[15].replace(/\s/g, ""),
              ext         = "",
              problemName = tmp['problemName'],
              path        = dir + '/' + contestName;

              if( typeof languages[ lang ] !== 'undefined' )
                ext = '.' + languages[ lang ];

          if( !fs.exists( path ) ){
            mkdirp(path, function (err) {
              if (err) console.error(err)
              else writeFile(path, problemName, ext, source);
            });
          }
          else writeFile(path, problemName, ext, source);

        });
      });
    });
  });
});

function writeFile(path, problemName, ext, source){
  if( typeof allp[problemName] === 'undefined' ){
    fs.writeFile( path + '/' + problemName[1] + ext, source , function (err) {
      if (err) throw err;
      else allp[ problemName ] = 2;
    });
  }
  else {
    rep ++;
    fs.writeFile( path + '/' + problemName[1] + allp[ problemName ] + ext, source , function (err) {
      if (err) throw err;
      else allp[ problemName ] ++;
    });
  }

  console.log('Ok ' + cont + "/" + tot);
  cont ++;
}
