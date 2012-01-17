var maingame;
var chunkmap;
var mapdata;
var map=null;
var orientation=false;
var tilePixels=16;
var worldTiles=16*3;
var worldPixels=worldTiles*tilePixels;
var center=Math.floor(worldPixels/2);
var lowEdge=0;
var highEdge=worldPixels-tilePixels;
var jumpDistance=tilePixels*2;
var triggered=false;
var playerDoc=null;
var playerData=null;
var mapObjects=null;
var mapIds=null;
var nextId=0;
var mana=0;
var health=100;

triggers={
	  teleport: function(args) {
    var world=args.world;
    log('teleporting to '+world);
    playerData.world=world;
    playerDoc.save(playerData);
    maingame.gotoLevel(world);
  }
};

function triggerAction(action, args)
{
  triggered=true;
  if(triggers.hasOwnProperty(action))
  {
    var f=triggers[action];
    f(args);
  }
  else
  {
    log('Unknown action '+action);
  }
}

function addAssets()
{
  gbox.addImage('font', 'resources/embiggen/font.png');
  gbox.addImage('logo', 'resources/embiggen/logo.png');
  gbox.addFont({ id: 'small', image: 'font', firstletter: ' ', tileh: 8, tilew: 8, tilerow: 255, gapx: 0, gapy: 0 });

  gbox.addImage('charSprite', 'resources/embiggen/oryx_lofi/lofi_char_16.png');
  gbox.addTiles({
    id:      'charTiles',
    image:   'charSprite',
    tileh:   16,
    tilew:   16,
    tilerow: 16,
    gapx:    0,
    gapy:    0
  });

  gbox.addImage('terrainSprite', 'resources/embiggen/terrain.png');
  gbox.addTiles({
    id:      'terrainTiles',
    image:   'terrainSprite',
    tileh:   16,
    tilew:   16,
    tilerow: 16,
    gapx:    0,
    gapy:    0
  });

  gbox.addImage('objectSprite', 'resources/embiggen/oryx_lofi/lofi_obj_16.png');
  gbox.addTiles({
    id:      'objectTiles',
    image:   'objectSprite',
    tileh:   16,
    tilew:   16,
    tilerow: 16,
    gapx:    0,
    gapy:    0
  });
}

function moveObjects(offsetX, offsetY)
{
  var objs=chunkmap.objectsFromChunks();
  log('moving:');
//  log(objs);
  for(var i=0; i<objs.length; i++)
  {
    var obj=objs[i];
    var id=obj.objectId;

    var o=gbox.getObject('objects', id);
    o.x=o.x-(offsetX*256);
    o.y=o.y-(offsetY*256);
  }
}

function addPlayer() {
  var tile=playerData.tile;
  var x=playerData.x*16;
  var y=playerData.y*16;

  gbox.addObject({
    id: 'player',
    group: 'chars',
    tileset: 'charTiles',
    colh:gbox.getTiles('charTiles').tileh,
    x: x,
    y: y,

    initialize: function()
    {
      toys.topview.initialize(this, {
        haspushing: false,
        frames:{
          standup:{ speed:1, frames:[1] },
          standdown:{ speed:1, frames:[1] },
          standleft:{ speed:1, frames:[1] },
          standright:{ speed:1, frames:[1] },
          movingup:{speed:3,frames:[1] },
          movingdown:{speed:3,frames:[1] },
          movingleft:{speed:3,frames:[1] },
          movingright:{speed:3,frames:[1] },
        }
      });

      this.frame=tile;

      this.x = x;
      this.y = y;
    },

    first: function()
    {
      toys.topview.controlKeys(this, { left: 'left', right: 'right', up: 'up', down: 'down' });
      toys.topview.handleAccellerations(this);
      toys.topview.applyForces(this);
      toys.topview.tileCollision(this, map, 'map', null, { tolerance: 6, approximation: 3 });

      if(this.accx>0)
      {
        orientation=false;
      }
      else if(this.accx<0)
      {
        orientation=true;
      }
      // else, leave it as it is

//      var offsetX=0;
//      var offsetY=0;

      if(this.x<lowEdge)
      {
        this.x=lowEdge;
      }
      else if(this.x>highEdge)
      {
        this.x=highEdge;
      }

      if(this.y<lowEdge)
      {
        this.y=lowEdge;
      }
      else if(this.y>highEdge)
      {
        this.y=highEdge;
      }

      /*
      if(offsetX!=0 || offsetY!=0)
      {
        moveObjects(offsetX, offsetY);
        chunkmap.move(offsetX, offsetY);
      }
      */

      if(gbox.keyIsHit('a'))
      {
        this.action();
      }
    },

    action: function()
    {
      log('action!');
      var tileX=Math.floor(this.x/16);
      var tileY=Math.floor(this.y/16);      
      log('tile coords: '+tileX+' '+tileY);
   
      var tileState=chunkmap.get(tileX, tileY);
      log('tileState: '+tileState);
      if(tileState==-1)
      {
        chunkmap.put(tileX, tileY, 106);
      }
      else
      {
        chunkmap.put(tileX, tileY, -1);
      }
    },

    blit: function()
    {
      gbox.blitTile(gbox.getBufferContext(), {
        tileset: this.tileset,
        tile:    this.frame,
        dx:      this.x,
        dy:      this.y,
        fliph:   orientation,
        flipv:   this.flipv,
        camera:  this.camera,
        alpha:   1.0
      });
    },
  });
}

