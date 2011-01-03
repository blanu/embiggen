ChunkMap=function(dbname, x, y, callback) {
  this.x=x;
  this.y=y;
  this.dbname=dbname;
  this.callback=callback;

  this.max=0;

  this.cache={};

  this.default=[
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ];

  this.chunks=[
    [this.default, this.default, this.default],
    [this.default, this.default, this.default],
    [this.default, this.default, this.default]
  ];

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
          row=row.concat(chunk[i]);
        }

        map.push(row);
      }
    }

    return map;
  }

  this.move=function(offsetX, offsetY)
  {
//    log('move('+offsetX+','+offsetY+')')

    this.x=this.x+offsetX;
    this.y=this.y+offsetY;

    if(this.max>0)
    {
      if(this.x<0)
      {
        this.x=this.max-1;
      }
      if(this.x>(this.max-1))
      {
        this.x=0;
      }

      if(this.y<0)
      {
        this.y=this.max-1;
      }
      if(this.y>(this.max-1))
      {
        this.y=0;
      }
    }

    if(offsetX!=0)
    {
      if(offsetX==1)
      {
        for(var y=0; y<3; y++)
        {
          this.chunks[y][0]=this.chunks[y][1];
          this.chunks[y][1]=this.chunks[y][2];
          this.chunks[y][2]=this.default;
        }

        this.loadChunk(this.dbname, this.x+1, this.y);
        this.loadChunk(this.dbname, this.x+1, this.y+1);
        this.loadChunk(this.dbname, this.x+1, this.y-1);
      }
      else
      {
        for(var y=0; y<3; y++)
        {
          this.chunks[y][2]=this.chunks[y][1];
          this.chunks[y][1]=this.chunks[y][0];
          this.chunks[y][0]=this.default;
        }

        this.loadChunk(this.dbname, this.x-1, this.y);
        this.loadChunk(this.dbname, this.x-1, this.y+1);
        this.loadChunk(this.dbname, this.x-1, this.y-1);
      }
    }

    if(offsetY!=0)
    {
      if(offsetY==1)
      {
        this.chunks[0]=this.chunks[1]
        this.chunks[1]=this.chunks[2]
        this.chunks[2]=[this.default, this.default, this.default];

        this.loadChunk(this.dbname, this.x, this.y+1);
        this.loadChunk(this.dbname, this.x+1, this.y+1);
        this.loadChunk(this.dbname, this.x-1, this.y+1);
      }
      else
      {
        this.chunks[2]=this.chunks[1]
        this.chunks[1]=this.chunks[0]
        this.chunks[0]=[this.default, this.default, this.default];

        this.loadChunk(this.dbname, this.x, this.y-1);
        this.loadChunk(this.dbname, this.x+1, this.y-1);
        this.loadChunk(this.dbname, this.x-1, this.y-1);
      }
    }

    if(this.callback!=null)
    {
      this.callback();
    }
  }

  var chunkMap=this;

  this.gotChunk=function(docname, chunk)
  {
//    log('gotChunk: '+docname);

    this.cache[docname]=chunk;

    var parts=docname.split('-');
    var coords=parts[1].split('_');
    var chunkX=parseFloat(coords[0]);
    var chunkY=parseFloat(coords[1]);

    this.cache[docname]=chunk;

    if(this.max>0)
    {
      if(chunkMap.x==0)
      {
        if(chunkX==(this.max-1))
        {
          chunkX=-1
        }
      }

      if(chunkMap.x==(this.max-1))
      {
        if(chunkX==0)
        {
          chunkX=this.max
        }
      }

      if(chunkMap.y==0)
      {
        if(chunkY==(this.max-1))
        {
          chunkY=-1
        }
      }

      if(chunkMap.y==(this.max-1))
      {
        if(chunkY==0)
        {
          chunkY=this.max
        }
      }
    }

    var localX=chunkX-this.x+1;
    var localY=chunkY-this.y+1;

    if(localX>=0 && localX<=2 && localY>=0 && localY<=2)
    {
//      log('Saving chunk ('+chunkX+','+chunkY+') as ('+localX+','+localY+')');
      chunkMap.chunks[localY][localX]=chunk;
    }
    else
    {
      log('Chunk not local '+chunkX+' '+chunkY+' '+localX+' '+localY);
    }

    var map=chunkMap.mapFromChunks();

    if(callback)
    {
      callback();
    }
  }

  this.gotConfig=function(data) {
    chunkMap.max=data['size'];
  }

  this.configCallback=function(e)
  {
    var args=e.data;
    var docname=args['docname'];
    var data=args['data'];

    chunkMap.gotConfig(data);
  }

  this.loadConfig=function(dbid)
  {
    var docid='config';

    if(docid in this.cache)
    {
      this.gotConfig(this.cache[docid]);
    }
    else
    {
      loader=new Worker('chunkLoader.js');
      loader.onmessage=this.configCallback;
      loader.onerror=function(e) {
        log('Error in web worker:');
        log(e);

        loader.terminate();
      };

      loader.postMessage({'baseUrl': 'http://freefall.blanu.net', 'dbname': dbid, 'docname': docid});
    }
  }

  this.loadChunk=function(dbid, x, y)
  {
//    log('this.loadChunk '+dbid+' '+x+' '+y+' '+this.max);
    if(this.max>0)
    {
      if(x<0)
      {
        x=x+this.max;
      }
      if(x>(this.max-1))
      {
        x=x-this.max;
      }

      if(y<0)
      {
        y=y+this.max;
      }
      if(y>(this.max-1))
      {
        y=y-this.max;
      }
    }

    var docid='level-'+x+'_'+y;

    if(docid in this.cache)
    {
//      log('Already in cache '+docid);
      this.gotChunk(docid, this.cache[docid]);
    }
    else
    {
      loader=new Worker('chunkLoader.js');
      loader.onmessage=this.loaderCallback;
      loader.onerror=function(e) {
        log('Error in web worker:');
        log(e);

        loader.terminate();
      };

      loader.postMessage({'baseUrl': 'http://freefall.blanu.net', 'dbname': dbid, 'docname': docid});
    }
  }

  this.loaderCallback=function(e)
  {
    var args=e.data;
    var docname=args['docname'];
    var data=args['data'];

    chunkMap.gotChunk(docname, data);
  }

  this.loadConfig(this.dbname);

  this.loadChunk(this.dbname, this.x, this.y);
  this.loadChunk(this.dbname, this.x, this.y+1);
  this.loadChunk(this.dbname, this.x, this.y-1);
  this.loadChunk(this.dbname, this.x+1, this.y);
  this.loadChunk(this.dbname, this.x+1, this.y+1);
  this.loadChunk(this.dbname, this.x+1, this.y-1);
  this.loadChunk(this.dbname, this.x-1, this.y);
  this.loadChunk(this.dbname, this.x-1, this.y+1);
  this.loadChunk(this.dbname, this.x-1, this.y-1);

  return this;
};
