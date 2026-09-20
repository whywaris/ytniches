import type { Preview } from "@storybook/nextjs-vite";

import "../app/globals.css";

// Implementation-Plan.md §2.4: "Storybook set up with dark mode as
// default." Dark is already the bare :root default in globals.css, so
// the toggle below just adds/removes the [data-theme="light"] override.
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Design-System.md §1.1 principle 1: dark is the primary experience",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "dark",
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === "light" ? "light" : undefined;
      return (
        <div data-theme={theme} className="bg-bg-base p-6 text-text-primary">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
