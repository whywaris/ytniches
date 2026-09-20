import { TextInput, type TextInputProps } from "@/components/ui/text-input";

// Design-System.md §5.2 "number" input type. Native <input type="number">
// already gives correct keyboard/stepper/validation behavior — no need
// to reinvent it, so this just forces the type on top of TextInput.
function NumberInput(props: Omit<TextInputProps, "type" | "prefix">) {
  return <TextInput type="number" {...props} />;
}

export { NumberInput };
