import React from "react";
import "./SectionTools.css";
import { toolsData } from "../data/toolsData";

const SectionTools = () => {
  return (
    <section className="section_tools">
      <div className="section_tools__header">
        <h1>Certains de nos nombreux outils professionnels</h1>
      </div>

      <div className="section_tools__grid">
        {toolsData.map((tool, index) => (
          <div className="tool_card" key={index}>
            <div className="tool_card__icon">
              <img src={tool.iconUrl} alt={tool.title} />
            </div>
            <h3>{tool.title}</h3>
            {/* <p>{tool.description}</p> */}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SectionTools;
