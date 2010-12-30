ChunkMap=function(dbname, x, y, callback) {
  this.x=x;
  this.y=y;
  this.callback=callback;

  this.chunks=[[[],[],[]],[[],[],[]],[[],[],[]]];

  this.mapFromChunks=function()
  {
    var map=[];

    for(var y=0; y<3; y++)
    {
      var firstChunk=this.chunks[y][0];

      for(var i=0; i<firstChunk.length; i++)
      {
        var row=[];

        for(var x=0; x<3; x++)
        {
          var chunk=this.chunks[y][x];
          log('adding row:');
          log(chunk[i]);
          row=row.concat(chunk[i]);
          log('new row:');
          log(row);
        }

        map.push(row);
      }
    }

    return map;
  }

  var chunkMap=this;

  this.gotChunk=function(doc, chunk)
  {
    log('gotChunk:');
    log(doc);
    log(chunk);
    for(var y=0; y<3; y++)
    {
      for(var x=0; x<3; x++)
      {
        chunkMap.chunks[y][x]=chunk;
      }
    }

    log('chunks:');
    log(chunkMap.chunks);

    var map=chunkMap.mapFromChunks();

    log('map:');
    log(map);

    log('callback:');
    log(callback);

    if(callback)
    {
      log('calling callback');
      callback();
    }
  }

  this.loadChunk=function(dbid, docid)
  {
    var db=freefall.Database('http://freefall.blanu.net', dbid);
    var doc=db.get(docid);
    doc.setDocCallback(this.gotChunk);
    doc.get();
  }

  this.loadChunk(dbname, 'level-0_0');

  return this;
};
