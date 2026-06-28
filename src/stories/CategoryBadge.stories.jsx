import React from "react";
import { CategoryBadge, CAT_LABEL, T } from "../tokens.jsx";

/* CategoryBadge — icona + label, mai colore da solo (principio 5). */

export default {
  title: "Components/CategoryBadge",
  component: CategoryBadge,
  parameters: { layout: "centered" },
  argTypes: {
    cat: { control: "select", options: Object.keys(CAT_LABEL) },
  },
};

export const Single = {
  args: { cat: "dining" },
};

export const AllCategories = {
  render: () => (
    <div style={{ display:"flex", flexWrap:"wrap", gap:12, maxWidth:560, fontFamily:T.font }}>
      {Object.keys(CAT_LABEL).map(c => <CategoryBadge key={c} cat={c} />)}
    </div>
  ),
};
