/*****************************************************************************
*                                                                            *
*  SVG Path Rounding Function                                                *
*  Copyright (C) 2014 Yona Appletree                                         *
*                                                                            *
*  Licensed under the Apache License, Version 2.0 (the "License");           *
*  you may not use this file except in compliance with the License.          *
*  You may obtain a copy of the License at                                   *
*                                                                            *
*      http://www.apache.org/licenses/LICENSE-2.0                            *
*                                                                            *
*  Unless required by applicable law or agreed to in writing, software       *
*  distributed under the License is distributed on an "AS IS" BASIS,         *
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  *
*  See the License for the specific language governing permissions and       *
*  limitations under the License.                                            *
*                                                                            *
*****************************************************************************/

/**
 * SVG Path rounding function. Takes an input path string and outputs a path
 * string where all line-line corners have been rounded. Only supports absolute
 * commands at the moment.
 * 
 * @param pathString The SVG input path
 * @param radius The amount to round the corners, either a value in the SVG 
 *               coordinate space, or, if useFractionalRadius is true, a value
 *               from 0 to 1.
 * @param useFractionalRadius If true, the curve radius is expressed as a
 *               fraction of the distance between the point being curved and
 *               the previous and next points.
 * @returns A new SVG path string with the rounding
 */

export const roundPathCorners = (pathString, radius, useFractionalRadius = true) => {

  pathString = SVGPathCommander.normalizePath(pathString).toString();
  const moveTowardsLength = (movingPoint, targetPoint, amount) => {
    const width = targetPoint.x - movingPoint.x;
    const height = targetPoint.y - movingPoint.y;
    const distance = Math.sqrt(width * width + height * height);
    return moveTowardsFractional(
      movingPoint,
      targetPoint,
      Math.min(1, amount / distance)
    );
  };

  const moveTowardsFractional = (movingPoint, targetPoint, fraction) => ({
    x: movingPoint.x + (targetPoint.x - movingPoint.x) * fraction,
    y: movingPoint.y + (targetPoint.y - movingPoint.y) * fraction,
  });

  const adjustCommand = (cmd, newPoint) => {
    if (cmd.length > 2) {
      cmd[cmd.length - 2] = newPoint.x;
      cmd[cmd.length - 1] = newPoint.y;
    }
  };

  const pointForCommand = (cmd) => ({
    x: parseFloat(cmd[cmd.length - 2]),
    y: parseFloat(cmd[cmd.length - 1]),
  });

  const pathParts = pathString
    .split(/[,\s]/)
    .reduce((parts, part) => {
      const match = part.match("([a-zA-Z])(.+)");
      if (match) {
        parts.push(match[1]);
        parts.push(match[2]);
      } else {
        parts.push(part);
      }
      return parts;
    }, []);

  const commands = pathParts.reduce((commands, part) => {
    if (parseFloat(part) == part && commands.length) {
      commands[commands.length - 1].push(part);
    } else {
      commands.push([part]);
    }
    return commands;
  }, []);

  let resultCommands = [];

  if (commands.length > 1) {
    const startPoint = pointForCommand(commands[0]);

    let virtualCloseLine = null;
    if (
      commands[commands.length - 1][0] == "Z" &&
      commands[0].length > 2
    ) {
      virtualCloseLine = ["L", startPoint.x, startPoint.y];
      commands[commands.length - 1] = virtualCloseLine;
    }

    resultCommands.push(commands[0]);

    for (let cmdIndex = 1; cmdIndex < commands.length; cmdIndex++) {
      const prevCmd = resultCommands[resultCommands.length - 1];
      const curCmd = commands[cmdIndex];
      const nextCmd =
        curCmd == virtualCloseLine
          ? commands[1]
          : commands[cmdIndex + 1];

      if (
        nextCmd &&
        prevCmd &&
        prevCmd.length > 2 &&
        curCmd[0] == "L" &&
        nextCmd.length > 2 &&
        nextCmd[0] == "L"
      ) {
        const prevPoint = pointForCommand(prevCmd);
        const curPoint = pointForCommand(curCmd);
        const nextPoint = pointForCommand(nextCmd);
        let curveStart, curveEnd;

        if (useFractionalRadius) {
          curveStart = moveTowardsFractional(
            curPoint,
            prevCmd.origPoint || prevPoint,
            radius
          );
          curveEnd = moveTowardsFractional(
            curPoint,
            nextCmd.origPoint || nextPoint,
            radius
          );
        } else {
          curveStart = moveTowardsLength(curPoint, prevPoint, radius);
          curveEnd = moveTowardsLength(curPoint, nextPoint, radius);
        }

        adjustCommand(curCmd, curveStart);
        curCmd.origPoint = curPoint;
        resultCommands.push(curCmd);

        const startControl = moveTowardsFractional(
          curveStart,
          curPoint,
          0.5
        );
        const endControl = moveTowardsFractional(
          curPoint,
          curveEnd,
          0.5
        );

        const curveCmd = [
          "C",
          startControl.x,
          startControl.y,
          endControl.x,
          endControl.y,
          curveEnd.x,
          curveEnd.y,
        ];
        curveCmd.origPoint = curPoint;
        resultCommands.push(curveCmd);
      } else {
        resultCommands.push(curCmd);
      }
    }

    if (virtualCloseLine) {
      const newStartPoint = pointForCommand(
        resultCommands[resultCommands.length - 1]
      );
      resultCommands.push(["Z"]);
      adjustCommand(resultCommands[0], newStartPoint);
    }
  } else {
    resultCommands = commands;
  }

  return resultCommands.reduce((str, c) => str + c.join(" ") + " ", "");
};


