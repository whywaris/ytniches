import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Search } from "lucide-react";
import { describe, expect, it } from "vitest";

import { TextInput } from "@/components/ui/text-input";

describe("TextInput", () => {
  it("has no accessibility violations across states and modifiers", async () => {
    const { container } = render(
      <>
        <TextInput label="Name" placeholder="Jane Doe" />
        <TextInput label="Email" helperText="We'll never share this" />
        <TextInput label="Username" errorMessage="Already taken" />
        <TextInput label="Search" prefix={<Search />} />
        <TextInput label="Disabled" disabled />
        <TextInput label="Bio" maxLength={100} showCharCount value="hello" onChange={() => {}} />
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("links the error message via aria-describedby and sets aria-invalid", () => {
    const { getByLabelText, getByRole } = render(
      <TextInput label="Username" errorMessage="Already taken" />,
    );
    const input = getByLabelText("Username");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(getByRole("alert")).toHaveTextContent("Already taken");
  });
});
