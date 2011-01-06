ChunkMap=function(dbname, x, y, callback, addObj, delObj) {
  this.x=x;
  this.y=y;
  this.dbname=dbname;
  this.callback=callback;
  this.addObjCallback=addObj;
  this.delObjCallback=delObj;

  this.max=0;

  this.cache={};

  this.defaultChunk=[
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
    [this.defaultChunk, this.defaultChunk, this.defaultChunk],
    [this.defaultChunk, this.defaultChunk, this.defaultChunk],
    [this.defaultChunk, this.defaultChunk, this.defaultChunk]
  ];

  this.chunksLoaded=0;

  this.objectList=[];
  this.objects=[
    [[], [], []],
    [[], [], []],
    [[], [], []]
  ];

  this.diff=function(a, b)
  {
    var uniqA=a.filter(function(x) {return b.indexOf(x)<0});
    var uniqB=b.filter(function(x) {return a.indexOf(x)<0});

    return [uniqA, uniqB];
  }

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

  this.objectsFromChunks=function()
  {
    var results=[];

    for(var y=0; y<3; y++)
    {
      for(var x=0; x<3; x++)
      {
        for(var i=0; i<this.objects[y][x].length; i++)
        {
          results.push(this.objects[y][x][i]);
        }
      }
    }

    return results;
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
          this.chunks[y][2]=this.defaultChunk;

          this.objects[y][0]=this.objects[y][1];
          this.objects[y][1]=this.objects[y][2];
          this.objects[y][2]=[];
          this.sendObjectChanges();
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
          this.chunks[y][0]=this.defaultChunk;

          this.objects[y][2]=this.objects[y][1];
          this.objects[y][1]=this.objects[y][0];
          this.objects[y][0]=[];
          this.sendObjectChanges();
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
        this.chunks[2]=[this.defaultChunk, this.defaultChunk, this.defaultChunk];

        this.objects[0]=this.objects[1]
        this.objects[1]=this.objects[2]
        this.objects[2]=[[], [], []];
        this.sendObjectChanges();

        this.loadChunk(this.dbname, this.x, this.y+1);
        this.loadChunk(this.dbname, this.x+1, this.y+1);
        this.loadChunk(this.dbname, this.x-1, this.y+1);
      }
      else
      {
        this.chunks[2]=this.chunks[1]
        this.chunks[1]=this.chunks[0]
        this.chunks[0]=[this.defaultChunk, this.defaultChunk, this.defaultChunk];

        this.objects[2]=this.objects[1]
        this.objects[1]=this.objects[0]
        this.objects[0]=[[], [], []];
        this.sendObjectChanges();

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

//    if(docid in this.cache)
    if(this.cache.hasOwnProperty(docid))
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

  this.gotObjects=function(docname, objects)
  {
//    log('gotObjects:');
//    log(docname);
//    log(objects);

//    log('storing '+docname+' in cache');
//    log(this.cache);
    this.cache[docname]=objects;
//    log(this.cache);

    if(objects.length>0)
    {
      var firstObject=objects[0];
      chunkX=firstObject['chunkX']
      chunkY=firstObject['chunkY']

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
        log('Saving objects ('+chunkX+','+chunkY+') as ('+localX+','+localY+')');
        chunkMap.objects[localY][localX]=objects;
      }
      else
      {
        log('Chunk not local '+chunkX+' '+chunkY+' '+localX+' '+localY);
      }
    }

    this.sendObjectChanges();
  }

  this.sendObjectChanges=function()
  {
//    log('sendObjectChanges');
    var oldList=chunkMap.objectList;
    chunkMap.objectList=chunkMap.objectsFromChunks();

//    log('comparing lists:');
//    log(oldList);
//    log(chunkMap.objectList);

    var diffs=chunkMap.diff(chunkMap.objectList, oldList);
    var adds=diffs[0];
    var dels=diffs[1];

//    log('diffs:');
//    log(diffs);

    if(dels.length>0 && chunkMap.delObjCallback!=null)
    {
      chunkMap.delObjCallback(dels);
      gbox.purgeGarbage()
    }

    if(adds.length>0 && chunkMap.addObjCallback!=null)
    {
      chunkMap.addObjCallback(adds);
    }
  }

  this.objectsLoaderCallback=function(e)
  {
    log('loader callback:');
    log(e.data);
    var args=e.data;

    if(args!=null)
    {
      var docname=args['viewkey'];
      var data=args['results'];

      if(data!=null)
      {
        chunkMap.gotObjects(docname, data);
      }
    }
  }

  this.loadObjects=function(dbid, x, y)
  {
    // No need to translate x and y for wrapping as long as loadObjects is only called at the end of loadChunk, after translation has been done

    var viewid='objectsByChunk';
    var key=x+'_'+y;

    if(this.cache.hasOwnProperty(key))
    {
      this.gotObjects(key, this.cache[key]);
    }
    else
    {
      log('not in cache: '+key);
      log(key);
      log(this.cache);

      loader=new Worker('viewLoader.js');
      loader.onmessage=this.objectsLoaderCallback;
      loader.onerror=function(e) {
        log('Error in web worker:');
        log(e);

        loader.terminate();
      };

      loader.postMessage({'baseUrl': 'http://freefall.blanu.net', 'dbname': dbid, 'viewname': viewid, 'key': key});
    }
  }

  this.gotChunk=function(docname, chunk)
  {
//    log('gotChunk: '+docname);

    this.cache[docname]=chunk;

    this.chunksLoaded=this.chunksLoaded+1;

    var parts=docname.split('-');
    var coords=parts[1].split('_');
    var chunkX=parseFloat(coords[0]);
    var chunkY=parseFloat(coords[1]);

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

    if(callback!=null && this.chunksLoaded%3==0) // Don't redraw map on every chunk loaded, as it slows down boundary crossings
    {
      callback();
    }
  }

  this.loaderCallback=function(e)
  {
    var args=e.data;
    var docname=args['docname'];
    var data=args['data'];

    chunkMap.gotChunk(docname, data);
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
    var viewid=x+'_'+y;

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

    this.loadObjects(dbid, x, y);
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
