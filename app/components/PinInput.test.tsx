import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { PinInput } from "./PinInput";

function ControlledPinInput({
  onComplete,
}: {
  onComplete?: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  return <PinInput value={value} onChange={setValue} onComplete={onComplete} />;
}

describe("PinInput", () => {
  it("renders 6 digit boxes by default", () => {
    render(<ControlledPinInput />);
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
  });

  it("calls onComplete with the full value once 6 digits are entered", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ControlledPinInput onComplete={onComplete} />);

    const boxes = screen.getAllByRole("textbox");
    await user.click(boxes[0]);
    for (let i = 0; i < 6; i++) {
      await user.keyboard(String(i + 1));
    }

    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("moves focus to the previous box on backspace when the current one is empty", async () => {
    const user = userEvent.setup();
    render(<ControlledPinInput />);

    const boxes = screen.getAllByRole("textbox");
    await user.click(boxes[0]);
    await user.keyboard("1");
    expect(document.activeElement).toBe(boxes[1]);

    await user.keyboard("{Backspace}");
    expect(document.activeElement).toBe(boxes[0]);
  });
});
