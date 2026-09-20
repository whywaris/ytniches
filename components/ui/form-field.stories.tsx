import { FormField, inputVariants } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof FormField> = {
  title: "ui/FormField",
  component: FormField,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof FormField>;

export const Variants: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <FormField label="Name" htmlFor="ff-name" helperId="ff-name-helper" errorId="ff-name-error">
        <input id="ff-name" className={cn(inputVariants({ invalid: false }))} />
      </FormField>
      <FormField
        label="Email"
        htmlFor="ff-email"
        helperId="ff-email-helper"
        errorId="ff-email-error"
        helperText="We'll never share this"
      >
        <input id="ff-email" className={cn(inputVariants({ invalid: false }))} />
      </FormField>
      <FormField
        label="Username"
        htmlFor="ff-username"
        helperId="ff-username-helper"
        errorId="ff-username-error"
        errorMessage="Already taken"
        required
      >
        <input
          id="ff-username"
          className={cn(inputVariants({ invalid: true }))}
          defaultValue="taken_name"
        />
      </FormField>
      <FormField
        label="Bio"
        htmlFor="ff-bio"
        helperId="ff-bio-helper"
        errorId="ff-bio-error"
        charCount={{ current: 24, max: 100 }}
      >
        <textarea
          id="ff-bio"
          className={cn(inputVariants({ invalid: false }), "h-auto resize-y py-2")}
          rows={3}
        />
      </FormField>
    </div>
  ),
};
