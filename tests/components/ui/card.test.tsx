import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Card, CardActions, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

describe("Card", () => {
  it("has no accessibility violations across variants, padding, and slots", async () => {
    const { container } = render(
      <>
        <Card variant="base" padding="sm">
          Base card
        </Card>
        <Card variant="interactive" padding="md">
          Interactive card
        </Card>
        <Card variant="selected" padding="lg">
          <CardHeader>Title</CardHeader>
          Selected card with slots
          <CardFooter>
            <CardActions>
              <Button size="sm">Confirm</Button>
            </CardActions>
          </CardFooter>
        </Card>
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
