// @ts-check

import { test, expect } from '@playwright/test';
import { ReqResClient } from '../../src/api/ReqResClient.js';

const FIRST_PAGE = 1;

test('Pagination on ReqRes. All pages together have "total" users without repeats', async () => {
  const client = new ReqResClient();
  const firstPage = await client.getListOfUsers(FIRST_PAGE);
  expect(firstPage.page).toBe(FIRST_PAGE);
  const users = [...firstPage.data];

  for (
    let pageNumber = FIRST_PAGE + 1;
    pageNumber <= firstPage.total_pages;
    pageNumber++
  ) {
    const nextPage = await client.getListOfUsers(pageNumber);
    expect(nextPage.page).toBe(pageNumber);
    users.push(...nextPage.data);
  }

  expect(users).toHaveLength(firstPage.total);
  const uniqueIds = new Set(users.map((user) => user.id));
  expect(uniqueIds.size, 'User ids must not repeat on different pages.').toBe(
    users.length,
  );
});
