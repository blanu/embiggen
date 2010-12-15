{
	_template:"leavemealone",
	setObject:[
		{
			object:"mapmeta",
			property:"stage1",
			value:{nextLevel:"stage2"}
		},
		{
			object:"mapobjects",
			property:"stage1",
			value:{
				items:[
					{objecttype:"player", x:40, y:40, side:1},
					{objecttype:"squid", x:80, y:40, side:1},
					{objecttype:"squid", x:140, y:40, side:1},
					{objecttype:"squid", x:220, y:40, side:1}
				]
			}
		},
		{
			object:"tilemaps",
			property:"stage1",
			value:help.finalizeTilemap({
				tileset:"tiles",
				map:[
					[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0],
					[2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2],
					[2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2],
					[2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2],
					[2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2],
					[2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2],
					[2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2],
					[2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2],
					[2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2],
					[2,null,null,null,null,null,null,3,3,null,null,null,null,null,null,null,null,null,null,2],
					[2,null,null,3,3,3,null,null,null,null,3,3,3,null,null,null,null,null,null,2],
					[2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2],
					[2,3,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,3,2],
					[2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2],
					[2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2]
				]
			})
		}
	]
}