function getBlankGrid(size)
{
  var result=[];
  var row;
  var x, y;

  for(x=0; x<size; x++)
  {
    row=[];

    for(y=0; y<size; y++)
    {
      row.push(0);
    }

    result.push(row);
  }

  return result;
}

function getCell(grid, x, y)
{
  if(x<0 || x>=grid.length || y<0 || y>=grid.length)
  {
    return 0;
  }
  else
  {
    return grid[x][y];
  }
}

function iterate(grid, f)
{
  log('iterate');
  var size=grid.length;
  var x, y, xx, yy;
  var result, row, cell, neighbors;

  result=[];

  for(x=0; x<size; x++)
  {
    row=[];

    for(y=0; y<size; y++)
    {
      cell=getCell(grid, x, y);
      neighbors=[getCell(grid, x-1, y-1), getCell(grid, x-1, y), getCell(grid, x-1, y+1), getCell(grid, x, y-1), getCell(grid, x, y+1), getCell(grid, x+1, y-1), getCell(grid, x+1, y), getCell(grid, x+1, y+1)];
      row.push(f(cell, neighbors));
    }

    result.push(row);
  }

  return result;
}

function count(cells)
{
  var count=0;
  var x;

  for(x=0; x<cells.length; x++)
  {
    if(cells[x]==1)
    {
      count=count+1;
    }
  }

  return count;
}

function right(cell, neighbors)
{
  if(neighbors[3]==1)
  {
    return 1;
  }
  else
  {
    return 0;
  }
}

function death(cell, neighbors)
{
  return 0;
}

function gameOfLife(cell, neighbors)
{
  var ncount=count(neighbors);
  if(cell==1)
  {
    if(ncount==2 || ncount==3)
    {
      return 1;
    }
    else
    {
      return 0;
    }
  }
  else
  {
    if(ncount==3)
    {
      return 1;
    }
    else
    {
      return 0;
    }
  }
}
