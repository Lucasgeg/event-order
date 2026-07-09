"use client";

import { useState, useEffect } from "react";

const jobs = ["Traiteur", "Boulangerie", "Pâtisserie", "Boutique", "Restaurant"];

export default function JobTitleRotator() {
  const [jobIndex, setJobIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setJobIndex((prev) => (prev + 1) % jobs.length);
        setVisible(true);
      }, 250);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="block text-gold-dark italic">
      de{" "}
      <span
        className={`inline-block transition-all duration-250 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        {jobs[jobIndex]}
      </span>{" "}
      simplement
    </span>
  );
}
