import React from "react";
import { Card, T, TY, sp } from "../tokens.jsx";

/* Card — superficie base. `hoverable` aggiunge lift + ombra (motion spec #24). */

export default {
  title: "Components/Card",
  component: Card,
  parameters: { layout: "centered" },
  argTypes: { hoverable: { control: "boolean" } },
};

const Sample = () => (
  <div style={{ width:260 }}>
    <div style={{ fontSize:TY.sm, color:T.fg3, marginBottom:sp(2) }}>Speso questo mese</div>
    <div style={{ fontSize:TY.display, fontWeight:700, letterSpacing:"-0.02em", lineHeight:1 }}>€1.247,80</div>
    <div style={{ fontSize:TY.sm, color:T.fg2, marginTop:sp(3) }}>84 transazioni · giugno 2026</div>
  </div>
);

export const Default = {
  args: { hoverable: false },
  render: (args) => <div style={{ fontFamily:T.font }}><Card {...args}><Sample/></Card></div>,
};

export const Hoverable = {
  args: { hoverable: true },
  render: (args) => (
    <div style={{ fontFamily:T.font }}>
      <Card {...args}><Sample/></Card>
      <div style={{ fontSize:TY.micro, color:T.fg3, marginTop:sp(3) }}>Passa il mouse sopra →</div>
    </div>
  ),
};