function gotPlayer(data)
{
  log('got player: '+data);
  log(data);
  playerData=data;

  gbox.go();
}

function followCamera(obj, viewdata)
{
  xbuf = 96;
  ybuf = 96;
  xcam = gbox.getCamera().x;
  ycam = gbox.getCamera().y;
  if ((obj.x - xcam) > (gbox._screenw - xbuf)) gbox.setCameraX( xcam + (obj.x - xcam)-(gbox._screenw - xbuf),viewdata);
  if ((obj.x - xcam) < (xbuf)) gbox.setCameraX(xcam + (obj.x - xcam) - (xbuf),viewdata);
  if ((obj.y - ycam) > (gbox._screenh - ybuf)) gbox.setCameraY( ycam + (obj.y - ycam)-(gbox._screenh - ybuf),viewdata);
  if ((obj.y - ycam) < (ybuf)) gbox.setCameraY(ycam + (obj.y - ycam) - (ybuf),viewdata);
}

function chunkAnimate()
{
  log('chunkAnimate');
  chunkmap.animate();
}

function addMap()
{
  log("playerData: ");
  log(playerData);
  chunkmap=ChunkMap(playerData.world, playerData.x, playerData.y, function() {
    if(map!=null)
    {
      mapdata=chunkmap.mapFromChunks();
      map.map=mapdata;
      gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map);
    }
    else
    {
      log('map undefined');
    }
  }, handleObjects);

  chunkmap.move(0,0);
  chunkmap.load();
  mapdata=chunkmap.mapFromChunks();

  map = {
    tileset: 'terrainTiles',
    map: mapdata,
    tileIsSolid: function(obj, t) {
      return false;
    }
  }

  map = help.finalizeTilemap(map);

  gbox.addObject({
    id:    'terrain',
    group: 'terrain',

    blit: function() {
      gbox.blitFade(gbox.getBufferContext(), { alpha: 1 });
      gbox.centerCamera(gbox.getObject('chars', 'player'), {w: map.w, h: map.h});
//      followCamera(gbox.getObject('chars', 'player'), {w: map.w, h: map.h});
      gbox.blit(gbox.getBufferContext(), gbox.getCanvas('map_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('map_canvas').width, dh: gbox.getCanvas('map_canvas').height, sourcecamera: true });
      updateHUD();
    }
  });

  gbox.createCanvas('map_canvas', { w: map.w, h: map.h });
  gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map);
}

function addHUD()
{
  maingame.hud.setWidget('mana', {
    widget: 'label',
    font:   'small',
    value:  mana,
    dx:     40,
    dy:     25,
    clear:  true
  });

  maingame.hud.setWidget('health', {
    widget: 'label',
    font:   'small',
    value:  health,
    dx:     200,
    dy:     25,
    clear:  true
  });
}

function updateHUD()
{
  maingame.hud.setValue('mana', 'value', mana);
  maingame.hud.setValue('health', 'value', health);
  maingame.hud.redraw();
}

function getId()
{
  var id=nextId;
  nextId=nextId+1;
  return id.toString();
}

function diffMaps(a, b)
{
  var adds=[];
  var dels=[];

  if(a==null)
  {
    mapObjects=getBlankGrid(worldTiles);
    mapIds=getBlankGrid(worldTiles);
    for(var y=0; y<worldTiles; y++)
    {
      for(var x=0; x<worldTiles; x++)
      {
        tileB=b[y][x];
        
        if(tileB!=-1)
        {
          adds.push([x, y]);
        }

        mapObjects[y][x]=tileB;
      }
    }
  }
  else
  {
    for(var y=0; y<worldTiles; y++)
    {
      for(var x=0; x<worldTiles; x++)
      {
        tileA=a[y][x];
        tileB=b[y][x];

        mapObjects[y][x]=tileB;

        if(tileA==tileB)
        {
          continue;
        }
        else
        {
          if(tileA==-1)
          {
            adds.push([x,y]);
          }
          else
          {
            dels.push([x,y]);
          }
        }
      }
    }
  }

  var objAdds=[];
  var objMoves=[];
  var objDels=[];

  for(var i=0; i<adds.length && i<dels.length; i++)
  {
    objMoves.push([dels[i], adds[i]]);
  }

  if(adds.length>dels.length)
  {
    for(var j=i; j<adds.length; j++)
    {
      objAdds.push(adds[j]);
    }
  }
  else if(dels.length>adds.length)
  {
    for(var j=i; j<dels.length; j++)
    {
      objDels.push(dels[j]);
    }
  }

  return [objAdds, objMoves, objDels];
}

