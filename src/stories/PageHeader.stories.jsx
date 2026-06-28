import React from "react";
import { PageHeader, T, sp } from "../tokens.jsx";

/* PageHeader — header di pagina sticky condiviso: titolo + meta + slot destro. */

export default {
  title: "Components/PageHeader",
  component: PageHeader,
  parameters: { layout: "fullscreen" },
  args: { title: "Spending", meta: "84 movimenti in archivio" },
  argTypes: { title: { control: "text" }, meta: { control: "text" } },
};

const PeriodButton = () => (
  <button style={{ padding:"8px 14px", background:T.surface, border:`1px solid ${T.border}`,
    borderRadius:T.r.md, fontSize:14, fontWeight:550, color:T.fg, cursor:"pointer", fontFamily:T.font }}>
    Questo mese ▾
  </button>
);

export const Default = {
  render: (args) => (
    <div style={{ fontFamily:T.font, background:T.bg, minHeight:300 }}>
      <PageHeader {...args} />
      <div style={{ padding:`${sp(6)}px ${sp(8)}px`, color:T.fg3, fontSize:14 }}>contenuto della pagina…</div>
    </div>
  ),
};

export const WithControl = {
  args: { title: "Overview", meta: "" },
  render: (args) => (
    <div style={{ fontFamily:T.font, background:T.bg, minHeight:300 }}>
      <PageHeader {...args} right={<PeriodButton/>} />
      <div style={{ padding:`${sp(6)}px ${sp(8)}px`, color:T.fg3, fontSize:14 }}>contenuto della pagina…</div>
    </div>
  ),
};
