import React from "react";
import { EmptyState, T } from "../tokens.jsx";

/* EmptyState — stato vuoto centrato, pattern "Overview / Empty". */

export default {
  title: "Components/EmptyState",
  component: EmptyState,
  parameters: { layout: "fullscreen" },
  args: {
    title: "Nessun dato ancora",
    body: "Importa il primo export CSV da Curve: l'Overview si popola da sé.",
    onImport: () => {},
  },
  argTypes: { title: { control: "text" }, body: { control: "text" } },
};

export const Default = {
  render: (args) => (
    <div style={{ fontFamily:T.font, background:T.bg, minHeight:420, paddingTop:8 }}>
      <EmptyState {...args} />
    </div>
  ),
};
