exports.map = function (params)
{
    if(params['type']=='object')
    {
      var chunkX=params['chunkX'];
      var chunkY=params['chunkY'];
      var chunkId=chunkX+'_'+chunkY;

      return ["{\"key\": \""+chunkId+"\", \"value\": "+JSON.stringify(params)+"}"];
    }
    else
    {
      return ["null"];
    }
}
