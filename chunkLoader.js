importScripts('http://beta.freefalldb.com/scripts/freefall.js');

gotChunk=function(doc, chunk)
{
//  postMessage('gotChunk');
  postMessage({'baseUrl': doc.db.base, 'dbname': doc.db.dbid, 'docname': doc.docid, 'data': chunk});
  close();
}

loadChunk=function(base, dbid, docid)
{
//  postMessage('loadChunk '+base+' '+dbid+' '+docid);
  var db=freefall.Database(base, dbid);
  var doc=db.get(docid);
  doc.setDocCallback(gotChunk);
//  postMessage('getting');
  doc.get();
}

onmessage=function(e)
{
  var data=e.data;

//  postMessage('worker got message');
  loadChunk(data['baseUrl'], data['dbname'], data['docname']);
}