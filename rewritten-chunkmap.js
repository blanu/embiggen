ChunkMap=function(dbname, x, y, callback, handleObj)
{
  var chunkMap=this;

  this.x=x;
  this.y=y;
  this.dbname=dbname;
  this.callback=callback;
  this.handleObjCallback=handleObj;

  this.max=3*16;

  this.objects=getBlankGrid(max);

  this.cache={};
  this.cache['0_0']=[{"objectId":"warp","chunkX":0,"chunkY":0,"tileX":0,"tileY":0,"tile":106}];

  this.objectList=[];

  this.diff=function(a, b)
  {
    var uniqA=a.filter(function(x) {return b.indexOf(x)<0});
    var uniqB=b.filter(function(x) {return a.indexOf(x)<0});

    return [uniqA, uniqB];
  }

  this.get=function(x, y)
  {
    return this.objects[y][x];
  }

  this.put=function(x, y, val)
  {
    chunkMap.objects[y][x]=val;
    chunkMap.handleObjCallback(chunkMap.objects);
  }

  this.mapFromChunks=function()
  {
    return getBlankGrid(max);
  }

  this.initMap=function()
  {
    var objects=getBlankGrid(max);

    for(var y=0; y<max; y++)
    {
      for(var x=0; x<max; x++)
      {
        if(Math.floor(Math.random()*2)==1)
        {
          objects[y][x]=106;
        }
        else
        {
          objects[y][x]=-1;
        }
      }
    }

    this.objects=objects;

    return objects;
  }

  this.move=function(offsetX, offsetY)
  {
    if(this.callback!=null)
    {
      this.callback();
    }
  }

  this.load=function()
  {
    this.loadObjects('test', 0, 0);
    this.startAnimation();
  }

  this.loadObjects=function(name, x, y)
  {
  }

  this.startAnimation=function()
  {
    chunkAnimate();
//    setInterval("chunkAnimate()", 10*1000);
//    setInterval("chunkAnimate()", 1*1000);
    setInterval("chunkAnimate()", 0.1*1000);
  }

  this.mapToGrid=function()
  {
    var grid=getBlankGrid(max);

    for(var y=0; y<max; y++)
    {
      for(var x=0; x<max; x++)
      {
        var obj=this.objects[y][x];
        if(obj==106)
        {
          grid[y][x]=1;
        }
      }
    }

//    log('map to grid:');
//    log(grid.map(function(a){return'['+a.join(',')+']'}).join(','));

    return grid;
  }

  this.gridToMap=function(grid)
  {
    for(var y=0; y<max; y++)
    {
      for(var x=0; x<max; x++)
      {
        if(grid[y][x]==1)
        {
          this.objects[y][x]=106;
        }
        else
        {
          this.objects[y][x]=-1;
        }
      }
    }

//    log('grid to map:');
//    log(grid.map(function(a){return'['+a.join(',')+']'}).join(','));

//    log("Objects:");
//    log(this.objects);
  }

  this.animate=function()
  {
    log("animating...");

    var grid=this.mapToGrid();
    grid=iterate(grid, gameOfLife);
    this.gridToMap(grid);

    chunkMap.handleObjCallback(chunkMap.objects);

    log("animated");
  }

  this.initMap();
  this.callback();

  return this;
};
