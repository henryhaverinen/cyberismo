/**
    Cyberismo
    Copyright © Cyberismo Ltd and contributors 2024

    This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public
    License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { NextRequest, NextResponse } from 'next/server';
import { Show } from '@cyberismocom/data-handler/show';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/cardtypes/{key}:
 *   get:
 *     summary: Returns the full content of a specific card type.
 *     description: The key parameter is the unique identifier ("cardTypeKey") of the card type. The response includes the card type details.
 *     responses:
 *       200:
 *        description: Object containing card type details. See definitions.ts/CardType for the structure.
 *       400:
 *         description: Error in reading project details.
 *       500:
 *         description: project_path not set or other internal error
 */
export async function GET(request: NextRequest) {
  const projectPath = process.env.npm_config_project_path;
  if (!projectPath) {
    return new NextResponse('project_path not set', { status: 500 });
  }

  // Last URL segment is the search parameter
  const key = request.nextUrl.pathname.split('/')?.pop();
  if (key == null) {
    return new NextResponse('No search key', { status: 400 });
  }

  const show = new Show();
  const detailsResponse = await show.showCardTypeDetails(projectPath, key);

  if (detailsResponse) {
    return NextResponse.json(detailsResponse);
  } else {
    return new NextResponse(`No card type details found for card key ${key}`, {
      status: 500,
    });
  }
}
