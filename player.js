function getPlayer(name)
{
  log('getting player '+name);
  var base='http://freefall.blanu.net';
  var emdb=freefall.Database(base, 'embiggen');
  playerDoc=emdb.get(name);
  playerDoc.setDocCallback(gotPlayer);
  playerDoc.get();
}
