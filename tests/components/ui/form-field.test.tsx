import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { FormField } from "@/components/ui/form-field";

describe("FormField", () => {
  it("has no accessibility violations across label/helper/error/char-count combinations", async () => {
    const { container } = render(
      <>
        <FormField label="Name" htmlFor="name" helperId="name-helper" errorId="name-error">
          <input id="name" />
        </FormField>
        <FormField
          label="Email"
          htmlFor="email"
          helperId="email-helper"
          errorId="email-error"
          helperText="We'll never share this"
        >
          <input id="email" aria-describedby="email-helper" />
        </FormField>
        <FormField
          label="Username"
          htmlFor="username"
          helperId="username-helper"
          errorId="username-error"
          errorMessage="Already taken"
          required
        >
          <input id="username" aria-invalid aria-describedby="username-error" />
        </FormField>
        <FormField
          label="Bio"
          htmlFor="bio"
          helperId="bio-helper"
          errorId="bio-error"
          charCount={{ current: 12, max: 100 }}
        >
          <textarea id="bio" />
        </FormField>
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the error message with role=alert instead of the helper text when both are provided", () => {
    const { getByRole, queryByText } = render(
      <FormField
        label="Username"
        htmlFor="username"
        helperId="username-helper"
        errorId="username-error"
        helperText="3-20 characters"
        errorMessage="Already taken"
      >
        <input id="username" />
      </FormField>,
    );

    expect(getByRole("alert")).toHaveTextContent("Already taken");
    expect(queryByText("3-20 characters")).not.toBeInTheDocument();
  });
});
