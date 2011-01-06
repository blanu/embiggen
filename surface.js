var maingame;
var chunkmap;
var mapdata;
var map=null;
var orientation=false;
var center=Math.floor((16*16*3)/2)+8;
var lowEdge=(center-128)-16;
var highEdge=(center+128)-16;
var triggered=false;
var playerData=null;

triggers={
  teleport: function(args) {
    var world=args.world;
    var chunkX=args.chunkX;
    var chunkY=args.chunkY;

    log('teleporting to '+world+'/('+chunkX+','+chunkY+')');
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
  log(objs);
  for(var i=0; i<objs.length; i++)
  {
    var obj=objs[i];
    var id=obj.objectId;

    var o=gbox.getObject('objects', id);
    o.x=o.x-(offsetX*256);
    o.y=o.y-(offsetY*256);
  }
}

function addPlayer(tile, x, y) {
  gbox.addObject({
    id: 'player',
    group: 'chars',
    tileset: 'charTiles',
    colh:gbox.getTiles('charTiles').tileh,

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

      var offsetX=0;
      var offsetY=0;

      if(this.x<lowEdge)
      {
        this.x=this.x+256;
        offsetX=-1;
      }
      else if(this.x>highEdge)
      {
        this.x=this.x-256;
        offsetX=1;
      }

      if(this.y<lowEdge)
      {
        this.y=this.y+256;
        offsetY=-1;
      }
      else if(this.y>highEdge)
      {
        this.y=this.y-256;
        offsetY=1;
      }

      if(offsetX!=0 || offsetY!=0)
      {
        moveObjects(offsetX, offsetY);
        chunkmap.move(offsetX, offsetY);
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

function gotPlayer(doc, data)
{
  log('got player');
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

function addMap()
{
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
}

function addHUD()
{
  maingame.hud.setWidget('mana', {
    widget: 'label',
    font:   'small',
    value:  0,
    dx:     40,
    dy:     25,
    clear:  true
  });
}

function updateHUD()
{
  maingame.hud.setValue('mana', 'value', 0);
  maingame.hud.redraw();
}

function addObjects(objs)
{
  log('addObjects');
  log(objs);

  for(var i=0; i<objs.length; i++)
  {
    var obj=objs[i];
    log(obj);
    var id=obj.objectId;
    var chunkX=obj.chunkX;
    var chunkY=obj['chunkY'];
    var tileX=obj['tileX'];
    var tileY=obj['tileY'];
    var frame=obj['tile'];
    var trigger=null;
    var config=null;
    if(obj.hasOwnProperty('trigger'))
    {
      trigger=obj.trigger;
      config=obj.config;
    }

    var localX=chunkX-chunkmap.x+1;
    var localY=chunkY-chunkmap.y+1;

    log('trying to add '+chunkX+' '+chunkY+' '+tileX+' '+tileY+' '+frame);

    gbox.addObject({
      id: id,
      group: 'objects',
      tileset: 'objectTiles',
      colh:gbox.getTiles('objectTiles').tileh,
      trigger: trigger,
      config: config,

      initialize: function()
      {
        toys.topview.initialize(this, {});
        this.x = (localX*16*16)+(tileX*16);
        this.y = (localY*16*16)+(tileY*16);
        this.frame=frame;
        log('added object '+this.id+':'+this.x+','+this.y+'/'+this.frame);
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
}

function delObjects(objs)
{
  log('delObjects');
  log(objs);

  for(var i=0; i<objs.length; i++)
  {
    var obj=objs[i];
    log(obj);

    var id=obj.objectId;
    var o=gbox.getObject('objects', id);

    gbox.trashObject(o);
  }
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
    var x=(playerData.chunkX*16*16)+(playerData.tileX*16);
    var y=(playerData.chunkY*16*16)+(playerData.tileY*16);
    addPlayer(playerData.tile, x, y);

    // First load map, then start game
    chunkmap=ChunkMap(playerData.world, playerData.chunkX, playerData.chunkY, function() {
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
    }, addObjects, delObjects);

    mapdata=chunkmap.mapFromChunks();

    addMap();

    gbox.createCanvas('map_canvas', { w: map.w, h: map.h });
    gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map);

    addHUD();
  }

  maingame.changeLevel=function()
  {
    log("changeLevel");
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
