import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Board } from "./Board";

const column = (name: string) => within(screen.getByRole("region", { name }));

function setup() {
  render(<Board />);
  return userEvent.setup();
}

describe("Board", () => {
  it("renders the five columns with dummy cards in column colors", () => {
    setup();
    expect(screen.getByRole("heading", { level: 1, name: "Product Launch" })).toBeInTheDocument();
    for (const name of ["Backlog", "To Do", "In Progress", "Review", "Done"]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument();
    }
    expect(screen.getAllByTestId("card")).toHaveLength(10);
    const card = column("To Do").getByText("Draft pricing page copy").parentElement!;
    expect(card).toHaveStyle({ backgroundColor: "#9FFCFD" });
    expect(screen.getByText("10 cards across 5 columns")).toBeInTheDocument();
  });

  it("renames a column with Enter", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Backlog" }));
    const input = screen.getByRole("textbox", { name: "Column name" });
    await user.clear(input);
    await user.type(input, "Ideas{Enter}");
    expect(screen.getByRole("region", { name: "Ideas" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Backlog" })).not.toBeInTheDocument();
  });

  it("cancels a rename with Escape and ignores empty names", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Review" }));
    await user.type(screen.getByRole("textbox", { name: "Column name" }), " Changes{Escape}");
    expect(screen.getByRole("region", { name: "Review" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Review" }));
    await user.clear(screen.getByRole("textbox", { name: "Column name" }));
    await user.keyboard("{Enter}");
    expect(screen.getByRole("region", { name: "Review" })).toBeInTheDocument();
  });

  it("adds a card to a column", async () => {
    const user = setup();
    await user.click(column("Review").getByRole("button", { name: "Add a card" }));
    await user.type(column("Review").getByRole("textbox", { name: "Card title" }), "Write release notes");
    await user.type(column("Review").getByRole("textbox", { name: "Card details" }), "Cover all new features");
    await user.click(column("Review").getByRole("button", { name: "Add card" }));

    expect(column("Review").getByText("Write release notes")).toBeInTheDocument();
    expect(column("Review").getByText("Cover all new features")).toBeInTheDocument();
    expect(column("Review").getByLabelText("2 cards")).toBeInTheDocument();
    expect(column("Review").queryByRole("textbox", { name: "Card title" })).not.toBeInTheDocument();
  });

  it("does not add a card with an empty title and can cancel", async () => {
    const user = setup();
    await user.click(column("Done").getByRole("button", { name: "Add a card" }));
    await user.type(column("Done").getByRole("textbox", { name: "Card title" }), "   ");
    await user.click(column("Done").getByRole("button", { name: "Add card" }));
    expect(column("Done").getAllByTestId("card")).toHaveLength(2);

    await user.click(column("Done").getByRole("button", { name: "Cancel" }));
    expect(column("Done").queryByRole("textbox", { name: "Card title" })).not.toBeInTheDocument();
  });

  it("deletes a card", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Delete Security review" }));
    expect(screen.queryByText("Security review")).not.toBeInTheDocument();
    expect(column("Review").queryAllByTestId("card")).toHaveLength(0);
    expect(screen.getByText("9 cards across 5 columns")).toBeInTheDocument();
  });
});