function damage()
{
  var player=gbox.getObject("chars","player");
  log('player:');
  log(player);
  var cx=player.x+tilePixels/2;
  var cy=player.y+tilePixels/2;
  var tileX=Math.floor(cx/tilePixels);
  var tileY=Math.floor(cy/tilePixels);
  log('tileX: '+tileX+' tileY: '+tileY);
  var tile=mapObjects[tileY][tileX];
  if(tile==106)
  {
    health=health-1;
    if(health==0)
    {
      log('dead!');
    }
    else if(health<0)
    {
      health=0;
    }
  }
}

function handleObjects(objs)
{
  log('handleObjects');

  var results=diffMaps(mapObjects, objs);
  var addObjs=results[0];
  var moveObjs=results[1];
  var delObjs=results[2];

  for(var i=0; i<addObjs.length; i++)
  {
    var obj=addObjs[i];
    var x=obj[0];
    var y=obj[1];

    log('adding');
    var id=getId();
    var obj={'x': x, 'y': y, 'frame': 106, 'id': id};
    mapIds[y][x]=id;

    gbox.addObject({
      id: id,
      object: obj,
      group: 'objects',
      tileset: 'objectTiles',
      colh:gbox.getTiles('objectTiles').tileh,

      initialize: function()
      {
        toys.topview.initialize(this, {});
        this.x = this.object.x*16;
        this.y = this.object.y*16;
        this.frame=this.object.frame;
      },

      first: function()
      {
        var player=gbox.getObject("chars","player");
        if (toys.topview.collides(this,player))
        {
          if(this.trigger!=null && !triggered)
          {
            log('triggered action!');
            triggerAction(this.trigger, this.config);
            triggered=true;
          }
        }
      },

      blit: function()
      {
        gbox.blitTile(gbox.getBufferContext(), {
          tileset: this.tileset,
          tile:    this.frame,
          dx:      this.x,
          dy:      this.y,
          fliph:   this.fliph,
          flipv:   this.flipv,
          camera:  this.camera,
          alpha:   1.0
        });
      },
    });
  } 

  for(var i=0; i<moveObjs.length; i++)
  {
    var obj=moveObjs[i];
    var from=obj[0];
    var to=obj[1];
    var fromx=from[0];
    var fromy=from[1];
    var tox=to[0];
    var toy=to[1];
    var id=mapIds[fromy][fromx];
    mapIds[toy][tox]=id;

    var obj=gbox.getObject('objects', id);
    if(obj!==undefined)
    {
      obj.x=tox*16;
      obj.y=toy*16;
    }
    else
    {
      log(id+' is missing');
    }
  }

  for(var i=0; i<delObjs.length; i++)
  {
    var obj=delObjs[i];
    var x=obj[0];
    var y=obj[1];
    var id=mapIds[y][x];
    mapIds[y][x]=null;

    log('deleting '+id);
    var o=gbox.getObject('objects', id);
    if(o!==undefined)
    {
      gbox.trashObject(o);
    }    
  }

  gbox.purgeGarbage()

  damage();
}

function main()
{
  log("main");
  gbox.setGroups(['terrain', 'objects', 'chars', 'game']);
  maingame = gamecycle.createMaingame('game', 'game');

  maingame.pressStartIntroAnimation=function(reset) { return true; }
  maingame.gameMenu=function(reset) { return true; }
  maingame.gameTitleIntroAnimation=function(reset){}
  maingame.gameIntroAnimation=function() { return true; }
  maingame.levelIntroAnimation=function(reset) { return true; }

  // We'll add more here in the next step...
  maingame.initializeGame=function()
  {
    log("initializeGame");
    addHUD();
  }

  maingame.changeLevel=function(level)
  {
    log("changeLevel");
    gbox.trashGroup('terrain');
    gbox.trashGroup('objects');
    gbox.trashGroup('chars');
    gbox.purgeGarbage();

    addPlayer();
    addMap();
  }
}

function initFresh()
{
  log('initFresh');
  help.akihabaraInit({title: 'Embiggen', width: 256, height: 256, zoom: 2});

  addAssets();

  gbox.setCallback(main);
  gbox.loadAll();

  getPlayer('blanu');
}

$(document).ready(initFresh);
