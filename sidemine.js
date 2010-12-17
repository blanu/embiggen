var maingame;
var tilemaps={}; // Loaded by external resources. Must be global.
var mapmeta={}; // Loaded by external resources. Must be global.
var mapobjects={}; // Loaded by external resources. Must be global.
var currentstage; // The stage that is currently playing

var firstLoad=true;

ChunkMap=function(dbname, x, y) {
  this.x=x;
  this.y=y;

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

    if(firstLoad)
    {
      log('firstLoad');
      firstLoad=false;

      var mapdata={"tileset":"tiles","map":map};
      tilemaps['0_0']=help.finalizeTilemap(mapdata);

  		gbox.loadAll(go);
    }
    else
    {
      log('nextLoad');
      log('before:');
      log(tilemaps['0_0']['map']);
      tilemaps['0_0']['map']=map;
      log('after:');
      log(tilemaps['0_0']['map']);

      var mapdata={"tileset":"tiles","map":map};
      tilemaps['0_0']=help.finalizeTilemap(mapdata);
      tilemaps['0_0'].tileIsSolidCeil=function(obj,t){ return (obj.group=="foes"?false:t==0) };
      tilemaps['0_0'].tileIsSolidFloor=function(obj,t){ return t!=null };
      gbox.blitTilemap(gbox.getCanvasContext("tileslayer"),tilemaps[currentstage]);
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

mapobjects['0_0']={items:[
{objecttype:"player", x:40, y:40, side:1},
{objecttype:"squid", x:80, y:40, side:1},
{objecttype:"squid", x:140, y:40, side:1},
{objecttype:"squid", x:220, y:40, side:1}
]};

function go()
{
  log('go');
  gbox.setGroups(["background","player","foes","sparks","gamecycle"]);

  maingame=gamecycle.createMaingame("gamecycle","gamecycle");

  maingame.gameIntroAnimation=function(reset)
  {
    return true;
  }

  maingame.gameTitleIntroAnimation=function(reset)
  {
    return true;
  }

  maingame.pressStartIntroAnimation=function(reset)
  {
    return true;
  }

  maingame.gameMenu=function(reset)
  {
    return true;
  }

  // Change level
  maingame.changeLevel=function(level)
  {
    log('changeLevel');
   	if (level==null) level="0_0"; // First stage
  	currentstage=level;
    gbox.createCanvas("tileslayer",{w:tilemaps[currentstage].w,h:tilemaps[currentstage].h});
    gbox.blitTilemap(gbox.getCanvasContext("tileslayer"),tilemaps[currentstage]);
    this.newLife();
  }

  // New life
  maingame.newLife=function(up)
  {
    log('newLife');
    // Cleanup the level.
    gbox.trashGroup("foes");
    gbox.purgeGarbage(); // Since we're starting, we can purge all now

    // Apply some common tilemap handlers to the map. Are the same for all the stages.
    tilemaps[currentstage].tileIsSolidCeil=function(obj,t){ return (obj.group=="foes"?false:t==0) };
    tilemaps[currentstage].tileIsSolidFloor=function(obj,t){ return t!=null };

    // Add the stage objects, according to the configured mapobjects
    var current;
    for (var i=0;i<mapobjects[currentstage].items.length;i++)
    {
      current=mapobjects[currentstage].items[i];
      switch (current.objecttype)
      {
        case "player":
        {
          toys.platformer.spawn(gbox.getObject("player","player"),help.mergeWithModel(current,{accx:0,accy:0})); // Apply to the defined object the model with no acceleration. Notes that the "objecttype" parameter is also merged to the object but ignored.
          break;
        }
        default:
        { // All the other objects are enemies. Depending on the ID, different enemies are spawn.
          maingame.addEnemy(current.objecttype,current); // Data are directly taken from the resources data.
          break;
        }
      }
    }

    toys.resetToy(maingame,"gametimer"); // Start the timer
  }

  // Games conditions
  maingame.gameEvents=function() {
    // Tick the timer
    if (gbox.groupIsEmpty("foes"))
//      if (mapmeta[currentstage].nextLevel)
//       maingame.gotoLevel(mapmeta[currentstage].nextLevel);
//      else
        maingame.gameIsCompleted();
  }

  // Game is over when...
  maingame.gameIsOver=function() {
    return false;
  }

  // Custom method
  maingame.addEnemy=function(type,data) {
    log('addEnemy');
    switch (type) {
      case "squid": {
        gbox.addObject({
							group:"foes",
							tileset:"enemy-goo",
							score:100,
							initialize:function() {
								toys.platformer.initialize(this,{
									frames:{
										still:{ speed:1, frames:[0] },
										walking:{ speed:4, frames:[0,1] },
										jumping:{ speed:1, frames:[0] },
										falling:{ speed:1, frames:[0] },
										die: { speed:1,frames:[0] }
									},
									x:data.x,
									y:data.y,
									jumpaccy:10,
									side:data.side

								});
							},
							first:function() {
								if (gbox.objectIsVisible(this)) {
									// Counter
									this.counter=(this.counter+1)%10;

									toys.platformer.applyGravity(this); // Apply gravity
									toys.platformer.auto.horizontalBounce(this); // Bounces horizontally if hit the sideways walls
									if (this.touchedfloor) // If touching the floor...
										toys.platformer.auto.goomba(this,{moveWhileFalling:true,speed:2}); // goomba movement
									else // Else...
										this.accx=0; // Stay still (i.e. jump only vertically)
									toys.platformer.auto.dontFall(this,tilemaps[currentstage],"map"); // prevent from falling from current platform
									toys.platformer.verticalTileCollision(this,tilemaps[currentstage],"map"); // vertical tile collision (i.e. floor)
									toys.platformer.horizontalTileCollision(this,tilemaps[currentstage],"map"); // horizontal tile collision (i.e. walls)
									if (toys.platformer.canJump(this)&&toys.timer.randomly(this,"jumper",{base:50,range:50})) this.accy=-this.jumpaccy; // Jump randomly (the toy is resetted the first call)
									toys.platformer.handleAccellerations(this); // gravity/attrito
									toys.platformer.setFrame(this); // set the right animation frame
									var pl=gbox.getObject("player","player");
								}
							},
							blit:function() {
								if (gbox.objectIsVisible(this))
									gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset,tile:this.frame,dx:this.x,dy:this.y,camera:this.camera,fliph:this.side,flipv:this.flipv});
							}
					  });
					break;
				}
      }
  }

  maingame.initializeGame=function()
  {
    log('initializeGame');
		    gbox.addObject({
		  	id:"player",
		  	group:"player",
		  	tileset:"player",
		  	multiplier:0,

			initialize:function() {
				toys.platformer.initialize(this,{
					frames:{
						still:{ speed:1, frames:[0] },
						walking:{ speed:2, frames:[1,2,3,2,1] },
						jumping:{ speed:1, frames:[4] },
						falling:{ speed:1, frames:[5] },
						die:{speed:1,frames:[6] }
					}
				});
			},

			collisionEnabled:function() {
				return !maingame.gameIsHold()&&!this.killed;
			},

			kill:function(by){
		  		this.killed=true;
		  		toys.generate.sparks.bounceDie(this,"sparks",null,{jump:6,flipv:false});
		  		maingame.playerDied({wait:50});
		  	},

		  	first:function() {

		  		// Counter
		  		this.counter=(this.counter+1)%10;
				if (!this.killed) {
					toys.platformer.applyGravity(this); // Apply gravity
					toys.platformer.horizontalKeys(this,{left:"left",right:"right"}); // Moves horizontally
					toys.platformer.verticalTileCollision(this,tilemaps[currentstage],"map"); // vertical tile collision (i.e. floor)
					toys.platformer.horizontalTileCollision(this,tilemaps[currentstage],"map"); // horizontal tile collision (i.e. walls)
					toys.platformer.jumpKeys(this,{jump:"a"}); // handle jumping
					toys.platformer.handleAccellerations(this); // gravity/attrito
					toys.platformer.setSide(this); // set horizontal side
					toys.platformer.setFrame(this); // set the right animation frame

					// Multiplier reset
					if (this.touchedfloor) this.multiplier=0;
				}

		  	},
		  	blit:function() {
		  		if (!this.killed)
          {
		  			gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset,tile:this.frame,dx:this.x,dy:this.y,camera:this.camera,fliph:this.side,flipv:this.flipv});
          }
		  	}

		  });

		 gbox.addObject({
		  	id:"bg",
		  	group:"background",
		  	blit:function() {
		  		gbox.centerCamera(gbox.getObject("player","player"),{w:tilemaps[currentstage].w,h:tilemaps[currentstage].h});
		  		gbox.blit(gbox.getBufferContext(),gbox.getImage("bg"),{dx:0,dy:0,dw:gbox.getScreenW(),dh:gbox.getScreenH(),sourcecamera:true,parallaxx:0.5,parallaxy:0.5});
		  		gbox.blit(gbox.getBufferContext(),gbox.getCanvas("tileslayer"),{dx:0,dy:0,dw:gbox.getScreenW(),dh:gbox.getScreenH(),sourcecamera:true});
		  	}
		  });

		  }

		  gbox.go();

	}

	// BOOTSTRAP
	gbox.onLoad(function ()
  {
		help.akihabaraInit({title:"Side Miner",splash:{footnotes:["Music by: Greenleo, Smiletron.","Full credits on ending title."]}});

		gbox.addBundle({file:"resources/sidemine/bundle.js"});

    gbox.addTiles({id:"tiles",image:"terrain",tileh:16,tilew:16,tilerow:256,gapx:0,gapy:0});
    gbox.addTiles({id:"player",image:"sprites",tileh:40,tilew:20,tilerow:9,gapx:0,gapy:0});
    gbox.addTiles({id:"enemy-goo",image:"sprites",tileh:20,tilew:20,tilerow:9,gapx:0,gapy:60});
    gbox.addTiles({id:"enemy-sad",image:"sprites",tileh:40,tilew:20,tilerow:9,gapx:0,gapy:80});
    gbox.addTiles({id:"tiledfont",image:"font",tileh:8,tilew:8,tilerow:255,gapx:0,gapy:8});

    chunkmap=ChunkMap('sidemine', 1, 1);
  }, false);
