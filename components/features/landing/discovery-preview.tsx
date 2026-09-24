"use client";

import * as React from "react";

import { Ill } from "@/components/features/landing/ill";
import { SegmentedTabs } from "@/components/features/landing/segmented-tabs";

// Landing-Page-Spec §5: the Discovery cell's "interactive preview swap
// between Niche Finder / Outlier Finder".
function DiscoveryPreview({ tags }: { tags: string[] }) {
  const options = tags.map((tag) => ({ id: tag, label: tag }));
  const [value, setValue] = React.useState(options[0].id);

  return (
    <SegmentedTabs
      options={options}
      value={value}
      onValueChange={setValue}
      label="Discovery preview"
    >
      <Ill
        id={value === options[0].id ? "bento_discovery" : "bento_discovery_outliers"}
        className="aspect-[16/9]"
      />
    </SegmentedTabs>
  );
}

export { DiscoveryPreview };
