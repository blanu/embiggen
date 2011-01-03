var maingame;
var chunkmap;
var mapdata;
var map=null;
var orientation=false;
var center=Math.floor((16*16*3)/2)+8;
var lowEdge=(center-128)-16;
var highEdge=(center+128)-16;

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

function addPlayer() {
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

      this.frame=2;

      this.x = center;
      this.y = center;
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

function main()
{
  log("main");
  gbox.setGroups(['terrain', 'object', 'chars', 'game']);
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
    addPlayer();

    // First load map, then start game
    chunkmap=ChunkMap('surface', 1, 1, function() {
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
    });

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

  gbox.go();
}

function initFresh()
{
  log('initFresh');
  help.akihabaraInit({title: 'Embiggen', width: 256, height: 256, zoom: 2});

  addAssets();

  gbox.setCallback(main);
  gbox.loadAll();
}

$(document).ready(initFresh);
