importScripts('http://beta.freefalldb.com/scripts/freefall.js');

gotView=function(view, data)
{
  postMessage({'baseUrl': view.db.base, 'dbname': view.db.dbid, 'viewname': view.viewid, 'viewkey': view.viewkey, 'results': data.results});
  close();
}

loadView=function(base, dbid, viewid, key)
{
  var db=freefall.Database(base, dbid);
  var doc=db.getView(viewid, key);
  view.setViewCallback(gotView);
  view.get();
}

onmessage=function(e)
{
  var data=e.data;

  loadView(data['baseUrl'], data['dbname'], data['viewname'], data['key']);
}