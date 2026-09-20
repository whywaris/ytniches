import { Search, X } from "lucide-react";

import { TextInput, type TextInputProps } from "@/components/ui/text-input";

export interface SearchInputProps extends Omit<TextInputProps, "prefix" | "type"> {
  onClear?: () => void;
}

function SearchInput({ value, onClear, ...props }: SearchInputProps) {
  const showClear = Boolean(value) && onClear;

  return (
    <TextInput
      type="search"
      value={value}
      prefix={<Search />}
      suffix={
        showClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="text-text-tertiary hover:text-text-primary"
          >
            <X />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
}

export { SearchInput };
