import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EmailLayout } from "@/lib/email/templates/layout";

describe("EmailLayout", () => {
  it("shows the logo from an absolute URL with alt text", () => {
    const html = renderToStaticMarkup(
      <EmailLayout preheader="Hi" siteUrl="https://ytniches.com">
        <p>Body</p>
      </EmailLayout>,
    );
    expect(html).toContain('src="https://ytniches.com/email/logo.png"');
    expect(html).toContain('alt="YTNiches"');
  });
});
