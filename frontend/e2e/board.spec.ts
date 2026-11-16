import { expect, test, type Locator, type Page } from "@playwright/test";

const column = (page: Page, name: string) => page.getByRole("region", { name, exact: true });
const titles = (col: Locator) => col.getByTestId("card").locator("h3").allTextContents();

async function drag(page: Page, source: Locator, target: Locator) {
  const from = (await source.boundingBox())!;
  const to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2 + 10, { steps: 5 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 20 });
  await page.mouse.up();
}

let errors: string[];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/");
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test("loads the board with five columns and dummy cards", async ({ page }) => {
  await expect(page).toHaveTitle("Kanban Board");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Product Launch");
  for (const name of ["Backlog", "To Do", "In Progress", "Review", "Done"]) {
    await expect(column(page, name)).toBeVisible();
  }
  await expect(page.getByTestId("card")).toHaveCount(10);
  await expect(column(page, "In Progress").getByTestId("card").first().locator("div").first()).toHaveCSS(
    "background-color",
    "rgb(200, 191, 231)",
  );
});

test("adds a card", async ({ page }) => {
  const todo = column(page, "To Do");
  await todo.getByRole("button", { name: "Add a card" }).click();
  await todo.getByLabel("Card title").fill("Plan beta program");
  await todo.getByLabel("Card details").fill("Recruit twenty early users.");
  await todo.getByRole("button", { name: "Add card" }).click();
  expect(await titles(todo)).toEqual([
    "Draft pricing page copy",
    "Design onboarding flow",
    "Set up analytics",
    "Plan beta program",
  ]);
  await expect(todo.getByText("Recruit twenty early users.")).toBeVisible();
});

test("deletes a card", async ({ page }) => {
  const card = page.getByTestId("card").filter({ hasText: "Competitor research" });
  await card.hover();
  await card.getByRole("button", { name: "Delete Competitor research", exact: true }).click();
  await expect(page.getByText("Competitor research")).toHaveCount(0);
  await expect(page.getByTestId("card")).toHaveCount(9);
});

test("renames a column", async ({ page }) => {
  await page.getByRole("button", { name: "In Progress" }).click();
  await page.getByLabel("Column name").fill("Doing");
  await page.keyboard.press("Enter");
  await expect(column(page, "Doing")).toBeVisible();
  await expect(column(page, "In Progress")).toHaveCount(0);
});

test("drags a card to another column", async ({ page }) => {
  const card = page.getByTestId("card").filter({ hasText: "Define launch goals" });
  await drag(page, card, column(page, "Done").getByTestId("card").last());
  expect(await titles(column(page, "Backlog"))).toEqual(["Competitor research"]);
  expect(await titles(column(page, "Done"))).toContain("Define launch goals");
  await expect(
    column(page, "Done").getByTestId("card").filter({ hasText: "Define launch goals" }).locator("div").first(),
  ).toHaveCSS("background-color", "rgb(169, 235, 190)");
});

test("reorders cards within a column", async ({ page }) => {
  const todo = column(page, "To Do");
  await drag(page, todo.getByTestId("card").first(), todo.getByTestId("card").last());
  expect(await titles(todo)).toEqual(["Design onboarding flow", "Set up analytics", "Draft pricing page copy"]);
});

test("drops a card into an empty column", async ({ page }) => {
  await page.getByRole("button", { name: "Delete Security review", exact: true }).click();
  await expect(column(page, "Review").getByTestId("card")).toHaveCount(0);
  await drag(page, page.getByTestId("card").filter({ hasText: "Build signup API" }), column(page, "Review"));
  expect(await titles(column(page, "Review"))).toEqual(["Build signup API"]);
  expect(await titles(column(page, "In Progress"))).toEqual(["Landing page hero"]);
});

test("reload resets to dummy data", async ({ page }) => {
  await page.getByRole("button", { name: "Delete Brand guidelines", exact: true }).click();
  await expect(page.getByTestId("card")).toHaveCount(9);
  await page.reload();
  await expect(page.getByTestId("card")).toHaveCount(10);
});
