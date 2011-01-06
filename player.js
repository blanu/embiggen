function getPlayer(name)
{
  log('getting player '+name);
  var base='http://freefall.blanu.net';
  var emdb=freefall.Database(base, 'embiggen');
  var playerDoc=emdb.get(name);
  doc.setDocCallback(gotPlayer);
  doc.get();
}
