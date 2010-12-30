var maingame;
var mapdata;
var map;
var orientation=false;

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
}

function addPlayer() {
  gbox.addObject({
    id: 'player',
    group: 'chars',
    tileset: 'charTiles',
    colh:gbox.getTiles('charTiles').tileh,

    initialize: function()
    {
      toys.topview.initialize(this, {});
      this.x = 200;
      this.y = 64;
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
//    map: loadMap(),
    map: mapdata,
    tileIsSolid: function(obj, t) {
//      return t != null;
      return false;
    }
  }

  map = help.finalizeTilemap(map);

  gbox.addObject({
    id:    'terrain',
    group: 'terrain',

    blit: function() {
      gbox.blitFade(gbox.getBufferContext(), { alpha: 1 });
//      gbox.centerCamera(gbox.getObject('chars', 'player'), {w: map.w, h: map.h});
      followCamera(gbox.getObject('chars', 'player'), {w: map.w, h: map.h});
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
  gbox.setGroups(['terrain', 'chars', 'game']);
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
    addMap();

    gbox.createCanvas('map_canvas', { w: map.w, h: map.h });
    gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map);

    addHUD();
  }

  maingame.changeLevel=function()
  {
    log("changeLevel");
  }

  // First load map, then start game
  chunkmap=ChunkMap('surface', 1, 1, function() {
    log('starting game');

    mapdata=chunkmap.mapFromChunks();

    gbox.go();
  });
}

function initFresh()
{
  log('initFresh');
  help.akihabaraInit({title: 'Embiggen', width: 320, height: 320, zoom: 2});

  addAssets();

  gbox.setCallback(main);
  gbox.loadAll();
}

$(document).ready(initFresh);
