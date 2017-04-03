// @flow
import {is} from 'immutable';

import type {ASTNode, ASTPath, Direction, HorizontalDirection, VerticalDirection} from '../types';
import findVerticalNeighborPath from './find-vertical-neighbor-path';
import findVerticalPathIn from './find-vertical-path-in';

function traverseVertically(direction: VerticalDirection, ast: ASTNode, path: ASTPath) {
  const neighborPath = findVerticalNeighborPath(direction, ast, path);
  if (
    (neighborPath.isEmpty() && direction === 'UP')
    || (!is(path, neighborPath) && neighborPath.get(-2) === 'elements')
  ) return neighborPath;
  return neighborPath.concat(findVerticalPathIn(direction, ast.getIn(neighborPath)));
}

function traverseHorizontally(direction: HorizontalDirection, ast: ASTNode, path: ASTPath) {
  const isLeft = direction === 'LEFT';

  const parentPath = path.slice(0, -1);
  if (
    ast.getIn(parentPath).get('type') === 'ObjectProperty' &&
    (isLeft ? 'key' : 'value') !== path.last()
  ) return parentPath.push(isLeft ? 'key' : 'value');

  const newPath = traverseVertically(isLeft ? 'UP' : 'DOWN', ast, path);
  return isLeft && ast.getIn(newPath.slice(0, -1)).get('type') === 'ObjectProperty'
    ? traverseHorizontally('RIGHT', ast, newPath)
    : newPath
}

export default function navigate(direction: Direction, ast: ASTNode, path: ASTPath) {
  if (['UP', 'DOWN'].includes(direction)) {
    return traverseVertically(direction, ast, path);
  } else if (['LEFT', 'RIGHT'].includes(direction)) {
    return traverseHorizontally(direction, ast, path);
  } else {
    throw new Error(`Unknown direction: ${direction}`);
  }
}